const root=document.querySelector('#transitView');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const source=(url,label)=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
const sources={icoca:'https://www.westjr.co.jp/global/sc/howto/icoca/',haruka:'https://www.westjr.co.jp/global/sc/ticket/westqr/haruka/',qr:'https://www.westjr.co.jp/global/sc/ticket/westqr/userguide/',ride:'https://www.westjr.co.jp/travel-information/sc/train-usage-guide/howto/'};
const panels={
  tickets:`<h3>这班车，怎么付钱？</h3><p>先看导航里的车种，再决定刷卡还是另买票。</p><div class="ticket-methods"><article class="ticket-method"><span class="ticket-pill">普通车费</span><h4>普通、快速、新快速</h4><p>在支持交通 IC 的区间，用同一张 ICOCA 进站、出站。找检票口的 IC 标志。</p><p>车上如有收费座席，另按该座席规则买票。</p>${source(sources.icoca,'ICOCA 中文使用说明')}</article><article class="ticket-method"><span class="ticket-pill extra">要确认特急票</span><h4>HARUKA、Rapi:t、近铁特急</h4><p>不能只凭刷 ICOCA 就当作票已买齐。先确认你买的是整张乘车票，还是需要补特急／座席票。</p><details><summary>坐 HARUKA：两种买法</summary><ol><li><strong>现场买：</strong>找 JR 售票机或窗口，买去目的地的乘车票＋HARUKA 特急票。</li><li><strong>买 WEST QR 产品：</strong>从旅行平台购买后，按凭证绑定账户。乘车当天启用，用联网手机的实时二维码过闸，无需换纸票。</li></ol><p>WEST QR 不接受截图；其他平台的兑换产品可能需领纸票，按你实际买的商品说明操作。</p>${source(sources.qr,'WEST QR 中文图解')} · ${source(sources.haruka,'票种与当前价格')}</details></article><article class="ticket-method"><span class="ticket-pill">行程自由时</span><h4>通票，先看覆盖再决定</h4><p>JR、地铁、私铁、巴士可能分属不同公司。一张通票不等于全关西都能坐。先查你实际要坐的区间，不用为了用券增加行程。</p>${source(sources.ride,'JR 官方乘车与购票指南')}</article></div><p class="guide-source">规则核查：2026-11-15 · 票价、可用区间和产品条件以运营方及所购票券为准。</p>`,
  board:`<h3>对上这四项，再上车</h3><p>先按地图确认铁路公司和线路，再对站台屏。车身颜色只能辅助认线路。</p><div class="station-board" aria-label="站台屏字段示意，不是实时班次"><p>站台屏字段示意 · 这里不显示实时班次</p><div class="station-board-grid"><div><small>① 行先</small><strong>开往哪里</strong><span>不是每站都停</span></div><div><small>② 種別</small><strong>车种</strong><span>普通／快速等</span></div><div><small>③ 発車時刻</small><strong>发车时间</strong><span>对上导航班次</span></div><div><small>④ のりば</small><strong>站台</strong><span>看现场</span></div></div></div><div class="station-steps"><div class="station-step"><b>1</b><div><strong>公司和线路先对上</strong><p>JR、阪急、南海、近铁是不同公司。“大阪站”“大阪梅田站”“新大阪站”也不是同一站。</p></div></div><div class="station-step"><b>2</b><div><strong>看方向，也看车种</strong><p>行先写列车开往的终点，不一定就是你的目的地。普通／各停、快速、新快速、特急的停站不同。</p></div></div><div class="station-step"><b>3</b><div><strong>核对时间、站台、停靠站</strong><p>按导航找到那班车，再看停車駅里有没有你的下车站。拿不准时，切到“问站员”给工作人员看。</p></div></div></div><details class="official-example"><summary>看一张官方发车屏示例</summary><img id="officialBoardImage" loading="lazy" src="https://www.kintetsu.co.jp/foreign/assets/about/howto/howto/images/english/cnt2-2.jpg" alt="近铁官方发车屏示例：发车时间、车种、目的地与站台"><p>近铁官方示例，只用于认识字段；不是你当天要坐的班次。${source('https://www.kintetsu.co.jp/foreign/assets/about/howto/howto/images/english/cnt2-2.jpg','打开原图')}</p></details><p class="guide-source">${source(sources.ride,'JR 中文乘车指南')}</p>`,
  ask:`<h3>给站员看，就能问</h3><p>先把地图里的目的地打开，再展示下面的大字问路卡。</p><div id="phraseDestination" class="phrase-destination" hidden></div><article class="phrase-card"><p>这班车停这一站吗？</p><p class="phrase-jp" lang="ja">この電車は、この駅に停まりますか？</p><button type="button" data-phrase="この電車は、この駅に停まりますか？">放大给站员看</button></article><article class="phrase-card"><p>去这里，应该在哪个站台乘车？</p><p class="phrase-jp" lang="ja">ここへ行きたいです。何番のりばですか？</p><button type="button" data-phrase="ここへ行きたいです。何番のりばですか？">放大给站员看</button></article><article class="phrase-card"><p>只有这张交通卡，还需要另外买票吗？</p><p class="phrase-jp" lang="ja">このICカードだけで乗れますか？ほかに切符が必要ですか？</p><button type="button" data-phrase="このICカードだけで乗れますか？ほかに切符が必要ですか？">放大给站员看</button></article>`
};
const queries={'关西机场站（JR／南海）':'Kansai-airport Station, Japan','京都站（JR）':'Kyoto Station, Japan','京都河原町站（阪急）':'Kyoto-Kawaramachi Station, Japan','大阪站（JR）':'Osaka Station, Japan','大阪梅田站（阪急）':'Osaka-Umeda Station, Japan','南海难波站':'Nankai Namba Station, Osaka, Japan','大阪难波站（近铁／阪神）':'Osaka-Namba Station, Japan','近铁奈良站':'Kintetsu-Nara Station, Japan','JR奈良站':'JR Nara Station, Japan','神户三宫站':'Sannomiya Station, Kobe, Japan'};
const from=root.querySelector('#routeOrigin'),to=root.querySelector('#routeDestination'),link=root.querySelector('#mapsLink'),swap=root.querySelector('#routeSwap');
function mapQuery(value){return queries[value]||Array.from(root.querySelector('#railStops').options).find(x=>x.value===value&&x.dataset.query)?.dataset.query||value}
function updateDestination(){const target=document.querySelector('#phraseDestination');if(target){target.hidden=!to.value.trim();target.innerHTML='<span>我要去这里 · 同时出示地图目的地</span><strong>'+esc(to.value.trim())+'</strong>'}}
function updateRoute(){
  const origin=from.value.trim(),destination=to.value.trim(),explicit=origin&&origin!=='当前位置',same=explicit&&mapQuery(origin)===mapQuery(destination);
  swap.disabled=!explicit||!destination||destination==='当前位置'||same;
  const message=!destination?'先选一个目的地':destination==='当前位置'?'终点请填写车站或地点':same?'请选择不同的起点和终点':'';
  if(message){link.removeAttribute('href');link.setAttribute('aria-disabled','true');link.textContent=message}
  else{const params=new URLSearchParams({api:'1',destination:mapQuery(destination),travelmode:'transit'});if(explicit)params.set('origin',mapQuery(origin));link.href='https://www.google.com/maps/dir/?'+params;link.removeAttribute('aria-disabled');link.textContent='在 Google 地图看班次与换乘 ↗'}
  root.querySelector('#routeContext').textContent=/奈良/.test(destination)?'近铁奈良和 JR 奈良是不同车站，选地点时留意。':/大阪|梅田|难波/.test(destination)?'大阪、梅田、新大阪和各公司的难波站，名称接近但位置不同。':'可以输入车站、酒店，或直接选择收藏里的地点。';
  updateDestination();
}
function selectTab(tab,focus=false){
  const active=root.querySelector(`[data-guide="${tab}"]`);if(!active)return;
  root.querySelectorAll('[data-guide]').forEach(button=>{const selected=button===active;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1});
  const panel=root.querySelector('#stationNotes');panel.innerHTML=panels[tab];panel.setAttribute('aria-labelledby',active.id);
  updateDestination();if(focus)active.focus();
  const image=document.querySelector('#officialBoardImage');if(image)image.addEventListener('error',()=>{image.hidden=true;image.parentElement.querySelector('p').prepend('图片暂未加载，可点原图查看。 ')},{once:true});
}
root.querySelectorAll('[data-guide]').forEach(button=>button.addEventListener('click',()=>selectTab(button.dataset.guide)));
root.querySelector('.guide-tabs').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...root.querySelectorAll('[data-guide]')];let index=tabs.findIndex(x=>x.getAttribute('aria-selected')==='true');index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;selectTab(tabs[index].dataset.guide,true)});
from.addEventListener('input',updateRoute);to.addEventListener('input',updateRoute);
from.addEventListener('blur',()=>{if(!from.value.trim()){from.value='当前位置';updateRoute()}});
root.querySelector('#routeHere').onclick=()=>{from.value='当前位置';updateRoute()};
swap.onclick=()=>{[from.value,to.value]=[to.value,from.value];updateRoute()};
const hotelButton=root.querySelector('#routeHotel');
let hotelAddress='';
function updateHotel(data){const now=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());const hotels=(data.stays||[]).filter(x=>x.address&&(!x.checkout||x.checkout>now)).sort((a,b)=>a.checkin.localeCompare(b.checkin));const item=hotels.find(x=>x.checkin<=now&&(!x.checkout||now<x.checkout))||hotels[0];hotelAddress=item?.address||'';hotelButton.hidden=!hotelAddress;hotelButton.textContent=item&&item.checkin<=now?'回酒店':'去已记的酒店'}
hotelButton.onclick=()=>{from.value='当前位置';to.value=hotelAddress;updateRoute()};
window.addEventListener('journey-updated',event=>updateHotel(event.detail));
try{updateHotel(JSON.parse(localStorage.getItem('kansai-journey-v2')||'{}'))}catch{}
root.addEventListener('click',event=>{const button=event.target.closest('[data-phrase]');if(!button)return;document.querySelector('#stationPhraseContent').innerHTML=`<p class="travel-eyebrow">すみません · 不好意思，想请您帮忙</p><p class="phrase-jp" lang="ja">${esc(button.dataset.phrase)}</p>${to.value.trim()?`<p class="wallet-muted">目的地 · 请同时出示地图</p><p class="phrase-place">${esc(to.value.trim())}</p>`:''}<button type="button" id="closeStationPhrase">收起</button>`;const dialog=document.querySelector('#stationPhraseDialog');dialog.showModal();document.querySelector('#closeStationPhrase').onclick=()=>dialog.close()});
document.querySelector('#stationPhraseDialog').addEventListener('click',event=>{if(event.target===event.currentTarget)event.currentTarget.close()});
selectTab('tickets');updateRoute();
