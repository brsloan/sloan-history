// Shared behaviour: lightbox for figures, time-slider map viewers.
(function () {
  // ---------- lightbox ----------
  var items = [], idx = 0, lb;
  function build() {
    lb = document.createElement('div');
    lb.className = 'lb';
    lb.innerHTML = '<button class="x" aria-label="Close">×</button><button class="prev" aria-label="Previous">‹</button>' +
      '<button class="next" aria-label="Next">›</button><img alt=""><div class="cap"></div>';
    document.body.appendChild(lb);
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.className === 'x') close(); });
    lb.querySelector('.prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.next').addEventListener('click', function () { show(idx + 1); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }
  function show(i) {
    idx = (i + items.length) % items.length;
    var it = items[idx];
    lb.querySelector('img').src = it.full;
    lb.querySelector('.cap').innerHTML = it.cap + (it.orig ? ' &nbsp;·&nbsp; <a href="' + encodeURI(it.orig) + '" target="_blank">Open the original file</a>' : '');
    lb.classList.add('open');
  }
  function close() { lb.classList.remove('open'); }
  window.initLightbox = function () {
    if (!lb) build();
    items = [];
    document.querySelectorAll('img[data-full]').forEach(function (img, i) {
      var fc = img.closest('figure') ? img.closest('figure').querySelector('figcaption') : null;
      items.push({ full: img.dataset.full, orig: img.dataset.orig, cap: fc ? fc.innerHTML : (img.alt || '') });
      img.onclick = function () { show(i); };
    });
  };

  // ---------- time slider ----------
  // <div class="timeview" data-frames='[{"y":"1838","src":"...","t":"..."}]'></div>
  function initTimeviews() {
    document.querySelectorAll('.timeview').forEach(function (tv) {
      var frames = JSON.parse(tv.dataset.frames), i = 0, timer = null;
      tv.innerHTML = '<div class="stage"><img alt=""></div><div class="bar"><span class="year"></span>' +
        '<input type="range" min="0" max="' + (frames.length - 1) + '" value="0" step="1"><button type="button">▶ Play</button></div><p class="what"></p>';
      var img = tv.querySelector('img'), yr = tv.querySelector('.year'), rng = tv.querySelector('input'),
        btn = tv.querySelector('button'), what = tv.querySelector('.what');
      frames.forEach(function (f) { var p = new Image(); p.src = f.src; });
      function set(n) { i = n; img.src = frames[i].src; yr.textContent = frames[i].y; what.textContent = frames[i].t || ''; rng.value = i; }
      rng.addEventListener('input', function () { stop(); set(+rng.value); });
      function stop() { clearInterval(timer); timer = null; btn.textContent = '▶ Play'; }
      btn.addEventListener('click', function () {
        if (timer) return stop();
        btn.textContent = '❚❚ Pause';
        if (i === frames.length - 1) set(0);
        timer = setInterval(function () { if (i >= frames.length - 1) return stop(); set(i + 1); }, 1500);
      });
      set(0);
    });
  }

  document.addEventListener('DOMContentLoaded', function () { window.initLightbox(); initTimeviews(); });
})();
