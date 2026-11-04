// Вход в раздел «Тренировка ума» на главной странице.
// Исходников главной в репозитории нет, поэтому блок добавляется поверх готовой сборки и не меняет её.
(function () {
  var href = '/aulita-game-lab/games/brain/';
  var css = '.bx-entry{max-width:1120px;margin:28px auto;padding:0 20px;font-family:Arial,sans-serif;color:#15304a}' +
    '.bx-box{display:flex;align-items:center;gap:18px;padding:18px 22px;background:linear-gradient(120deg,#fff4bf,#d6f3ea);border:3px solid #15304a;border-radius:24px;box-shadow:0 6px 0 #15304a}' +
    '.bx-cats{display:flex;flex:none;align-items:flex-end}.bx-cats img{width:86px;height:96px;object-fit:contain;margin-right:-14px}' +
    '.bx-text{flex:1;min-width:0;padding-left:14px}.bx-text small{display:block;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#397766;margin-bottom:6px}' +
    '.bx-text strong{display:block;font:700 clamp(24px,4vw,34px)/1.1 Georgia,serif}.bx-text p{margin:7px 0 0;font-size:15px;line-height:1.4;color:#35506a}' +
    '.bx-go{flex:none;display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:12px 24px;border:3px solid #fff;border-radius:16px;background:linear-gradient(#ff7a60,#ff543e);box-shadow:0 5px 0 #c92c25;color:#fff;font-weight:700;font-size:17px;text-decoration:none}' +
    '@media(max-width:720px){.bx-box{flex-wrap:wrap;justify-content:center;text-align:center}.bx-text{flex-basis:100%;padding-left:0}.bx-go{width:100%}}';
  function build() {
    var s = document.createElement('section');
    s.className = 'bx-entry'; s.id = 'brain';
    s.innerHTML = '<div class="bx-box"><div class="bx-cats"><img src="' + href + 'img/mia.webp" alt=""><img src="' + href + 'img/rocky.webp" alt=""><img src="' + href + 'img/tima.webp" alt=""></div>' +
      '<div class="bx-text"><small>Новый раздел</small><strong>Тренировка ума с котиками</strong><p>55 игр на память, внимание, скорость, логику, слова и счёт, а ещё разминка на каждый день.</p></div>' +
      '<a class="bx-go" href="' + href + '">Открыть игры</a></div>';
    return s;
  }
  function mount() {
    var games = document.getElementById('games');
    if (!games || !games.parentNode || document.getElementById('brain')) return;
    games.parentNode.insertBefore(build(), games);
  }
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  // React дорисовывает страницу позже, поэтому ждём появления раздела с играми.
  new MutationObserver(mount).observe(document.documentElement, { childList: true, subtree: true });
  mount();
})();
