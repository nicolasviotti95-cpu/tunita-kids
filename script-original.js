const yearNode=document.querySelector("#year");
if(yearNode)yearNode.textContent=new Date().getFullYear();

const catalog=document.querySelector("#catalogo");
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
}
renderCatalog();

// Cuando el catálogo esté conectado, la web tomará los productos publicados de la base.
const dbConfig=window.TUNITA_SUPABASE||{};
let publicClient=null;
if(dbConfig.url&&dbConfig.key&&window.supabase?.createClient){
  publicClient=window.supabase.createClient(dbConfig.url,dbConfig.key);
  publicClient.from("products").select("category,name,detail,price,image_url,description,active").eq("active",true).order("created_at",{ascending:false})
    .then(({data,error})=>{if(!error&&Array.isArray(data)){catalogProducts=data.map(product=>({...product,image:product.image_url}));renderCatalog();}});
}

const categoryButtons=[...document.querySelectorAll("[data-catalog-category]")];
const contactTitle=document.querySelector("#contact-title");
const contactDescription=document.querySelector("#contact-description");
const contactWhatsapp=document.querySelector("#contact-whatsapp");
categoryButtons.forEach(button=>button.addEventListener("click",()=>{
  const category=button.dataset.catalogCategory;
  const section=document.querySelector(`#categoria-${slugify(category)}`);
  setDrawerOpen(false);
  if(section){document.querySelector("#ropa").hidden=true;section.scrollIntoView({behavior:"smooth",block:"start"});return;}
  document.querySelector("#ropa").hidden=false;
  contactTitle.textContent=`¿Buscás ${category.toLowerCase()}?`;
  contactDescription.textContent=`Estamos preparando esta parte del catálogo. Escribinos y consultamos opciones y disponibilidad de ${category.toLowerCase()}.`;
  contactWhatsapp.href=`https://wa.me/59892822192?text=${encodeURIComponent(`Hola Tunita Kids, quería consultar por ${category.toLowerCase()}.`)}`;
  contactWhatsapp.textContent="Consultar disponibilidad →";
  contactWhatsapp.setAttribute("aria-label",`Consultar disponibilidad de ${category.toLowerCase()} por WhatsApp`);
  document.querySelector("#ropa").scrollIntoView({behavior:"smooth",block:"start"});
}));

// El enlace privado aparece únicamente si hay una sesión autenticada y autorizada.
const adminMenuLink=document.querySelector("#menu-admin-link");
async function refreshAdminMenuLink(session){
  if(!adminMenuLink)return;
  adminMenuLink.hidden=true;
  if(!session?.user||!publicClient)return;
  const {data}=await publicClient.from("admin_users").select("user_id").eq("user_id",session.user.id).maybeSingle();
  adminMenuLink.hidden=!data;
}
if(publicClient){
  publicClient.auth.getSession().then(({data})=>refreshAdminMenuLink(data.session));
  publicClient.auth.onAuthStateChange((_event,session)=>setTimeout(()=>refreshAdminMenuLink(session),0));
}

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
document.querySelector("#hero-open-categories").addEventListener("click",()=>setDrawerOpen(true));
document.querySelector("#return-to-categories").addEventListener("click",()=>setDrawerOpen(true));
drawerClose.addEventListener("click",()=>setDrawerOpen(false));
drawerShade.addEventListener("click",()=>setDrawerOpen(false));
sideMenu.addEventListener("click",event=>{if(event.target.closest("a"))setDrawerOpen(false)});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&menuTrigger.getAttribute("aria-expanded")==="true")setDrawerOpen(false)});

