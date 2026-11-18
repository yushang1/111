const root=document.querySelector('#transitView');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const source=(url,label)=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
const sources={icoca:'https://www.westjr.co.jp/global/sc/howto/icoca/',haruka:'https://www.westjr.co.jp/global/sc/ticket/westqr/haruka/',qr:'https://www.westjr.co.jp/global/sc/ticket/westqr/userguide/',ride:'https://www.westjr.co.jp/travel-information/sc/train-usage-guide/howto/'};
const panels={
  tickets:`<h3>这班车，怎么付钱？</h3><p>先看导航里的车种，再决定刷卡还是另买票。</p><div class="ticket-methods"><article class="ticket-method"><span class="ticket-pill">普通车费</span><h4>普通、快速、新快速</h4><p>在支持交通 IC 的区间，用同一张 ICOCA 进站、出站。找检票口的 IC 标志。</p><p>车上如有收费座席，另按该座席规则买票。</p>${source(sources.icoca,'ICOCA 中文使用说明')}</article><article class="ticket-method"><span class="ticket-pill extra">要确认特急票</span><h4>HARUKA、Rapi:t、近铁特急</h4><p>不能只凭刷 ICOCA 就当作票已买齐。先确认你买的是整张乘车票，还是需要补特急／座席票。</p><details><summary>坐 HARUKA：两种买法</summary><ol><li><strong>现场买：</strong>找 JR 售票机或窗口，买去目的地的乘车票＋HARUKA 特急票。</li><li><strong>买 WEST QR 产品：</strong>从旅行平台购买后，按凭证绑定账户。乘车当天启用，用联网手机的实时二维码过闸，无需换纸票。</li></ol><p>WEST QR 不接受截图；其他平台的兑换产品可能需领纸票，按你实际买的商品说明操作。</p>${source(sources.qr,'WEST QR 中文图解')} · ${source(sources.haruka,'票种与当前价格')}</details></article><article class="ticket-method"><span class="ticket-pill">行程自由时</span><h4>通票，先看覆盖再决定</h4><p>JR、地铁、私铁、巴士可能分属不同公司。一张通票不等于全关西都能坐。先查你实际要坐的区间，不用为了用券增加行程。</p>${source(sources.ride,'JR 官方乘车与购票指南')}</article></div><p class="guide-source">规则核查：2026-11-15 · 票价、可用区间和产品条件以运营方及所购票券为准。</p>`,
  board:`<h3>拿导航对照站台屏</h3><p>先在 Google 地图展开那一段车程，记下线路、上车站和下车站。到站台后，不用读懂整块屏。</p><figure class="official-example"><a href="https://www.kintetsu.co.jp/foreign/assets/about/howto/howto/images/chinese-kan/cnt2-2.jpg" target="_blank" rel="noopener noreferrer" aria-label="放大近铁站台屏示例"><img id="officialBoardImage" src="https://www.kintetsu.co.jp/foreign/assets/about/howto/howto/images/chinese-kan/cnt2-2.jpg" width="522" height="235" alt="近铁站台屏实拍，图上用中文标出发车时间、车种、方向、停靠站和站台号"></a><figcaption>近铁官方实拍 · 点图放大 · 示例不是实时班次。<br><a href="https://www.kintetsu.co.jp/foreign/chinese-kan/about/howto/howto.html" target="_blank" rel="noopener noreferrer">近铁简体中文乘车说明 ↗</a></figcaption></figure><ol class="board-checklist"><li><strong>先找大号数字：</strong>图左的 <b>1</b> 是 1 号站台。</li><li><strong>找到自己那一行：</strong>示例第二行是 <b>10:13</b>、<span lang="ja">快速急行</span>（车种）、<span lang="ja">奈良</span>（终点方向）。不要看到「奈良」就直接上。</li><li><strong>对下车站：</strong>看同一行右侧的「停車駅」，对照导航的站名或站号；看不清就把这一段路线给站员，请他指给你看。</li></ol><p class="guide-note">现场屏幕长得不一样也没关系：先对站台，再对时间和车种，最后确认停靠站。临时调整以现场信息为准。</p>`,
  ask:`<h3>听不懂日语，就请他指出来</h3><p>先在导航里打开要坐的那段路线，或把车票拿在手上。把下面的大字卡给站员看，不用照着念。</p><div id="phraseDestination" class="phrase-destination" hidden></div><article class="phrase-card"><h4>我在哪个站台上车？</h4><p>请在屏幕上指出该坐的车和站台，或写下站台号。</p><button type="button" data-phrase="この駅へ行きたいです。乗る電車とホームの番号を、画面で指さすか、書いていただけますか？">出示：请指给我看</button></article><article class="phrase-card"><h4>这班车到我这一站吗？</h4><p>把班次和目的地一起给站员看，请他指「停」或「不停」。</p><button type="button" data-phrase="この電車はこの駅に停まりますか？下の答えを指さしてください。" data-answer="stop">出示：停 / 不停</button></article><article class="phrase-card"><h4>我还要另买票吗？</h4><p>拿出你的 IC 卡或车票，请站员指出需不需要另买票。</p><button type="button" data-phrase="このICカードや切符のほかに、別の切符が必要ですか？下の答えを指さしてください。" data-answer="ticket">出示：要买 / 不用</button></article>`
};
const queries={'关西机场站（JR／南海）':'Kansai-airport Station, Japan','京都站（JR）':'Kyoto Station, Japan','京都河原町站（阪急）':'Kyoto-Kawaramachi Station, Japan','大阪站（JR）':'Osaka Station, Japan','大阪梅田站（阪急）':'Osaka-Umeda Station, Japan','南海难波站':'Nankai Namba Station, Osaka, Japan','大阪难波站（近铁／阪神）':'Osaka-Namba Station, Japan','JR难波站':'JR Namba Station, Osaka, Japan','近铁奈良站':'Kintetsu-Nara Station, Japan','JR奈良站':'JR Nara Station, Japan','神户三宫站':'Sannomiya Station, Kobe, Japan'};
const from=root.querySelector('#routeOrigin'),to=root.querySelector('#routeDestination'),link=root.querySelector('#mapsLink'),swap=root.querySelector('#routeSwap');
const stops=root.querySelector('#railStops');
const picker=document.querySelector('#routePicker'),pickerSearch=picker.querySelector('#routePickerSearch'),pickerResults=picker.querySelector('#routePickerResults');
const useDevice=picker.querySelector('#routeUseDevice');
let pickTarget;
function mapQuery(value){return Object.hasOwn(queries,value)?queries[value]:Array.from(stops.options).find(option=>option.value===value&&option.dataset.query)?.dataset.query||value}
function renderPicker(){
  const query=pickerSearch.value.trim().toLowerCase();
  const seen=new Set();
  const matches=Array.from(stops.options).filter(option=>{
    if(seen.has(option.value))return false;
    seen.add(option.value);
    return query?(option.value+' '+(option.dataset.query||queries[option.value]||'')).toLowerCase().includes(query):Object.hasOwn(queries,option.value);
  });
  picker.querySelector('#routePickerCount').textContent=query?(matches.length?(matches.length>24?'显示前 24 个，继续输入可缩小范围。':'找到 '+matches.length+' 个地点'):'没有匹配，可关闭后直接手动输入。'):'常用车站 · 输入关键词可查收藏地点';
  pickerResults.replaceChildren(...matches.slice(0,24).map(option=>{
    const result=document.createElement('button');
    result.type='button';result.textContent=option.value;
    result.onclick=()=>selectPlace(option.value);
    return result;
  }));
}
function selectPlace(value){
  pickTarget.value=value;
  updateRoute();picker.close();
}
root.querySelectorAll('[data-route-pick]').forEach(button=>button.onclick=()=>{
  pickTarget=document.getElementById(button.dataset.routePick);
  picker.querySelector('#routePickerTitle').textContent=pickTarget===from?'选择起点':'选择终点';
  useDevice.hidden=pickTarget!==from;pickerSearch.value='';renderPicker();picker.showModal();
});
pickerSearch.addEventListener('input',renderPicker);
useDevice.onclick=()=>selectPlace('');
picker.querySelector('#closeRoutePicker').onclick=()=>picker.close();
function updateDestination(){const target=document.querySelector('#phraseDestination');if(target){target.hidden=!to.value.trim();target.innerHTML='<span>我要去这里 · 同时出示地图目的地</span><strong>'+esc(to.value.trim())+'</strong>'}}
function updateRoute(){
  const origin=from.value.trim(),destination=to.value.trim(),explicit=origin&&origin!=='当前位置',same=explicit&&mapQuery(origin)===mapQuery(destination);
  swap.disabled=!explicit||!destination||destination==='当前位置'||same;
  const message=!destination?'先选一个终点':destination==='当前位置'?'终点请填写车站或地点':same?'请选择不同的起点和终点':'';
  if(message){link.removeAttribute('href');link.setAttribute('aria-disabled','true');link.textContent=message}
  else{const params=new URLSearchParams({api:'1',destination:mapQuery(destination),travelmode:'transit'});if(explicit)params.set('origin',mapQuery(origin));link.href='https://www.google.com/maps/dir/?'+params;link.removeAttribute('aria-disabled');link.textContent=explicit?'在 Google 地图查路线 ↗':'用 Google 地图从当前位置出发 ↗'}
  root.querySelector('#routeContext').textContent=/奈良/.test(destination)?'近铁奈良和 JR 奈良是不同车站，选地点时留意。':/大阪|梅田|难波/.test(destination)?'大阪、梅田、新大阪和各公司的难波站，名称接近但位置不同。':'可以输入车站、酒店，或直接选择收藏里的地点。';
  updateDestination();
}
function selectTab(tab,focus=false){
  const active=root.querySelector(`[data-guide="${tab}"]`);if(!active)return;
  root.querySelectorAll('[data-guide]').forEach(button=>{const selected=button===active;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1});
  const panel=root.querySelector('#stationNotes');panel.innerHTML=panels[tab];panel.setAttribute('aria-labelledby',active.id);
  updateDestination();if(focus)active.focus();
  const image=document.querySelector('#officialBoardImage');if(image){
    const fallback=()=>{image.closest('a').hidden=true;image.closest('figure').querySelector('figcaption').prepend('照片暂未加载，可打开下方官方说明。 ')};
    image.addEventListener('error',fallback,{once:true});if(image.complete&&!image.naturalWidth)fallback();
  }
}
root.querySelectorAll('[data-guide]').forEach(button=>button.addEventListener('click',()=>selectTab(button.dataset.guide)));
root.querySelector('.guide-tabs').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...root.querySelectorAll('[data-guide]')];let index=tabs.findIndex(x=>x.getAttribute('aria-selected')==='true');index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;selectTab(tabs[index].dataset.guide,true)});
from.addEventListener('input',updateRoute);to.addEventListener('input',updateRoute);
swap.onclick=()=>{[from.value,to.value]=[to.value,from.value];updateRoute()};
const hotelButton=root.querySelector('#routeHotel');
let hotelAddress='';
function updateHotel(data){const now=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());const hotels=(data.stays||[]).filter(x=>x.address&&(!x.checkout||x.checkout>now)).sort((a,b)=>a.checkin.localeCompare(b.checkin));const item=hotels.find(x=>x.checkin<=now&&(!x.checkout||now<x.checkout))||hotels[0];hotelAddress=item?.address||'';hotelButton.hidden=!hotelAddress;hotelButton.textContent=item&&item.checkin<=now?'回酒店':'去已记的酒店'}
hotelButton.onclick=()=>{from.value='';to.value=hotelAddress;updateRoute()};
window.addEventListener('journey-updated',event=>updateHotel(event.detail));
try{updateHotel(JSON.parse(localStorage.getItem('kansai-journey-v2')||'{}'))}catch{}
const replyPairs={stop:[['停まります','停这一站'],['停まりません','不停这一站']],ticket:[['必要です','还要另买'],['不要です','不用另买']]};
root.addEventListener('click',event=>{
  const button=event.target.closest('[data-phrase]');if(!button)return;
  const answers=replyPairs[button.dataset.answer];
  const reply=answers?'<div class="station-replies">'+answers.map(([japanese,chinese])=>'<div><strong lang="ja">'+japanese+'</strong><span>'+chinese+'</span></div>').join('')+'</div>':'';
  const dialog=document.querySelector('#stationPhraseDialog');
  dialog.querySelector('#stationPhraseContent').innerHTML=`<p class="travel-eyebrow" lang="ja">すみません。日本語がよく分かりません。</p><p class="phrase-jp" lang="ja">${esc(button.dataset.phrase)}</p>${to.value.trim()?`<p class="wallet-muted">目的地 · 请同时出示地图</p><p class="phrase-place">${esc(to.value.trim())}</p>`:''}${reply}<button type="button" id="closeStationPhrase">收起</button>`;
  dialog.showModal();dialog.querySelector('#closeStationPhrase').onclick=()=>dialog.close();
});
document.querySelector('#stationPhraseDialog').addEventListener('click',event=>{if(event.target===event.currentTarget)event.currentTarget.close()});
selectTab('tickets');updateRoute();
