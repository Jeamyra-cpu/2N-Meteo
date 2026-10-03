(function(){
  var menu = document.getElementById('menu');
  var btn = document.getElementById('btnMenu');
  var btnFermer = document.getElementById('btnFermer');

  function ouvrirMenu(){
    menu.classList.add('ouvert');
    btn.setAttribute('aria-expanded','true');
    btn.setAttribute('aria-label','Fermer le menu');
    btnFermer.focus();
  }
  function fermerMenu(){
    menu.classList.remove('ouvert');
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-label','Ouvrir le menu');
  }
  btn.addEventListener('click', function(){
    menu.classList.contains('ouvert') ? fermerMenu() : ouvrirMenu();
  });
  btnFermer.addEventListener('click', function(){ fermerMenu(); btn.focus(); });
  document.querySelectorAll('[data-fermer-menu]').forEach(function(el){
    el.addEventListener('click', function(){ fermerMenu(); btn.focus(); });
  });

  function fermerPages(){
    document.querySelectorAll('.lecture.ouvert').forEach(function(p){ p.classList.remove('ouvert'); });
    document.body.style.overflow = '';
  }
  function ouvrirPage(id){
    fermerPages();
    var page = document.getElementById(id);
    if(!page) return;
    page.classList.add('ouvert');
    page.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    var retour = page.querySelector('[data-fermer-page]');
    if(retour) retour.focus();
  }
  document.querySelectorAll('[data-page]').forEach(function(el){
    el.addEventListener('click', function(){ fermerMenu(); ouvrirPage(el.getAttribute('data-page')); });
  });
  document.querySelectorAll('[data-fermer-page]').forEach(function(el){
    el.addEventListener('click', function(){ fermerPages(); btn.focus(); });
  });

  document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape') return;
    if(document.querySelector('.lecture.ouvert')){ fermerPages(); btn.focus(); }
    else if(menu.classList.contains('ouvert')){ fermerMenu(); btn.focus(); }
  });
})();