// Opens the folded section a link points to (the contents links, a shared address, a citation link), so the target is never hidden.
(function () {
  function openFor() {
    var id = location.hash.slice(1); if (!id) return;
    var el = document.getElementById(id); if (!el) return;
    for (var d = el.closest ? el.closest('details') : null; d; d = d.parentElement && d.parentElement.closest('details')) d.open = true;
    el.scrollIntoView();
  }
  window.addEventListener('hashchange', openFor); openFor();
})();
