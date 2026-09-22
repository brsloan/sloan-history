// Interactive pedigree chart. Data comes from js/tree-data.js (built from the GEDCOM).
(function () {
  var T = window.TREE, I = T.indi, F = T.fam;
  var HOME = T.root, root = HOME, selected = HOME;

  // Photos and story links for key people
  var PHOTO = {
    '@P5@': 'uly-porch', '@P15@': 'uly-minnie-izora-1936', '@P16@': 'ellis-family-1940s', '@P17@': 'john-1953',
    '@P84@': 'bessie-portrait', '@P86@': 'harold-marine-1952', '@P21@': 'jane-sloan-compton', '@P79@': 'jane-william-compton',
    '@P123@': 'charles-sharp', '@P122@': 'sharp-couple', '@P300@': 'reavis-couple', '@P301@': 'reavis-couple',
    '@P94@': 'gum-store', '@P93@': 'charles-clara-kids', '@P19@': 'grave-john-sloan-sc', '@P27@': 'grave-archibald',
    '@P1@': 'photo-strip-couple', '@P2@': 'photo-strip-couple', '@P9@': 'wash-kettle', '@P98@': 'mary-schwartz-sloan',
    '@P241@': 'james-sheets', '@P240@': 'james-lucy-sheets', '@P259@': 'crum-family', '@P514@': 'abraham-crum',
    '@P191@': 'delores-nurse-1958', '@P192@': 'torrence-family-1962', '@P208@': 'delores-dorothy-1956', '@P143@': 'hodge-william', '@P142@': 'condon-christina', '@P96@': 'helen-hodge',
    '@P41@': 'grave-robert-drennan', '@P80@': 'enfields', '@P102@': 'enfields', '@P22@': 'grave-martha',
    '@P20@': 'grave-frances', '@P24@': 'grave-emily', '@P25@': 'grave-mary-ann', '@P14@': 'james-person-1925', '@P185@': 'uly-minnie-izora-1936'
  };
  var NOTE = {
    '@P9@': 'His parents as shown here are a strong hypothesis, not proven — see “A Soldier of ’76.”',
    '@P19@': 'The birth year comes from his gravestone’s claim of 113 years, which is almost certainly exaggerated.',
    '@P12@': 'That his father was the transported convict Gawan Pickering is plausible but unproven.',
    '@P312@': 'His link to our Thomas Pickering is plausible but unproven.'
  };
  var STORY = {};
  [['south-carolina.html', 'A Soldier of ’76', ['@P19@', '@P18@', '@P27@', '@P26@', '@P41@']],
   ['pioneers.html', 'The farm near Hamilton', ['@P9@', '@P10@', '@P1@', '@P2@', '@P12@', '@P312@', '@P21@', '@P22@', '@P20@', '@P24@', '@P25@', '@P79@', '@P80@', '@P102@']],
   ['sawmill.html', 'Uly’s sawmill', ['@P5@', '@P15@', '@P16@', '@P17@', '@P86@', '@P90@', '@P98@', '@P185@', '@P4@', '@P14@']],
   ['cambria.html', 'Cambria', ['@P84@', '@P94@', '@P93@', '@P123@', '@P122@', '@P299@', '@P300@', '@P301@', '@P380@']],
   ['moms-side.html', 'Mom’s side', ['@P190@', '@P191@', '@P192@', '@P209@', '@P208@', '@P237@', '@P241@', '@P240@', '@P259@', '@P514@', '@P485@', '@P491@', '@P490@']],
   ['lowell.html', 'Lowell, Massachusetts', ['@P96@', '@P143@', '@P142@']]
  ].forEach(function (s) { s[2].forEach(function (id) { STORY[id] = [s[0], s[1]]; }); });

  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function parents(id) {
    var p = I[id]; if (!p || !p.famc) return [null, null];
    var f = F[p.famc[0]]; return f ? [f.h || null, f.w || null] : [null, null];
  }
  function life(p) {
    if (!p) return '';
    if (p === I[HOME]) return '';
    if (p.living) return p.by ? 'b. ' + p.by : '';   // living, no year shown
    var b = p.by || '', d = p.dy || '';
    return (b || d) ? (b || '?') + ' – ' + (d || '?') : '';
  }

  // depth of every ancestor of HOME, for "your great-grandfather" labels
  var depth = {};
  (function walk(id, d) { if (!id || !I[id]) return; if (depth[id] == null || d < depth[id]) depth[id] = d; var pr = parents(id); walk(pr[0], d + 1); walk(pr[1], d + 1); })(HOME, 0);
  function ordinal(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function relation(id) {
    var d = depth[id]; if (d == null || d === 0) return '';
    var g = I[id].s === 'F' ? 'mother' : 'father';
    if (d === 1) return 'Your ' + g;
    if (d === 2) return 'Your grand' + g;
    if (d === 3) return 'Your great-grand' + g;
    return 'Your ' + ordinal(d - 2) + '-great-grand' + g;
  }

  // ---------- pedigree grid ----------
  var GENS = 5, ROWS = 16;
  function draw() {
    var el = document.getElementById('pedigree'); el.innerHTML = '';
    var slots = [[root]];
    for (var g = 1; g < GENS; g++) {
      slots[g] = [];
      slots[g - 1].forEach(function (id) { var pr = id ? parents(id) : [null, null]; slots[g].push(pr[0], pr[1]); });
    }
    slots.forEach(function (row, g) {
      var span = ROWS / row.length;
      row.forEach(function (id, k) {
        var d = document.createElement('div'), p = id && I[id];
        d.className = 'pbox g' + g + (p ? (p.s === 'F' ? ' f' : '') : ' empty') + (id === selected ? ' sel' : '');
        d.style.gridColumn = (g + 1); d.style.gridRow = (k * span + 1) + ' / span ' + span;
        if (p) {
          d.innerHTML = '<span class="nm">' + esc(p.n) + '</span><span class="dt">' + esc(life(p)) + '</span>';
          d.title = p.n;
          if (g === GENS - 1) { var pr = parents(id); if (pr[0] || pr[1]) d.className += ' more'; }
          d.onclick = function () {
            if (g === GENS - 1 && d.className.indexOf('more') > -1 && selected === id) { go(id); return; }
            select(id);
          };
          d.ondblclick = function () { go(id); };
        } else d.innerHTML = '<span class="nm">&nbsp;</span><span class="dt">unknown</span>';
        el.appendChild(d);
      });
    });
  }

  function plink(id) { var p = I[id]; return p ? '<a class="p" data-id="' + id + '">' + esc(p.n) + '</a> <small>' + esc(life(p)) + '</small>' : ''; }
  function panel() {
    var p = I[selected], el = document.getElementById('person'), h = '';
    var rel = relation(selected);
    if (rel) h += '<div class="rel">' + rel + '</div>';
    h += '<h3>' + esc(p.n) + '</h3><div class="life">' + esc(life(p)) + '</div>';
    if (PHOTO[selected]) h += '<img src="img/' + PHOTO[selected] + '-t.jpg" alt="">';
    h += '<dl>';
    if (!p.living) {
      if (p.b || p.bp) h += '<dt>Born</dt><dd>' + esc([p.b, p.bp].filter(Boolean).join(' · ')) + '</dd>';
      if (p.d || p.dp) h += '<dt>Died</dt><dd>' + esc([p.d, p.dp].filter(Boolean).join(' · ')) + '</dd>';
      if (p.bup) h += '<dt>Buried</dt><dd>' + esc(p.bup) + '</dd>';
    }
    var pr = parents(selected);
    if (pr[0] || pr[1]) h += '<dt>Parents</dt><dd>' + [pr[0], pr[1]].filter(Boolean).map(plink).join('<br>') + '</dd>';
    (p.fams || []).forEach(function (fid) {
      var f = F[fid]; if (!f) return;
      var sp = f.h === selected ? f.w : f.h;
      // lp / lc: a living spouse / living children left out of the public copy (build_public.py)
      h += '<dt>Spouse</dt><dd>' + (sp ? plink(sp) : f.lp ? 'living' : 'unknown') + (f.m && !p.living ? '<br><small>m. ' + esc(f.m) + (f.mp ? ', ' + esc(f.mp) : '') + '</small>' : '') + '</dd>';
      if ((f.c && f.c.length) || f.lc) h += '<dt>Children</dt><dd>' + (f.c || []).map(plink).concat(f.lc ? ['<small>+ ' + f.lc + ' living</small>'] : []).join('<br>') + '</dd>';
    });
    h += '</dl>';
    if (NOTE[selected]) h += '<p style="font:.82rem/1.4 var(--sans);color:#8a6a24;margin:.8rem 0 0">⚠ ' + NOTE[selected] + '</p>';
    if (STORY[selected]) h += '<a class="story" href="' + STORY[selected][0] + '">Read the story: ' + STORY[selected][1] + ' →</a><br>';
    if (selected !== root) h += '<a class="story p" data-id="' + selected + '">Chart this person’s ancestors →</a>';
    el.innerHTML = h;
    el.querySelectorAll('a.p').forEach(function (a) { a.onclick = function () { go(a.dataset.id); }; });
  }
  function select(id) { selected = id; draw(); panel(); }
  function go(id) { root = id; selected = id; draw(); panel(); try { history.replaceState(null, '', '#' + id.replace(/@/g, '')); } catch (e) { } window.scrollTo({ top: document.getElementById('treebar').offsetTop - 70, behavior: 'smooth' }); }

  // ---------- search ----------
  var box = document.getElementById('q'), res = document.getElementById('results');
  var index = Object.keys(I).filter(function (k) { return I[k].n; }).map(function (k) { return [k, I[k].n.toLowerCase()]; });
  box.addEventListener('input', function () {
    var q = box.value.trim().toLowerCase(); res.innerHTML = '';
    if (q.length < 2) { res.style.display = 'none'; return; }
    var parts = q.split(/\s+/);
    var hits = index.filter(function (e) { return parts.every(function (w) { return e[1].indexOf(w) > -1; }); }).slice(0, 40);
    hits.forEach(function (e) {
      var d = document.createElement('div'); d.innerHTML = esc(I[e[0]].n) + ' <small>' + esc(life(I[e[0]])) + '</small>';
      d.onclick = function () { res.style.display = 'none'; box.value = ''; go(e[0]); }; res.appendChild(d);
    });
    res.style.display = hits.length ? 'block' : 'none';
  });
  document.addEventListener('click', function (e) { if (e.target !== box) res.style.display = 'none'; });
  document.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function () { go(b.dataset.go); }; });

  var h = location.hash.replace('#', '');
  if (h && I['@' + h + '@']) { root = selected = '@' + h + '@'; }
  document.getElementById('count').textContent = Object.keys(I).length;
  draw(); panel();
})();
