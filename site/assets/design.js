// Choose a design: five looks for the same content. The choice is kept in this browser only.
// One "Choose a design" button in the top bar opens a panel of the five designs as real screenshots (design.b guidelines 2a, 25 Nov 2026).
// Without JavaScript the page keeps its "Designs" link and the select at the foot.
(function () {
  var K = 'car-buyer:design', d = null;
  try { d = new URLSearchParams(location.search).get('design') || localStorage.getItem(K); } catch (e) {}
  if (!/^[1-5]$/.test(d || '')) d = '1';
  document.documentElement.dataset.design = d;
  var DESIGNS = [
    ['1', 'Forecourt', 'Plain and calm: one column, a card for each tool'],
    ['2', 'Logbook', 'Numbered fields, like the V5C'],
    ['3', 'MOT certificate', 'Test items, each with a result'],
    ['4', 'Windscreen card', 'Big figures, like a price card'],
    ['5', 'Road atlas', 'A route with numbered junctions']
  ];
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }
  function build(trigger) {
    var dlg = el('dialog', 'design-dialog'); dlg.setAttribute('aria-labelledby', 'design-dialog-h');
    var h = el('h2', null, 'Choose a design'); h.id = 'design-dialog-h';
    var p = el('p', 'small', 'The same facts and tools, laid out five ways. Your choice is kept in this browser.');
    var ul = el('ul', 'design-grid'), opts = [];
    DESIGNS.forEach(function (x) {
      var li = el('li'), b = el('button', 'design-opt'); b.type = 'button'; b.dataset.design = x[0];
      var img = el('img'); img.src = '/assets/designs/' + x[0] + '.webp'; img.width = 480; img.height = 300; img.alt = ''; img.loading = 'lazy';
      b.append(img, el('strong', null, x[0] + ' ' + x[1]), el('span', 'small', x[2]));
      b.addEventListener('click', function () { set(x[0]); dlg.close(); });
      li.append(b); ul.append(li); opts.push(b);
    });
    var row = el('p', 'design-foot'), all = el('a', null, 'All five, side by side'); all.href = '/designs/';
    var close = el('button', 'quiet', 'Close'); close.type = 'button'; close.addEventListener('click', function () { dlg.close(); });
    row.append(all, ' ', close);
    dlg.append(h, p, ul, row);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { trigger.focus(); });
    function mark() { opts.forEach(function (b) { if (b.dataset.design === document.documentElement.dataset.design) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); }); }
    function set(v) { document.documentElement.dataset.design = v; try { localStorage.setItem(K, v); } catch (e) {} mark(); var s = document.getElementById('design-choice'); if (s) s.value = v; }
    mark(); document.body.append(dlg);
    trigger.addEventListener('click', function () { mark(); if (dlg.showModal) dlg.showModal(); else location.href = '/designs/'; });
  }
  document.addEventListener('DOMContentLoaded', function () {
    var link = document.querySelector('.navdesigns'), nav = document.querySelector('.own');
    if (link && nav) {
      var btn = el('button', 'design-btn quiet', 'Choose a design'); btn.type = 'button'; btn.setAttribute('aria-haspopup', 'dialog');
      link.replaceWith(btn); build(btn);
      Array.prototype.forEach.call(document.querySelectorAll('footer .chooser'), function (c) { c.remove(); });
      return;
    }
    // A page without the top bar link keeps the select at the foot.
    var s = document.getElementById('design-choice'); if (!s) return;
    s.value = d;
    s.addEventListener('change', function () { document.documentElement.dataset.design = s.value; try { localStorage.setItem(K, s.value); } catch (e) {} });
  });
})();
