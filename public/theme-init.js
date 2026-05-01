(function() {
  var t = localStorage.getItem('theme');
  if (t === 'dark') { document.documentElement.classList.add('dark'); document.documentElement.classList.remove('light'); }
  else              { document.documentElement.classList.add('light'); document.documentElement.classList.remove('dark'); }
})();
