/*! Quality Rush: Defect Runner — © 2026 Marcus Faulkner. Plain JS, no build step. */
// Art lives in assets/. Parts and obstacles are drawn in code.
const ASSETS = {
  bg_far: "assets/bg_far.webp",
  bg_near: "assets/bg_near.webp",
  dive: "assets/dive.webp",
  end_shutdown: "assets/end_shutdown.webp",
  end_win: "assets/end_win.webp",
  face_celebrate: "assets/face_celebrate.webp",
  face_confident: "assets/face_confident.webp",
  face_determined: "assets/face_determined.webp",
  face_frustrated: "assets/face_frustrated.webp",
  face_happy: "assets/face_happy.webp",
  face_surprised: "assets/face_surprised.webp",
  jump: "assets/jump.webp",
  logo: "assets/logo.webp",
  run0: "assets/run0.webp",
  run1: "assets/run1.webp",
  run2: "assets/run2.webp",
  slide: "assets/slide.webp",
  stumble: "assets/stumble.webp"
};

/* ===================== Shared data ===================== */
const DEFECTS = {
  missing:  {name:"Missing fastener", tier:0, lesson:"An empty bolt hole means the joint can loosen under load. Count every fastener."},
  scratch:  {name:"Surface scratch",  tier:0, lesson:"A scratch across a sealing face becomes a leak path."},
  contam:   {name:"Contamination",    tier:0, lesson:"Oil and chips cause bad coatings, seal damage and downstream failures."},
  wrongpart:{name:"Wrong component",  tier:1, lesson:"A brass bushing where the BOM calls for steel. Verify components, not just presence."},
  misalign: {name:"Misaligned bore",  tier:1, lesson:"An off-center bore won't line up with its mating part. Check geometry, not just surfaces."},
  crack:    {name:"Hairline crack",   tier:2, lesson:"Cracks grow. Hairline today, field failure tomorrow. Watch the bore edge."},
  chipped:  {name:"Chipped tooth",    tier:1, lesson:"A chipped gear tooth means noise, vibration and a failed gearbox. Inspect every tooth."},
};
const TIER_AT = [0, 25, 55];            // seconds into the shift when each defect tier unlocks
const SHIFT = 90, SHIELDS = 5;
const RANKS = ["Trainee","Inspector","Quality Specialist","Quality Champion","MISTER QUALITY"];

/* Housing art (shared with Quality Quest), built as standalone SVG images */
const SVGDEFS = `<defs><linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef2f6"/><stop offset=".45" stop-color="#b6c1cd"/><stop offset="1" stop-color="#7d8b9b"/></linearGradient>
<radialGradient id="boreg" cx="50%" cy="45%"><stop offset="0" stop-color="#05090f"/><stop offset=".75" stop-color="#1c2836"/><stop offset="1" stop-color="#53657a"/></radialGradient>
<radialGradient id="bolt" cx="38%" cy="35%"><stop offset="0" stop-color="#f5f7f9"/><stop offset="1" stop-color="#6b7a8c"/></radialGradient>
<radialGradient id="brass" cx="38%" cy="35%"><stop offset="0" stop-color="#ffe6a0"/><stop offset="1" stop-color="#a3711f"/></radialGradient></defs>`;
function housingSVG(defect, seed=0){
  const o=[], bx=defect==="misalign"?58:50, by=defect==="misalign"?43:50;
  o.push(`<rect x="6" y="6" width="88" height="88" rx="12" fill="url(#steel)" stroke="#4d5c6d" stroke-width="2"/>`);
  o.push(`<rect x="12" y="12" width="76" height="76" rx="8" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.2"/>`);
  o.push(`<circle cx="50" cy="50" r="30" fill="none" stroke="rgba(80,95,112,.25)" stroke-width="0.8"/>`);
  o.push(`<circle cx="${bx}" cy="${by}" r="19" fill="#8c99a8"/>`);
  if(defect==="wrongpart") o.push(`<circle cx="${bx}" cy="${by}" r="17" fill="url(#brass)" stroke="#7a5212"/>`);
  o.push(`<circle cx="${bx}" cy="${by}" r="${defect==="wrongpart"?12:15}" fill="url(#boreg)"/>`);
  const pos=[[20,20],[80,20],[20,80],[80,80]], miss=defect==="missing"?(seed%4):-1;
  pos.forEach(([x,y],k)=>{
    if(k===miss){ o.push(`<circle cx="${x}" cy="${y}" r="6.5" fill="#0b121b" stroke="#5a6e86" stroke-width="1.5"/>`); return; }
    const h=[0,1,2,3,4,5].map(i=>{const a=Math.PI/3*i+Math.PI/6; return `${(x+7*Math.cos(a)).toFixed(1)},${(y+7*Math.sin(a)).toFixed(1)}`}).join(" ");
    o.push(`<polygon points="${h}" fill="url(#bolt)" stroke="#4d5c6d" stroke-width="1"/><circle cx="${x}" cy="${y}" r="2.6" fill="#8c99a8"/>`);
  });
  if(defect==="scratch"){ o.push(seed%2?`<path d="M30 64 L72 34" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M30 64 L72 34" stroke="#ff6a6a" stroke-width="1.2"/>`:`<path d="M28 36 Q50 30 70 66" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M28 36 Q50 30 70 66" fill="none" stroke="#ff6a6a" stroke-width="1.2"/>`); }
  if(defect==="contam") o.push(`<path d="M60 64 q8 -6 14 2 q4 8 -6 10 q-10 3 -12 -4 q-2 -5 4 -8z" fill="#3a2a12" opacity=".9"/><path d="M28 60 q3 -4 6 0 q-3 3 -6 0z M34 70 q4 -1 3 4 M24 66 q2 3 6 1" stroke="#d9a63a" stroke-width="2" fill="none"/>`);
  if(defect==="crack") o.push(`<path d="M${bx+14} ${by-9} l6 -4 l3 3 l6 -5 l4 1" fill="none" stroke="#111820" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${SVGDEFS}${o.join("")}</svg>`;
}
const svgURL = s => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);

/* More parts on the line. Each family lists the defects it can carry. */
const FAMILIES={
  housing:{name:"Housing", defects:["missing","scratch","contam","wrongpart","misalign","crack"]},
  flange: {name:"Flange",  defects:["missing","scratch","contam","wrongpart","misalign","crack"]},
  gear:   {name:"Gear",    defects:["chipped","scratch","contam","wrongpart","misalign","crack"]},
  bracket:{name:"Bracket", defects:["missing","scratch","contam","wrongpart","crack"]},
};
const HEX=(x,y,r)=>[0,1,2,3,4,5].map(i=>{const a=Math.PI/3*i+Math.PI/6; return `${(x+r*Math.cos(a)).toFixed(1)},${(y+r*Math.sin(a)).toFixed(1)}`}).join(" ");
const BOLT=(x,y,r=7)=>`<polygon points="${HEX(x,y,r)}" fill="url(#bolt)" stroke="#4d5c6d" stroke-width="1"/><circle cx="${x}" cy="${y}" r="${r*.37}" fill="#8c99a8"/>`;
const HOLE=(x,y,r=6.5)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#0b121b" stroke="#5a6e86" stroke-width="1.5"/>`;
const SCRATCH=seed=>seed%2?`<path d="M30 64 L72 34" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M30 64 L72 34" stroke="#ff6a6a" stroke-width="1.2"/>`:`<path d="M28 36 Q50 30 70 66" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M28 36 Q50 30 70 66" fill="none" stroke="#ff6a6a" stroke-width="1.2"/>`;
const CONTAM=`<path d="M60 64 q8 -6 14 2 q4 8 -6 10 q-10 3 -12 -4 q-2 -5 4 -8z" fill="#3a2a12" opacity=".9"/><path d="M28 60 q3 -4 6 0 q-3 3 -6 0z M34 70 q4 -1 3 4 M24 66 q2 3 6 1" stroke="#d9a63a" stroke-width="2" fill="none"/>`;
const CRACK=(x,y)=>`<path d="M${x} ${y} l6 -4 l3 3 l6 -5 l4 1" fill="none" stroke="#111820" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
function flangeSVG(d,seed){
  const body=d==="wrongpart"?"url(#brass)":"url(#steel)", bx=d==="misalign"?58:50, by=d==="misalign"?43:50, o=[];
  o.push(`<circle cx="50" cy="50" r="45" fill="${body}" stroke="#4d5c6d" stroke-width="2"/><circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255,255,255,.4)"/><circle cx="50" cy="50" r="22" fill="none" stroke="rgba(60,75,92,.35)" stroke-width="1.5"/>`);
  o.push(`<circle cx="${bx}" cy="${by}" r="14" fill="url(#boreg)" stroke="#5a6e86" stroke-width="2"/>`);
  for(let i=0;i<6;i++){ const a=i*Math.PI/3-Math.PI/2, x=+(50+32*Math.cos(a)).toFixed(1), y=+(50+32*Math.sin(a)).toFixed(1);
    o.push(d==="missing"&&i===seed%6?HOLE(x,y,5.5):BOLT(x,y,6)); }
  if(d==="scratch") o.push(SCRATCH(seed)); if(d==="contam") o.push(CONTAM); if(d==="crack") o.push(CRACK(bx+11,by-8));
  return o.join("");
}
function gearSVG(d,seed){
  // chipped tooth: the tooth is gone and the break bites into the rim (dark jagged notch), always on the upper half
  const body=d==="wrongpart"?"url(#brass)":"url(#steel)", bx=d==="misalign"?57:50, by=d==="misalign"?44:50, o=[], N=10, chip=[9,0,1][seed%3];
  for(let i=0;i<N;i++){ if(d==="chipped"&&i===chip) continue;
    o.push(`<rect x="43" y="1.5" width="14" height="16" rx="2" fill="${body}" stroke="#4d5c6d" stroke-width="1.2" transform="rotate(${i*360/N} 50 50)"/>`); }
  o.push(`<circle cx="50" cy="50" r="36" fill="${body}" stroke="#4d5c6d" stroke-width="1.5"/><circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,.35)"/>`);
  if(d==="chipped") o.push(`<path d="M39 13 L42.5 21 L45.5 18 L48.5 25.5 L51.5 19.5 L54.5 24 L57.5 18.5 L61 13 Z" fill="#0b1118" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round" transform="rotate(${chip*36} 50 50)"/>`);
  for(let i=0;i<4;i++){ const a=i*Math.PI/2+Math.PI/4; o.push(`<circle cx="${(50+21*Math.cos(a)).toFixed(1)}" cy="${(50+21*Math.sin(a)).toFixed(1)}" r="6" fill="#1c2836" stroke="#5a6e86"/>`); }
  o.push(`<circle cx="50" cy="50" r="13" fill="${body}" stroke="#4d5c6d" stroke-width="1.5"/><circle cx="${bx}" cy="${by}" r="7.5" fill="url(#boreg)"/><rect x="${bx-2}" y="${by-10}" width="4" height="4" fill="#0b121b"/>`);
  if(d==="scratch") o.push(SCRATCH(seed)); if(d==="contam") o.push(CONTAM); if(d==="crack") o.push(CRACK(bx+8,by-10));
  return o.join("");
}
function bracketSVG(d,seed){
  const body=d==="wrongpart"?"url(#brass)":"url(#steel)", o=[];
  o.push(`<path d="M12 10 H40 V62 H90 V90 H12 Z" fill="${body}" stroke="#4d5c6d" stroke-width="2" stroke-linejoin="round"/><path d="M18 16 H34 V68 H84 V84 H18 Z" fill="none" stroke="rgba(255,255,255,.4)"/>`);
  const pts=[[26,28],[26,74],[72,76]];
  pts.forEach(([x,y],i)=>o.push(d==="missing"&&i===seed%3?HOLE(x,y,6):BOLT(x,y,7)));
  if(d==="scratch") o.push(`<path d="M18 50 L36 36" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M18 50 L36 36" stroke="#ff6a6a" stroke-width="1.2"/><path d="M46 70 L66 82" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M46 70 L66 82" stroke="#ff6a6a" stroke-width="1.2"/>`);
  if(d==="contam") o.push(`<path d="M52 66 q8 -6 14 2 q4 8 -6 10 q-10 3 -12 -4 q-2 -5 4 -8z" fill="#3a2a12" opacity=".9"/><path d="M20 44 q3 -4 6 0 q-3 3 -6 0z" stroke="#d9a63a" stroke-width="2" fill="none"/>`);
  if(d==="crack") o.push(`<path d="M40 62 l4 5 l-3 4 l5 5 l-1 5" fill="none" stroke="#111820" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`);
  return o.join("");
}
function partSVG(fam,d,seed=0){
  if(fam==="housing") return housingSVG(d,seed);
  const inner={flange:flangeSVG,gear:gearSVG,bracket:bracketSVG}[fam](d,seed);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${SVGDEFS}${inner}</svg>`;
}


/* ===================== Sound ===================== */
let AC=null, SOUND=true;
function tone(seq){
  if(!SOUND) return;
  try{ AC = AC || new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==="suspended") AC.resume(); let t=AC.currentTime;
    seq.forEach(([f,d,type])=>{ const o=AC.createOscillator(), g=AC.createGain(); o.type=type||"square"; o.frequency.value=f;
      g.gain.setValueAtTime(.07,t); g.gain.exponentialRampToValueAtTime(.001,t+d); o.connect(g).connect(AC.destination); o.start(t); o.stop(t+d); t+=d*.8; });
  }catch(e){}
}
const SFX={jump:[[420,.06,"triangle"],[640,.08,"triangle"]], slide:[[300,.09,"triangle"],[200,.1,"triangle"]], catch:[[880,.06],[1320,.1]],
  wrong:[[260,.22,"sawtooth"]], escape:[[180,.3,"sawtooth"],[120,.35,"sawtooth"]], hit:[[140,.25,"sawtooth"]], tick:[[440,.08]], go:[[880,.18]],
  win:[[523,.14],[659,.14],[784,.14],[1046,.32]], over:[[392,.2,"triangle"],[311,.25,"triangle"],[233,.4,"triangle"]], click:[[700,.04]]};


/* ===================== Music =====================
   An original arcade loop synthesized live with Web Audio: kick, clap, hats, bass and an arpeggio
   in A minor (Am–F–C–G). Tempo climbs from 132 to 156 BPM as the shift goes on. */
const Music={on:false,timer:0,next:0,step:0,bus:null,noise:null,
  ensure(){ AC=AC||new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==="suspended") AC.resume();
    if(!this.bus){ this.bus=AC.createGain(); this.bus.gain.value=.3; this.bus.connect(AC.destination);
      const n=AC.sampleRate*.4, b=AC.createBuffer(1,n,AC.sampleRate), d=b.getChannelData(0); for(let i=0;i<n;i++) d[i]=Math.random()*2-1; this.noise=b; } },
  start(){ if(!SOUND||this.on) return; try{ this.ensure(); this.on=true; this.next=AC.currentTime+.06;
    clearInterval(this.timer); this.timer=setInterval(()=>this.tick(),25); }catch(e){} },
  stop(){ this.on=false; clearInterval(this.timer); },
  reset(){ this.stop(); this.step=0; },
  tick(){ if(!this.on) return; const bpm=132+24*(G?prog():0), s16=60/bpm/4;
    while(this.next<AC.currentTime+.12){ this.note(this.step,this.next,s16); this.next+=s16; this.step++; } },
  env(node,t,peak,dur){ const g=AC.createGain(); g.gain.setValueAtTime(peak,t); g.gain.exponentialRampToValueAtTime(.0008,t+dur); node.connect(g).connect(this.bus); return g; },
  osc(type,f,t,dur,peak,lp){ const o=AC.createOscillator(); o.type=type; o.frequency.setValueAtTime(f,t);
    let n=o; if(lp){ const fl=AC.createBiquadFilter(); fl.type="lowpass"; fl.frequency.value=lp; o.connect(fl); n=fl; }
    this.env(n,t,peak,dur); o.start(t); o.stop(t+dur+.02); return o; },
  hit(t,type,freq,peak,dur){ const s=AC.createBufferSource(); s.buffer=this.noise; const f=AC.createBiquadFilter(); f.type=type; f.frequency.value=freq;
    s.connect(f); this.env(f,t,peak,dur); s.start(t); s.stop(t+dur+.02); },
  note(i,t,s16){
    const k=i%16, bar=Math.floor(i/16)%4, section=Math.floor(i/64)%2;
    if(k%4===0){ const o=this.osc("sine",150,t,.16,.9); o.frequency.exponentialRampToValueAtTime(45,t+.12); }           // kick
    if(k===4||k===12){ this.hit(t,"highpass",1400,.5,.13); this.osc("triangle",190,t,.06,.25); }                      // clap
    if(k%2===1) this.hit(t,"highpass",7500,k%4===3?.22:.12,.035);                                                      // hats
    const roots=[55,43.65,65.41,49];                                                                                     // A F C G
    if(k%2===0){ let f=roots[bar]*(k===6||k===14?2:1); this.osc("sawtooth",f,t,s16*1.7,.32,650); }                    // bass
    const chords=[[440,523.3,659.3],[349.2,440,523.3],[523.3,659.3,784],[392,493.9,587.3]], pat=[0,1,2,1,2,0,1,2];
    if(section===1 || prog()>.6){ const f=chords[bar][pat[k%8]]; this.osc("square",f,t,s16*.9,.07,2600); }            // arpeggio
    if(section===0 && (k===0||k===10) && bar%2===0) this.osc("triangle",chords[bar][2]*2,t,s16*3,.08);                 // bell hits
  }};

/* ===================== Storage (best score) ===================== */
/* Two paces. Standard is the default; Rush is the original, faster tuning. */
const MODES={
  standard:{name:"Standard", v0:215, ramp:2.3, defect:[.28,.12], partGap:[310,230], obsGap:[760,440], highAfter:20, jump:1.0, slide:1.0, apex:150},
  rush:    {name:"Rush",     v0:290, ramp:3.3, defect:[.34,.16], partGap:[250,190], obsGap:[560,420], highAfter:12, jump:.86, slide:.86, apex:145},
};
let MODE="standard"; try{ if(localStorage.getItem("qr-mode")==="rush") MODE="rush"; }catch(e){}
const M=()=>MODES[MODE];
function loadBest(){ try{ return +localStorage.getItem("qr-best-"+MODE)||(MODE==="rush"?+localStorage.getItem("qr-best")||0:0); }catch(e){ return 0; } }
function saveBest(v){ try{ localStorage.setItem("qr-best-"+MODE,String(v)); }catch(e){} }

/* ===================== Images ===================== */
const IMG={}, PARTIMG={};
function loadImg(src){ return new Promise(r=>{ const i=new Image(); i.onload=()=>r(i); i.onerror=()=>r(i); i.src=src; }); }
async function loadAll(){
  const keys=["run0","run1","run2","jump","slide","dive","stumble","bg_far","bg_near"];
  await Promise.all(keys.map(async k=>{ IMG[k]=await loadImg(ASSETS[k]); }));
  const jobs=[];
  for(const [f,info] of Object.entries(FAMILIES)) for(const d of [null,...info.defects]) for(let s=0;s<4;s++)
    jobs.push(loadImg(svgURL(partSVG(f,d,s))).then(i=>PARTIMG[f+":"+(d||"good")+s]=i));
  await Promise.all(jobs);
}

/* ===================== UI helpers ===================== */
const $=id=>document.getElementById(id);
const face=n=>`<img alt="Maya" src="${ASSETS["face_"+n]}">`;
const SHIELD_SVG=`<svg viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" fill="#2f7fe0" stroke="#bfe0ff" stroke-width="1.4"/><path d="M8 12l3 3 5-6" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
function show(id){ ["title","play","end"].forEach(s=>$(s).hidden=s!==id); scrollTo(0,0); }

/* ===================== Title screen ===================== */
function renderTitle(){
  const best=loadBest();
  const defs=[["housing",null,"Good part","Let it ship"],["flange","missing","Missing fastener","From the start"],["housing","scratch","Scratch","From the start"],["bracket","contam","Contamination","From the start"],
              ["gear","wrongpart","Wrong component","Brass, not steel · 0:25"],["housing","misalign","Misaligned bore","At 0:25"],["gear","chipped","Chipped tooth","At 0:25"],["flange","crack","Hairline crack","At 0:55"]];
  $("title").innerHTML=`<div class="wrap">
    <img class="logo" src="${ASSETS.logo}" alt="Quality Rush: Defect Runner">
    <section class="panel callout"><div class="face">${face("confident")}</div>
      <div class="bubble"><small>Maya · Metrology</small>We're running the line today. Pull every bad part before it ships, and watch your footing on the floor.</div></section>
    <div class="modes" role="radiogroup" aria-label="Pace">${Object.entries(MODES).map(([k,m])=>`<button class="mode${k===MODE?" on":""}" role="radio" aria-checked="${k===MODE}" data-m="${k}"><b>${m.name}</b><span>${k==="standard"?"Learn the line":"Faster line, tighter gaps"}</span></button>`).join("")}</div>
    <button class="cta" id="startBtn"><span>START SHIFT<small>${M().name.toUpperCase()} · 90 SECONDS · 5 SHIELDS</small></span></button>
    ${best?`<div class="best">Your best <b>${best}</b></div>`:""}
    <div class="banner"><span>How to play</span></div>
    <section class="panel howto">
      <div class="how"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#2f7fe0"/><path d="M24 11l10 12h-6v13h-8V23h-6z" fill="#fff"/></svg><b>JUMP</b><span>Swipe up or tap Jump</span><em>Pallets &amp; spills</em></div>
      <div class="how"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#e2741a"/><path d="M24 37L14 25h6V12h8v13h6z" fill="#fff"/></svg><b>SLIDE</b><span>Swipe down or tap Slide</span><em>Low beams</em></div>
      <div class="how"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#22b14c"/><path d="M20 30V15a2.5 2.5 0 015 0v9l1-.5a2.5 2.5 0 013 1l.5-.3a2.5 2.5 0 013 1.5l.5-.2a2.5 2.5 0 013 2V33c0 4-3 7-7 7h-3c-3 0-5-1.5-6.5-4L16 31a2.5 2.5 0 014-1z" fill="#fff"/></svg><b>PULL</b><span>Tap a part on the conveyor</span><em>Defects only</em></div>
    </section>
    <div class="banner"><span>Know your defects</span></div>
    <section class="panel defs">${defs.map(([f,d,n,w])=>`<div class="def${d?"":" good"}"><img alt="" src="${svgURL(partSVG(f,d,1))}"><b>${n}</b><em>${w}</em></div>`).join("")}</section>
    <div class="banner"><span>Parts on the line</span></div>
    <section class="panel defs fams">${Object.entries(FAMILIES).map(([f,i])=>`<div class="def good"><img alt="" src="${svgURL(partSVG(f,null,0))}"><b>${i.name}</b><em>Good part</em></div>`).join("")}</section>
    <div class="banner"><span>Scoring</span></div>
    <section class="panel rules">
      <div><b class="pos">+50×</b><span>Pull a defect. Chain pulls to build your combo up to ×5.</span></div>
      <div><b class="neg">−75</b><span>A defect reaches shipping. That's an escape, and it costs a shield.</span></div>
      <div><b class="neg">−40</b><span>Pull a good part. False rejects reset your combo.</span></div>
      <div><b class="neg">−50</b><span>Hit an obstacle. You stumble and lose a shield.</span></div>
      <div><b class="pos">+100</b><span>Per shield left when the shift ends. Lose all five and the line shuts down.</span></div>
    </section>
    <button class="cta" id="startBtn2"><span>START SHIFT<small>LET'S RUN</small></span></button>
    <p class="foot">© 2026 Marcus Faulkner · Quality Rush · Mister Quality™<br>A game, not a professional quality certification.</p>
  </div>`;
  const go=()=>{ tone(SFX.click); startGame(); };
  $("startBtn").onclick=go; $("startBtn2").onclick=go;
  document.querySelectorAll(".mode").forEach(b=>b.onclick=()=>{ MODE=b.dataset.m; try{ localStorage.setItem("qr-mode",MODE); }catch(e){} tone(SFX.click); renderTitle(); });
}

/* ===================== Game ===================== */
const H=540, FEET=440, BELT=289, PART=82, PARTY=BELT-PART/2, SHIP_X=26;
const cv=$("cv"), ctx=cv.getContext("2d");
let W=960, SCALE=1, DPR=1, G=null, raf=0, last=0;

function resize(){
  const box=$("stagebox"), bw=box.clientWidth, bh=box.clientHeight; if(!bw||!bh) return;
  W=Math.round(Math.max(420,Math.min(1000,H*bw/bh)));
  SCALE=Math.min(bw/W,bh/H); DPR=Math.min(window.devicePixelRatio||1,2);
  cv.style.width=Math.floor(W*SCALE)+"px"; cv.style.height=Math.floor(H*SCALE)+"px";
  cv.width=Math.round(W*SCALE*DPR); cv.height=Math.round(H*SCALE*DPR);
  if(G) G.mx=Math.max(120,Math.round(W*0.24));
  draw();
}
addEventListener("resize",()=>{ if(!$("play").hidden) resize(); });

function newGame(){
  return { t:0, dist:0, farX:0, nearX:0, score:0, combo:0, bestCombo:0, shields:SHIELDS,
    parts:[], obs:[], fx:[], nextPart:120, nextObs:900, seed:1,
    mx:Math.max(120,Math.round(W*0.24)),
    jumpT:-1, slideT:-1, stumbleT:-1, inv:0, catchT:-1, bufJump:0, bufSlide:0, runPhase:0,
    caught:0, escaped:0, falseRej:0, shipped:0, cleared:0, hits:0,
    byType:Object.fromEntries(Object.keys(DEFECTS).map(k=>[k,{caught:0,missed:0}])),
    tierShown:0, state:"count", count:3.4, paused:false, over:false, sayUntil:0 };
}
const prog=()=>Math.min(G.t/SHIFT,1);
const sc=()=>W/960;                                   // world speed scales with view width: same reaction time on every screen
const speed=()=>(M().v0+M().ramp*G.t)*sc();

async function startGame(){
  await READY;
  show("play"); G=newGame(); resize(); renderHUD(); say("confident","Eyes on the line. Pull the bad ones.",0);
  cancelAnimationFrame(raf); last=performance.now(); raf=requestAnimationFrame(loop);
  tone(SFX.tick);
}

function say(f,text,ms=1600){ $("mFace").innerHTML=face(f); $("mSay").textContent=text; if(G) G.sayUntil=G.t+ms/1000; }

/* --- input --- */
function doJump(){ if(!G||G.state!=="run"||G.paused) return;
  if(G.stumbleT>=0){ G.bufJump=.2; return; }
  if(G.jumpT<0){ G.slideT=-1; G.jumpT=0; tone(SFX.jump); } else G.bufJump=.18; }
function doSlide(){ if(!G||G.state!=="run"||G.paused) return;
  if(G.stumbleT>=0){ G.bufSlide=.2; return; }
  if(G.jumpT>=0){ G.bufSlide=.3; G.jumpT=Math.max(G.jumpT,.62); return; }  // fast-fall, then slide on landing
  if(G.slideT<0){ G.slideT=0; tone(SFX.slide); } }
function toLogical(e){ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]; }
function tryPull(x,y){
  let best=null,bd=1e9;
  G.parts.forEach(p=>{ if(p.state!=="live") return; const dx=Math.abs(p.x-x), dy=Math.abs(PARTY-y);
    if(dx<PART*0.75 && dy<PART*0.85 && dx<bd){ bd=dx; best=p; } });
  if(!best) return false;
  pull(best); return true;
}
let ptr=null;
cv.addEventListener("pointerdown",e=>{ e.preventDefault(); if(!G) return;
  if(G.paused){ setPause(false); return; }
  const [x,y]=toLogical(e); ptr={id:e.pointerId,x:e.clientX,y:e.clientY,done:false};
  if(G.state==="run" && tryPull(x,y)) ptr.done=true;
});
cv.addEventListener("pointermove",e=>{ if(!ptr||ptr.done||e.pointerId!==ptr.id) return;
  const dy=e.clientY-ptr.y, dx=e.clientX-ptr.x;
  if(Math.abs(dy)>26 && Math.abs(dy)>Math.abs(dx)){ ptr.done=true; dy<0?doJump():doSlide(); } });
addEventListener("pointerup",()=>ptr=null); addEventListener("pointercancel",()=>ptr=null);
function padBtn(id,fn){ const b=$(id);
  b.addEventListener("pointerdown",e=>{ e.preventDefault(); b.classList.add("down"); fn(); });
  ["pointerup","pointerleave","pointercancel"].forEach(t=>b.addEventListener(t,()=>b.classList.remove("down"))); }
padBtn("bJump",doJump); padBtn("bSlide",doSlide);
addEventListener("keydown",e=>{ if($("play").hidden) return;
  if([" ","ArrowUp","w","W"].includes(e.key)){ e.preventDefault(); doJump(); }
  else if(["ArrowDown","s","S"].includes(e.key)){ e.preventDefault(); doSlide(); }
  else if(["p","P","Escape"].includes(e.key)){ setPause(!G.paused); } });
$("pauseBtn").onclick=()=>setPause(!G.paused);
const SND_ON=`<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
      SND_OFF=`<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
function renderSnd(){ $("sndBtn").innerHTML=SOUND?SND_ON:SND_OFF; $("sndBtn").setAttribute("aria-label",SOUND?"Mute sound":"Turn sound on"); }
$("sndBtn").onclick=()=>{ SOUND=!SOUND; renderSnd(); if(!SOUND) Music.stop(); else if(G&&G.state==="run"&&!G.paused) Music.start(); }; renderSnd();
document.addEventListener("visibilitychange",()=>{ if(document.hidden && G && G.state==="run") setPause(true); });
function setPause(v){ if(!G||G.over) return; G.paused=v; if(v) Music.stop(); else if(G.state==="run") Music.start();
  $("ov").className="overlay"+(v?" pause":""); $("ov").innerHTML=v?`<div><b>PAUSED</b><span>Tap to resume</span></div>`:"";
  if(v) $("ov").onclick=()=>setPause(false); else { $("ov").onclick=null; last=performance.now(); } }

/* --- actions --- */
const mult=()=>Math.min(1+Math.floor(G.combo/2),5);
function pull(p){
  if(p.defect){ G.combo++; G.bestCombo=Math.max(G.bestCombo,G.combo); const pts=50*mult(); G.score+=pts; G.caught++; G.byType[p.defect].caught++;
    p.state="caught"; p.t=0; fx(p.x,PARTY-40,`+${pts}`,DEFECTS[p.defect].name,"#56f08a"); tone([[760+G.combo*40,.06],[1140+G.combo*40,.1]]);
    if(G.jumpT<0&&G.slideT<0&&G.stumbleT<0) G.catchT=0;
    if(mult()>=3&&G.combo%2===0) say("happy",`Combo ×${mult()}! Keep pulling!`,1200); else say("happy",["Good catch.","Pulled it.","That's a reject.","Nice eye."][G.caught%4],1000);
  } else { G.combo=0; G.score-=40; G.falseRej++; p.state="wrong"; p.t=0; fx(p.x,PARTY-40,"−40","Good part","#ff6060"); tone(SFX.wrong);
    say("frustrated","That one was good. Look before you pull.",1500); }
  renderHUD();
}
function fx(x,y,big,small,color){ G.fx.push({x,y,big,small,color,t:0}); }
function loseShield(){ G.shields--; renderHUD(true); if(G.shields<=0) endGame(false); }

/* --- spawning --- */
function pickDefect(){
  const tier=G.t>=TIER_AT[2]?2:G.t>=TIER_AT[1]?1:0;
  const pool=Object.keys(DEFECTS).filter(k=>DEFECTS[k].tier<=tier);
  // newly unlocked defects show up more often at first so players learn them
  const fresh=pool.filter(k=>DEFECTS[k].tier===tier&&tier>0);
  if(fresh.length&&Math.random()<.45) return fresh[Math.floor(Math.random()*fresh.length)];
  return pool[Math.floor(Math.random()*pool.length)];
}
function spawnPart(){
  const defect=Math.random()<(M().defect[0]+M().defect[1]*prog())?pickDefect():null;
  const fams=Object.keys(FAMILIES).filter(f=>!defect||FAMILIES[f].defects.includes(defect));
  const fam=fams[Math.floor(Math.random()*fams.length)];
  G.parts.push({x:W+PART,defect,fam,img:PARTIMG[fam+":"+(defect||"good")+(G.seed++%4)],state:"live",t:0});
  G.nextPart=(M().partGap[0]+Math.random()*M().partGap[1])*sc()*(1-.25*prog());
}
function spawnObs(){
  const high=G.t>M().highAfter && Math.random()<.42;
  G.obs.push({x:W+90,kind:high?"high":"low",v:high?0:(Math.random()<.5?0:1),checked:false,hit:false});
  G.nextObs=(M().obsGap[0]+Math.random()*M().obsGap[1])*sc()*(1-.28*prog());
}

/* --- loop --- */
function loop(now){
  raf=requestAnimationFrame(loop);
  let dt=(now-last)/1000; last=now; if(dt>.1) dt=.016;
  if(!G||G.over) return;
  if(G.paused){ draw(); return; }
  if(G.state==="count"){
    const before=Math.ceil(G.count); G.count-=dt; const after=Math.ceil(G.count);
    if(after!==before && after>0) tone(SFX.tick);
    if(G.count<=0){ G.state="run"; tone(SFX.go); $("ov").innerHTML=""; Music.reset(); Music.start(); }
    else { const lab=G.count>.6?String(Math.ceil(G.count-.4)):"GO!"; if(lab!==G.countShown){ G.countShown=lab; $("ov").innerHTML=`<div class="big">${lab}</div>`; } }
    G.runPhase+=dt*1.2; draw(); return;
  }
  step(dt); draw();
}
function step(dt){
  G.t+=dt; const v=speed();
  G.dist+=v*dt/sc(); G.nearX+=v*dt; G.farX+=v*dt*.45; G.runPhase+=dt*(2.6+1.6*prog());
  // timers
  if(G.jumpT>=0){ G.jumpT+=dt/M().jump; if(G.jumpT>=1){ G.jumpT=-1; if(G.bufSlide>0){ G.bufSlide=0; G.slideT=0; tone(SFX.slide);} else if(G.bufJump>0){ G.bufJump=0; G.jumpT=0; tone(SFX.jump);} } }
  if(G.slideT>=0){ G.slideT+=dt/M().slide; if(G.slideT>=1){ G.slideT=-1; if(G.bufJump>0){ G.bufJump=0; G.jumpT=0; tone(SFX.jump);} } }
  if(G.stumbleT>=0){ G.stumbleT+=dt/0.55; if(G.stumbleT>=1){ G.stumbleT=-1; if(G.bufJump>0){G.bufJump=0;G.jumpT=0;} else if(G.bufSlide>0){G.bufSlide=0;G.slideT=0;} } }
  if(G.catchT>=0){ G.catchT+=dt/0.24; if(G.catchT>=1) G.catchT=-1; }
  G.bufJump=Math.max(0,G.bufJump-dt); G.bufSlide=Math.max(0,G.bufSlide-dt); G.inv=Math.max(0,G.inv-dt);
  // spawn
  G.nextPart-=v*dt; if(G.nextPart<=0 && G.t<SHIFT-2.2) spawnPart();
  G.nextObs-=v*dt; if(G.t>2.5 && G.nextObs<=0 && G.t<SHIFT-2.5) spawnObs();
  // parts
  G.parts.forEach(p=>{
    if(p.state==="live"){ p.x-=v*dt;
      if(p.x<SHIP_X){ p.state="gone";
        if(p.defect){ G.escaped++; G.byType[p.defect].missed++; G.combo=0; G.score-=75; fx(110,PARTY-60,"ESCAPE −75",DEFECTS[p.defect].name,"#ff6060"); G.shipFlash=1; tone(SFX.escape);
          say("surprised",`Escape! ${DEFECTS[p.defect].name} just shipped.`,1800); loseShield(); }
        else { G.shipped++; G.score+=10; }
        renderHUD(); }
    } else { p.t+=dt; if(p.state==="caught"){ p.x-=v*dt*.3; } else p.x-=v*dt; }
  });
  G.parts=G.parts.filter(p=>p.state==="live"||(p.state!=="gone"&&p.t<.5));
  // obstacles: judged at the moment the obstacle passes Maya
  const jumpOff=jumpOffset();
  G.obs.forEach(o=>{ o.x-=v*dt;
    if(!o.checked && o.x<=G.mx){ o.checked=true;
      const ok = o.kind==="low" ? jumpOff>38 : G.slideT>=0;   // forgiving: most of the jump arc clears a pallet
      if(ok){ G.cleared++; G.score+=20; fx(G.mx,FEET-200,"+20",o.kind==="low"?"Cleared":"Ducked","#8fc6ff"); }
      else if(G.inv<=0){ o.hit=true; G.hits++; G.score-=50; G.combo=0; G.stumbleT=0; G.jumpT=-1; G.slideT=-1; G.inv=1.4;
        fx(G.mx,FEET-200,"−50",o.kind==="low"?"Tripped":"Head strike","#ff6060"); tone(SFX.hit);
        say("frustrated",o.kind==="low"?"Watch your footing! Jump the pallets.":"Low beam! Slide under it.",1700); loseShield(); }
      renderHUD(); } });
  G.obs=G.obs.filter(o=>o.x>-160);
  G.fx.forEach(f=>f.t+=dt); G.fx=G.fx.filter(f=>f.t<1.1);
  if(G.shipFlash) G.shipFlash=Math.max(0,G.shipFlash-dt*1.6);
  // announcements
  if(G.tierShown<1 && G.t>=TIER_AT[1]){ G.tierShown=1; announce("NEW DEFECTS","Wrong component · Misaligned bore · Chipped tooth"); say("determined","New defects: brass parts, off-center bores and chipped gear teeth.",2600); }
  if(G.tierShown<2 && G.t>=TIER_AT[2]){ G.tierShown=2; announce("LINE SPEEDING UP","Hairline cracks start now"); say("determined","Cracks now. Watch the bore edge, upper right.",2600); }
  if(G.t>G.sayUntil && G.t>1.5){ G.sayUntil=G.t+999; say("confident",G.t>55?"Last stretch. Stay sharp.":G.t>25?"Check the bore on every part.":"Eyes on the line.",0); }
  if(Math.floor(G.t*4)!==Math.floor((G.t-dt)*4)) renderHUD();
  if(G.t>=SHIFT) endGame(true);
}
function announce(a,b){ const d=document.createElement("div"); d.className="banner-new"; d.innerHTML=`${a}<small>${b}</small>`; $("stagebox").appendChild(d); setTimeout(()=>d.remove(),2700); tone([[660,.1],[880,.12]]); }
function jumpOffset(){ return G.jumpT>=0 ? 4*M().apex*G.jumpT*(1-G.jumpT) : 0; }

/* --- HUD --- */
function renderHUD(bump){
  if(!G) return;
  $("hScore").textContent=G.score;
  const c=$("hCombo"); c.textContent="×"+mult(); c.classList.toggle("hot",mult()>=3);
  const left=Math.max(0,Math.ceil(SHIFT-G.t)); $("hTime").textContent=`${Math.floor(left/60)}:${String(left%60).padStart(2,"0")}`;
  $("hShields").innerHTML=Array.from({length:SHIELDS},(_,k)=>`<span class="${k<G.shields?"":"lost"}">${SHIELD_SVG}</span>`).join("");
}

/* --- drawing --- */
function tile(img,offset,y,h){
  if(!img.width) return; const w=img.width*(h/img.height); let x=-(offset%w);
  for(;x<W;x+=w) ctx.drawImage(img,Math.floor(x),y,Math.ceil(w)+1,h);
}
function draw(){
  if(!cv.width) return;
  ctx.setTransform(SCALE*DPR,0,0,SCALE*DPR,0,0); ctx.imageSmoothingQuality="high";
  const g=G||newGame();
  tile(IMG.bg_far,g.farX,0,292); tile(IMG.bg_near,g.nearX,292,248);
  // shipping zone
  const sg=ctx.createLinearGradient(0,0,70,0); sg.addColorStop(0,`rgba(212,42,42,${.55+.4*(g.shipFlash||0)})`); sg.addColorStop(1,"rgba(212,42,42,0)");
  ctx.fillStyle=sg; ctx.fillRect(0,170,70,140);
  ctx.save(); ctx.translate(15,240); ctx.rotate(-Math.PI/2); ctx.fillStyle="#fff"; ctx.font="700 13px 'Barlow Condensed',sans-serif"; ctx.textAlign="center"; ctx.fillText("SHIPPING ◂",0,4); ctx.restore();
  // parts on the belt
  g.parts.forEach(p=>{
    let a=1,y=PARTY,s=1;
    if(p.state==="caught"){ y-=p.t*120; a=1-p.t*2; s=1+p.t*.4; }
    if(p.state==="wrong"){ a=1-p.t*2; }
    ctx.globalAlpha=Math.max(0,a);
    ctx.fillStyle="rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(p.x,BELT+2,PART*.46,6,0,0,Math.PI*2); ctx.fill();
    if(p.img&&p.img.width) ctx.drawImage(p.img,p.x-PART*s/2,y-PART*s/2,PART*s,PART*s);
    if(p.state==="caught"){ ctx.strokeStyle="#56f08a"; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(p.x,y,PART*.62*s,0,Math.PI*2); ctx.stroke(); }
    if(p.state==="wrong"){ ctx.strokeStyle="#ff6060"; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(p.x,y,PART*.62,0,Math.PI*2); ctx.stroke(); }
    ctx.globalAlpha=1;
  });
  // obstacles
  g.obs.forEach(o=>drawObs(o));
  // Maya
  drawMaya(g);
  // floating text
  g.fx.forEach(f=>{ const a=Math.min(1,1.6-f.t*1.5); ctx.globalAlpha=Math.max(0,a); const y=f.y-f.t*46;
    ctx.textAlign="center"; ctx.lineWidth=5; ctx.strokeStyle="rgba(0,0,0,.75)";
    ctx.font="22px 'Lilita One',Impact,sans-serif"; ctx.strokeText(f.big,f.x,y); ctx.fillStyle=f.color; ctx.fillText(f.big,f.x,y);
    if(f.small){ ctx.font="700 13px 'Barlow Condensed',sans-serif"; ctx.lineWidth=4; ctx.strokeText(f.small.toUpperCase(),f.x,y+16); ctx.fillStyle="#fff"; ctx.fillText(f.small.toUpperCase(),f.x,y+16); }
    ctx.globalAlpha=1; });
  // speed lines late in the shift
  if(G && prog()>.6 && G.state==="run"){ ctx.strokeStyle="rgba(255,255,255,.12)"; ctx.lineWidth=2;
    for(let i=0;i<6;i++){ const y=60+((i*83+G.nearX*.7)%360), x=(W-((G.nearX*1.7+i*211)%(W+200))); ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+70,y); ctx.stroke(); } }
}
function drawMaya(g){
  let img, h, y=FEET, x=g.mx;
  if(g.stumbleT>=0){ img=IMG.stumble; h=94; x-=10*Math.sin(g.stumbleT*Math.PI); }
  else if(g.slideT>=0){ img=IMG.slide; h=94; }
  else if(g.jumpT>=0){ img=IMG.jump; h=142; y-=4*M().apex*g.jumpT*(1-g.jumpT); }
  else if(g.catchT>=0){ img=IMG.dive; h=104; }
  else { const seq=[0,1,2,1]; img=IMG["run"+seq[Math.floor(g.runPhase*4)%4]]; h=170; y-=Math.abs(Math.sin(g.runPhase*Math.PI*2))*3; }
  if(!img||!img.width) return;
  const w=img.width*h/img.height;
  // shadow
  const lift=FEET-y; ctx.fillStyle=`rgba(0,0,0,${.38-lift/600})`; ctx.beginPath(); ctx.ellipse(g.mx,FEET+2,Math.max(18,46-lift/6),7,0,0,Math.PI*2); ctx.fill();
  if(g.inv>0 && Math.floor(g.inv*12)%2===0 && g.stumbleT<0) ctx.globalAlpha=.4;
  ctx.drawImage(img,x-w*0.5,y-h,w,h); ctx.globalAlpha=1;
}
function drawObs(o){
  const x=o.x;
  if(o.kind==="high"){
    const bottom=FEET-108, top=bottom-36;
    ctx.strokeStyle="#4b5563"; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x-40,0); ctx.lineTo(x-40,top); ctx.moveTo(x+40,0); ctx.lineTo(x+40,top); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(x-66,top,132,36); ctx.clip();
    ctx.fillStyle="#ffcc1f"; ctx.fillRect(x-66,top,132,36); ctx.fillStyle="#111";
    for(let i=-6;i<8;i++){ ctx.beginPath(); ctx.moveTo(x-66+i*22,top+36); ctx.lineTo(x-66+i*22+14,top+36); ctx.lineTo(x-66+i*22+50,top); ctx.lineTo(x-66+i*22+36,top); ctx.fill(); }
    ctx.restore(); ctx.strokeStyle="#111"; ctx.lineWidth=2; ctx.strokeRect(x-66,top,132,36);
    // label plate on the beam itself, so it never covers parts on the belt
    ctx.fillStyle="rgba(10,14,20,.9)"; ctx.fillRect(x-48,top+8,96,20); ctx.strokeStyle="#ffcc1f"; ctx.lineWidth=1.5; ctx.strokeRect(x-48,top+8,96,20);
    ctx.fillStyle="#ffcc1f"; ctx.font="700 13px 'Barlow Condensed',sans-serif"; ctx.textAlign="center"; ctx.fillText("LOW CLEARANCE",x,top+23);
  } else if(o.v===0){            // pallet of boxes
    ctx.fillStyle="#8a5a2b"; ctx.fillRect(x-46,FEET-16,92,14); ctx.fillStyle="#6b4420"; for(const dx of [-44,-6,32]) ctx.fillRect(x+dx,FEET-4,12,6);
    const bx=[[x-42,FEET-62,44,46],[x+2,FEET-62,40,46],[x-24,FEET-98,46,36]];
    bx.forEach(([bx,by,bw,bh])=>{ ctx.fillStyle="#c98e4e"; ctx.fillRect(bx,by,bw,bh); ctx.strokeStyle="#7b5426"; ctx.lineWidth=2; ctx.strokeRect(bx,by,bw,bh);
      ctx.fillStyle="#e7c48c"; ctx.fillRect(bx+bw/2-4,by,8,bh); });
  } else {                       // spill with wet-floor sign
    ctx.fillStyle="rgba(80,140,220,.55)"; ctx.beginPath(); ctx.ellipse(x+6,FEET-1,58,9,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="rgba(200,230,255,.5)"; ctx.beginPath(); ctx.ellipse(x-10,FEET-3,18,3,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#ffcc1f"; ctx.strokeStyle="#7a5a00"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x-22,FEET-2); ctx.lineTo(x-6,FEET-70); ctx.lineTo(x+6,FEET-70); ctx.lineTo(x+22,FEET-2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle="#111"; ctx.font="30px 'Lilita One',Impact,sans-serif"; ctx.textAlign="center"; ctx.fillText("!",x,FEET-22);
  }
}

/* --- end of shift --- */
function rankFor(r){
  const total=r.caught+r.escaped, det=total?r.caught/total:0; let k=0;
  if(det>=.5) k=1;
  if(det>=.75 && r.complete) k=2;
  if(det>=.9 && r.complete && r.hits<=2) k=3;
  if(det>=.97 && r.complete && r.falseRej<=1 && r.hits<=1) k=4;
  if(!r.complete) k=Math.min(k,1);
  return {k,det};
}
function endGame(complete){
  if(G.over) return; G.over=true; G.state="over"; Music.stop();
  if(complete) G.score+=100*G.shields;
  const r={complete,score:G.score,caught:G.caught,escaped:G.escaped,falseRej:G.falseRej,cleared:G.cleared,hits:G.hits,shields:G.shields,
    bestCombo:G.bestCombo,dist:Math.round(G.dist/10),byType:G.byType,t:Math.min(G.t,SHIFT)};
  const prevBest=loadBest(); r.newBest=r.score>prevBest; if(r.newBest) saveBest(r.score);
  tone(complete?SFX.win:SFX.over);
  setTimeout(()=>{ cancelAnimationFrame(raf); renderEnd(r); },complete?400:900);
}
function renderEnd(r){
  const {k,det}=rankFor(r);
  const line = !r.complete ? "Too many escapes and stumbles. The line's down. Shake it off and run it again." :
    k===4 ? "Clean shift. Every defect pulled, nothing shipped. That's Mister Quality work." :
    r.escaped ? "Shift done, but parts got past us. Every escape is a part in a customer's hands." : "Solid shift. Now do it faster and cleaner.";
  const types=Object.keys(DEFECTS).filter(t=>r.byType[t].caught+r.byType[t].missed>0);
  $("end").innerHTML=`<div class="wrap">
    <div class="endhero" style="--rc:${r.complete?"var(--gold)":"var(--stop-hi)"};--rg:${r.complete?"rgba(255,204,31,.4)":"rgba(255,60,60,.4)"}">
      <img src="${r.complete?ASSETS.end_win:ASSETS.end_shutdown}" alt="${r.complete?"Maya celebrating":"Maya at a line shutdown"}">
      <h1>${r.complete?"SHIFT COMPLETE":"LINE SHUTDOWN"}<small>${r.complete?`${r.shields} SHIELD${r.shields===1?"":"S"} LEFT · +${100*r.shields} BONUS`:`STOPPED AT ${Math.floor(r.t/60)}:${String(Math.floor(r.t%60)).padStart(2,"0")}`}</small></h1>
    </div>
    <section class="panel callout"><div class="face">${face(r.complete?(k>=3?"celebrate":"happy"):"frustrated")}</div><div class="bubble"><small>Maya</small>${line}</div></section>
    <section class="panel rankp"><div class="k">Shift rank · ${M().name} pace</div><div class="rankname">${RANKS[k]}</div>
      <div class="ladder">${RANKS.map((n,i)=>`<span class="${i===k?"on":""}">${n}</span>`).join("")}</div></section>
    <div class="kpis">
      <div class="kpi"><b class="pos">${r.score}</b><span>${r.newBest?"New best score!":loadBest()>0?"Score · best "+loadBest():"Score"}</span></div>
      <div class="kpi"><b>${Math.round(det*100)}%</b><span>Defect detection</span></div>
      <div class="kpi"><b>${r.caught}</b><span>Defects pulled</span></div>
      <div class="kpi"><b style="color:${r.escaped?"var(--stop-hi)":"var(--go-hi)"}">${r.escaped}</b><span>Escapes</span></div>
      <div class="kpi"><b>${r.falseRej}</b><span>False rejects</span></div>
      <div class="kpi"><b>${r.cleared}/${r.cleared+r.hits}</b><span>Obstacles cleared</span></div>
      <div class="kpi"><b>×${Math.min(1+Math.floor(r.bestCombo/2),5)}</b><span>Best combo (${r.bestCombo} in a row)</span></div>
      <div class="kpi"><b>${r.dist}m</b><span>Distance run</span></div>
    </div>
    <div class="banner"><span>Defect report</span></div>
    <section class="panel dtable">${types.length?types.map(t=>{const b=r.byType[t];return `<div class="drow"><img alt="" src="${svgURL(partSVG(t==="chipped"?"gear":"housing",t,2))}"><div><b>${DEFECTS[t].name}</b><p>${DEFECTS[t].lesson}</p></div>
      <div class="n"><span style="color:var(--go-hi)">${b.caught}</span> / <span style="color:${b.missed?"var(--stop-hi)":"var(--muted)"}">${b.missed}</span></div></div>`}).join("")+`<p class="foot" style="text-align:right;margin:2px 0 0">pulled / escaped</p>`:`<p style="margin:0">No defects reached you this shift.</p>`}</section>
    <button class="cta" id="againBtn"><span>RUN ANOTHER SHIFT<small>${Math.max(r.score,loadBest())>0?"BEAT "+Math.max(r.score,loadBest()):"TRY AGAIN"}</small></span></button>
    <button class="cta alt" id="homeBtn"><span>BACK TO TITLE</span></button>
    <p class="foot">© 2026 Marcus Faulkner · Quality Rush · Mister Quality™</p>
  </div>`;
  show("end");
  $("againBtn").onclick=()=>{ tone(SFX.click); startGame(); };
  $("homeBtn").onclick=()=>{ tone(SFX.click); renderTitle(); show("title"); };
}

/* ===================== Boot ===================== */
const READY=loadAll();
(function boot(){ renderTitle(); show("title"); })();
