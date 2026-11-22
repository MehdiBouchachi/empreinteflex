import { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutDashboard, ShoppingBag, Boxes, ClipboardList, Package, Users, ShieldCheck, LogOut, Menu, X, Plus, Minus, Search, Download, ArrowUpRight, ArrowRight, Receipt, BedDouble, RefreshCw, Check, Camera, Globe2, MapPin, ChevronDown, AlertTriangle, Wallet, UserPlus, Printer, Settings2, LockKeyhole } from 'lucide-react';
import { api, post, dzd, uid, type User, type Location, type Product } from './api';
import fr from './fr.json';import en from './en.json';import ar from './ar.json';

type Lang='fr'|'en'|'ar'; type Page='dashboard'|'pos'|'inventory'|'orders'|'catalog'|'customers'|'team';
type Translate=(key:string)=>string;
const messages:Record<Lang,Record<string,string>>={fr,en,ar};
const navIcons={
 dashboard:LayoutDashboard,pos:ShoppingBag,orders:ClipboardList,customers:Users,
 inventory:Boxes,catalog:Package,team:ShieldCheck
};
const navGroups:{label?:string;pages:Page[]}[]=[
 {pages:['dashboard']},
 {label:'navSales',pages:['pos','orders','customers']},
 {label:'navProducts',pages:['inventory','catalog']},
 {label:'navAdmin',pages:['team']}
];
const err=(e:unknown)=>e instanceof Error?e.message:String(e);
const money=(minor:any)=>dzd(Number(minor||0));
const amount=(dinars:string)=>Math.round(Number(dinars)*100);
const hasRole=(u:User,role:string)=>u.roles.some(x=>x.role===role);
const isAdmin=(u:User)=>hasRole(u,'COMPANY_ADMIN');
const isManager=(u:User)=>isAdmin(u)||hasRole(u,'LOCATION_MANAGER');
function Badge({children,good=false}:{children:any;good?:boolean}){return <span className={'ef-badge '+(good?'positive':'')}>{children}</span>}
function Empty({t}:{t:Translate}){return <div className="empty-state"><Boxes size={26}/>{t('noData')}</div>}
function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:any}){return <div className="modal-scrim" onMouseDown={onClose}><div className="modal-panel" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><h2>{title}</h2><button className="icon-button" aria-label="Close" onClick={onClose}><X size={19}/></button></div>{children}</div></div>}
function Button({children,secondary=false,disabled=false,type='button',onClick}:{children:any;secondary?:boolean;disabled?:boolean;type?:'button'|'submit';onClick?:()=>void}){return <button type={type} className={secondary?'btn-outline':'btn-primary'} disabled={disabled} onClick={onClick}>{children}</button>}
function StockSearch({t,value,onChange,onSubmit,label=t('searchStock')}:{t:Translate;label?:string;value:string;onChange:(value:string)=>void;onSubmit?:()=>void}){
 const input=useRef<HTMLInputElement>(null);
 const field=<>
  <Search size={20} aria-hidden="true"/>
  <input ref={input} aria-label={label} placeholder={label} value={value} onChange={event=>onChange(event.target.value)}/>
  {value&&<button type="button" className="icon-button search-clear" aria-label={t('clearSearch')} onClick={()=>{onChange('');input.current?.focus()}}><X size={18}/></button>}
 </>;
 return onSubmit
  ? <form className="search-bar dashboard-search" role="search" onSubmit={event=>{event.preventDefault();onSubmit()}}>{field}<button className="search-submit" type="submit">{t('searchAction')}</button></form>
  : <div className="search-bar" role="search">{field}</div>;
}
function Heading({title,subtitle,children}:{title:string;subtitle:string;children?:any}){return <div className="section-heading"><div><h1>{title}</h1><p>{subtitle}</p></div>{children&&<div className="heading-actions">{children}</div>}</div>}
function useLoad<T>(url:string|null,refresh:number,initial:T,onError:(e:string)=>void):T{
 const [data,setData]=useState(initial);
 useEffect(()=>{if(!url)return;let mounted=true;api<T>(url).then(d=>mounted&&setData(d)).catch(e=>mounted&&onError(err(e)));return()=>{mounted=false}},[url,refresh]);
 return data;
}
function useLang():[Lang,(l:Lang)=>void]{
 const [lang,setLang]=useState<Lang>(()=>{const v=localStorage.getItem('ef_staff_lang');return v==='ar'||v==='en'?v:'fr'});
 return [lang,(v:Lang)=>{localStorage.setItem('ef_staff_lang',v);setLang(v)}];
}
function LangPicker({lang,setLang}:{lang:Lang;setLang:(l:Lang)=>void}){return <div className="language-picker"><Globe2 size={16}/><select aria-label={messages[lang].language} value={lang} onChange={e=>setLang(e.target.value as Lang)}><option value="fr">FR</option><option value="en">EN</option><option value="ar">العربية</option></select></div>}
function Login({t,lang,setLang,onDone}:{t:Translate;lang:Lang;setLang:(l:Lang)=>void;onDone:(u:User)=>void}){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{await post('/auth/login',{email,password});const user=await api<User>('/auth/me');onDone(user)}catch(e){setError(err(e))}finally{setBusy(false)}}
 return <div className="login-shell"><div className="login-visual"><div className="login-wordmark"><span className="mark">EF<span>.</span></span> EMPREINTE FLEX</div><div className="login-photo"/><div className="login-copy"><p className="overline">EMPREINTE FLEX / RETAIL</p><h1>{t('loginAside')}</h1><p>{t('workspace')}</p></div></div><div className="login-form-panel"><div className="login-lang"><LangPicker lang={lang} setLang={setLang}/></div><div className="login-form-inner"><span className="small-logo">EMPREINTE <b>FLEX</b></span><div className="login-icon"><LockKeyhole size={24}/></div><h2>{t('welcome')}</h2><p className="hint">{t('loginIntro')}</p>{error&&<div className="alert error"><AlertTriangle size={17}/>{error}</div>}<form onSubmit={submit} className="form-stack"><label>{t('email')}<input autoComplete="username" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>{t('password')}<input autoComplete="current-password" type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><Button type="submit" disabled={busy}>{busy?t('loading'):t('loginButton')} <ArrowRight size={17}/></Button></form><p className="login-note">© Empreinte Flex · {t('appTitle')}</p></div></div></div>
}
export function App(){
 const [lang,setLang]=useLang();const t:Translate=(key)=>messages[lang][key]||messages.fr[key]||key;
 const [user,setUser]=useState<User|null>(null),[loaded,setLoaded]=useState(false),[page,setPage]=useState<Page>('dashboard'),[drawer,setDrawer]=useState(false);
 const [locations,setLocations]=useState<Location[]>([]),[locationId,setLocationId]=useState(''),[refresh,setRefresh]=useState(0);
 const menuToggle=useRef<HTMLButtonElement>(null);
 const menuClose=useRef<HTMLButtonElement>(null);
 const main=useRef<HTMLElement>(null);

 function closeDrawer(){
  setDrawer(false);
  menuToggle.current?.focus();
 }
 useEffect(()=>{
  if(!drawer)return;
  menuClose.current?.focus();
  const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')closeDrawer()};
  const wide=window.matchMedia('(min-width: 981px)');
  const onResize=()=>{if(wide.matches)setDrawer(false)};
  document.addEventListener('keydown',onKey);
  wide.addEventListener('change',onResize);
  return ()=>{document.removeEventListener('keydown',onKey);wide.removeEventListener('change',onResize)};
 },[drawer]);
 const [inventoryQuery,setInventoryQuery]=useState('');
 const [error,setError]=useState(''),[notice,setNotice]=useState('');
 function success(message:string){setNotice(message);setRefresh(n=>n+1);setError('')}
 useEffect(()=>{api<User>('/auth/me').then(setUser).catch(()=>setUser(null)).finally(()=>setLoaded(true))},[]);
 useEffect(()=>{if(!user)return;api<Location[]>('/staff/locations').then(d=>{setLocations(d);setLocationId(l=>l||d[0]?.id||'')}).catch(e=>setError(err(e)))},[user]);
 useEffect(()=>{document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.documentElement.lang=lang},[lang]);
 if(!loaded)return <div className="initial-loading"><span>EMPREINTE FLEX</span>{t('loading')}</div>;
 if(!user)return <Login t={t} lang={lang} setLang={setLang} onDone={setUser}/>;
 const admin=isAdmin(user),manager=isManager(user);
 const groups=navGroups.map(group=>({...group,pages:group.pages.filter(id=>
  id==='team'||id==='catalog'?admin:id==='dashboard'?manager:true
 )})).filter(group=>group.pages.length);
 const available=groups.flatMap(group=>group.pages);
 const active=available.includes(page)?page:available[0];
 const navigate=(id:Page,query='')=>{setInventoryQuery(query);setPage(id);setDrawer(false);setError('');setNotice('')};
 const common={t,lang,refresh,onError:setError,onSuccess:success};
 const pageContent={dashboard:<Dashboard key={locationId} {...common} locationId={locationId} locations={locations} onNavigate={navigate}/>,pos:<POS {...common} locationId={locationId}/>,inventory:<Inventory key={locationId} {...common} locationId={locationId} canAdjust={manager} initialQuery={inventoryQuery}/>,orders:<Orders {...common} canManage={manager}/>,catalog:<Catalog {...common}/>,customers:<Customers {...common} locationId={locationId}/>,team:<Team {...common} locations={locations}/>};
 return <div className="app-shell">
  <aside id="staff-sidebar" className={'app-sidebar '+(drawer?'sidebar-open':'')}>
   <div className="sidebar-brand">
    <img src="/logo.svg" alt=""/>
    <span><b>EMPREINTE FLEX</b><small>{t('workspace')}</small></span>
    <button ref={menuClose} type="button" className="sidebar-close icon-button" aria-label={t('close')} onClick={closeDrawer}><X size={20}/></button>
   </div>
   <nav aria-label={t('navMenu')}>
    {groups.map(({label,pages})=><div className="sidebar-nav-group" key={label??'dashboard'} role={label?'group':undefined} aria-labelledby={label?`sidebar-${label}`:undefined}>
     {label&&<h2 id={`sidebar-${label}`}>{t(label)}</h2>}
     {pages.map(id=>{
      const Icon=navIcons[id];
      return <button type="button" key={id} aria-current={id===active?'page':undefined} className={'nav-item '+(id===active?'selected':'')}
       onClick={()=>{navigate(id);if(drawer){window.scrollTo(0,0);main.current?.focus({preventScroll:true})}}}>
       <Icon size={19} aria-hidden="true"/><span>{t(id)}</span>
      </button>;
     })}
    </div>)}
   </nav>
   <div className="sidebar-lower">
    <div className="sidebar-user"><div className="avatar" aria-hidden="true">{user.displayName?.slice(0,1).toUpperCase()||'E'}</div><span><b dir="auto">{user.displayName}</b><small><bdi>{user.email}</bdi></small></span></div>
    <button type="button" className="sidebar-signout" onClick={async()=>{await post('/auth/logout',{}).catch(()=>{});setDrawer(false);setUser(null)}}><LogOut size={18} aria-hidden="true"/>{t('logout')}</button>
   </div>
  </aside>
  {drawer&&<button type="button" className="drawer-backdrop" aria-label={t('close')} tabIndex={-1} onClick={closeDrawer}/>}
  <div className="app-body">
   <header className="app-topbar">
    <button ref={menuToggle} type="button" className="mobile-menu icon-button" onClick={()=>drawer?closeDrawer():setDrawer(true)}
     aria-controls="staff-sidebar" aria-expanded={drawer} aria-label={t('navMenu')}><Menu size={21}/></button>
    <div className="topbar-showroom">
     <MapPin size={17} aria-hidden="true"/>
     {locations.length>1
      ? <select className="location-select" value={locationId} onChange={e=>setLocationId(e.target.value)} aria-label={t('selectShowroom')}>
         {locations.map(location=><option key={location.id} value={location.id}>{location.name}</option>)}
        </select>
      : <span><bdi>{locations[0]?.name??t('showroom')}</bdi></span>}
    </div>
    <LangPicker lang={lang} setLang={setLang}/>
   </header>
   <main ref={main} tabIndex={-1} className="app-content">
    {error&&<div className="alert error"><AlertTriangle size={17}/><span>{error}</span><button aria-label={t('close')} onClick={()=>setError('')}><X size={16}/></button></div>}
    {notice&&<div className="alert success"><Check size={17}/><span>{notice}</span><button aria-label={t('close')} onClick={()=>setNotice('')}><X size={16}/></button></div>}
    {pageContent[active]}
   </main>
  </div>
 </div>;

}
function Dashboard({t,lang,locationId,locations,onNavigate,refresh,onError}:{t:Translate;lang:Lang;locationId:string;locations:Location[];onNavigate:(p:Page,query?:string)=>void;refresh:number;onError:(x:string)=>void}){
 const [query,setQuery]=useState('');
 const report=useLoad<{byChannel:{total_minor:number;orders:number}[]}|null>(
  locationId ? `/staff/reports/sales-summary?locationId=${locationId}` : null,refresh,null,onError
 );
 const orders=useLoad<any[]|null>('/staff/orders',refresh,null,onError);
 const number=new Intl.NumberFormat(lang==='ar'?'ar-DZ':lang==='fr'?'fr-DZ':'en-DZ');
 const currency=new Intl.NumberFormat(number.resolvedOptions().locale,{style:'currency',currency:'DZD',minimumFractionDigits:0});
 const formatMoney=(minor:number)=>currency.format(minor/100);
 const stats=[
  {label:'totalSales',value:report&&formatMoney(report.byChannel.reduce((sum,channel)=>sum+channel.total_minor,0))},
  {label:'totalOrders',value:report&&number.format(report.byChannel.reduce((sum,channel)=>sum+channel.orders,0))},
  {label:'pending',value:orders&&number.format(orders.filter(order=>order.status==='PENDING').length)},
  {label:'locationsCount',value:locations.length?number.format(locations.length):null}
 ];
 return <div className="dashboard">
  <section className="dashboard-start" aria-labelledby="dashboard-title">
   <h1 id="dashboard-title">{t('dashboard')}</h1>
   <StockSearch t={t} value={query} onChange={setQuery} onSubmit={()=>onNavigate('inventory',query.trim())}/>
   <div className="dashboard-actions">
    <Button onClick={()=>onNavigate('pos')}><Plus size={18}/>{t('createSale')}</Button>
    <Button secondary onClick={()=>onNavigate('inventory')}><Boxes size={18}/>{t('checkStock')}</Button>
    <Button secondary onClick={()=>onNavigate('customers')}><Users size={18}/>{t('seeCustomers')}</Button>
   </div>
  </section>
  <dl className="metrics-row">
   {stats.map(({label,value})=><div className="metric-card" key={label}>
    <dt>{t(label)}</dt>
    <dd><bdi>{value??'?'}</bdi></dd>
   </div>)}
  </dl>
   <section className="surface-panel" aria-labelledby="recent-orders">
    <div className="panel-header">
     <h2 id="recent-orders">{t('recentOrders')}</h2>
     <button className="text-link" onClick={()=>onNavigate('orders')}>{t('viewAll')} <ArrowRight size={16}/></button>
    </div>
    <div className="table-wrap">
     <table aria-labelledby="recent-orders">
      <thead><tr>{['orderNumber','channel','status','total'].map(key=><th key={key} scope="col">{t(key)}</th>)}</tr></thead>
      <tbody>{orders?.slice(0,7).map(order=><tr key={order.id}>
       <td className="strong"><bdi>{order.order_number}</bdi></td>
       <td>{order.channel_code==='POS'?t('posChannel'):t('online')}</td>
       <td><Badge good={order.status==='FULFILLED'}>{t('order'+order.status.charAt(0)+order.status.slice(1).toLowerCase())}</Badge></td>
       <td className="strong"><bdi>{formatMoney(Number(order.total_minor))}</bdi></td>
      </tr>)}</tbody>
     </table>
     {orders?.length===0&&<Empty t={t}/>}
    </div>
   </section>
  <div className="demo-note"><AlertTriangle size={17}/>{t('demoWarning')}</div>
 </div>
}
type PosVariant={
 product_id:string; variant_id:string; sku:string; name:string;
 width_mm:number; length_mm:number; height_mm:number|null;
 on_hand:number; reserved:number; available:number; amount_minor:number|null; image_url:string|null;
};
const dimensionKey=(variant:PosVariant)=>`${variant.width_mm}x${variant.length_mm}`;
const dimensionLabel=(variant:Pick<PosVariant,'width_mm'|'length_mm'>)=>`${variant.width_mm/10} × ${variant.length_mm/10} cm`;
const thicknessLabel=(variant:Pick<PosVariant,'height_mm'>)=>variant.height_mm==null?'':`${variant.height_mm/10} cm`;
const sellable=(variant:PosVariant)=>variant.available>0&&variant.amount_minor!==null;

function ProductPhoto({src,className=''}:{src:string|null;className?:string}){
 const [failed,setFailed]=useState<string|null>(null);
 return <span className={`pos-photo ${className}`} aria-hidden="true">
  {src&&src!==failed?<img src={src} alt="" loading="lazy" decoding="async" onError={()=>setFailed(src)}/>:<BedDouble size={21}/>}
 </span>;
}

function PosVariantPicker({t,variants,query,cart,onAdd}:{t:Translate;variants:PosVariant[];query:string;cart:Record<string,number>;onAdd:(variant:PosVariant)=>void}){
 const preferred=variants.find(variant=>variant.sku.toLowerCase()===query.toLowerCase())??variants.find(sellable)??variants[0];
 const [variantId,setVariantId]=useState(preferred.variant_id);
 const selected=variants.find(variant=>variant.variant_id===variantId)??preferred;
 const dimensions=new Map(variants.map(variant=>[dimensionKey(variant),variant]));
 const sizeOptions=variants.filter(variant=>dimensionKey(variant)===dimensionKey(selected));
 const remaining=Math.max(0,selected.available-(cart[selected.variant_id]??0));

 return <div className="pos-variant-picker">
  <ProductPhoto src={selected.image_url} className="pos-photo-preview"/>
  <div className="pos-picker-controls">
  <div className="pos-variant-options" role="group" aria-label={t('size')}>
   <strong>{t('size')}</strong>
   <div className="pos-option-row">{Array.from(dimensions,([key,variant])=><button
    type="button" key={key} aria-pressed={key===dimensionKey(selected)}
    onClick={()=>{
     if(key===dimensionKey(selected))return;
     const options=variants.filter(option=>dimensionKey(option)===key);
     setVariantId((options.find(option=>sellable(option)&&option.height_mm===selected.height_mm)??options.find(sellable)??options[0]).variant_id);
    }}><bdi>{dimensionLabel(variant)}</bdi></button>)}</div>
  </div>
  {sizeOptions.length>1&&<div className="pos-variant-options" role="group" aria-label={t('posThickness')}>
   <strong>{t('posThickness')}</strong>
   <div className="pos-option-row">{sizeOptions.map(option=><button
    type="button" key={option.variant_id} aria-pressed={option.variant_id===selected.variant_id}
    onClick={()=>setVariantId(option.variant_id)}>
    <bdi>{thicknessLabel(option)||option.sku}</bdi>
    {option.height_mm!=null&&sizeOptions.some(other=>other.variant_id!==option.variant_id&&other.height_mm===option.height_mm)&&<small><bdi>{option.sku}</bdi></small>}
   </button>)}</div>
  </div>}
  <div className="pos-variant-summary">
   <div aria-live="polite">
    <strong>{selected.amount_minor===null?t('posNoPrice'):money(selected.amount_minor)}</strong>
    <small><bdi>{selected.sku}</bdi>{sizeOptions.length===1&&selected.height_mm!=null&&<> · {t('posThickness')} <bdi>{thicknessLabel(selected)}</bdi></>}</small>
    <Badge good={remaining>0}>{remaining} {t('available')}</Badge>
   </div>
   <Button disabled={!sellable(selected)||remaining===0} onClick={()=>onAdd(selected)}><Plus size={17}/>{t('posAdd')}</Button>
  </div>
  </div>
 </div>;
}

function useGroupedStock(locationId:string,search:string,refresh:number,onError:(message:string)=>void){
 const [result,setResult]=useState<{query:string;variants:PosVariant[]|null}|null>(null);
 useEffect(()=>{
  if(!locationId)return;
  const controller=new AbortController();
  const timer=window.setTimeout(()=>{
   api<PosVariant[]>(`/staff/inventory?locationId=${encodeURIComponent(locationId)}&groupBy=product&q=${encodeURIComponent(search)}`,{signal:controller.signal})
    .then(variants=>setResult({query:search,variants}))
    .catch(error=>{if(!controller.signal.aborted){setResult({query:search,variants:null});onError(err(error))}});
  },search?250:0);
  return ()=>{window.clearTimeout(timer);controller.abort()};
 },[locationId,search,refresh,onError]);
 const stock=result?.query===search?result.variants:null;
 return {stock,loading:!result||result.query!==search};
}

function groupStock(stock:PosVariant[]|null){
 const products=new Map<string,PosVariant[]>();
 for(const variant of stock??[]){
  const variants=products.get(variant.product_id)??[];
  variants.push(variant);
  products.set(variant.product_id,variants);
 }
 for(const variants of products.values())variants.sort((a,b)=>a.width_mm-b.width_mm||a.length_mm-b.length_mm||(a.height_mm??0)-(b.height_mm??0));
 return products;
}

function PosProductList({t,locationId,refresh,cart,onAdd,onError}:{t:Translate;locationId:string;refresh:number;cart:Record<string,number>;onAdd:(variant:PosVariant)=>void;onError:(message:string)=>void}){
 const [query,setQuery]=useState('');
 const [openId,setOpenId]=useState<string|null>(null);
 const search=query.trim();
 const {stock,loading}=useGroupedStock(locationId,search,refresh,onError);
 const products=groupStock(stock);
 return <section className="surface-panel">
  <div className="panel-header"><h2>{t('selectProduct')}</h2></div>
  <StockSearch t={t} value={query} onChange={value=>{setQuery(value);setOpenId(null)}}/>
  <div className="pos-list">
   {loading&&<div className="empty-state" role="status">{t('loading')}</div>}
   {stock&&products.size===0&&<Empty t={t}/>}
   {Array.from(products,([id,variants])=>{
    const inStock=variants.some(variant=>variant.available>0);
    const prices=variants.flatMap(variant=>variant.amount_minor===null?[]:[variant.amount_minor]);
    const min=Math.min(...prices),max=Math.max(...prices);
    const open=openId===id;
    return <div className="pos-product" key={id}>
     <button className="product-line" type="button" aria-expanded={open} aria-controls={`pos-options-${id}`} onClick={()=>setOpenId(open?null:id)}>
      <ProductPhoto src={variants[0].image_url}/>
      <span className="product-label"><b>{variants[0].name}</b>{!inStock&&<small>{t('posOutOfStock')}</small>}</span>
      {prices.length>0&&<span className="product-price"><b><bdi>{min===max?money(min):`${money(min)} – ${money(max)}`}</bdi></b></span>}
      <ChevronDown className="pos-product-chevron" size={18} aria-hidden="true"/>
     </button>
     <div id={`pos-options-${id}`} hidden={!open}>{open&&<PosVariantPicker t={t} variants={variants} query={search} cart={cart} onAdd={onAdd}/>}</div>
    </div>;
   })}
  </div>
 </section>;
}
function POS({t,locationId,refresh,onError,onSuccess}:{t:Translate;locationId:string;refresh:number;onError:(x:string)=>void;onSuccess:(x:string)=>void}){
 const [cart,setCart]=useState<{variantId:string;sku:string;name:string;dimensions:string;imageUrl:string|null;qty:number;available:number;price:number}[]>([]);
 const [cash,setCash]=useState(''),[customerId,setCustomerId]=useState(''),[receipt,setReceipt]=useState<any>(null),[busy,setBusy]=useState(false);
 const customers=useLoad<any[]>('/staff/customers',refresh,[],onError);
 const total=cart.reduce((sum,l)=>sum+l.qty*l.price,0);
 function add(row:PosVariant){
  const price=row.amount_minor;
  if(price===null||row.available<=0)return;
  setCart(previous=>{
   const existing=previous.find(line=>line.variantId===row.variant_id);
   if(existing){
    if(existing.qty>=row.available)return previous;
    return previous.map(line=>line.variantId===row.variant_id?{...line,qty:line.qty+1,available:row.available,price}:line);
   }
   const dimensions=[dimensionLabel(row),thicknessLabel(row)].filter(Boolean).join(' · ');
   return [...previous,{variantId:row.variant_id,sku:row.sku,name:row.name,dimensions,imageUrl:row.image_url,qty:1,price,available:row.available}];
  });
 }
 async function checkout(){if(!cart.length||!locationId)return;setBusy(true);try{const sale=await post('/pos/sales',{locationId,customerId:customerId||null,items:cart.map(l=>({variantId:l.variantId,quantity:l.qty})),payment:{method:'CASH',amountMinor:amount(cash)}},uid());setCart([]);setCash('');setReceipt(sale);onSuccess(t('saleRecorded'))}catch(e){onError(err(e))}finally{setBusy(false)}}
 return <><Heading title={t('pos')} subtitle={t('posSubtitle')}/><div className="sales-layout"><PosProductList key={locationId} t={t} locationId={locationId} refresh={refresh} cart={Object.fromEntries(cart.map(line=>[line.variantId,line.qty]))} onAdd={add} onError={onError}/><section className="surface-panel cart-panel"><div className="panel-header"><h2>{t('cart')}</h2><Badge>{cart.length} SKU</Badge></div>{!cart.length?<div className="cart-empty"><ShoppingBag size={33}/><h3>{t('emptyCart')}</h3><p>{t('chooseItem')}</p></div>:<div className="cart-lines">{cart.map(l=><div className="cart-row" key={l.variantId}><div className="pos-cart-product"><ProductPhoto src={l.imageUrl}/><div><b>{l.name}</b><small><bdi>{l.dimensions}</bdi> · <bdi>{l.sku}</bdi></small><strong>{money(l.price*l.qty)}</strong></div></div><div className="quantity-stepper"><button onClick={()=>setCart(c=>c.map(x=>x.variantId===l.variantId?{...x,qty:Math.max(1,x.qty-1)}:x))}><Minus size={14}/></button>{l.qty}<button onClick={()=>setCart(c=>c.map(x=>x.variantId===l.variantId?{...x,qty:Math.min(x.available,x.qty+1)}:x))}><Plus size={14}/></button><button onClick={()=>setCart(c=>c.filter(x=>x.variantId!==l.variantId))}><X size={14}/></button></div></div>)}</div>}<div className="cart-checkout"><div className="checkout-total"><span>{t('total')}</span><strong>{money(total)}</strong></div><label>{t('customerOptional')}<select value={customerId} onChange={e=>setCustomerId(e.target.value)}><option value="">{t('walkIn')}</option>{customers.map(c=><option value={c.id} key={c.id}>{c.full_name} {c.phone||''}</option>)}</select></label><label>{t('cashReceived')}<input type="number" min="0" step="0.01" placeholder="0.00" value={cash} onChange={e=>setCash(e.target.value)}/></label><p className="muted"><Wallet size={16}/>{t('cashOnly')}</p><Button disabled={busy||!cart.length||!cash||!Number.isFinite(amount(cash))||amount(cash)<total||total<=0} onClick={checkout}><Receipt size={18}/>{busy?t('loading'):t('completeSale')}</Button></div></section></div>{receipt&&<Modal title={t('confirmSale')} onClose={()=>setReceipt(null)}><div id="printable-receipt" className="printed-receipt"><div className="receipt-logo">EMPREINTE FLEX</div><p>{receipt.orderNumber}</p><hr/>{receipt.items?.map((l:any)=><div className="receipt-line" key={l.variantId}>{l.name} × {l.quantity}<b>{money(l.lineTotalMinor)}</b></div>)}<hr/><div className="receipt-line"><b>{t('total')}</b><strong>{money(receipt.totalMinor)}</strong></div><div className="receipt-line">{t('cashReceived')}<span>{money(receipt.cashTenderedMinor)}</span></div><div className="receipt-line">{t('change')}<span>{money(receipt.changeMinor)}</span></div><p>{t('thankYou')}</p></div><Button onClick={()=>window.print()}><Printer size={17}/>{t('printReceipt')}</Button></Modal>}</>
}
function InventoryVariants({t,variants,query,canAdjust,onAdjust}:{t:Translate;variants:PosVariant[];query:string;canAdjust:boolean;onAdjust:(variant:PosVariant)=>void}){
 const [size,setSize]=useState(()=>dimensionKey(variants.find(row=>row.sku.toLowerCase()===query.toLowerCase())??variants[0]));
 const sizes=new Map(variants.map(row=>[dimensionKey(row),row]));
 const activeSize=sizes.has(size)?size:dimensionKey(variants[0]);
 return <div className="inventory-variants">
  <div className="pos-variant-options" role="group" aria-label={t('size')}>
   <strong>{t('size')}</strong>
   <div className="pos-option-row">{Array.from(sizes,([key,row])=><button key={key} type="button" aria-pressed={key===activeSize} onClick={()=>setSize(key)}><bdi>{dimensionLabel(row)}</bdi></button>)}</div>
  </div>
  <div className="table-wrap inventory-variant-table" tabIndex={0} role="region" aria-label={t('inventory')+' ? '+variants[0].name}>
   <table aria-label={variants[0].name+' ? '+dimensionLabel(sizes.get(activeSize)!)}>
    <thead><tr>{['posThickness','sku','inStock','reserved','available',...(canAdjust?['actions']:[])].map(key=><th key={key} scope="col">{t(key)}</th>)}</tr></thead>
    <tbody>{variants.filter(row=>dimensionKey(row)===activeSize).map(row=><tr key={row.variant_id}>
     <th scope="row"><bdi>{thicknessLabel(row)||'?'}</bdi></th><td className="mono"><bdi>{row.sku}</bdi></td>
     <td>{row.on_hand}</td><td>{row.reserved}</td><td><Badge good={Number(row.available)>0}>{row.available}</Badge></td>
     {canAdjust&&<td><button type="button" className="text-link" aria-label={t('adjust')+' '+row.sku} onClick={()=>onAdjust(row)}>{t('adjust')}</button></td>}
    </tr>)}</tbody>
   </table>
  </div>
 </div>;
}

function Inventory({t,locationId,refresh,onError,onSuccess,canAdjust,initialQuery}:{t:Translate;locationId:string;refresh:number;onError:(x:string)=>void;onSuccess:(x:string)=>void;canAdjust:boolean;initialQuery:string}){
 const [query,setQuery]=useState(initialQuery);
 const [openId,setOpenId]=useState<string|null>();
 const [selected,setSelected]=useState<PosVariant|null>(null);
 const [delta,setDelta]=useState(''),[reason,setReason]=useState(''),[busy,setBusy]=useState(false);
 const search=query.trim();
 const {stock,loading}=useGroupedStock(locationId,search,refresh,onError);
 const products=groupStock(stock);
 const activeId=openId===undefined&&search&&products.size===1?products.keys().next().value:openId;
 const valid=Number.isInteger(Number(delta))&&Number(delta)!==0&&Math.abs(Number(delta))<=100000&&reason.trim().length>=5&&reason.trim().length<=300;

 async function adjust(event:React.FormEvent){
  event.preventDefault();
  if(!selected||!canAdjust||!valid||busy)return;
  setBusy(true);
  try{
   await post('/staff/inventory/adjustments',{locationId,variantId:selected.variant_id,delta:Number(delta),reason:reason.trim()},uid());
   setSelected(null);
   onSuccess(t('stockUpdated'));
  }catch(error){onError(err(error))}
  finally{setBusy(false)}
 }

 return <>
  <Heading title={t('inventory')} subtitle={t('stockSubtitle')}/>
  <section className="surface-panel inventory-panel" aria-label={t('inventory')}>
   <div className="inventory-toolbar">
    <StockSearch t={t} value={query} onChange={value=>{setQuery(value);setOpenId(undefined)}}/>
    {stock&&<Badge>{stock.length} SKU</Badge>}
   </div>
   {loading&&<div className="empty-state" role="status">{t('loading')}</div>}
   {stock?.length===0&&<Empty t={t}/>}
   {Array.from(products,([id,variants])=>{
    const open=activeId===id;
    const available=variants.reduce((total,row)=>total+Number(row.available),0);
    return <div className="pos-product inventory-product" key={id}>
     <button type="button" className="product-line" aria-expanded={open} aria-controls={`inventory-options-${id}`} onClick={()=>setOpenId(open?null:id)}>
      <ProductPhoto src={variants[0].image_url}/>
      <span className="product-label"><b>{variants[0].name}</b><small>{variants.length} SKU</small></span>
      <Badge good={available>0}>{available} {t('available')}</Badge>
      <ChevronDown className="pos-product-chevron" size={18} aria-hidden="true"/>
     </button>
     <div id={`inventory-options-${id}`} hidden={!open}>{open&&<InventoryVariants key={search} t={t} variants={variants} query={search} canAdjust={canAdjust} onAdjust={row=>{setSelected(row);setDelta('');setReason('')}}/>}</div>
    </div>;
   })}
  </section>
  {selected&&<Modal title={t('stockAdjustment')+' ? '+selected.sku} onClose={()=>{if(!busy)setSelected(null)}}>
   <form className="form-stack" noValidate onSubmit={adjust}>
    <p className="inventory-adjustment-product"><strong>{selected.name}</strong> <bdi>{[dimensionLabel(selected),thicknessLabel(selected)].filter(Boolean).join(' ? ')}</bdi></p>
    <label>{t('delta')}<input type="number" required step="1" min="-100000" max="100000" value={delta} onChange={e=>setDelta(e.target.value)}/></label>
    <label>{t('reason')}<textarea required minLength={5} maxLength={300} placeholder={t('reasonPlaceholder')} value={reason} onChange={e=>setReason(e.target.value)}/></label>
    <Button type="submit" disabled={!valid||busy}>{busy?t('loading'):t('save')}</Button>
   </form>
  </Modal>}
 </>;
}
const ORDER_STATUSES=['','PENDING','CONFIRMED','FULFILLED','CANCELLED','EXPIRED','RETURNED'];
function Orders({t,refresh,onError,onSuccess,canManage}:{t:Translate;refresh:number;onError:(x:string)=>void;onSuccess:(x:string)=>void;canManage:boolean}){
 const [filter,setFilter]=useState(''),[selected,setSelected]=useState<any>(null),[detail,setDetail]=useState<any>(null),[reason,setReason]=useState(''),[cash,setCash]=useState(''),[restock,setRestock]=useState(false),[counter,setCounter]=useState(0),[busy,setBusy]=useState(false);
 const orders=useLoad<any[]>(`/staff/orders${filter?'?status='+filter:''}`,refresh+counter,[],onError);
 async function open(order:any){setSelected(order);setReason('');setCash('');try{setDetail(await api(`/staff/orders/${order.id}`))}catch(e){onError(err(e))}}
 async function action(name:string){if(!selected)return;setBusy(true);try{const path=`/staff/orders/${selected.id}/${name}`;let body:any={};if(name==='cancel')body={reason};if(name==='refund')body={reason,restock};if(name==='collect-payment')body={method:'CASH',amountMinor:amount(cash)};await post(path,body,uid());setSelected(null);setDetail(null);setCounter(x=>x+1);onSuccess(t('orderUpdated'))}catch(e){onError(err(e))}finally{setBusy(false)}}
 return <><Heading title={t('orders')} subtitle={t('ordersSubtitle')}><select value={filter} className="filter-select" onChange={e=>setFilter(e.target.value)}>{ORDER_STATUSES.map(s=><option key={s} value={s}>{s?t('order'+s.charAt(0)+s.slice(1).toLowerCase()):t('all')}</option>)}</select></Heading><section className="surface-panel"><div className="table-wrap"><table><thead><tr>{['orderNumber','date','channel','status','total','actions'].map(k=><th key={k}>{t(k)}</th>)}</tr></thead><tbody>{orders.map(o=><tr key={o.id}><td className="strong mono">{o.order_number}</td><td>{new Date(o.created_at).toLocaleDateString()}</td><td>{o.channel_code==='POS'?t('posChannel'):t('online')}</td><td><Badge good={o.status==='FULFILLED'}>{t('order'+o.status.charAt(0)+o.status.slice(1).toLowerCase())}</Badge></td><td className="strong">{money(o.total_minor)}</td><td><button className="text-link" onClick={()=>open(o)}>{t('details')} <ArrowUpRight size={15}/></button></td></tr>)}</tbody></table>{!orders.length&&<Empty t={t}/>}</div></section>{selected&&<Modal title={t('orderInfo')} onClose={()=>{setSelected(null);setDetail(null)}}><div className="order-detail"><p className="mono strong">{selected.order_number}</p><div className="detail-pair"><span>{t('status')}</span><Badge good={selected.status==='FULFILLED'}>{t('order'+selected.status.charAt(0)+selected.status.slice(1).toLowerCase())}</Badge></div><div className="detail-pair"><span>{t('total')}</span><strong>{money(selected.total_minor)}</strong></div>{detail?.items?.map((i:any)=><div className="detail-pair" key={i.id}><span>{i.name_snapshot} × {i.qty}</span><b>{money(i.line_total_minor)}</b></div>)}{canManage&&<div className="order-controls">{selected.status==='PENDING'&&<Button onClick={()=>action('confirm')} disabled={busy}>{t('confirm')}</Button>}{selected.status==='CONFIRMED'&&<Button onClick={()=>action('fulfill')} disabled={busy}>{t('fulfill')}</Button>}{['PENDING','CONFIRMED'].includes(selected.status)&&<><label>{t('cancelReason')}<input minLength={3} value={reason} onChange={e=>setReason(e.target.value)}/></label><Button secondary disabled={busy||reason.trim().length<3} onClick={()=>action('cancel')}>{t('cancel')}</Button></>}{selected.channel_code==='ONLINE'&&['CONFIRMED','FULFILLED'].includes(selected.status)&&selected.payment_status==='UNPAID'&&<><label>{t('cashReceived')}<input type="number" min="0" step="0.01" value={cash} onChange={e=>setCash(e.target.value)}/></label><Button disabled={busy||amount(cash)<Number(selected.total_minor)} onClick={()=>action('collect-payment')}>{t('collectPayment')}</Button></>}{selected.status==='FULFILLED'&&selected.payment_status==='PAID'&&<><label>{t('refundReason')}<input value={reason} onChange={e=>setReason(e.target.value)}/></label><label className="check-label"><input type="checkbox" checked={restock} onChange={e=>setRestock(e.target.checked)}/>{t('restock')}</label><Button secondary disabled={busy||reason.trim().length<5} onClick={()=>action('refund')}>{t('refund')}</Button></>}</div>}</div></Modal>}</>
}
type CatalogPriceVariant={id:string}&Pick<PosVariant,'sku'|'width_mm'|'length_mm'|'height_mm'|'amount_minor'>;
function catalogPriceMinor(value:string){
 const normalized=value.trim().replace(',','.');
 if(!/^\d+(?:\.\d{1,2})?$/.test(normalized))return null;
 const minor=amount(normalized);
 return Number.isSafeInteger(minor)&&minor<=1_000_000_000_000?minor:null;
}

function CatalogPriceEditor({product,t,onClose,onSuccess}:{product:Product;t:Translate;onClose:()=>void;onSuccess:(message:string)=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const [variants,setVariants]=useState<CatalogPriceVariant[]|null>(null);
 const [size,setSize]=useState('');
 const [drafts,setDrafts]=useState<Record<string,string>>({});
 const [pending,setPending]=useState<string|null>(null);
 const [feedback,setFeedback]=useState<{id:string;text:string;error?:boolean}|null>(null);
 const [loadError,setLoadError]=useState('');
 const [retry,setRetry]=useState(0);
 const [confirmClose,setConfirmClose]=useState(false);

 useEffect(()=>{
  const element=dialog.current;
  element?.showModal();
  return ()=>element?.close();
 },[]);
 useEffect(()=>{
  const controller=new AbortController();
  api<{variants:CatalogPriceVariant[]}>(`/catalog/products/${product.slug}`,{signal:controller.signal})
   .then(data=>setVariants(data.variants.sort((a,b)=>a.width_mm-b.width_mm||a.length_mm-b.length_mm||(a.height_mm??0)-(b.height_mm??0))))
   .catch(error=>{if(!controller.signal.aborted)setLoadError(err(error))});
  return ()=>controller.abort();
 },[product.slug,retry]);

 const dimensions=new Map((variants??[]).map(row=>[`${row.width_mm}x${row.length_mm}`,row]));
 const activeSize=size||dimensions.keys().next().value;
 function close(){
  if(pending)return;
  const dirty=variants?.some(row=>drafts[row.id]!==undefined&&catalogPriceMinor(drafts[row.id])!==row.amount_minor);
  if(dirty)setConfirmClose(true);else onClose();
 }
 async function save(row:CatalogPriceVariant,event:React.FormEvent){
  event.preventDefault();
  const minor=catalogPriceMinor(drafts[row.id]??'');
  if(pending||minor===null||minor===row.amount_minor)return;
  setConfirmClose(false);
  setPending(row.id);
  setFeedback(null);
  try{
   await post(`/admin/variants/${row.id}/prices`,{amountMinor:minor});
   setVariants(current=>current?.map(variant=>variant.id===row.id?{...variant,amount_minor:minor}:variant)??null);
   setDrafts(current=>{const next={...current};delete next[row.id];return next});
   setFeedback({id:row.id,text:t('priceSaved')});
   onSuccess(t('priceSaved'));
  }catch(error){setFeedback({id:row.id,text:err(error),error:true})}
  finally{setPending(null)}
 }

 return <dialog ref={dialog} className="modal-panel catalog-price-editor" aria-labelledby="catalog-price-title"
  onCancel={event=>{event.preventDefault();close()}}>
  <div className="modal-head">
   <div><h2 id="catalog-price-title">{t('editPrices')}</h2><p>{product.name}</p></div>
   <button type="button" className="icon-button" aria-label={t('close')} disabled={pending!==null} onClick={close}><X size={20}/></button>
  </div>
  {loadError?<div className="catalog-price-feedback" role="alert">
   {loadError} <Button secondary onClick={()=>{setLoadError('');setRetry(value=>value+1)}}>{t('retry')}</Button>
  </div>:!variants?<div className="empty-state" role="status">{t('loading')}</div>:variants.length===0?<Empty t={t}/>:<>
   <div className="pos-variant-options" role="group" aria-label={t('size')}>
    <strong>{t('size')}</strong>
    <div className="pos-option-row">{Array.from(dimensions,([key,row])=><button key={key} type="button" aria-pressed={key===activeSize} disabled={pending!==null} onClick={()=>setSize(key)}><bdi>{dimensionLabel(row)}</bdi></button>)}</div>
   </div>
   <div className="catalog-price-rows">
    {variants.filter(row=>`${row.width_mm}x${row.length_mm}`===activeSize).map(row=>{
     const current=row.amount_minor===null?'':String(row.amount_minor/100);
     const value=drafts[row.id]??current;
     const minor=catalogPriceMinor(value);
     const invalid=drafts[row.id]!==undefined&&minor===null;
     const message=feedback?.id===row.id?feedback:null;
     return <form className="catalog-price-row" noValidate key={row.id} onSubmit={event=>save(row,event)}>
      <div className="catalog-price-identity">
       <strong>{thicknessLabel(row)?<>{t('posThickness')} <bdi>{thicknessLabel(row)}</bdi></>:<bdi>{dimensionLabel(row)}</bdi>}</strong>
       <small><bdi>{row.sku}</bdi></small>
       <small>{t('currentPrice')} <bdi>{row.amount_minor===null?t('posNoPrice'):money(row.amount_minor)}</bdi></small>
      </div>
      <label>{t('newPrice')}<input dir="ltr" inputMode="decimal" value={value} disabled={pending!==null}
       aria-invalid={invalid} aria-describedby={invalid?`price-feedback-${row.id}`:undefined}
       onChange={event=>{setDrafts(draft=>({...draft,[row.id]:event.target.value}));if(message)setFeedback(null)}}/></label>
      <Button type="submit" disabled={pending!==null||minor===null||minor===row.amount_minor}>{pending===row.id?t('loading'):t('save')}</Button>
      {(invalid||message)&&<p id={`price-feedback-${row.id}`} className="catalog-price-feedback" role={invalid||message?.error?'alert':'status'}>{invalid?t('priceInvalid'):message?.text}</p>}
     </form>;
    })}
   </div>
  </>}
  {confirmClose&&<div className="catalog-price-discard" role="status">
   <strong>{t('discardPrices')}</strong>
   <Button secondary onClick={()=>setConfirmClose(false)}>{t('continueEditing')}</Button>
   <Button secondary onClick={onClose}>{t('discard')}</Button>
  </div>}
 </dialog>;
}

type CatalogPhoto={id:string;url:string|null;altText:string};
function CatalogPhotoEditor({product,t,onClose,onSuccess}:{product:Product;t:Translate;onClose:()=>void;onSuccess:(message:string)=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const [photos,setPhotos]=useState<CatalogPhoto[]|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState('');
 const [removeId,setRemoveId]=useState<string|null>(null);
 const path=`/admin/media/products/${product.id}`;

 useEffect(()=>{
  const element=dialog.current;
  element?.showModal();
  const controller=new AbortController();
  api<CatalogPhoto[]>(path,{signal:controller.signal}).then(setPhotos)
   .catch(failure=>{if(!controller.signal.aborted)setError(err(failure))});
  return ()=>{controller.abort();element?.close()};
 },[path]);

 async function update(action:()=>Promise<unknown>){
  if(busy)return;
  setBusy(true);setError('');setStatus('');
  try{
   await action();
   setRemoveId(null);
   onSuccess(t('photoUpdated'));
   setPhotos(null);
   setPhotos(await api<CatalogPhoto[]>(path));
   setStatus(t('photoUpdated'));
  }catch(failure){setError(err(failure))}
  finally{setBusy(false)}
 }
 function upload(file:File,replaceId?:string){
  if(file.size>10*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type)){setError(t('maxImage'));return}
  const body=new FormData();
  body.append('productId',product.id);body.append('altText',replaceId?'':product.name);body.append('file',file);
  if(replaceId)body.append('replaceId',replaceId);
  void update(()=>api('/admin/media/upload',{method:'POST',body}));
 }
 function pickFile(event:React.ChangeEvent<HTMLInputElement>,replaceId?:string){
  const file=event.currentTarget.files?.[0];event.currentTarget.value='';
  if(file)upload(file,replaceId);
 }

 const primaryId=photos?.find(photo=>photo.url)?.id;
 return <dialog ref={dialog} className="modal-panel catalog-photo-editor" aria-labelledby="catalog-photo-title"
  onCancel={event=>{event.preventDefault();if(!busy)onClose()}}>
  <div className="modal-head">
   <div><h2 id="catalog-photo-title">{t('managePhotos')}</h2><p>{product.name}</p></div>
   <button type="button" className="icon-button" aria-label={t('close')} disabled={busy} onClick={onClose}><X size={20}/></button>
  </div>
  <div className="catalog-gallery-toolbar">
   <label className="btn-primary gallery-upload"><Plus size={17}/>{t('uploadPhoto')}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={pickFile}/></label>
   <span>{t('maxImage')}</span>
  </div>
  {error&&<div className="alert error" role="alert">{error}</div>}
  {busy&&<p role="status">{t('loading')}</p>}
  {status&&<p className="catalog-photo-status" role="status">{status}</p>}
  {!photos&&!error&&!busy&&<div className="empty-state" role="status">{t('loading')}</div>}
  {photos?.length===0&&<div className="empty-state">{t('noProductPhotos')}</div>}
  <div className="catalog-gallery">
   {photos?.map((photo,index)=><article key={photo.id} className="catalog-gallery-photo">
    <ProductPhoto src={photo.url} className="gallery-preview"/>
    <div className="catalog-gallery-controls">
     {photo.id===primaryId?<Badge good>{t('mainPhoto')}</Badge>:<button type="button" className="text-link" disabled={busy||!photo.url}
      onClick={()=>update(()=>api(`${path}/${photo.id}/primary`,{method:'PATCH'}))}>{t('makeMainPhoto')}</button>}
     <div className="catalog-gallery-actions">
      <label className="btn-outline gallery-upload">{t('replacePhoto')}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy}
       aria-label={`${t('replacePhoto')} ${index+1}`} onChange={event=>pickFile(event,photo.id)}/></label>
      <button type="button" className="text-link gallery-remove" disabled={busy} aria-label={`${t('removePhoto')} ${index+1}`} onClick={()=>setRemoveId(photo.id)}>{t('removePhoto')}</button>
     </div>
     {removeId===photo.id&&<div className="gallery-confirm">
      <p>{t('confirmRemovePhoto')}</p>
      <Button secondary disabled={busy} onClick={()=>setRemoveId(null)}>{t('cancel')}</Button>
      <Button disabled={busy} onClick={()=>update(()=>api(`${path}/${photo.id}`,{method:'DELETE'}))}>{t('removePhoto')}</Button>
     </div>}
    </div>
   </article>)}
  </div>
 </dialog>;
}

function Catalog({t,lang,refresh,onError,onSuccess}:{t:Translate;lang:Lang;refresh:number;onError:(x:string)=>void;onSuccess:(x:string)=>void}){
 const [query,setQuery]=useState(''),[page,setPage]=useState(1);
 const [result,setResult]=useState<{url:string;items:Product[]|null}|null>(null);
 const [contentLang,setContentLang]=useState<Lang>(lang);
 const [saving,setSaving]=useState(false),[formError,setFormError]=useState('');
 const [mode,setMode]=useState<'product'|'variant'|'price'|'photos'|null>(null),[selected,setSelected]=useState<Product|null>(null);
 const [form,setForm]=useState<Record<string,string>>({categoryCode:'MATTRESS',nameFr:'',nameEn:'',nameAr:'',descFr:'',descEn:'',descAr:'',slug:'',widthCm:'',lengthCm:'',heightCm:'',price:''});
 function field(key:string,value:string){setForm(f=>({...f,[key]:value}))}
 const url='/catalog/products?q='+encodeURIComponent(query.trim())+'&page='+page;
 const products=result?.url===url?result.items:null;
 const categories=useLoad<{code:string;name:string}[]>('/catalog/categories',0,[],onError);
 useEffect(()=>{
  const controller=new AbortController();
  const timer=window.setTimeout(()=>{
   api<{items:Product[]}>(url,{signal:controller.signal}).then(data=>setResult({url,items:data.items}))
    .catch(error=>{if(!controller.signal.aborted){setResult({url,items:null});onError(err(error))}});
  },query.trim()?250:0);
  return ()=>{window.clearTimeout(timer);controller.abort()};
 },[url,refresh,onError]);
 function openVariants(product:Product,nextMode:'variant'|'price'){
  setSelected(product);
  setMode(nextMode);
  setFormError('');
  setForm(current=>({...current,price:''}));
 }
 const thicknessRequired=selected?.category==='MATTRESS'||selected?.category==='TOPPER';
 const dimension=(value:string)=>/^\d+(?:[.,]\d)?$/.test(value.trim())?Number(value.trim().replace(',','.'))*10:0;
 const widthMm=dimension(form.widthCm),lengthMm=dimension(form.lengthCm),heightMm=dimension(form.heightCm);
 const variantPrice=catalogPriceMinor(form.price);
 const validDimension=(value:number)=>Number.isInteger(value)&&value>0&&value<=2_147_483_647;
 const validVariant=validDimension(widthMm)&&validDimension(lengthMm)&&(form.heightCm.trim()?validDimension(heightMm):!thicknessRequired)&&variantPrice!==null;

 const nameI18n={fr:form.nameFr.trim(),en:form.nameEn.trim(),ar:form.nameAr.trim()};
 const descriptionI18n={fr:form.descFr.trim(),en:form.descEn.trim(),ar:form.descAr.trim()};
 const productName=nameI18n.fr||nameI18n.en||nameI18n.ar;
 const derivedSlug=(nameI18n.fr||nameI18n.en||nameI18n.ar).toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const slugValid=!form.slug.trim()||/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim());
 const validProduct=Boolean(productName)&&slugValid&&Boolean(categories.some(category=>category.code===form.categoryCode));
 const languageSuffix={fr:'Fr',en:'En',ar:'Ar'}[contentLang];
 const categoryLabel=(code:string,fallback:string)=>categoryLabels[code]?t(categoryLabels[code]):fallback;

 async function submit(e:React.FormEvent){
  e.preventDefault();
  if(saving||(mode==='variant'&&!validVariant)||(mode==='product'&&!validProduct))return;
  setFormError('');
  setSaving(true);
  try{
  if(mode==='product'){
   await post('/admin/products',{categoryCode:form.categoryCode,name:productName,
     slug:form.slug.trim()||derivedSlug||`product-${uid().replace(/-/g,'').slice(0,12)}`,
     description:descriptionI18n.fr||descriptionI18n.en||descriptionI18n.ar,
     nameI18n,descriptionI18n,
     storefrontMeta:{range:form.categoryCode==='MATTRESS'?'classic':form.categoryCode==='PILLOW'?'oreiller':'sur-matelas',pricingType:form.categoryCode==='PILLOW'?'SIMPLE':'VARIANT_FULL'},featured:true});
   onSuccess(t('productSaved'));
  } else if(mode==='variant'){
   await post(`/admin/products/${selected?.id}/variants`,{widthMm,lengthMm,heightMm:heightMm||null,priceMinor:variantPrice});
   onSuccess(t('variantSaved'));
  }
  setMode(null);
 }catch(e){setFormError(err(e))}finally{setSaving(false)}}
 const categoryLabels:Record<string,string>={MATTRESS:'catalogMattress',PILLOW:'catalogPillow',TOPPER:'catalogTopper'};
 return <><Heading title={t('catalog')} subtitle={t('catalogSubtitle')}><Button onClick={()=>{setSelected(null);setContentLang(lang);setFormError('');setMode('product');setForm(f=>({...f,nameFr:'',nameEn:'',nameAr:'',descFr:'',descEn:'',descAr:'',slug:''}))}}><Plus size={17}/>{t('newProduct')}</Button></Heading>
 <div className="catalog-toolbar">
  <StockSearch t={t} label={t('catalogSearch')} value={query} onChange={value=>{setQuery(value);setPage(1)}}/>
  {(page>1||products?.length===24)&&<div className="catalog-pagination">
   <Button secondary disabled={page===1} onClick={()=>setPage(page-1)}>{t('catalogPrevious')}</Button>
   <span aria-live="polite">{t('catalogPage')} {page}</span>
   <Button secondary disabled={products?.length!==24} onClick={()=>setPage(page+1)}>{t('catalogNext')}</Button>
  </div>}
 </div>
 {result?.url!==url&&<div className="empty-state" role="status">{t('loading')}</div>}
 {products?.length===0&&<Empty t={t}/>}
 <div className="catalog-grid">{products?.map(product=><article className="catalog-card" key={product.id}>
  <ProductPhoto src={product.image_url} className="catalog-photo"/>
  <div className="catalog-info">
   <Badge>{categoryLabel(product.category,product.category)}</Badge>
   <h2>{product.name}</h2>
   {product.description&&<p>{product.description}</p>}
   <div className="catalog-price">
    {product.starting_price_minor===null?t('posNoPrice'):<>{t('catalogFrom')} <strong><bdi>{money(product.starting_price_minor)}</bdi></strong></>}
   </div>
   <div className="catalog-actions">
    <button type="button" className="text-link" onClick={()=>{setForm(f=>({...f,widthCm:'',lengthCm:'',heightCm:''}));openVariants(product,'variant')}}><Plus size={16}/>{t('newVariant')}</button>
    <button type="button" className="text-link" onClick={()=>openVariants(product,'price')}><Settings2 size={16}/>{t('editPrices')}</button>
   </div>
   <button type="button" className="media-drop" onClick={()=>{setSelected(product);setMode('photos')}}>
    <Camera size={17}/>{t('managePhotos')}
   </button>
  </div>
 </article>)}</div>

 {mode==='photos'&&selected&&<CatalogPhotoEditor product={selected} t={t} onClose={()=>setMode(null)} onSuccess={onSuccess}/>}
 {mode==='price'&&selected&&<CatalogPriceEditor product={selected} t={t} onClose={()=>setMode(null)} onSuccess={onSuccess}/>}
 {(mode==='product'||mode==='variant')&&<Modal title={mode==='product'?t('newProduct'):t('newVariant')} onClose={()=>{if(!saving)setMode(null)}}><form className="form-stack" onSubmit={submit}>
 {mode==='product'&&<>
  <label>{t('category')}<select value={form.categoryCode} onChange={event=>field('categoryCode',event.target.value)}>
   {categories.map(category=><option value={category.code} key={category.code}>{categoryLabel(category.code,category.name)}</option>)}
  </select></label>
  <div className="product-language-panel">
   <div className="pos-variant-options" role="group" aria-label={t('productLanguages')}>
    <strong>{t('productLanguages')}</strong>
    <div className="pos-option-row">{([['fr','Fran\u00e7ais'],['en','English'],['ar','\u0627\u0644\u0639\u0631\u0628\u064a\u0629']] as const).map(([code,label])=>
     <button key={code} type="button" lang={code} aria-pressed={contentLang===code} onClick={()=>setContentLang(code)}>
      {label}{nameI18n[code]&&<Check size={14} aria-hidden="true"/>}
     </button>)}</div>
   </div>
   <label>{t('name'+languageSuffix)}<input dir={contentLang==='ar'?'rtl':'ltr'} lang={contentLang} maxLength={180}
    value={form['name'+languageSuffix]} onChange={event=>field('name'+languageSuffix,event.target.value)}/></label>
   <label>{t('desc'+languageSuffix)}<textarea dir={contentLang==='ar'?'rtl':'ltr'} lang={contentLang} maxLength={6000}
    value={form['desc'+languageSuffix]} onChange={event=>field('desc'+languageSuffix,event.target.value)}/></label>
   {!productName&&<p>{t('productNameHint')}</p>}
  </div>
  <details className="product-url-options"><summary>{t('productUrl')}</summary>
   <label>{t('slug')}<input dir="ltr" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder={derivedSlug} value={form.slug} onChange={event=>field('slug',event.target.value)}/></label>
  </details>
 </>}
 {mode==='variant'&&<>
  <div className="variant-product"><ProductPhoto src={selected?.image_url??null}/><strong>{selected?.name}</strong></div>
  {thicknessRequired&&<div className="pos-variant-options" role="group" aria-label={t('size')}>
   <strong>{t('size')}</strong>
   <div className="pos-option-row">{[[90,190],[140,190],[160,200],[180,200]].map(([width,length])=><button key={width} type="button" aria-pressed={widthMm===width*10&&lengthMm===length*10}
    onClick={()=>setForm(current=>({...current,widthCm:String(width),lengthCm:String(length)}))}><bdi>{width} × {length} cm</bdi></button>)}</div>
  </div>}
  <div className="form-grid">
   <label>{t('widthCm')}<input inputMode="decimal" required value={form.widthCm} onChange={event=>field('widthCm',event.target.value)}/></label>
   <label>{t('lengthCm')}<input inputMode="decimal" required value={form.lengthCm} onChange={event=>field('lengthCm',event.target.value)}/></label>
   <label>{t(thicknessRequired?'heightCm':'heightOptional')}<input inputMode="decimal" required={thicknessRequired} value={form.heightCm} onChange={event=>field('heightCm',event.target.value)}/></label>
   <label>{t('price')}<input inputMode="decimal" required value={form.price} onChange={event=>field('price',event.target.value)}/></label>
  </div>
  <p className="variant-reference-note">{t('autoSku')}</p>
 </>}
 {formError&&<div className="alert error" role="alert">{formError}</div>}
 <Button type="submit" disabled={saving||(mode==='variant'&&!validVariant)||(mode==='product'&&!validProduct)}>{saving?t('loading'):t('save')}</Button></form></Modal>}</>
}
function Customers({t,locationId,refresh,onError,onSuccess}:{t:Translate;locationId:string;refresh:number;onError:(x:string)=>void;onSuccess:(x:string)=>void}){
 const [q,setQ]=useState(''),[modal,setModal]=useState(false),[name,setName]=useState(''),[email,setEmail]=useState(''),[phone,setPhone]=useState(''),[history,setHistory]=useState<any[]|null>(null),[title,setTitle]=useState(''),[counter,setCounter]=useState(0);
 const customers=useLoad<any[]>(`/staff/customers?q=${encodeURIComponent(q)}`,refresh+counter,[],onError);
 async function save(e:React.FormEvent){e.preventDefault();try{await post('/staff/customers',{fullName:name,email:email||null,phone:phone||null,locationId});setModal(false);setName('');setEmail('');setPhone('');setCounter(x=>x+1);onSuccess(t('saveChanges'))}catch(e){onError(err(e))}}
 async function seeHistory(c:any){setTitle(c.full_name);try{setHistory(await api(`/staff/customers/${c.id}/orders`))}catch(e){onError(err(e))}}
 return <><Heading title={t('customers')} subtitle={t('peopleSubtitle')}><Button onClick={()=>setModal(true)}><UserPlus size={17}/>{t('newCustomer')}</Button></Heading><section className="surface-panel"><div className="search-bar"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={t('search')+'...'} /></div><div className="table-wrap"><table><thead><tr>{['fullName','email','phone','history'].map(k=><th key={k}>{t(k)}</th>)}</tr></thead><tbody>{customers.map(c=><tr key={c.id}><td className="strong">{c.full_name}</td><td>{c.email||'—'}</td><td dir="ltr">{c.phone||'—'}</td><td><button className="text-link" onClick={()=>seeHistory(c)}>{c.order_count} · {t('history')} <ArrowUpRight size={15}/></button></td></tr>)}</tbody></table>{!customers.length&&<Empty t={t}/>}</div></section>{modal&&<Modal title={t('newCustomer')} onClose={()=>setModal(false)}><form onSubmit={save} className="form-stack"><label>{t('fullName')}<input required minLength={2} value={name} onChange={e=>setName(e.target.value)}/></label><label>{t('email')}<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>{t('phone')}<input value={phone} onChange={e=>setPhone(e.target.value)}/></label><Button type="submit">{t('save')}</Button></form></Modal>}{history&&<Modal title={t('history')+' — '+title} onClose={()=>setHistory(null)}>{history.length?history.map(o=><div className="detail-pair" key={o.id}><span>{o.order_number}</span><strong>{money(o.total_minor)}</strong></div>):<Empty t={t}/>}</Modal>}</>
}
function Team({t,locations,refresh,onError,onSuccess}:{t:Translate;locations:Location[];refresh:number;onError:(x:string)=>void;onSuccess:(x:string)=>void}){
 const [modal,setModal]=useState(false),[email,setEmail]=useState(''),[name,setName]=useState(''),[password,setPassword]=useState(''),[role,setRole]=useState('SELLER'),[locationId,setLocationId]=useState(''),[counter,setCounter]=useState(0);
 const users=useLoad<any[]>('/admin/users',refresh+counter,[],onError);
 async function save(e:React.FormEvent){e.preventDefault();try{await post('/admin/users',{email,displayName:name,password,role,locationId:['SELLER','LOCATION_MANAGER'].includes(role)?locationId:null});setModal(false);setPassword('');setCounter(x=>x+1);onSuccess(t('saveChanges'))}catch(e){onError(err(e))}}
 async function toggle(u:any){try{await api(`/admin/users/${u.id}/status`,{method:'PATCH',body:JSON.stringify({active:!u.active})});setCounter(x=>x+1);onSuccess(t('saveChanges'))}catch(e){onError(err(e))}}
 return <><Heading title={t('team')} subtitle={t('teamSubtitle')}><Button onClick={()=>{setLocationId(locations[0]?.id||'');setModal(true)}}><Plus size={17}/>{t('newEmployee')}</Button></Heading><div className="surface-panel"><div className="table-wrap"><table><thead><tr>{['fullName','email','role','status','actions'].map(k=><th key={k}>{t(k)}</th>)}</tr></thead><tbody>{users.map(u=><tr key={u.id}><td className="strong">{u.display_name}</td><td>{u.email}</td><td>{u.roles?.map((r:any)=><div key={r.role+String(r.locationId)}><Badge>{({SELLER:t('seller'),LOCATION_MANAGER:t('manager'),COMPANY_ADMIN:t('globalAdmin'),TECHNICAL_OPERATOR:t('engineer')})[r.role as 'SELLER']||r.role}</Badge></div>)}</td><td><Badge good={u.active}>{u.active?t('active'):t('inactive')}</Badge></td><td><button className="text-link" onClick={()=>toggle(u)}>{t('toggle')}</button></td></tr>)}</tbody></table>{!users.length&&<Empty t={t}/>}</div></div>{modal&&<Modal title={t('newEmployee')} onClose={()=>setModal(false)}><form onSubmit={save} className="form-stack"><label>{t('fullName')}<input required value={name} onChange={e=>setName(e.target.value)}/></label><label>{t('email')}<input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>{t('passwordHint')}<input required minLength={12} type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><label>{t('role')}<select value={role} onChange={e=>setRole(e.target.value)}><option value="SELLER">{t('seller')}</option><option value="LOCATION_MANAGER">{t('manager')}</option><option value="COMPANY_ADMIN">{t('globalAdmin')}</option><option value="TECHNICAL_OPERATOR">{t('engineer')}</option></select></label>{['SELLER','LOCATION_MANAGER'].includes(role)&&<label>{t('location')}<select value={locationId} required onChange={e=>setLocationId(e.target.value)}>{locations.map(l=><option value={l.id} key={l.id}>{l.name}</option>)}</select></label>}<Button type="submit">{t('createEmployee')}</Button></form></Modal>}</>
}
