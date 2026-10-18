document.querySelector("#year").textContent=new Date().getFullYear();

const catalog=document.querySelector("#catalogo");
const catalogLinks=document.querySelector("#catalog-links");
let catalogProducts=Array.isArray(window.TUNITA_PRODUCTS)?window.TUNITA_PRODUCTS:[];
const escapeHTML=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const slugify=value=>String(value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const groups=new Map();
function renderCatalog(){
  groups.clear();
  catalogProducts.forEach(product=>{
    if(!product.category||!product.name||!product.image||product.active===false)return;
    if(!groups.has(product.category))groups.set(product.category,[]);
    groups.get(product.category).push(product);
  });
  catalog.innerHTML=[...groups.entries()].map(([category,products])=>{
  const sectionId=`categoria-${slugify(category)}`;
  return `<section class="featured-product" id="${sectionId}"><div class="product-heading"><p class="hand-label"><span>✿</span> Una selección para ${escapeHTML(category.toLowerCase())}</p><p>Prendas por pedido, sujetas a disponibilidad.</p></div>${products.map(product=>{
    const title=escapeHTML(product.name),detail=escapeHTML(product.detail||"Prenda infantil"),description=escapeHTML(product.description||"Consultanos por WhatsApp para conocer más detalles.");
    const price=Number(product.price),formattedPrice=Number.isFinite(price)?new Intl.NumberFormat("es-UY").format(price):escapeHTML(product.price||"Consultar");
    const message=encodeURIComponent(`Hola Tunita Kids, quiero consultar por ${product.name}.`);
    const audience=product.audience?` <i>·</i> ${escapeHTML(product.audience)}`:"";
    return `<article class="product-spread"><div class="product-photo"><img src="${escapeHTML(product.image)}" alt="${title}: ${detail}" loading="lazy"><span>${detail}</span></div><div class="product-details"><p class="product-kicker">${escapeHTML(category)}${audience} <i>·</i> Por pedido</p><h2>${title}</h2><p class="product-description">${description}</p><div class="product-price"><span>Precio</span><strong>$${formattedPrice}</strong><small>Consultá talles y disponibilidad</small></div><a class="primary-link" href="https://wa.me/59892822192?text=${message}" target="_blank" rel="noreferrer">Consultar por WhatsApp <span>↗</span></a><p class="product-note">Confirmamos disponibilidad antes de coordinar tu pedido.</p></div></article>`;
  }).join("")}</section>`;
  }).join("");
  catalogLinks.innerHTML=[...groups.keys()].map(category=>`<a class="drawer-link" href="#categoria-${slugify(category)}">${escapeHTML(category)} <span>✿</span></a>`).join("");
}
renderCatalog();

// Cuando el catálogo esté conectado, la web tomará los productos publicados de la base.
const dbConfig=window.TUNITA_SUPABASE||{};
if(dbConfig.url&&dbConfig.key&&window.supabase?.createClient){
  const publicClient=window.supabase.createClient(dbConfig.url,dbConfig.key);
  publicClient.from("products").select("category,name,detail,price,image_url,description,active").eq("active",true).order("created_at",{ascending:false})
    .then(({data,error})=>{if(!error&&Array.isArray(data)){catalogProducts=data.map(product=>({...product,image:product.image_url}));renderCatalog();}});
}

const categoryNames={remeras:"remeras",pantalones:"pantalones",buzos:"buzos",shorts:"shorts",medias:"medias"};
const categoryButtons=[...document.querySelectorAll("[data-select-category]")];
const contactTitle=document.querySelector("#contact-title");
const contactDescription=document.querySelector("#contact-description");
const contactWhatsapp=document.querySelector("#contact-whatsapp");
categoryButtons.forEach(button=>button.addEventListener("click",()=>{
  const category=categoryNames[button.dataset.selectCategory];
  if(category){
    contactTitle.textContent=`¿Buscás ${category}?`;
    contactDescription.textContent=`Consultanos por ${category}: revisamos las opciones disponibles y coordinamos tu pedido por WhatsApp.`;
    contactWhatsapp.href=`https://wa.me/59892822192?text=${encodeURIComponent(`Hola Tunita Kids, quería consultar por ${category}.`)}`;
    contactWhatsapp.textContent="Consultar disponibilidad →";
    contactWhatsapp.setAttribute("aria-label",`Consultar disponibilidad de ${category} por WhatsApp`);
  }
  setDrawerOpen(false);
  document.querySelector("#ropa").scrollIntoView({behavior:"smooth",block:"start"});
}));

const menuTrigger=document.querySelector("#menu-trigger");
const sideMenu=document.querySelector("#side-menu");
const drawerShade=document.querySelector("#drawer-shade");
const drawerClose=document.querySelector("#drawer-close");
function setDrawerOpen(open){
  menuTrigger.setAttribute("aria-expanded",String(open));
  sideMenu.setAttribute("aria-hidden",String(!open));
  sideMenu.inert=!open;
  sideMenu.classList.toggle("is-open",open);
  drawerShade.hidden=!open;
  document.body.classList.toggle("drawer-open",open);
  if(open)drawerClose.focus();else menuTrigger.focus();
}
menuTrigger.addEventListener("click",()=>setDrawerOpen(menuTrigger.getAttribute("aria-expanded")!=="true"));
drawerClose.addEventListener("click",()=>setDrawerOpen(false));
drawerShade.addEventListener("click",()=>setDrawerOpen(false));
sideMenu.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>setDrawerOpen(false)));
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&menuTrigger.getAttribute("aria-expanded")==="true")setDrawerOpen(false)});

