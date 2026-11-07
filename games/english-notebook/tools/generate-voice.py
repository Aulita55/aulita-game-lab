import json,re,hashlib,subprocess,argparse
from pathlib import Path
import onnxruntime as rt
rt.disable_telemetry_events()  # offline inference: never send runtime telemetry
import numpy as np,soundfile as sf
import kokoro_onnx
from kokoro_onnx import Kokoro
options=rt.SessionOptions(); options.intra_op_num_threads=1; options.inter_op_num_threads=1
kokoro_onnx.create_session=lambda model: rt.InferenceSession(model,sess_options=options,providers=["CPUExecutionProvider"])

def phonetic(s):
 s=s.replace('r','ɹ').replace('ɡ','ɡ');s=re.sub(r'e(?!ɪ|ə)', 'ɛ',s)
 # Explicit stress is useful to the neural model even for standalone monosyllables.
 if 'ˈ' not in s and 'ˌ' not in s:s='ˈ'+s
 return s
p=argparse.ArgumentParser();p.add_argument('corpus');p.add_argument('model');p.add_argument('voices');p.add_argument('cache');p.add_argument('output');args=p.parse_args()
d=json.loads(Path(args.corpus).read_text());cache=Path(args.cache);cache.mkdir(parents=True,exist_ok=True);out=Path(args.output);out.mkdir(parents=True,exist_ok=True);k=Kokoro(args.model,args.voices);sr=24000;records=[]
for i,c in enumerate(d['clips']):
 if c.get('ipa'):phones=', '.join(' ɔː '.join(phonetic(v) for v in group.split('/')) for group in c['ipa'].split(' | '))
 elif c.get('force'):
  f=c['force'];parts=re.split(r'\b'+re.escape(f['word'])+r'\b',c['text'],maxsplit=1,flags=re.I);assert len(parts)==2,c['text'];phones=k.tokenizer.phonemize(parts[0],'en-gb')+' '+phonetic(f['ipa'])+' '+k.tokenizer.phonemize(parts[1],'en-gb')
 else:phones=k.tokenizer.phonemize(c['text'],'en-gb')
 fingerprint=hashlib.sha256((phones+'|bf_emma|.82|v2').encode()).hexdigest();file=cache/(fingerprint+'.wav')
 if file.exists():a,rate=sf.read(file,dtype='float32')
 else:
  a,rate=k.create(phones,voice='bf_emma',speed=.82,lang='en-gb',is_phonemes=True)
  assert rate==sr and len(a)>.12*sr and np.isfinite(a).all() and np.max(np.abs(a))>.005,c['text'];a*=min(2.,.12/max(np.sqrt(np.mean(a*a)),.001),.92/max(np.max(np.abs(a)),.001));sf.write(file,a,sr)
 records.append((c,a,phones))
 if (i+1)%100==0:print('Generated',i+1,'/',len(d['clips']),flush=True)
packs=[];clips={};sources=[]
for pack,first in enumerate(range(0,len(records),75)):
 chunks=[];cursor=0
 for c,a,phones in records[first:first+75]:
  piece=np.concatenate([np.zeros(2400),a,np.zeros(4320)]);clips[c['key']]=[pack,round(cursor/sr,6),round(len(piece)/sr,6)];chunks.extend([piece,np.zeros(13200)]);cursor+=len(piece)+13200;sources.append({'key':c['key'],'text':c['text'],'ipa':c.get('ipa'),'phonemes':phones})
 wav=cache/f'pack-{pack}.wav';sf.write(wav,np.concatenate(chunks),sr);name=f'en-gb-{pack+1:02}.mp3';encoded=cache/name
 subprocess.run(['ffmpeg','-nostdin','-v','error','-y','-i',str(wav),'-ar','24000','-ac','1','-codec:a','libmp3lame','-q:a','8',str(encoded)],check=True)
 duration=float(json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(encoded)]))['format']['duration']);assert abs(duration-cursor/sr)<.15,name
 temp=out/(name+'.partial');temp.write_bytes(encoded.read_bytes());temp.replace(out/name);b=(out/name).read_bytes();packs.append({'file':name,'duration':cursor/sr,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)})
m={'version':2,'voice':'bf_emma','locale':'en-GB','speed':.82,'packs':packs,'clips':clips,'aliases':d['aliases'],'forms':d['forms'],'ipa':d['ipa']}
(out/'manifest.js').write_text('window.NotebookVoiceManifest='+json.dumps(m,ensure_ascii=False,separators=(',',':'))+';\n');(out/'sources.json').write_text(json.dumps({'model':'Kokoro-82M v1.0','voice':'bf_emma','modelLicense':'Apache-2.0','modelSource':'https://huggingface.co/hexgrad/Kokoro-82M','phoneticOverrides':'../verb-pronunciations.tsv','clips':sources},ensure_ascii=False,separators=(',',':'))+'\n');print('DONE',len(clips),'clips',len(packs),'packs',sum(p['bytes'] for p in packs),'bytes',flush=True)
