import {SUNTORY_PLACE_ID, bookingPlaceId} from './suntory-guide.mjs';

const KEY='kansai-journey-v2';
const clean=(value,max=2000)=>typeof value==='string'?value.slice(0,max):'';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fields={flights:['label','number','depDate','depTime','depPlace','depZone','arrDate','arrTime','arrPlace','arrZone','note'],stays:['name','address','checkin','checkout','confirmation','url','note'],bookings:['name','date','time','endTime','address','confirmation','url','note','status','payment']};
const validTime=value=>/^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
const niceDate=value=>validDate(value)?`${Number(value.slice(5,7))}月${Number(value.slice(8))}日`:'';
const safeURL=value=>{try{const url=new URL(value);return url.protocol==='https:'?url.href:''}catch{return ''}};
const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};
export function sanitizeJourneyData(raw){
  const result={schema:2,flights:[],stays:[],bookings:[],tasks:[]};
  for(const [kind,names] of Object.entries(fields)){
    if(!Array.isArray(raw?.[kind]))continue;
    result[kind]=raw[kind].filter(x=>x&&typeof x==='object').slice(0,100).map((x,i)=>{
      const item={id:clean(x.id,100)||`${kind}-${i}`};
      for(const name of names){item[name]=clean(x[name]);if(['depDate','arrDate','checkin','checkout','date'].includes(name)&&!validDate(item[name]))item[name]='';if(['depTime','arrTime','time','endTime'].includes(name)&&!validTime(item[name]))item[name]='';}
      if(kind==='bookings'){
        item.status=x.status==='pending'?'pending':'confirmed';
        item.placeId=bookingPlaceId(x);
        if(!item.time||item.endTime<=item.time)item.endTime='';
      }
      if(item.url)item.url=safeURL(item.url);
      return item;
    });
  }
  if(Array.isArray(raw?.tasks))result.tasks=raw.tasks.filter(x=>x&&typeof x==='object'&&typeof x.label==='string').slice(0,100).map((x,i)=>({id:clean(x.id,100)||`task-${i}`,label:clean(x.label,300),done:x.done===true}));
  return result;
}
export const getJourneyData=()=>sanitizeJourneyData(load(KEY,{}));
let options={},editorState=null;
const root=()=>document.querySelector('#tripView');
function status(message){document.querySelector('#tripSaveStatus').textContent=message}
function save(data){try{localStorage.setItem(KEY,JSON.stringify(sanitizeJourneyData(data)));return true}catch{status('本机空间不足，未保存。请先导出备份。');return false}}
function mapButton(address,label='查乘车路线'){return address?`<button type="button" class="wallet-action" data-route="${esc(address)}">${label}<span aria-hidden="true"> ↗</span></button>`:''}
function links(item,guide=false){return `<div class="wallet-actions">${guide?`<button type="button" class="wallet-action wallet-guide" data-booking-guide="${esc(item.id)}">怎么去 <span aria-hidden="true"> →</span></button>`:mapButton(item.address)}${item.address?`<button type="button" class="wallet-action" data-copy-text="${esc(item.address)}">复制地址</button>`:''}${item.confirmation?`<button type="button" class="wallet-action" data-copy-text="${esc(item.confirmation)}">复制确认号</button>`:''}${safeURL(item.url)?`<a class="wallet-action" href="${esc(safeURL(item.url))}" target="_blank" rel="noopener noreferrer">查看确认资料 ↗</a>`:''}</div>`}
function editButton(kind,id){return `<button type="button" class="wallet-edit" data-edit-kind="${kind}" data-id="${esc(id)}" aria-label="编辑${kind==='flights'?'航班':kind==='stays'?'住宿':'预约'}">编辑</button>`}
function emptyCard(title,body,kind,button){return `<div class="wallet-empty"><div><strong>${title}</strong>${body?`<p>${body}</p>`:''}</div>${kind?`<button type="button" class="wallet-action" data-add="${kind}">${button}</button>`:''}</div>`}
function stayCard(item){return `<article class="wallet-card"><div class="wallet-card-top"><span class="wallet-kicker">住宿</span>${editButton('stays',item.id)}</div><h4>${esc(item.name||'住宿')}</h4><p class="wallet-dates">${esc(niceDate(item.checkin))}入住${item.checkout?' · '+esc(niceDate(item.checkout))+'退房':''}</p>${item.address?`<p class="wallet-address" lang="ja">${esc(item.address)}</p>`:''}${item.confirmation?`<p class="wallet-meta">确认号 <span>${esc(item.confirmation)}</span></p>`:''}${item.note?`<p class="wallet-note">${esc(item.note)}</p>`:''}${links(item)}</article>`}
function bookingCard(item){
  const guide=item.placeId===SUNTORY_PLACE_ID;
  const place=guide?options.getPlace?.(item.placeId):null;
  const address=place?.address||item.address;
  const time=item.endTime?`${item.time}–${item.endTime}`:item.time;
  return `<article class="wallet-card"><div class="wallet-card-top"><span class="wallet-kicker">${item.status==='pending'?'待确认':'已预约'}${time?' · '+esc(time)+' 日本时间':''}</span>${editButton('bookings',item.id)}</div><h4>${esc(item.name||place?.name||'预约')}</h4><p class="wallet-dates">${esc(niceDate(item.date))}</p>${address?`<p class="wallet-address">${esc(address)}</p>`:''}${item.payment?`<p class="wallet-meta">${esc(item.payment)}</p>`:''}${item.confirmation?`<p class="wallet-meta">确认号 <span>${esc(item.confirmation)}</span></p>`:''}${item.note?`<p class="wallet-note">${esc(item.note)}</p>`:''}${links({...item,address},guide)}</article>`;
}
function flightCard(item){return `<article class="wallet-card flight-card"><div class="wallet-card-top"><span class="wallet-kicker">${esc(item.label||'航班')}${item.number?' · '+esc(item.number):''}</span>${editButton('flights',item.id)}</div><div class="flight-leg"><div><strong>${esc(item.depTime||'待补时间')}</strong><p>${esc(item.depPlace||'出发机场')}</p><small>${esc(niceDate(item.depDate))} · ${esc(item.depZone||'当地时间')}</small></div><span class="flight-arrow" aria-hidden="true">→</span><div><strong>${esc(item.arrTime||'待补时间')}</strong><p>${esc(item.arrPlace||'到达机场')}</p><small>${esc(niceDate(item.arrDate))} · ${esc(item.arrZone||'当地时间')}</small></div></div>${!item.number?'<p class="wallet-meta">航班号待补充</p>':''}${item.note?`<p class="wallet-note">${esc(item.note)}</p>`:''}</article>`}
export function renderJourney(){
  if(!root())return;
  const data=getJourneyData();
  document.querySelector('#flightCards').innerHTML=data.flights.length?data.flights.slice().sort((a,b)=>(a.depDate+a.depTime).localeCompare(b.depDate+b.depTime)).map(flightCard).join(''):emptyCard('暂无航班','添加后显示起飞和到达的当地时间。','flights','添加航班');
  document.querySelector('#stayCards').innerHTML=data.stays.length?data.stays.slice().sort((a,b)=>a.checkin.localeCompare(b.checkin)).map(x=>stayCard(x)).join(''):emptyCard('暂无住宿','');
  document.querySelector('#bookingCards').innerHTML=data.bookings.length?data.bookings.slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).map(x=>bookingCard(x)).join(''):emptyCard('暂无预约','');
  const tasks=data.tasks;
  document.querySelector('#prepCount').textContent=tasks.length?`${tasks.filter(x=>x.done).length}/${tasks.length}`:'';
  document.querySelector('#journeyTasks').innerHTML=tasks.map(task=>`<div class="wallet-task"><label><input type="checkbox" data-task="${esc(task.id)}" ${task.done?'checked':''}><span>${esc(task.label)}</span></label><button type="button" data-remove-task="${esc(task.id)}" aria-label="删除准备事项：${esc(task.label)}">×</button></div>`).join('')||'<p class="wallet-muted">把还没办好的事加在这里，完成一项勾一项。</p>';
  const legacy=load('kansai-trip-card',{});
  const names={flights:'往返航班',hotels:'住宿',bookings:'已预约',prep:'出发准备'};
  const present=Object.keys(names).filter(k=>typeof legacy[k]==='string'&&legacy[k].trim());
  document.querySelector('#legacyTrip').hidden=!present.length;
  document.querySelector('#legacyRecords').innerHTML=present.map(k=>`<article class="legacy-record"><div class="wallet-card-top"><h4>${names[k]}</h4><button type="button" class="wallet-edit" data-legacy="${k}">编辑</button></div><p>${esc(legacy[k])}</p></article>`).join('');
  window.dispatchEvent(new CustomEvent('journey-updated',{detail:data}));
}
function input(name,label,value='',type='text',required=false){return `<label class="wallet-field"><span>${label}${required?' <small>必填</small>':''}</span><input name="${name}" type="${type}" value="${esc(value)}" ${required?'required':''} ${type==='text'?'maxlength="2000"':''}></label>`}
function openEditor(kind,id){
  const item=getJourneyData()[kind].find(x=>x.id===id)||{};
  editorState={kind,id};
  const dialog=document.querySelector('#journeyEditor');
  document.querySelector('#journeyEditorTitle').textContent=(id?'编辑':'添加')+({flights:'航班',stays:'住宿',bookings:'预约'}[kind]);
  let content='';
  if(kind==='flights')content=input('label','名称（例如：去程）',item.label)+input('number','航班号',item.number)+'<div class="wallet-form-pair">'+input('depDate','起飞日期',item.depDate,'date',true)+input('depTime','起飞时间',item.depTime,'time')+'</div>'+input('depPlace','出发机场与航站楼',item.depPlace,'text',true)+input('depZone','起飞时间所属地',item.depZone||'北京时间')+'<div class="wallet-form-pair">'+input('arrDate','到达日期',item.arrDate,'date',true)+input('arrTime','到达时间',item.arrTime,'time')+'</div>'+input('arrPlace','到达机场与航站楼',item.arrPlace,'text',true)+input('arrZone','到达时间所属地',item.arrZone||'日本时间');
  if(kind==='stays')content=input('name','酒店名称',item.name,'text',true)+input('address','日文地址',item.address)+'<div class="wallet-form-pair">'+input('checkin','入住日期',item.checkin,'date',true)+input('checkout','退房日期',item.checkout,'date',true)+'</div>';
  if(kind==='bookings'){
    const place=options.getPlace?.(SUNTORY_PLACE_ID);
    content=input('name','预约名称',item.name,'text',true)+input('date','预约日期（日本）',item.date,'date',true)+
      '<div class="wallet-form-pair">'+input('time','开始时间（日本）',item.time,'time')+input('endTime','结束时间（日本）',item.endTime,'time')+'</div>'+
      `<label class="wallet-field"><span>关联乘车攻略</span><select name="placeId"><option value="">无</option><option value="${SUNTORY_PLACE_ID}" ${item.placeId===SUNTORY_PLACE_ID?'selected':''}>${esc(place?.name||'三得利工厂')}</option></select></label>`+
      input('address','地点或地址（未关联时使用）',item.address)+
      `<label class="wallet-field"><span>预约状态</span><select name="status"><option value="confirmed" ${item.status!=='pending'?'selected':''}>已确认</option><option value="pending" ${item.status==='pending'?'selected':''}>待确认</option></select></label>`+
      input('payment','付款备注',item.payment);
  }
  if(kind!=='flights')content+=input('confirmation','确认号',item.confirmation)+input('url','确认资料链接（https）',item.url,'url');
  content+=`<label class="wallet-field"><span>备注</span><textarea name="note" rows="3" maxlength="2000">${esc(item.note||'')}</textarea></label>`;
  document.querySelector('#journeyEditorFields').innerHTML=content;
  document.querySelector('#journeyDelete').hidden=!id;
  document.querySelector('#journeyEditorError').textContent='';
  dialog.showModal();
}
async function copyText(value){try{await navigator.clipboard.writeText(value);status('已复制')}catch{const box=document.querySelector('#copyFallback');box.value=value;box.hidden=false;box.focus();box.select();status('已选中内容，可以使用系统复制')}}
export function setupJourney(config){
  options=config;
  document.querySelector('#tripBackup').onclick=()=>options.onBackup();
  root().addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.add)openEditor(button.dataset.add);
    if(button.dataset.editKind)openEditor(button.dataset.editKind,button.dataset.id);
    if(button.dataset.route)options.onRoute(button.dataset.route);
    if(button.dataset.bookingGuide){
      const booking=getJourneyData().bookings.find(item=>item.id===button.dataset.bookingGuide);
      if(booking?.placeId===SUNTORY_PLACE_ID)options.onGuide(booking);
    }
    if(button.dataset.copyText)copyText(button.dataset.copyText);
    if(button.dataset.jump)document.getElementById(button.dataset.jump).scrollIntoView({behavior:'smooth',block:'start'});
    if(button.dataset.removeTask){const data=getJourneyData();data.tasks=data.tasks.filter(x=>x.id!==button.dataset.removeTask);if(save(data))renderJourney()}
    if(button.dataset.legacy){editorState={kind:'legacy',id:button.dataset.legacy};document.querySelector('#journeyEditorTitle').textContent='编辑之前的记录';document.querySelector('#journeyEditorFields').innerHTML=`<label class="wallet-field"><span>内容</span><textarea name="legacy" rows="8" maxlength="10000">${esc(load('kansai-trip-card',{})[button.dataset.legacy])}</textarea></label>`;document.querySelector('#journeyDelete').hidden=true;document.querySelector('#journeyEditorError').textContent='';document.querySelector('#journeyEditor').showModal()}
  });
  root().addEventListener('change',event=>{if(event.target.dataset.task){const data=getJourneyData();const task=data.tasks.find(x=>x.id===event.target.dataset.task);if(task){task.done=event.target.checked;if(save(data))renderJourney();else event.target.checked=!event.target.checked}}});
  document.querySelector('#journeyTaskForm').onsubmit=event=>{event.preventDefault();const input=document.querySelector('#newJourneyTask');const label=input.value.trim();if(!label)return;const data=getJourneyData();if(data.tasks.length>=100){status('最多保存100项准备事项');return}data.tasks.push({id:uid(),label,done:false});if(save(data)){input.value='';renderJourney();status('准备事项已添加')}};
  document.querySelectorAll('[data-close-journey]').forEach(x=>x.onclick=()=>document.querySelector('#journeyEditor').close());
  document.querySelector('#journeyEditor').addEventListener('click',event=>{if(event.target===event.currentTarget)event.currentTarget.close()});
  document.querySelector('#journeyEditForm').onsubmit=event=>{
    event.preventDefault();const values=Object.fromEntries(new FormData(event.target));
    if(editorState.kind==='legacy'){const legacy=load('kansai-trip-card',{});legacy[editorState.id]=values.legacy;try{localStorage.setItem('kansai-trip-card',JSON.stringify(legacy))}catch{document.querySelector('#journeyEditorError').textContent='未保存，请检查本机存储空间。';return}}
    else{
      if(editorState.kind==='stays'&&values.checkout<=values.checkin){document.querySelector('#journeyEditorError').textContent='退房日期需要晚于入住日期。';return}
      if(values.endTime&&(!values.time||values.endTime<=values.time)){document.querySelector('#journeyEditorError').textContent='结束时间需要晚于开始时间。';return}
      if(values.url&&!safeURL(values.url)){document.querySelector('#journeyEditorError').textContent='确认资料请填写 https 链接。';return}
      const data=getJourneyData();const list=data[editorState.kind];const at=list.findIndex(x=>x.id===editorState.id);const item={...values,id:editorState.id||uid()};if(at<0){if(list.length>=100){document.querySelector('#journeyEditorError').textContent='最多保存100条记录。';return}list.push(item)}else list[at]=item;
      if(!save(data)){document.querySelector('#journeyEditorError').textContent='未保存，请先导出备份并检查本机存储空间。';return}
    }
    document.querySelector('#journeyEditor').close();renderJourney();status('已保存到本机');
  };
  document.querySelector('#journeyDelete').onclick=()=>{if(!editorState?.id||!confirm('删除这一条本机记录？'))return;const data=getJourneyData();data[editorState.kind]=data[editorState.kind].filter(x=>x.id!==editorState.id);if(save(data)){document.querySelector('#journeyEditor').close();renderJourney();status('已删除这一条记录')}};
  // Travel details arrive in a URL fragment and are stored only in this browser.
  // They are never included in a request to the public website or its repository.
  const fragment=new URLSearchParams(location.hash.slice(1)),seed=fragment.get('journey');
  if(seed&&seed.length<16000){
    fragment.delete('journey');
    history.replaceState(null,'',location.pathname+location.search+(fragment.toString()?'#'+fragment:''));
    document.querySelector('[data-view="tripView"]').click();
    try{
      const bytes=Uint8Array.from(atob(seed.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
      const incoming=sanitizeJourneyData(JSON.parse(new TextDecoder().decode(bytes)));
      const data=getJourneyData();
      const addFlights=!data.flights.length&&incoming.flights.length;
      const booking=incoming.bookings.find(item=>item.placeId===SUNTORY_PLACE_ID&&item.name&&item.date&&item.time);
      const existing=booking&&data.bookings.find(item=>item.id===booking.id||(item.placeId===booking.placeId&&item.date===booking.date));
      const addBooking=booking&&!existing&&data.bookings.length<100;
      if(addFlights)data.flights=incoming.flights;
      if(addBooking)data.bookings.push(booking);
      if((addFlights||addBooking)&&!save(data)){renderJourney();return}
      if(booking){
        status(existing?'已打开本机已有预约。':addBooking?'已载入预约，只保存在本机。':'预约记录已满，未载入。');
      }else if(addFlights)status('已载入你确认过的航班时间，航班号仍待补充。');
    }catch{status('确认信息未能载入，可以手动添加。')}
  }
  renderJourney();
}
