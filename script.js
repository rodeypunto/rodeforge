(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const {copy, games} = window.RODEFORGE_CONTENT;
  let currentSlide=0;
  let language='es';
  let currentGame=null;
  let gameOpener=null;
  let toastTimer;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  document.documentElement.classList.add('js');
  const renderText = (node,text) => {
    node.replaceChildren();
    text.split('\n').forEach((line,i)=>{
      if(i)node.append(document.createElement('br'));
      if(line.startsWith('[')&&line.endsWith(']')){const span=document.createElement('span');span.textContent=line.slice(1,-1);node.append(span);}
      else node.append(document.createTextNode(line));
    });
  };
  function buildCarousel(id){
    const images=games[id].gallery || [];
    const en=language==='en';
    const gallery=document.createElement('section');gallery.className='game-gallery';
    gallery.setAttribute('aria-label',(en?'Image gallery: ':'Galería de imágenes: ')+games[id].title);
    gallery.setAttribute('aria-roledescription',en?'carousel':'carrusel');gallery.tabIndex=0;
    const stage=document.createElement('div');stage.className='carousel-stage';
    const slides=images.map((entry,i)=>{
      const slide=document.createElement('div');slide.className='carousel-slide';
      slide.setAttribute('role','group');slide.setAttribute('aria-roledescription',en?'slide':'diapositiva');
      slide.setAttribute('aria-label',`${i+1} / ${images.length}`);
      const image=document.createElement('img');image.src=entry.src;image.alt=games[id].title+' — '+entry[language];image.draggable=false;image.decoding='async';
      image.width=540;image.height=960;image.loading=i===currentSlide?'eager':'lazy';
      slide.append(image);slide.hidden=i!==currentSlide;stage.append(slide);return slide;
    });
    const toolbar=document.createElement('div');toolbar.className='carousel-toolbar';
    const previous=document.createElement('button');previous.type='button';previous.className='carousel-arrow';previous.textContent='←';previous.setAttribute('aria-label',en?'Previous image':'Imagen anterior');
    const caption=document.createElement('p');caption.className='carousel-caption';caption.setAttribute('aria-live','polite');caption.setAttribute('aria-atomic','true');
    const next=document.createElement('button');next.type='button';next.className='carousel-arrow';next.textContent='→';next.setAttribute('aria-label',en?'Next image':'Imagen siguiente');
    toolbar.append(previous,caption,next);
    const thumbnails=document.createElement('div');thumbnails.className='carousel-thumbnails';thumbnails.setAttribute('role','group');thumbnails.setAttribute('aria-label',en?'Choose an image':'Elegir una imagen');
    const thumbs=images.map((entry,i)=>{
      const button=document.createElement('button');button.type='button';button.className='carousel-thumbnail';button.setAttribute('aria-label',`${en?'View image':'Ver imagen'} ${i+1}: ${entry[language]}`);
      const image=document.createElement('img');image.src=entry.src;image.alt='';image.width=40;image.height=62;image.loading='lazy';image.draggable=false;
      button.append(image);button.addEventListener('click',()=>show(i));thumbnails.append(button);return button;
    });
    function show(index){
      currentSlide=(index+images.length)%images.length;
      gallery.dataset.slide=String(currentSlide+1);
      slides.forEach((slide,i)=>{slide.hidden=i!==currentSlide;});
      thumbs.forEach((button,i)=>{button.setAttribute('aria-pressed',String(i===currentSlide));});
      caption.replaceChildren();const counter=document.createElement('span');counter.className='mono';counter.textContent=`0${currentSlide+1} / 0${images.length}`;
      const label=document.createElement('span');label.textContent=images[currentSlide][language];caption.append(counter,label);
    }
    previous.addEventListener('click',()=>show(currentSlide-1));next.addEventListener('click',()=>show(currentSlide+1));
    gallery.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      if(event.key==='ArrowLeft')show(currentSlide-1);
      if(event.key==='ArrowRight')show(currentSlide+1);
      if(event.key==='Home')show(0);
      if(event.key==='End')show(images.length-1);
    });
    let start=null;
    stage.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse')start={x:event.clientX,y:event.clientY};});
    stage.addEventListener('pointerup',event=>{if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.25)show(currentSlide+(dx<0?1:-1));});
    stage.addEventListener('pointercancel',()=>{start=null;});
    gallery.append(stage,toolbar,thumbnails);show(currentSlide);return gallery;
  }
  function renderGame(id){
    const game=games[id],t=game[language];
    const content=$('#game-dialog-content');
    content.replaceChildren();
    const wrap=document.createElement('div');wrap.className='game-modal-inner';
    const gallery=(game.gallery?.length)?buildCarousel(id):document.createElement('div');
    if(!game.gallery?.length){gallery.className='game-poster';const poster=document.createElement('img');poster.src=game.art.world;poster.alt=t.artAlt;poster.width=game.art.width;poster.height=game.art.height;gallery.append(poster);}
    
    const details=document.createElement('div');details.className='modal-game-copy';
    const status=document.createElement('p');status.className='modal-status';status.textContent=t.status;
    const title=document.createElement('h2');title.id='game-dialog-title';title.textContent=game.title;
    const description=document.createElement('p');description.className='modal-description';description.textContent=t.description;
    const tags=document.createElement('div');tags.className='modal-game-tags';t.tags.forEach(text=>{const tag=document.createElement('span');tag.textContent=text;tags.append(tag);});
    const link=document.createElement('a');link.className='button button-primary';link.href=`mailto:rodeatope@gmail.com?subject=${encodeURIComponent(game.title+' | RodeForge Interactive')}`;link.textContent=t.cta+' ↗';
    const note=document.createElement('p');note.className='modal-art-note';note.textContent=t.note;
    const galleryNote=t.note;
    note.textContent=galleryNote;
    const facts=document.createElement('dl');facts.className='modal-game-facts';
    [[copy[language].gameGenre,t.tags?.[0]||t.genre],[copy[language].gamePlatform,t.platform]].forEach(([label,value])=>{if(!value)return;const item=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;item.append(dt,dd);facts.append(item);});
    const returnButton=document.createElement('button');returnButton.type='button';returnButton.className='text-link return-gallery';returnButton.textContent='← '+copy[language].backGallery;returnButton.addEventListener('click',()=>$('#game-dialog').close());
    if(game.art.logo){const logo=document.createElement('img');logo.className='modal-game-logo';logo.src=game.art.logo;logo.alt='';logo.width=900;logo.height=298;details.append(logo);}
    details.append(status,title,description,tags,facts);
    for(const action of game.links||[]){const store=document.createElement('a');store.className='button button-primary';store.href=action.url;store.textContent=action.label[language]+' ↗';if(new URL(action.url,location.href).origin!==location.origin){store.target='_blank';store.rel='noopener noreferrer';}details.append(store);}
    if(game.trailer?.src){const video=document.createElement('video');video.controls=true;video.playsInline=true;video.preload='none';video.src=game.trailer.src;video.setAttribute('aria-label',copy[language].videoLabel);if(game.trailer.poster)video.poster=game.trailer.poster;details.append(video);}
    if(id==='bombait'){const privacy=document.createElement('a');privacy.className='privacy-entry';privacy.href='/rodeforge/games/bombait/privacy/'+(language==='en'?'en/':'');privacy.textContent=copy[language].bombaitPrivacy;details.append(privacy);}
    details.append(link,note,returnButton);wrap.append(gallery,details);content.append(wrap);
    $('[data-dialog-brand]').textContent='RODEFORGE / '+game.title.toUpperCase();
  }
  function renderProjects(){
    const collection=$('[data-projects]');
    const focused=document.activeElement?.closest('[data-game]')?.dataset.game;
    collection.innerHTML=window.RODEFORGE_CARDS(games,language,copy[language]);
    if(focused)$(`[data-game="${focused}"]`,collection)?.focus({preventScroll:true});
    // Language changes occur after the reveal observer has been created.
    if(collection.dataset.ready)$$('.reveal',collection).forEach(node=>node.classList.add('is-visible'));
    collection.dataset.ready='true';
  }
  function changeLanguage(lang, updateUrl=false){
    if(!copy[lang])return;
    language=lang;document.documentElement.lang=lang;
    $$('[data-i18n]').forEach(node=>{const text=copy[lang][node.dataset.i18n];if(text!==undefined)renderText(node,text);});
    $$('[data-i18n-alt]').forEach(node=>{node.alt=copy[lang][node.dataset.i18nAlt];});
    $('.desktop-nav').setAttribute('aria-label',copy[lang].navLabel);
    $('#mobile-nav').setAttribute('aria-label',copy[lang].mobileNavLabel);
    $('.footer-navigation').setAttribute('aria-label',copy[lang].footerExplore);
    $('.language-switch').setAttribute('aria-label',copy[lang].languageLabel);
    $$('[data-lang]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lang===lang)));
    $$('.modal-close').forEach(button=>button.setAttribute('aria-label',copy[lang].close));
    $$('[data-privacy-link]').forEach(node=>{node.href='/rodeforge/games/bombait/privacy/'+(lang==='en'?'en/':'');});
    renderProjects();
    $('.wordmark').setAttribute('aria-label',lang==='es'?'RodeForge Interactive, inicio':'RodeForge Interactive, home');
    $('.emblem').setAttribute('aria-label',lang==='es'?'Emblema de RodeForge en blanco':'RodeForge symbol in white');
    const menu = $('.menu-toggle');
    menu.setAttribute('aria-label',copy[lang][menu.getAttribute('aria-expanded')==='true'?'menuClose':'menuOpen']);
    document.title=copy[lang].pageTitle;$('meta[name="description"]').content=copy[lang].metaDescription;
    $('[data-portrait]').alt=copy[lang].studioPhotoAlt;
    ['og:title','twitter:title'].forEach(key=>{const node=$(`meta[property="${key}"],meta[name="${key}"]`);if(node)node.content=copy[lang].pageTitle;});
    ['og:description','twitter:description'].forEach(key=>{const node=$(`meta[property="${key}"],meta[name="${key}"]`);if(node)node.content=copy[lang].metaDescription;});
    $('meta[property="og:locale"]').content=lang==='es'?'es_ES':'en_GB';
    if(updateUrl){const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);}
    
    if(currentGame)renderGame(currentGame);
    try{localStorage.setItem('rodeforge-language',lang);}catch{}
  }
  $$('[data-lang]').forEach(button=>button.addEventListener('click',()=>changeLanguage(button.dataset.lang,true)));
  let saved;try{saved=localStorage.getItem('rodeforge-language');}catch{}
  const requested=new URLSearchParams(location.search).get('lang');
  changeLanguage(copy[requested]?requested:saved==='en'?'en':'es');
  $('#year').textContent=String(new Date().getFullYear());
  const menuButton=$('.menu-toggle'),mobileNav=$('#mobile-nav');
  function closeMenu(){document.body.classList.remove('menu-open');mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label',copy[language].menuOpen);}
  menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',copy[language][open?'menuClose':'menuOpen']);mobileNav.hidden=!open;document.body.classList.toggle('menu-open',open);if(open)$('a',mobileNav).focus();});
  $$('a',mobileNav).forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mobileNav.hidden){closeMenu();menuButton.focus();}});
  const mobileQuery=window.matchMedia('(max-width:760px)');mobileQuery.addEventListener('change',()=>{if(!mobileQuery.matches)closeMenu();});
  document.addEventListener('click',event=>{if(!mobileNav.hidden&&!$('.site-header').contains(event.target))closeMenu();});
  const navigationSections=$$('main section[id]').filter(section=>['juegos','estudio','filosofia','publishers','contacto'].includes(section.id));
  let scrollPending=false;
  function updateNavigation(){
    scrollPending=false;
    $('.site-header').classList.toggle('is-scrolled',window.scrollY>12);
    let active='';
    for(const section of navigationSections){if(section.getBoundingClientRect().top<window.innerHeight*.32)active=section.id;}
    if(active==='filosofia')active='estudio';
    $$('.desktop-nav a,.mobile-nav a').forEach(link=>{if(link.hash==='#'+active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  }
  window.addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(updateNavigation);}},{passive:true});
  window.addEventListener('resize',updateNavigation);updateNavigation();
  $$('.modal').forEach(dialog=>{
    $('.modal-close',dialog).addEventListener('click',()=>dialog.close());
    dialog.addEventListener('keydown',event=>{
      if(event.key!=='Tab')return;
      const controls=$$('a[href],button:not([disabled]),video[controls],[tabindex="0"]',dialog).filter(node=>node.getClientRects().length&&!node.closest('[hidden]'));
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    });
    let backdropPressed=false;
    dialog.addEventListener('pointerdown',event=>{const rect=dialog.getBoundingClientRect();backdropPressed=event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom);});
    dialog.addEventListener('click',event=>{if(backdropPressed&&event.target===dialog)dialog.close();backdropPressed=false;});
  });
  $('[data-projects]').addEventListener('click',event=>{const button=event.target.closest('[data-game]');if(!button)return;gameOpener=button;currentGame=button.dataset.game;currentSlide=0;renderGame(currentGame);$('#game-dialog').showModal();$('#game-dialog').scrollTop=0;$('.modal-close',$('#game-dialog')).focus({preventScroll:true});});
  $('#game-dialog').addEventListener('close',()=>{$$('video',$('#game-dialog')).forEach(video=>video.pause());currentGame=null;currentSlide=0;if(gameOpener?.isConnected)gameOpener.focus({preventScroll:true});gameOpener=null;});
  $('[data-open-intro]').addEventListener('click',()=>{$('#intro-dialog').showModal();const video=$('#intro-dialog video');video.play().catch(()=>{});});
  $('#intro-dialog').addEventListener('close',()=>{$('#intro-dialog video').pause();});
  $('[data-open-credits]').addEventListener('click',()=>$('#credits-dialog').showModal());
  function toast(message){const node=$('.toast');node.textContent=message;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),3200);}
  $('.copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('rodeatope@gmail.com');toast(copy[language].copied);}catch{toast(copy[language].copyFailed);}});
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});},{threshold:.08});
  $$('.reveal').forEach(node=>observer.observe(node));
  const brand=$('.hero-brand');
  brand.addEventListener('pointermove',event=>{if(reducedMotion.matches||event.pointerType!=='mouse')return;const rect=brand.getBoundingClientRect();brand.style.setProperty('--mx',((event.clientX-rect.left)/rect.width-.5)*8+'deg');brand.style.setProperty('--my',-((event.clientY-rect.top)/rect.height-.5)*6+'deg');});
  brand.addEventListener('pointerleave',()=>{brand.style.setProperty('--mx','0deg');brand.style.setProperty('--my','0deg');});
  // An ambient ember field. Drawing stops outside the hero, in hidden tabs and for reduced motion.
  const canvas=$('#embers'),ctx=canvas.getContext('2d');
  if(ctx){
    let width=0,height=0,raf=0,last=0,visible=true;const particles=[];const particleColor=getComputedStyle(document.documentElement).getPropertyValue('--ambient-rgb').trim();
    const resize=()=>{const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);width=rect.width;height=rect.height;canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);particles.length=0;for(let i=0;i<(width<760?10:24);i++)particles.push({x:Math.random()*width,y:Math.random()*height,size:Math.random()*1.3+.3,speed:Math.random()*13+5,alpha:Math.random()*.16+.04,phase:Math.random()*6.28});};
    function draw(time){raf=0;const dt=Math.min((time-last)/1000,.04);last=time;ctx.clearRect(0,0,width,height);for(const p of particles){p.y-=p.speed*dt;p.x+=Math.sin(time*.0005+p.phase)*dt*3;if(p.y<0){p.y=height;p.x=Math.random()*width;}ctx.fillStyle=`rgba(${particleColor},${p.alpha*(.75+Math.sin(time*.002+p.phase)*.25)})`;ctx.fillRect(p.x,p.y,p.size,p.size*1.8);}if(visible&&!document.hidden&&!reducedMotion.matches)raf=requestAnimationFrame(draw);}
    function sync(){cancelAnimationFrame(raf);raf=0;if(visible&&!document.hidden&&!reducedMotion.matches){last=performance.now();raf=requestAnimationFrame(draw);}else ctx.clearRect(0,0,width,height);}
    new ResizeObserver(()=>{resize();sync();}).observe($('.hero'));
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe($('.hero'));
    document.addEventListener('visibilitychange',sync);reducedMotion.addEventListener('change',sync);
  }
})();
