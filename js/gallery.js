// Filterable photo grid, driven by js/gallery-data.js
(function () {
  var G = window.GALLERY, groups = [['all', 'Everything'], ['farm', 'The Sloan farm'], ['pioneers', 'Pioneers'], ['cambria-family', 'Sharps & Gums'],
    ['cambria-place', 'Cambria'], ['county', 'Mulberry & county'], ['maps', 'Maps'], ['docs', 'Documents'], ['graves', 'Gravestones'],
    ['sc', 'South Carolina'], ['grantham', 'Granthams'], ['torrence', 'Torrences'], ['lowell', 'Lowell']];
  var f = document.getElementById('filters'), grid = document.getElementById('grid'), cur = location.hash.slice(1) || 'all';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function draw() {
    grid.innerHTML = G.filter(function (g) { return cur === 'all' || g.group === cur; }).map(function (g) {
      return '<figure><img loading="lazy" src="img/' + g.slug + '-t.jpg" data-full="img/' + g.slug + '.jpg"' +
        (g.src ? ' data-orig="' + esc(g.src) + '"' : '') + ' alt=""><figcaption>' +
        g.cap + (g.credit ? '<span class="credit">' + esc(g.credit) + '</span>' : '') + '</figcaption></figure>';
    }).join('');
    f.querySelectorAll('button').forEach(function (b) { b.className = b.dataset.g === cur ? 'on' : ''; });
    window.initLightbox();
  }
  groups.forEach(function (g) {
    var n = g[0] === 'all' ? G.length : G.filter(function (x) { return x.group === g[0]; }).length;
    if (!n) return;
    var b = document.createElement('button'); b.dataset.g = g[0]; b.textContent = g[1] + ' (' + n + ')';
    b.onclick = function () { cur = g[0]; try { history.replaceState(null, '', '#' + cur); } catch (e) { } draw(); }; f.appendChild(b);
  });
  draw();
})();
