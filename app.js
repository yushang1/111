import {hasCoordinate,distanceKm,orderedPlaces,withinBounds} from './geo.mjs';
import {createFreeMap,mapCategory} from './free-map.mjs';

const CATEGORIES=['全部','吃饭','咖啡','景点','散步','购物','住宿'];
const $=selector=>document.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function readLocal(key,fallback={}){try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}}
function writeLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{alert('浏览器无法保存本机数据，请使用备份功能保留内容。');return false}}
const state={data:null,marks:readLocal('kansai-marks'),nearbyCity:'京都',nearbyCategory:'全部',nearbyLimit:12,savedLimit:24,position:null,map:null,mapBounds:null,selectedId:null};

function setupSelect(select,values,allLabel){select.innerHTML=[allLabel,...values].map((v,i)=>`<option value="${i?esc(v):'all'}">${esc(v)}</option>`).join('')}
function setup(){
  const cities=[...new Set(state.data.places.map(p=>p.city))];
  setupSelect($('#nearbyCity'),cities,'全部城市');$('#nearbyCity').value='京都';
  setupSelect($('#savedCity'),cities,'全部城市');setupSelect($('#savedCategory'),CATEGORIES.slice(1),'全部分类');
  $('#nearbyCategories').innerHTML=CATEGORIES.map(c=>`<button class="chip ${c==='全部'?'active':''}" aria-pressed="${c==='全部'}" data-category="${c}">${c}</button>`).join('');
  $('#mapLegend').innerHTML=CATEGORIES.slice(1).map(c=>`<span><i style="--point-color:${mapCategory(c).color}">${mapCategory(c).symbol}</i>${c}</span>`).join('');
  $('#dataSummary').textContent=`${state.data.googleAudit.mappedEntries} 条历史清单核对 · ${state.data.places.filter(p=>p.verified&&!p.googleListRecord).length} 条后续保存记录 · ${state.data.places.filter(p=>!p.verified).length} 条待确认`;
  $('#coordinateCoverage').textContent=`${state.data.coordinateCount}/${state.data.count} 条已匹配公开参考坐标。其余保留在收藏中；直线距离不等于步行距离。`;
  const note=document.createElement('p');note.className='status-line';note.textContent=state.data.coverageNote;$('#savedCount').parentElement.after(note);
  bind();renderNearby();renderSaved();restoreTrip();startMap();
}
function bind(){
  document.querySelectorAll('.bottom-nav button').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.view)));
  $('#nearbyCity').addEventListener('change',event=>{state.nearbyCity=event.target.value;state.nearbyLimit=12;state.mapBounds=null;$('#viewportFilter').checked=false;renderNearby(true)});
  $('#areaQuery').addEventListener('input',()=>{const anchor=selectedAnchor();if(anchor){state.nearbyCity=anchor.city;$('#nearbyCity').value=anchor.city}state.nearbyLimit=12;renderNearby(true)});
  $('#nearbyCategories').addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;state.nearbyCategory=button.dataset.category;state.nearbyLimit=12;document.querySelectorAll('#nearbyCategories button').forEach(x=>{x.classList.toggle('active',x===button);x.setAttribute('aria-pressed',String(x===button))});renderNearby(true)});
  $('#radius').addEventListener('change',()=>{state.nearbyLimit=12;renderNearby(true)});
  $('#viewportFilter').addEventListener('change',()=>{state.nearbyLimit=12;renderNearby()});
  $('#nearbyMore').addEventListener('click',()=>{state.nearbyLimit+=12;renderNearby()});
  for(const id of ['savedSearch','savedCity','savedCategory','savedState','savedOrigin'])$('#'+id).addEventListener(id==='savedSearch'?'input':'change',()=>{state.savedLimit=24;renderSaved()});
  $('#savedMore').addEventListener('click',()=>{state.savedLimit+=24;renderSaved()});
  $('#locateBtn').addEventListener('click',locate);$('#loadMapBtn').addEventListener('click',startMap);
  $('#backupBtn').addEventListener('click',showBackup);$('#restoreInput').addEventListener('change',restoreBackup);
  $('#tripForm').addEventListener('submit',saveTrip);
  $('#detailDialog').addEventListener('click',event=>{if(event.target===$('#detailDialog'))$('#detailDialog').close()});
  document.addEventListener('click',handleCardAction);
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();window.installPrompt=event;$('#installBtn').hidden=false});
  $('#installBtn').addEventListener('click',async()=>{if(window.installPrompt){await window.installPrompt.prompt();window.installPrompt=null;$('#installBtn').hidden=true}});
}
function showView(id){document.querySelectorAll('.view').forEach(view=>view.classList.toggle('active',view.id===id));document.querySelectorAll('.bottom-nav button').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===id));scrollTo({top:0,behavior:'smooth'});if(id==='nearbyView')requestAnimationFrame(()=>state.map?.resize())}
function nearbyBase(){
  const query=$('#areaQuery').value.trim().toLowerCase();
  const anchor=selectedAnchor();
  return orderedPlaces(state.data.places.filter(place=>(anchor?place.city===anchor.city:state.nearbyCity==='all'||place.city===state.nearbyCity)&&(state.nearbyCategory==='全部'||place.category===state.nearbyCategory)&&(!query||(anchor?hasCoordinate(place)&&distanceKm(anchor.coordinate,place.coordinate)<=5:`${place.name} ${place.japaneseName} ${place.region}`.toLowerCase().includes(query)))),referencePosition());
}
function selectedAnchor(){const query=$('#areaQuery').value.trim().toLowerCase();return state.data.anchors?.find(anchor=>anchor.aliases.some(alias=>alias.toLowerCase()===query))}
function referencePosition(){return selectedAnchor()?.coordinate||state.position}
function filteredNearby(){
  const radius=Number($('#radius').value),bounds=$('#viewportFilter').checked?state.mapBounds:null;
  return nearbyBase().filter(place=>{
    if(radius&&referencePosition()&&(!hasCoordinate(place)||distanceKm(referencePosition(),place.coordinate)>radius))return false;
    if(bounds&&(!hasCoordinate(place)||!withinBounds(place.coordinate,bounds)))return false;
    return true;
  });
}
function renderNearby(fit=false){
  const items=filteredNearby();let shown=items.slice(0,state.nearbyLimit);
  const selected=items.find(p=>p.id===state.selectedId);if(selected&&!shown.includes(selected))shown=[selected,...shown.slice(0,-1)];
  $('#nearbyCount').textContent=`${selectedAnchor()?selectedAnchor().name+'直线 5 公里内：':'当前显示 '}${items.length} 个地点`;
  $('#nearbyList').innerHTML=shown.length?shown.map(placeCard).join(''):'<div class="privacy-card">当前范围没有匹配地点。可扩大范围或手动选择城市；无坐标的地点仍在全部收藏中。</div>';
  $('#nearbyMore').hidden=shown.length>=items.length;
  const area=$('#areaQuery').value.trim()||(state.nearbyCity==='all'?'关西':state.nearbyCity);
  $('#areaMapLink').href=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(area+' 日本')}`;
  // Use the full city/category selection for map points; viewport filtering affects cards only.
  const radius=Number($('#radius').value),point=referencePosition();
  const mapped=nearbyBase().filter(p=>hasCoordinate(p)&&(!radius||!point||distanceKm(point,p.coordinate)<=radius));
  const unlocated=nearbyBase().filter(p=>!hasCoordinate(p)).length;
  $('#mapHint').textContent=mapped.length?`${mapped.length} 个地点可在地图查看${unlocated?' · '+unlocated+' 个位置待核':''}，点数字放大`:'这组收藏的位置仍待核对，请在下方查看';
  state.map?.update(mapped,{fit,selectedId:state.selectedId});
}
function filteredSaved(){
  const query=$('#savedSearch').value.trim().toLowerCase(),city=$('#savedCity').value,cat=$('#savedCategory').value,mark=$('#savedState').value,origin=$('#savedOrigin').value;
  return state.data.places.filter(place=>(city==='all'||place.city===city)&&(cat==='all'||place.category===cat)&&(!query||`${place.name} ${place.googleListRecord?.name||''} ${place.japaneseName} ${place.region} ${place.note} ${place.sourceLabel}`.toLowerCase().includes(query))&&(mark==='all'||(mark==='unmarked'?!state.marks[place.id]:state.marks[place.id]===mark))&&(origin==='all'||(origin==='google'?Boolean(place.googleListRecord):!place.googleListRecord)));
}
function renderSaved(){const items=filteredSaved(),shown=items.slice(0,state.savedLimit);$('#savedCount').textContent=`找到 ${items.length} 个地点`;$('#savedList').innerHTML=shown.length?shown.map(placeCard).join(''):'<div class="privacy-card">没有匹配收藏。</div>';$('#savedMore').hidden=shown.length>=items.length}
function distanceLabel(place){
  if(!hasCoordinate(place))return '坐标 / 分店待核';
  const point=referencePosition();if(!point)return '有公开参考坐标';
  const distance=distanceKm(point,place.coordinate);
  return distance<1?`直线约 ${Math.round(distance*1000/50)*50} 米`:`直线约 ${distance.toFixed(1)} 公里`;
}
function placeCard(place){const mark=state.marks[place.id];return `<article class="place-card ${state.selectedId===place.id?'is-selected':''}" data-id="${place.id}"><div class="place-top"><div><h3>${esc(place.name)}</h3><div class="place-sub">${esc(place.city)} · ${esc(place.region)} · ${esc(place.category)}</div></div><span class="tag ${place.verified?'':'pending'}">${place.verified?'有保存记录':'待确认'}</span></div><p class="place-note">${esc(place.note||'暂无实用备注')}</p><div class="distance">${distanceLabel(place)}</div><div class="card-actions"><button class="detail-btn" data-action="detail">详情</button>${state.map&&hasCoordinate(place)?'<button class="detail-btn" data-action="focus">地图点</button>':''}<a class="map-btn" href="${place.mapSearchUrl}" target="_blank" rel="noopener">Google Maps</a><div class="state-buttons"><button class="state-btn ${mark==='want'?'active':''}" data-action="mark" data-mark="want" aria-label="特别想去" aria-pressed="${mark==='want'}">★</button><button class="state-btn ${mark==='visited'?'active':''}" data-action="mark" data-mark="visited" aria-label="去过" aria-pressed="${mark==='visited'}">✓</button></div></div></article>`}
function handleCardAction(event){
  const button=event.target.closest('[data-action]');if(!button)return;
  const place=state.data.places.find(p=>p.id===button.closest('[data-id]')?.dataset.id);if(!place)return;
  const action=button.dataset.action;
  if(action==='detail'){state.selectedId=place.id;state.map?.update(nearbyBase(),{selectedId:place.id});showDetail(place)}
  if(action==='focus'){
    state.nearbyCity=place.city;$('#nearbyCity').value=place.city;$('#areaQuery').value='';$('#radius').value='0';$('#viewportFilter').checked=false;
    state.nearbyCategory='全部';document.querySelectorAll('#nearbyCategories button').forEach(b=>{const active=b.dataset.category==='全部';b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
    showView('nearbyView');state.selectedId=place.id;renderNearby();state.map.focus(place);$('#tripMap').scrollIntoView({block:'center',behavior:'smooth'});
  }
  if(action==='mark'){const next=button.dataset.mark;if(state.marks[place.id]===next)delete state.marks[place.id];else state.marks[place.id]=next;writeLocal('kansai-marks',state.marks);renderNearby();renderSaved()}
}
function selectPlace(id){
  state.selectedId=id;
  const index=filteredNearby().findIndex(p=>p.id===id);
  if(index<0){const place=state.data.places.find(p=>p.id===id);if(place)showDetail(place);return}
  renderNearby();
  $(`#nearbyList [data-id="${id}"]`)?.scrollIntoView({block:'center',behavior:'smooth'});
}
function showDetail(place){
  const coordinate=place.coordinate;
  const link=(url,label)=>url?`<a href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`:'';
  $('#detailContent').innerHTML=`<div class="detail-inner"><div class="eyebrow">${esc(place.city)} · ${esc(place.category)}</div><h2>${esc(place.name)}</h2><div class="place-sub">${esc(place.japaneseName||'日文名称待核')}</div><dl><dt>区域</dt><dd>${esc(place.region)}</dd><dt>地址</dt><dd>${esc(place.address||'尚未核对完整地址，请在 Google Maps 确认')}${place.addressSourceUrl?`<br>${link(place.addressSourceUrl,'地址来源')} · ${esc(place.addressCheckedAt||'日期未记录')}`:''}</dd><dt>收藏备注</dt><dd>${esc(place.note||'暂无')}</dd><dt>收藏来源</dt><dd>${esc(place.sourceLabel)}；笔记经验不代表实时营业、价格或排队。${link(place.sourceUrl,'原笔记')}</dd><dt>记录状态</dt><dd>${esc(place.evidence)}</dd><dt>坐标</dt><dd>${esc(place.coordinateStatus)}${coordinate?`<br>${coordinate.lat}, ${coordinate.lng}<br>${link(coordinate.sourceUrl,'公开资料来源')} · ${esc(coordinate.checkedAt||'日期未记录')} 匹配`:''}</dd>${place.officialUrl?`<dt>官网</dt><dd>${link(place.officialUrl,'查看官方网页')}</dd>`:''}</dl><div class="detail-actions"><a href="${esc(place.mapDirectionsUrl||place.mapSearchUrl)}" target="_blank" rel="noopener">${coordinate?'Google 步行路线':'Google 搜索确认'}</a><button id="closeDetail">关闭</button></div></div>`;
  $('#detailDialog').showModal();$('#closeDetail').onclick=()=>$('#detailDialog').close();
}
function mapFailure(message){$('#mapFallback').hidden=false;$('#mapStatus').textContent=message;$('#loadMapBtn').hidden=false;$('#loadMapBtn').disabled=false;$('#loadMapBtn').textContent='重试地图';state.map?.dispose();state.map=null;$('#viewportFilter').checked=false;$('#viewportFilter').disabled=true;renderNearby();renderSaved()}
async function startMap(){
  const button=$('#loadMapBtn');button.disabled=true;$('#mapFallback').hidden=false;$('#mapStatus').textContent='正在打开地图…';
  try{
    state.map=await createFreeMap($('#tripMap'),{onSelect:selectPlace,onBounds:bounds=>{state.mapBounds=bounds;if($('#viewportFilter').checked)renderNearby()}});
    $('#mapFallback').hidden=true;$('#viewportFilter').disabled=false;renderNearby(true);renderSaved();if(state.position)state.map.locate(state.position);
  }catch{mapFailure('地图暂时没能载入，可以重试；收藏列表和 Google 导航仍可使用。')}
}
function locate(){
  const line=$('#locationStatus');if(!navigator.geolocation){line.textContent='当前浏览器不支持定位，请手动选区域。';return}
  line.textContent='正在读取当前位置…';
  navigator.geolocation.getCurrentPosition(position=>{
    state.position={lat:position.coords.latitude,lng:position.coords.longitude};
    const closest=orderedPlaces(state.data.places.filter(hasCoordinate),state.position)[0];
    if(closest&&distanceKm(state.position,closest.coordinate)<80){state.nearbyCity=closest.city;$('#nearbyCity').value=closest.city}else{state.nearbyCity='all';$('#nearbyCity').value='all'}
    $('#areaQuery').value='';state.nearbyLimit=12;state.map?.locate(state.position);
    line.textContent='已定位。按参考坐标计算直线距离；无坐标地点排在后面，位置仅用于本次会话。';renderNearby();renderSaved();
  },error=>{line.textContent=error.code===1?'定位被拒绝。手动选城市、街区或车站仍可浏览。':'暂时无法取得位置，请手动选区域。'},{enableHighAccuracy:false,timeout:8000,maximumAge:300000});
}
function saveTrip(event){event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));if(writeLocal('kansai-trip-card',data)){$('#tripSaveStatus').textContent='已保存';setTimeout(()=>$('#tripSaveStatus').textContent='本机保存',1800)}}
function restoreTrip(){const data=readLocal('kansai-trip-card');for(const key of ['flights','hotels','bookings','prep'])$(`#tripForm [name="${key}"]`).value=typeof data[key]==='string'?data[key]:''}
function showBackup(){
  $('#detailContent').innerHTML='<div class="detail-inner backup-sheet"><div class="eyebrow">本机数据</div><h2>备份与恢复</h2><p class="intro">导出包含地点标记和出行底卡。恢复会替换这两类本机数据。</p><button id="exportBackup" class="primary-btn">导出 JSON 备份</button><button id="importBackup">从备份恢复</button><button id="closeBackup">取消</button></div>';
  $('#detailDialog').showModal();$('#closeBackup').onclick=()=>$('#detailDialog').close();$('#importBackup').onclick=()=>$('#restoreInput').click();$('#exportBackup').onclick=exportBackup;
}
function exportBackup(){const payload={schema:1,exportedAt:new Date().toISOString(),marks:state.marks,trip:readLocal('kansai-trip-card')};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const anchor=document.createElement('a');anchor.href=url;anchor.download='kansai-pocket-backup.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function restoreBackup(event){
  const file=event.target.files[0];if(!file)return;if(file.size>1000000){alert('备份文件过大，请选择此应用导出的 JSON。');return}
  const reader=new FileReader();reader.onload=()=>{try{
    const payload=JSON.parse(reader.result);if(payload.schema!==1||!payload.marks||typeof payload.marks!=='object')throw Error('schema');
    const marks={};for(const place of state.data.places)if(['want','visited'].includes(payload.marks[place.id]))marks[place.id]=payload.marks[place.id];
    const trip={};for(const key of ['flights','hotels','bookings','prep'])if(typeof payload.trip?.[key]==='string')trip[key]=payload.trip[key].slice(0,10000);
    state.marks=marks;writeLocal('kansai-marks',marks);writeLocal('kansai-trip-card',trip);restoreTrip();renderNearby();renderSaved();$('#detailDialog').close();
  }catch{alert('无法读取这个备份文件')}};reader.readAsText(file);event.target.value='';
}
fetch('places.json').then(response=>{if(!response.ok)throw Error('data');return response.json()}).then(data=>{state.data=data;setup()}).catch(()=>{$('#nearbyList').innerHTML='<div class="privacy-card">地点数据加载失败，请稍后重新打开。</div>'});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js'));
