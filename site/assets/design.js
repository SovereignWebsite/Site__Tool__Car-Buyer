// Choose a design: five looks for the same content. The choice is kept in this browser only.
(function () {
  var K = 'car-buyer:design', d = null;
  try { d = new URLSearchParams(location.search).get('design') || localStorage.getItem(K); } catch (e) {}
  if (!/^[1-5]$/.test(d || '')) d = '1';
  document.documentElement.dataset.design = d;
  document.addEventListener('DOMContentLoaded', function () {
    var s = document.getElementById('design-choice'); if (!s) return;
    s.value = d;
    s.addEventListener('change', function () {
      document.documentElement.dataset.design = s.value;
      try { localStorage.setItem(K, s.value); } catch (e) {}
    });
  });
})();
