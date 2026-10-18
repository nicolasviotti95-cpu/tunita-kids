document.querySelector("#year").textContent=new Date().getFullYear();

const categoryNames={remeras:"remeras",pantalones:"pantalones",buzos:"buzos",shorts:"shorts",medias:"medias"};
const categoryButtons=[...document.querySelectorAll("[data-select-category]")];
const contactTitle=document.querySelector("#contact-title");
const contactDescription=document.querySelector("#contact-description");
const contactWhatsapp=document.querySelector("#contact-whatsapp");
categoryButtons.forEach(button=>button.addEventListener("click",()=>{
  const category=categoryNames[button.dataset.selectCategory];
  if(category){
    contactTitle.textContent=`¿Buscás ${category}?`;
    contactDescription.textContent=`El catálogo de ${category} se está preparando. Escribinos y te contamos las novedades de esta categoría.`;
    contactWhatsapp.href=`https://wa.me/59892822192?text=${encodeURIComponent(`Hola Tunita Kids, quería consultar por ${category}.`)}`;
    contactWhatsapp.setAttribute("aria-label",`Consultar por ${category} en WhatsApp`);
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

