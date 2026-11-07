"""Run the local voice builder with all process network syscalls denied by Linux seccomp.
The restriction is inherited by its child processes; the parent workspace is unchanged.
"""
import ctypes,errno,runpy,sys,socket
lib=ctypes.CDLL('libseccomp.so.2',use_errno=True)
lib.seccomp_init.argtypes=[ctypes.c_uint32];lib.seccomp_init.restype=ctypes.c_void_p
lib.seccomp_syscall_resolve_name.argtypes=[ctypes.c_char_p];lib.seccomp_syscall_resolve_name.restype=ctypes.c_int
lib.seccomp_rule_add.argtypes=[ctypes.c_void_p,ctypes.c_uint32,ctypes.c_int,ctypes.c_uint]
lib.seccomp_load.argtypes=[ctypes.c_void_p];lib.seccomp_release.argtypes=[ctypes.c_void_p]
ctx=lib.seccomp_init(0x7fff0000)
if not ctx:raise RuntimeError('Cannot create offline filter')
try:
 for name in ['socket','socketpair','connect','sendto','sendmsg','sendmmsg','socketcall']:
  number=lib.seccomp_syscall_resolve_name(name.encode())
  if number>=0 and lib.seccomp_rule_add(ctx,0x50000|errno.EPERM,number,0)!=0:raise RuntimeError('Cannot deny '+name)
 if lib.seccomp_load(ctx)!=0:raise RuntimeError('Offline filter could not be installed; refusing to run')
finally:lib.seccomp_release(ctx)
try:socket.socket(socket.AF_INET,socket.SOCK_STREAM)
except PermissionError:print('OFFLINE VERIFIED: kernel denies network sockets and sends',flush=True)
else:raise RuntimeError('Network is still available; refusing to run')
if len(sys.argv)>1:
 target=sys.argv[1];sys.argv=sys.argv[1:];runpy.run_path(target,run_name='__main__')
