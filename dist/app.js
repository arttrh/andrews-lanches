const toggle=document.querySelector('.menu-toggle');
function setMenu(open){toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Fechar navegação':'Abrir navegação');document.querySelector('header').classList.toggle('menu-open',open);toggle.querySelector('span').textContent=open?'Fechar':'Menu'}
toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){setMenu(false);toggle.focus()}});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});document.querySelectorAll('[data-category]').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter})}));

const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
// Keep links readable even if scripts or animations are unavailable.
document.querySelectorAll('a.button, a.text-link, .product-info a').forEach(link=>{
  const label=link.textContent.trim();
  link.setAttribute('aria-label',label);
  const viewport=document.createElement('span');viewport.className='rolling-label';viewport.setAttribute('aria-hidden','true');
  const front=document.createElement('span');front.className='rolling-front';front.textContent=label;
  const back=document.createElement('span');back.className='rolling-back';back.textContent=label;
  viewport.append(front,back);link.replaceChildren(viewport);
});

function initializeMotion(){
  if(motionPreference.matches||!window.gsap||!window.SplitText||!window.ScrollTrigger)return;
  gsap.registerPlugin(SplitText,ScrollTrigger);
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)',()=>{
    const cleanups=[];const splits=[];
    document.querySelectorAll('.rolling-label').forEach(label=>{
      const link=label.parentElement;
      const front=SplitText.create(label.querySelector('.rolling-front'),{type:'chars',aria:'none'});
      const back=SplitText.create(label.querySelector('.rolling-back'),{type:'chars',aria:'none'});
      splits.push(front,back);
      const animation=gsap.timeline({paused:true,defaults:{duration:0.48,ease:'power3.inOut'}})
        .to(front.chars,{yPercent:-115,stagger:0.012},0)
        .to(back.chars,{yPercent:-115,stagger:0.012},0);
      const enter=()=>animation.play();
      const leave=()=>{if(!link.matches(':hover')&&document.activeElement!==link)animation.reverse()};
      link.addEventListener('pointerenter',enter);link.addEventListener('pointerleave',leave);
      link.addEventListener('focus',enter);link.addEventListener('blur',leave);
      cleanups.push(()=>{link.removeEventListener('pointerenter',enter);link.removeEventListener('pointerleave',leave);link.removeEventListener('focus',enter);link.removeEventListener('blur',leave);animation.kill()});
    });
    document.querySelectorAll('h1, h2, .order-banner h3').forEach(heading=>{
      const hero=heading.tagName==='H1';
      const split=SplitText.create(heading,{type:'words,chars',autoSplit:true,aria:'auto',wordsClass:'split-word',onSplit(self){
        return gsap.from(self.chars,{yPercent:105,autoAlpha:0,rotation:3,duration:0.8,stagger:0.018,ease:'power3.out',delay:hero?0.15:0,scrollTrigger:hero?undefined:{trigger:heading,start:'top 88%',once:true}});
      }});
      splits.push(split);
    });
    gsap.from('.hero-copy > .eyebrow, .hero-copy > p, .hero-copy .actions, .hero-note',{y:18,opacity:0,duration:0.7,stagger:0.12,delay:0.45,ease:'power2.out'});
    gsap.from('.hero-photos .photo',{y:45,opacity:0,duration:1.1,stagger:0.16,delay:0.3,ease:'power3.out'});
    gsap.from('.header-shell',{y:-20,opacity:0,duration:0.65,ease:'power3.out'});
    return()=>{cleanups.forEach(fn=>fn());splits.forEach(split=>split.revert())};
  });
}
if(document.fonts){document.fonts.ready.then(initializeMotion)}else{initializeMotion()}
