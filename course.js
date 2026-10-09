const C=window.COURSE;
let ix=Math.max(0,Math.min(C.pages.length-1,Number(location.hash.slice(1)||1)-1));
let isSource=false,zoom=1;
const $=s=>document.querySelector(s);
$('#chapter').textContent=`Chapter ${C.chapter} · ${C.title}`;
$('#total').textContent=`/ ${C.pages.length}`;
$('#number').max=C.pages.length;
function fit(el,max){
  const inner=el.firstElementChild;
  let lo=8,hi=Math.max(8,max);
  for(let n=0;n<14;n++){
    const mid=(lo+hi)/2;
    el.style.fontSize=mid+'px';
    if(inner.scrollHeight>el.clientHeight+0.5||inner.scrollWidth>el.clientWidth+0.5)hi=mid;
    else lo=mid;
  }
  el.style.fontSize=Math.floor(lo*10)/10+'px';
  return lo;
}
function resize(){
  const v=$('#visual'),h=$('#holder');
  const fitScale=Math.min((v.clientWidth-20)/1440,(v.clientHeight-44)/1080);
  const s=Math.max(.1,fitScale*zoom);
  h.style.width=(1440*s)+'px';h.style.height=(1080*s)+'px';
  $('#slide').style.transform=`scale(${s})`;
  $('#zoom').textContent=`${Math.round(zoom*100)}%`;
}
function detail(text){$('#detail>div').textContent=text;$('#detail').showModal()}
function textRects(el){const range=document.createRange();range.selectNodeContents(el.firstElementChild);return [...range.getClientRects()]}
function collision(a,b){for(const x of textRects(a))for(const y of textRects(b))if(Math.min(x.right,y.right)-Math.max(x.left,y.left)>2&&Math.min(x.bottom,y.bottom)-Math.max(x.top,y.top)>2)return true;return false}
function resolveCollisions(){const a=[...document.querySelectorAll('#slide .text')];for(let pass=0;pass<18;pass++){let changed=false;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const x=a[i],y=a[j];if(!collision(x,y))continue;const first=x.offsetTop<=y.offsetTop?x:y;const second=first===x?y:x;const chosen=parseFloat(first.style.fontSize)>11?first:second;const size=parseFloat(chosen.style.fontSize);if(size<=9)continue;chosen.style.fontSize=Math.max(9,Math.floor(size*.92*10)/10)+'px';changed=true}if(!changed)break}}
function render(){
  const p=C.pages[ix],slide=$('#slide');
  slide.replaceChildren();
  const img=document.createElement('img');
  const imagePath=isSource?p.source:p.bg;
  img.src=imagePath+(p.n===1?'?brand=20261009-2':'');
  img.alt=`Chapter ${C.chapter}, slide ${p.n}`;slide.append(img);
  if(!isSource){
    for(const b of p.boxes){
      const el=document.createElement('div');el.className='text';
      el.tabIndex=0;el.setAttribute('role','button');
      el.setAttribute('aria-label',b.text);
      const inner=document.createElement('div');inner.textContent=b.text;el.append(inner);
      Object.assign(el.style,{left:b.x+'px',top:b.y+'px',width:Math.max(8,b.w)+'px',height:Math.max(12,b.h)+'px',color:b.color,textAlign:b.align==='justify'?'left':b.align,fontWeight:b.bold?'700':'400'});
      if(b.rot)el.style.transform=`rotate(${b.rot}deg)`;
      el.onclick=()=>detail(b.text);
      el.onkeydown=e=>{if(e.key==='Enter')detail(b.text)};
      slide.append(el);fit(el,b.size);
    }
  }
  if(!isSource)resolveCollisions();
  $('#number').value=ix+1;
  $('#caption').textContent=isSource?'Original source reference':`Chapter ${C.chapter} · Slide ${ix+1} · Select a label to enlarge it`;
  $('#prev').disabled=ix===0;$('#next').disabled=ix===C.pages.length-1;
  history.replaceState(null,'','#'+(ix+1));
  resize();
}
function move(d){ix=Math.max(0,Math.min(C.pages.length-1,ix+d));render()}
$('#prev').onclick=()=>move(-1);$('#next').onclick=()=>move(1);
$('#number').onchange=()=>{ix=Math.max(0,Math.min(C.pages.length-1,Number($('#number').value)-1));render()};
$('#source').onclick=()=>{isSource=!isSource;$('#source').textContent=isSource?'English view':'Original reference';render()};
$('#zin').onclick=()=>{zoom=Math.min(4,zoom*1.25);resize()};
$('#zout').onclick=()=>{zoom=Math.max(.5,zoom/1.25);resize()};
$('#zfit').onclick=()=>{zoom=1;resize()};
$('#full').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen()};
$('#close').onclick=()=>$('#detail').close();
$('#find').onclick=()=>{const q=$('#search').value.trim().toLowerCase();if(!q)return;for(let i=1;i<=C.pages.length;i++){const k=(ix+i)%C.pages.length;if([...C.pages[k].transcript,...C.pages[k].figureNotes].join(' ').toLowerCase().includes(q)){ix=k;render();return}}alert('No matching text in this chapter.')};
$('#search').onkeydown=e=>{if(e.key==='Enter')$('#find').click()};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(e.target.tagName)||$('#detail').open)return;if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '){e.preventDefault();move(1)}if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();move(-1)}if(e.key==='Home'){ix=0;render()}if(e.key==='End'){ix=C.pages.length-1;render()}if(e.key==='+'||e.key==='='){$('#zin').click()}if(e.key==='-'){$('#zout').click()}});
window.addEventListener('resize',resize);render();


