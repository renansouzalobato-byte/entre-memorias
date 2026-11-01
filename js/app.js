const DEFAULT_CONTENT = {
  config: {
    title: "Entre Memórias",
    intro: "Algumas coisas merecem um lugar só delas.",
    letter: "Este espaço é seu. Escreva aqui uma mensagem pessoal quando sentir que encontrou as palavras certas.",
    signature: "com carinho,",
    ambientAudio: ""
  },
  memories: [],
  gallery: [],
  audios: []
};

let content = structuredClone(DEFAULT_CONTENT);
let currentScreen = "inicio";
let galleryItems = [];
let galleryIndex = 0;
let adminTab = "memories";
let ambient = null;

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];

async function loadContent(){
  try {
    const response = await fetch("data/content.json");
    if(!response.ok) throw new Error("Não foi possível carregar o conteúdo");
    const data = await response.json();
    content = normalizeContent(data);
  } catch(error) {
    console.info("Usando conteúdo padrão. Abra o projeto por um servidor HTTP para carregar o JSON.", error);
    content = normalizeContent(DEFAULT_CONTENT);
  }
  renderAll();
}

function normalizeContent(data){
  return {
    config: {...DEFAULT_CONTENT.config, ...(data.config || {})},
    memories: Array.isArray(data.memories) ? data.memories : [],
    gallery: Array.isArray(data.gallery) ? data.gallery : [],
    audios: Array.isArray(data.audios) ? data.audios : []
  };
}

function renderAll(){
  document.title = content.config.title || "Entre Memórias";
  $("#heroTitle").innerHTML = (content.config.title || "Entre Memórias").replace(" ", "<br><em>") + (content.config.title?.includes(" ") ? "</em>" : "");
  $("#introText").textContent = content.config.intro || "";
  $("#letterBody").textContent = content.config.letter || "";
  $("#signature").textContent = content.config.signature || "";
  renderMemories();
  renderGallery();
  renderAudios();
  setupAmbient();
}

function renderMemories(){
  const host = $("#memoryList");
  if(!content.memories.length){
    host.innerHTML = emptyState("✳","Este espaço está esperando suas memórias.","Adicione datas, textos e fotografias pelo painel de edição.");
    return;
  }
  host.innerHTML = content.memories.map((m,i)=>`
    <article class="memory-card">
      ${m.image ? `<img class="memory-image" src="${escapeAttr(m.image)}" alt="${escapeAttr(m.alt || m.title || "Fotografia de uma memória")}" loading="lazy">` : `<div class="memory-image placeholder" aria-hidden="true">✳</div>`}
      <div><span class="memory-date">${escapeHTML(m.date || "uma lembrança")}</span><h3>${escapeHTML(m.title || "Sem título")}</h3><p>${escapeHTML(m.description || "")}</p>${m.caption ? `<p class="memory-date" style="margin-top:13px">${escapeHTML(m.caption)}</p>` : ""}</div>
    </article>`).join("");
}
function renderGallery(){
  const host = $("#galleryGrid");
  galleryItems = content.gallery.filter(x=>x.image);
  if(!galleryItems.length){
    host.innerHTML = emptyState("▧","As fotografias aparecem aqui.","Adicione imagens e legendas quando quiser.");
    return;
  }
  host.innerHTML = galleryItems.map((g,i)=>`
    <figure class="gallery-item" style="--tilt:${i%2===0?-1.4:1.2}deg" data-gallery-index="${i}" tabindex="0" role="button" aria-label="Ampliar ${escapeAttr(g.caption || "fotografia")}">
      <img src="${escapeAttr(g.image)}" alt="${escapeAttr(g.alt || g.caption || "Fotografia")}" loading="lazy">
      <figcaption>${escapeHTML(g.caption || "um registro")}</figcaption>
    </figure>`).join("");
  $$(".gallery-item",host).forEach(el=>{
    el.addEventListener("click",()=>openImage(Number(el.dataset.galleryIndex)));
    el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openImage(Number(el.dataset.galleryIndex));}});
  });
}
function renderAudios(){
  const host = $("#audioList");
  if(!content.audios.length){
    host.innerHTML = emptyState("♫","Nenhuma gravação adicionada ainda.","Você poderá incluir áudios pessoais no painel de edição.");
    return;
  }
  host.innerHTML = content.audios.map((a,i)=>`
    <article class="audio-card">
      <div class="audio-icon">♫</div>
      <div class="audio-meta"><h3>${escapeHTML(a.title || "Gravação")}</h3><p>${escapeHTML(a.description || "Um pequeno registro sonoro.")}</p><audio controls preload="none" src="${escapeAttr(a.src)}" aria-label="${escapeAttr(a.title || "Gravação")}"></audio></div>
      <span class="audio-duration">REGISTRO ${String(i+1).padStart(2,"0")}</span>
    </article>`).join("");
  const players = $$("audio",host);
  players.forEach(player=>player.addEventListener("play",()=>players.filter(p=>p!==player).forEach(p=>p.pause())));
}
function emptyState(icon,title,desc){return `<div class="empty-state"><span>${icon}</span><h3>${escapeHTML(title)}</h3><p>${escapeHTML(desc)}</p></div>`}
function escapeHTML(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(value){return escapeHTML(value)}

function goTo(id){
  const target = document.getElementById(id);
  if(!target) return;
  currentScreen=id;
  $$(".screen").forEach(s=>s.classList.toggle("active",s.id===id));
  $$(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.go===id));
  const order=["inicio","jornada","sons","galeria","detalhes","carta"];
  $("#progressBar").style.width=((order.indexOf(id)+1)/order.length*100)+"%";
  window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
}
function openImage(index){
  if(!galleryItems.length)return;
  galleryIndex=index;
  updateImageModal();
  $("#imageModal").classList.add("open");
  $("#imageModal").setAttribute("aria-hidden","false");
}
function updateImageModal(){
  const item=galleryItems[galleryIndex];
  $("#modalImage").src=item.image;
  $("#modalImage").alt=item.alt||item.caption||"Fotografia";
  $("#modalCaption").textContent=item.caption||"";
}
function closeImage(){
  $("#imageModal").classList.remove("open");
  $("#imageModal").setAttribute("aria-hidden","true");
  $("#modalImage").src="";
}
function setupAmbient(){
  if(ambient){ambient.pause();ambient=null}
  const button=$("#musicToggle");
  if(content.config.ambientAudio){
    ambient=new Audio(content.config.ambientAudio);
    ambient.loop=true;
    button.style.display="inline-grid";
    button.textContent="♫";
    button.onclick=async()=>{
      try{
        if(ambient.paused){await ambient.play();button.classList.add("playing");button.setAttribute("aria-label","Pausar música ambiente")}
        else{ambient.pause();button.classList.remove("playing");button.setAttribute("aria-label","Ativar música ambiente")}
      }catch(e){alert("Não foi possível reproduzir o áudio. Verifique o arquivo configurado.")}
    };
  }else{
    button.style.display="none";
  }
}

function openAdmin(){
  $("#adminModal").classList.add("open");
  $("#adminModal").setAttribute("aria-hidden","false");
  renderAdmin();
}
function closeAdmin(){
  $("#adminModal").classList.remove("open");
  $("#adminModal").setAttribute("aria-hidden","true");
}
function renderAdmin(){
  $$(".admin-tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===adminTab));
  const host=$("#adminContent");
  if(adminTab==="memories") host.innerHTML=memoryForm()+itemList(content.memories,"memories");
  if(adminTab==="photos") host.innerHTML=photoForm()+itemList(content.gallery,"gallery");
  if(adminTab==="audios") host.innerHTML=audioForm()+itemList(content.audios,"audios");
  if(adminTab==="letter") host.innerHTML=letterForm();
  bindAdminForms();
}
function memoryForm(){return `<form id="memoryForm"><div class="form-grid">
  <div class="form-field"><label>Título</label><input name="title" required placeholder="Ex.: Um dia especial"></div>
  <div class="form-field"><label>Data ou período</label><input name="date" placeholder="Ex.: março de 2026"></div>
  <div class="form-field full"><label>Descrição</label><textarea name="description" placeholder="Conte um pouco sobre essa lembrança..."></textarea></div>
  <div class="form-field"><label>Caminho da imagem (opcional)</label><input name="image" placeholder="assets/images/foto.jpg"></div>
  <div class="form-field"><label>Legenda (opcional)</label><input name="caption" placeholder="Uma pequena legenda"></div>
  </div><div class="form-actions"><button class="primary-button" type="submit">Adicionar memória +</button></div></form>
  <p class="helper-text">Dica: coloque a imagem na pasta assets/images e informe o caminho relativo. Depois exporte o JSON.</p>`}
function photoForm(){return `<form id="photoForm"><div class="form-grid">
  <div class="form-field"><label>Caminho da imagem</label><input name="image" required placeholder="assets/images/foto.jpg"></div>
  <div class="form-field"><label>Legenda</label><input name="caption" placeholder="Uma lembrança..."></div>
  <div class="form-field full"><label>Texto alternativo (acessibilidade)</label><input name="alt" placeholder="Descreva brevemente a imagem"></div>
  </div><div class="form-actions"><button class="primary-button" type="submit">Adicionar fotografia +</button></div></form>
  <p class="helper-text">Copie a imagem para assets/images. Use JPG, PNG ou WebP e caminhos relativos.</p>`}
function audioForm(){return `<form id="audioForm"><div class="form-grid">
  <div class="form-field"><label>Título</label><input name="title" required placeholder="Ex.: Uma risada"></div>
  <div class="form-field"><label>Caminho do áudio</label><input name="src" required placeholder="assets/audio/audio-01.mp3"></div>
  <div class="form-field full"><label>Descrição</label><input name="description" placeholder="O contexto dessa gravação"></div>
  </div><div class="form-actions"><button class="primary-button" type="submit">Adicionar áudio +</button></div></form>
  <p class="helper-text">Copie o arquivo para assets/audio. Formatos comuns: MP3, WAV ou OGG. Use somente gravações que seja adequado compartilhar.</p>`}
function letterForm(){return `<form id="letterForm" class="letter-fields">
  <div class="form-field"><label>Título do site</label><input name="title" value="${escapeAttr(content.config.title)}"></div>
  <div class="form-field"><label>Frase de abertura</label><textarea name="intro">${escapeHTML(content.config.intro)}</textarea></div>
  <div class="form-field"><label>Mensagem final</label><textarea name="letter" style="min-height:160px">${escapeHTML(content.config.letter)}</textarea></div>
  <div class="form-field"><label>Assinatura</label><input name="signature" value="${escapeAttr(content.config.signature)}"></div>
  <div class="form-field"><label>Caminho da música ambiente (opcional)</label><input name="ambientAudio" value="${escapeAttr(content.config.ambientAudio)}" placeholder="assets/audio/musica.mp3"></div>
  <div class="form-actions"><button class="primary-button" type="submit">Salvar textos</button></div>
  </form><p class="helper-text">As alterações serão incluídas no JSON quando você exportar o conteúdo.</p>`}
function itemList(items,type){
  if(!items.length)return `<div class="item-list"><p class="helper-text">Nenhum item adicionado ainda.</p></div>`;
  return `<div class="item-list">${items.map((item,i)=>`<div class="admin-item"><span>${escapeHTML(item.title||item.caption||"Item sem título")}</span><button type="button" data-delete="${type}" data-index="${i}">Excluir</button></div>`).join("")}</div>`;
}
function bindAdminForms(){
  const mf=$("#memoryForm");
  if(mf)mf.addEventListener("submit",e=>{e.preventDefault();const d=Object.fromEntries(new FormData(mf));content.memories.push({id:crypto.randomUUID(),...d});renderAll();renderAdmin();});
  const pf=$("#photoForm");
  if(pf)pf.addEventListener("submit",e=>{e.preventDefault();const d=Object.fromEntries(new FormData(pf));content.gallery.push({id:crypto.randomUUID(),...d});renderAll();renderAdmin();});
  const af=$("#audioForm");
  if(af)af.addEventListener("submit",e=>{e.preventDefault();const d=Object.fromEntries(new FormData(af));content.audios.push({id:crypto.randomUUID(),...d});renderAll();renderAdmin();});
  const lf=$("#letterForm");
  if(lf)lf.addEventListener("submit",e=>{e.preventDefault();Object.assign(content.config,Object.fromEntries(new FormData(lf)));renderAll();renderAdmin();alert("Textos atualizados neste navegador. Exporte o JSON para publicar.");});
  $$("[data-delete]",$("#adminContent")).forEach(btn=>btn.addEventListener("click",()=>{
    const type=btn.dataset.delete,index=Number(btn.dataset.index);
    const key=type==="memories"?"memories":type==="gallery"?"gallery":"audios";
    if(confirm("Excluir este item?")){content[key].splice(index,1);renderAll();renderAdmin();}
  }));
}
function exportJSON(){
  const blob=new Blob([JSON.stringify(content,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="content.json";a.click();URL.revokeObjectURL(url);
}
function importJSON(file){
  const reader=new FileReader();
  reader.onload=()=>{
    try{content=normalizeContent(JSON.parse(reader.result));renderAll();renderAdmin();alert("Conteúdo importado com sucesso.");}
    catch(e){alert("Não foi possível ler esse JSON. Verifique o arquivo.");}
  };
  reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded",()=>{
  loadContent();
  $$(".nav-link").forEach(b=>b.addEventListener("click",()=>goTo(b.dataset.go)));
  $("#startJourney").addEventListener("click",()=>goTo("jornada"));
  $$("[data-next]").forEach(b=>b.addEventListener("click",()=>goTo(b.dataset.next)));
  $("#restartJourney").addEventListener("click",()=>goTo("inicio"));
  $("#modalClose").addEventListener("click",closeImage);
  $("#imageModal").addEventListener("click",e=>{if(e.target.id==="imageModal")closeImage()});
  $("#modalPrev").addEventListener("click",()=>{galleryIndex=(galleryIndex-1+galleryItems.length)%galleryItems.length;updateImageModal()});
  $("#modalNext").addEventListener("click",()=>{galleryIndex=(galleryIndex+1)%galleryItems.length;updateImageModal()});
  $("#adminOpen").addEventListener("click",openAdmin);
  $("#adminClose").addEventListener("click",closeAdmin);
  $("#adminModal").addEventListener("click",e=>{if(e.target.id==="adminModal")closeAdmin()});
  $$(".admin-tab").forEach(b=>b.addEventListener("click",()=>{adminTab=b.dataset.tab;renderAdmin()}));
  $("#exportData").addEventListener("click",exportJSON);
  $("#importData").addEventListener("change",e=>{if(e.target.files[0])importJSON(e.target.files[0]);e.target.value=""});
  $("#resetData").addEventListener("click",()=>{if(confirm("Restaurar o conteúdo inicial? Isso descarta as alterações deste navegador.")){content=structuredClone(DEFAULT_CONTENT);renderAll();renderAdmin();}});
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){closeImage();closeAdmin()}
    if($("#imageModal").classList.contains("open")&&e.key==="ArrowRight")$("#modalNext").click();
    if($("#imageModal").classList.contains("open")&&e.key==="ArrowLeft")$("#modalPrev").click();
  });
});
