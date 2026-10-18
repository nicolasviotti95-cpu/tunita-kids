const garments={
  remeras:{title:"Remeras",overline:"Para jugar y pasear",description:"Colores alegres y comodidad para acompañar cada juego, paseo y abrazo.",caption:"La primera colección",label:"Ilustración de una remera",tone:"#ed8a95",path:"M54 25 37 31 20 47l14 17 12-9v70h68V55l12 9 14-17-17-16-17-6c-4 13-12 19-26 19s-22-6-26-19Z"},
  pantalones:{title:"Pantalones",overline:"Libres para explorar",description:"Prendas cómodas para correr, descubrir y moverse con total libertad.",caption:"Libertad para moverse",label:"Ilustración de un pantalón",tone:"#94ad62",path:"M43 24h74l-7 111-29-50-30 50Z"},
  buzos:{title:"Buzos",overline:"Suaves como un mimo",description:"Un abrazo calentito para sumar color a los días frescos y las tardes de paseo.",caption:"Un abrazo calentito",label:"Ilustración de un buzo",tone:"#b597c9",path:"M55 24 39 30 20 49l14 18 13-10v67h66V57l13 10 14-18-19-19-16-6c-5 12-13 18-25 18S60 36 55 24Z M59 24c1-12 9-19 21-19s20 7 21 19"},
  shorts:{title:"Shorts",overline:"Listos para salir",description:"Livianos y cómodos para disfrutar los días de sol y cada nueva aventura.",caption:"Días de sol",label:"Ilustración de un short",tone:"#e7bd50",path:"M37 25h86l-8 105-31-35-31 35Z"},
  medias:{title:"Medias",overline:"Pequeños grandes detalles",description:"Detalles suaves y coloridos para completar sus looks de todos los días.",caption:"Detalles con amor",label:"Ilustración de un par de medias",tone:"#68aaa0",path:"M39 19h36v66H54v18l28 10v24H27v-35l12-18Zm48 0h36v66h-21v18l28 10v24H75v-35l12-18Z"}
};
const tabs=[...document.querySelectorAll(".clothing-tab")];
const panel=document.querySelector("#clothing-detail");
function selectGarment(tab){
  const item=garments[tab.dataset.item];
  tabs.forEach(other=>{other.classList.toggle("selected",other===tab);other.setAttribute("aria-selected",String(other===tab));other.tabIndex=other===tab?0:-1});
  panel.setAttribute("aria-labelledby",tab.id);
  panel.dataset.tone=tab.dataset.item;
  document.querySelector("#garment-title").textContent=item.title;
  document.querySelector("#garment-overline").textContent=item.overline;
  document.querySelector("#garment-description").textContent=item.description;
  document.querySelector("#garment-drawing path").setAttribute("d",item.path);
  document.querySelector("#garment-drawing path").style.fill=item.tone;
  document.querySelector("#garment-drawing").setAttribute("aria-label",item.label);
  document.querySelector(".stage-caption").textContent=item.caption;
}
tabs.forEach((tab,index)=>{
  tab.addEventListener("click",()=>selectGarment(tab));
  tab.tabIndex=index===0?0:-1;
  tab.addEventListener("keydown",event=>{
    if(!["ArrowDown","ArrowUp","ArrowRight","ArrowLeft"].includes(event.key))return;
    event.preventDefault();
    const next=index+(["ArrowDown","ArrowRight"].includes(event.key)?1:-1);
    const nextTab=tabs[(next+tabs.length)%tabs.length];nextTab.focus();selectGarment(nextTab);
  });
});
document.querySelector("#year").textContent=new Date().getFullYear();

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
sideMenu.querySelectorAll("[data-select-category]").forEach(button=>button.addEventListener("click",()=>{
  const tab=tabs.find(item=>item.dataset.item===button.dataset.selectCategory);
  if(tab)selectGarment(tab);
  setDrawerOpen(false);
  document.querySelector("#ropa").scrollIntoView({behavior:"auto",block:"start"});
}));
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&menuTrigger.getAttribute("aria-expanded")==="true")setDrawerOpen(false)});

