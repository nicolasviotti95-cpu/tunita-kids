(() => {
  const config=window.TUNITA_SUPABASE||{};
  const setupNotice=document.querySelector("#setup-notice");
  const loginPanel=document.querySelector("#login-panel");
  const dashboard=document.querySelector("#dashboard");
  const loginFeedback=document.querySelector("#login-feedback");
  const productFeedback=document.querySelector("#product-feedback");
  const listFeedback=document.querySelector("#list-feedback");
  const productList=document.querySelector("#product-list");
  const form=document.querySelector("#product-form");
  const imageInput=document.querySelector("#product-image");
  const bucket="product-images";
  const html=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const setFeedback=(node,message,isError=false)=>{node.textContent=message;node.classList.toggle("error",isError)};
  const setBusy=(button,busy,label)=>{button.disabled=busy;if(busy)button.dataset.originalLabel=button.textContent;button.textContent=busy?label:(button.dataset.originalLabel||button.textContent)};

  if(!config.url||!config.key||!window.supabase?.createClient){
    setupNotice.hidden=false;
    return;
  }
  const client=window.supabase.createClient(config.url,config.key);
  loginPanel.hidden=false;

  async function isAdmin(user){
    const {data,error}=await client.from("admin_users").select("user_id").eq("user_id",user.id).maybeSingle();
    if(error)throw error;
    return Boolean(data);
  }

  async function showSession(user){
    if(!user){loginPanel.hidden=false;dashboard.hidden=true;return}
    try{
      if(!(await isAdmin(user))){
        await client.auth.signOut();
        loginPanel.hidden=false;
        setFeedback(loginFeedback,"Este correo todavía no tiene permiso para administrar la tienda.",true);
        return;
      }
      loginPanel.hidden=true;
      dashboard.hidden=false;
      await loadProducts();
    }catch(error){
      await client.auth.signOut();
      loginPanel.hidden=false;
      setFeedback(loginFeedback,"No pudimos validar el acceso. Revisá la configuración de seguridad.",true);
    }
  }

  async function loadProducts(){
    productList.innerHTML='<p class="empty-state">Cargando tu catálogo…</p>';
    const {data,error}=await client.from("products").select("id,category,audience,name,detail,price,image_url,image_path,description,active").order("created_at",{ascending:false});
    if(error){productList.innerHTML='<p class="empty-state">No pudimos cargar las prendas. Revisá la conexión y volvé a intentar.</p>';setFeedback(listFeedback,"No se pudo cargar el catálogo.",true);return}
    document.querySelector("#inventory-count").textContent=String(data.length);
    if(!data.length){productList.innerHTML='<p class="empty-state">Todavía no hay prendas. Agregá la primera desde el formulario y aparecerá en la tienda.</p>';return}
    productList.innerHTML=data.map(item=>`<article class="managed-product" data-id="${html(item.id)}"><img src="${html(item.image_url)}" alt="" loading="lazy"><div class="managed-copy"><h3>${html(item.name)}</h3><p>${html(item.category)}${item.audience?` · ${html(item.audience)}`:""} · $${new Intl.NumberFormat("es-UY").format(Number(item.price)||0)}</p>${item.active?"":"<span class=\"hidden-badge\">Oculta de la tienda</span>"}</div><div class="managed-actions"><button type="button" data-action="edit">Editar</button><button type="button" data-action="toggle">${item.active?"Ocultar":"Publicar"}</button><button type="button" class="delete-action" data-action="delete">Borrar</button></div></article>`).join("");
    productList._products=data;
  }

  function clearForm(){
    form.reset();
    document.querySelector("#product-id").value="";
    document.querySelector("#product-active").checked=true;
    document.querySelector("#editor-title").textContent="Agregar prenda";
    document.querySelector("#save-product").innerHTML="Guardar prenda <span>→</span>";
    document.querySelector("#cancel-edit").hidden=true;
    document.querySelector("#image-preview-wrap").hidden=true;
    imageInput.required=false;
    imageInput.value="";
  }

  function fillForm(item){
    document.querySelector("#product-id").value=item.id;
    document.querySelector("#product-name").value=item.name||"";
    document.querySelector("#product-category").value=item.category||"";
    document.querySelector("#product-audience").value=item.audience||"";
    document.querySelector("#product-detail").value=item.detail||"";
    document.querySelector("#product-price").value=item.price??"";
    document.querySelector("#product-description").value=item.description||"";
    document.querySelector("#product-active").checked=Boolean(item.active);
    document.querySelector("#image-preview").src=item.image_url;
    document.querySelector("#image-preview-wrap").hidden=false;
    imageInput.required=false;
    document.querySelector("#editor-title").textContent="Editar prenda";
    document.querySelector("#save-product").innerHTML="Guardar cambios <span>→</span>";
    document.querySelector("#cancel-edit").hidden=false;
    document.querySelector("#product-name").focus();
  }

  async function storeImage(file){
    const ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
    const path=`${crypto.randomUUID()}.${ext}`;
    const {error}=await client.storage.from(bucket).upload(path,file,{contentType:file.type,upsert:false,cacheControl:"3600"});
    if(error)throw error;
    const {data}=client.storage.from(bucket).getPublicUrl(path);
    return {path,url:data.publicUrl};
  }

  async function removeImage(path){
    if(!path)return;
    const {error}=await client.storage.from(bucket).remove([path]);
    if(error)console.warn("No se pudo quitar el archivo anterior del almacenamiento.",error);
  }

  document.querySelector("#login-form").addEventListener("submit",async event=>{
    event.preventDefault();
    const button=event.currentTarget.querySelector("button[type=submit]");
    setBusy(button,true,"Entrando…");
    setFeedback(loginFeedback,"");
    const email=document.querySelector("#login-email").value.trim();
    const password=document.querySelector("#login-password").value;
    const {data,error}=await client.auth.signInWithPassword({email,password});
    setBusy(button,false);
    if(error){setFeedback(loginFeedback,"No pudimos iniciar sesión. Revisá el correo y la contraseña.",true);return}
    await showSession(data.user);
  });

  form.addEventListener("submit",async event=>{
    event.preventDefault();
    const button=document.querySelector("#save-product");
    setBusy(button,true,"Guardando…");
    setFeedback(productFeedback,"");
    let uploaded=null;
    const id=document.querySelector("#product-id").value;
    const existing=(productList._products||[]).find(product=>product.id===id);
    try{
      const file=imageInput.files[0];
      if(file){
        if(!["image/jpeg","image/png","image/webp"].includes(file.type))throw new Error("La foto debe ser JPG, PNG o WebP.");
        if(file.size>5*1024*1024)throw new Error("La foto supera el límite de 5 MB.");
        uploaded=await storeImage(file);
      }else if(!existing){throw new Error("Elegí una foto para la prenda.");}
      const record={
        category:document.querySelector("#product-category").value,
        audience:document.querySelector("#product-audience").value||null,
        name:document.querySelector("#product-name").value.trim(),
        detail:document.querySelector("#product-detail").value.trim(),
        price:Number(document.querySelector("#product-price").value),
        description:document.querySelector("#product-description").value.trim(),
        active:document.querySelector("#product-active").checked,
        image_url:uploaded?.url||existing?.image_url,
        image_path:uploaded?.path||existing?.image_path||null
      };
      const result=id?await client.from("products").update(record).eq("id",id):await client.from("products").insert(record);
      if(result.error)throw result.error;
      if(uploaded&&existing?.image_path)await removeImage(existing.image_path);
      clearForm();
      setFeedback(productFeedback,id?"Prenda actualizada. Ya se refleja en la tienda.":"Prenda agregada. Ya se refleja en la tienda.");
      await loadProducts();
    }catch(error){
      if(uploaded)await removeImage(uploaded.path);
      setFeedback(productFeedback,error.message||"No se pudo guardar la prenda. Revisá los datos e intentá nuevamente.",true);
    }finally{setBusy(button,false)}
  });

  imageInput.addEventListener("change",()=>{
    const file=imageInput.files[0];
    if(!file)return;
    document.querySelector("#image-preview").src=URL.createObjectURL(file);
    document.querySelector("#image-preview-wrap").hidden=false;
  });
  document.querySelector("#cancel-edit").addEventListener("click",clearForm);
  document.querySelector("#logout-button").addEventListener("click",async()=>{await client.auth.signOut();dashboard.hidden=true;loginPanel.hidden=false;clearForm();setFeedback(loginFeedback,"Sesión cerrada.")});

  productList.addEventListener("click",async event=>{
    const button=event.target.closest("button[data-action]");
    if(!button)return;
    const row=button.closest("[data-id]");
    const item=(productList._products||[]).find(product=>product.id===row.dataset.id);
    if(!item)return;
    if(button.dataset.action==="edit"){fillForm(item);return}
    if(button.dataset.action==="toggle"){
      button.disabled=true;
      const {error}=await client.from("products").update({active:!item.active}).eq("id",item.id);
      button.disabled=false;
      if(error){setFeedback(listFeedback,"No se pudo cambiar la visibilidad.",true);return}
      setFeedback(listFeedback,item.active?"Prenda oculta de la tienda.":"Prenda publicada en la tienda.");
      await loadProducts();
      return;
    }
    if(button.dataset.action==="delete"&&window.confirm(`¿Borramos “${item.name}” del catálogo? Esta acción no se puede deshacer.`)){
      button.disabled=true;
      const {error}=await client.from("products").delete().eq("id",item.id);
      if(error){button.disabled=false;setFeedback(listFeedback,"No se pudo borrar la prenda.",true);return}
      await removeImage(item.image_path);
      if(document.querySelector("#product-id").value===item.id)clearForm();
      setFeedback(listFeedback,"Prenda borrada del catálogo.");
      await loadProducts();
    }
  });

  client.auth.getSession().then(({data})=>showSession(data.session?.user||null));
  client.auth.onAuthStateChange((_event,session)=>{if(!session)showSession(null)});
})();

