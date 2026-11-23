// Car buyer: everything stays in this browser (localStorage). Nothing is sent anywhere.
(function () {
  'use strict';
  var KEY = 'car-buyer:v1';
  function load() {
    try { var d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (d && Array.isArray(d.cars)) return d; } catch (e) {}
    return { cars: [], current: null, costs: {} };
  }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }
  var data = load();
  var $ = function (id) { return document.getElementById(id); };
  var status = $('status');
  function say(t) { if (status) status.textContent = t; }
  function norm(r) { return String(r || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8); }
  function current() { for (var i = 0; i < data.cars.length; i++) if (data.cars[i].reg === data.current) return data.cars[i]; return null; }

  // Check a car
  var form = $('regform'), reg = $('reg'), label = $('label'), notes = $('notes');
  if (form) {
    var c = current();
    var nb = $('notesbox'); function showNotes() { if (nb) nb.hidden = !current(); }
    if (c) { reg.value = c.reg; label.value = c.label || ''; if (notes) notes.value = c.notes || ''; }
    showNotes();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var r = norm(reg.value); if (!r) { say('Type a registration first.'); return; }
      var car = null; data.cars.forEach(function (x) { if (x.reg === r) car = x; });
      if (!car) { car = { reg: r, label: '', notes: '', ticks: {} }; data.cars.push(car); }
      car.label = label.value.trim(); data.current = r; reg.value = r;
      say(save(data) ? 'Saved ' + r + ' in this browser.' : 'This browser would not save it (private mode?), but the checks still work.');
      showNotes();
    });
    if (notes) notes.addEventListener('input', function () {
      var car = current(); if (!car) { say('Save the car first, then your notes are kept with it.'); return; }
      car.notes = notes.value; save(data);
    });
    document.querySelectorAll('a[data-copy]').forEach(function (a) {
      a.addEventListener('click', function () {
        var r = norm(reg.value); if (!r) { say('Type the registration first, so it can be copied.'); return; }
        say('Copied: ' + r + '. Paste it into the page that opened.');
        if (navigator.clipboard) navigator.clipboard.writeText(r).catch(function () { say(r + ': copy it by hand, this browser would not.'); });
      });
    });
  }


  // Age identifier (DVLA INF104): AB12 CDE format since September 2001.
  function ageOf(r) {
    var m = /^[A-Z]{2}(\d{2})[A-Z]{3}$/.exec(r); if (!m) return '';
    var n = parseInt(m[1], 10), y, from, to;
    if (n >= 51) { y = 2000 + n - 50; from = 'September ' + y; to = 'February ' + (y + 1); }
    else if (n >= 2) { y = 2000 + n; from = 'March ' + y; to = 'August ' + y; }
    else return '';
    return 'Age identifier ' + m[1] + ': issued between ' + from + ' and ' + to + '. A private number can make a car look older, never younger, so check the first registration date with DVLA.';
  }
  var ageEl = $('age');
  if (ageEl && reg) { var upd = function () { ageEl.textContent = ageOf(norm(reg.value)); }; reg.addEventListener('input', upd); upd(); }

  // Checklist
  var sel = $('car');
  if (sel) {
    function fill() {
      sel.innerHTML = '';
      if (!data.cars.length) { var o = document.createElement('option'); o.textContent = 'No car yet: add one on Check a car'; o.value = ''; sel.appendChild(o); }
      data.cars.forEach(function (x) { var o = document.createElement('option'); o.value = x.reg; o.textContent = x.reg + (x.label ? ' (' + x.label + ')' : ''); if (x.reg === data.current) o.selected = true; sel.appendChild(o); });
      var car = current() || data.cars[0]; if (car) data.current = car.reg;
      document.querySelectorAll('[data-tick]').forEach(function (b) { b.checked = !!(car && car.ticks && car.ticks[b.dataset.tick]); });
    }
    var pn = $('printnotes');
    function notesOut() { var car = current(); if (pn) pn.textContent = car ? (car.reg + (car.label ? ' (' + car.label + ')' : '') + '\n' + (car.notes || '')) : ''; }
    fill(); notesOut();
    if ($('print')) $('print').addEventListener('click', function () { notesOut(); if (!current()) document.querySelectorAll('[data-tick]').forEach(function (b) { b.checked = false; }); window.print(); });
    sel.addEventListener('change', function () { data.current = sel.value; save(data); fill(); notesOut(); });
    document.querySelectorAll('[data-tick]').forEach(function (b) {
      b.addEventListener('change', function () {
        var car = current(); if (!car) { b.checked = false; say('Add a car first, on Check a car.'); return; }
        car.ticks = car.ticks || {}; car.ticks[b.dataset.tick] = b.checked; save(data);
      });
    });
    $('export').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'car-buyer.json'; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
    $('import').addEventListener('change', function (e) {
      var f = e.target.files[0]; if (!f) return;
      f.text().then(function (t) {
        var d = JSON.parse(t); if (!d || !Array.isArray(d.cars)) throw new Error('not a Car buyer file');
        d.cars = d.cars.filter(function (x) { return x && typeof x.reg === 'string'; }).map(function (x) {
          return { reg: norm(x.reg), label: String(x.label || '').slice(0, 80), notes: String(x.notes || '').slice(0, 20000), ticks: (x.ticks && typeof x.ticks === 'object') ? x.ticks : {} };
        });
        data = { cars: d.cars, current: d.cars.length ? d.cars[0].reg : null, costs: (d.costs && typeof d.costs === 'object') ? d.costs : {} };
        save(data); fill(); say('Imported ' + data.cars.length + ' car(s).');
      }).catch(function () { say('That file is not a Car buyer export.'); });
    });
    $('wipe').addEventListener('click', function () {
      if (!confirm('Delete every car, note and tick saved in this browser?')) return;
      data = { cars: [], current: null, costs: {} }; try { localStorage.removeItem(KEY); } catch (e) {} fill(); say('Deleted.');
    });
  }


  // Windscreen card figures on the home page (design 4)
  if ($('ws-reg')) {
    var w = current() || data.cars[0];
    if (w) { $('ws-reg').textContent = w.reg; var a = ageOf(w.reg); var m = /between (.+?) and (.+?)\./.exec(a); if (m) { var f = m[1].split(' '), e = m[2].split(' '); $('ws-age').textContent = f[1] === e[1] ? f[0].slice(0, 3) + ' to ' + e[0].slice(0, 3) + ' ' + e[1] : f[0].slice(0, 3) + ' ' + f[1] + ' to ' + e[0].slice(0, 3) + ' ' + e[1]; } }
    var t = 0, has = false;
    Object.keys(data.costs || {}).forEach(function (k) { var v = parseFloat(data.costs[k]) || 0; if (v) has = true; t += k === 'ulezdays' ? v * 12.5 : k === 'ccdays' ? v * 18 : v; });
    if (has) $('ws-cost').textContent = '£' + Math.round(t).toLocaleString('en-GB');
  }

  // Costs
  var total = $('total');
  if (total) {
    var ULEZ = 12.5, CC = 18; // TfL rates as read on 23 November 2026; see the note on the page.
    function sum() {
      var t = 0;
      document.querySelectorAll('[data-cost]').forEach(function (i) {
        var v = parseFloat(i.value) || 0, k = i.dataset.cost;
        t += k === 'ulezdays' ? v * ULEZ : k === 'ccdays' ? v * CC : v;
      });
      total.textContent = 'Total: £' + Math.round(t).toLocaleString('en-GB') + ' a year, about £' + Math.round(t / 12).toLocaleString('en-GB') + ' a month';
    }
    document.querySelectorAll('[data-cost]').forEach(function (i) {
      if (data.costs && data.costs[i.dataset.cost] != null) i.value = data.costs[i.dataset.cost];
      i.addEventListener('input', function () { data.costs = data.costs || {}; data.costs[i.dataset.cost] = i.value; save(data); sum(); });
    });
    sum();
  }
})();
