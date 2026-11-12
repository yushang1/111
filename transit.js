const root=document.querySelector('#transitView');
if(root){
  const stationGuide=`<details class="quick-check"><summary>到站后怎么对站台屏？（30 秒小抄）</summary><ol><li><strong>先认公司／线路：</strong>看 Google Maps 这一段写 JR、南海、阪急等哪家公司，再跟站内同名线路标识。</li><li><strong>对方向、车种：</strong><span class="jp">行先</span>是开往方向／终点；<span class="jp">種別</span>是普通、快速、新快速或特急。颜色和车头外形不能判断快慢。</li><li><strong>核对时间、站台和停靠：</strong>找地图那班车的发车时间和站台号；确认目的地下车站在这班车的停站里。普通／各停通常站站停；快速类会跳过部分站；特急须按实际车票确认是否需要特急券。</li></ol><p class="note"><span class="jp">発車時刻</span>＝发车时间；<span class="jp">のりば</span>＝站台；<span class="jp">停車駅</span>＝停靠站。</p><div class="help-phrase"><strong>不确定就给站员看</strong><br>この電車はこの駅に停まりますか？<span>这班车停这一站吗？把 Google Maps 上的目的地指给站员看。</span></div></details>`;
  const ticketGuide=`<details class="quick-check"><summary>HARUKA 怎么买？ICOCA 和周票怎么选？</summary><div class="choice"><strong>按你目前这趟的建议：</strong>ICOCA 留着付普通车费；机场到京都单独选 HARUKA 或大巴；先不买周票。</div><ol><li><strong>HARUKA 直达票：</strong>WEST QR 单程票专用在关西机场—京都这段。JR 西日本当前页面列价：10 月 31 日前售出 ¥2,200，11 月 1 日起 ¥2,700。可通过海外旅行平台购买；把票号绑定到 WEST QR 账户。12 月 10 日的座位预约从 11 月 10 日起开放；乘车当天 4:00 后点「Use ticket」，用手机实时二维码过 JR 闸机。二维码需联网，不能用截图。<br><a href="https://www.westjr.co.jp/global/en/ticket/westqr/haruka/" target="_blank" rel="noopener">JR 西日本：WEST QR HARUKA 票价和规则 ↗</a> · <a href="https://www.westjr.co.jp/global/en/ticket/westqr/userguide/" target="_blank" rel="noopener">JR 西日本：绑定、预约座位和使用步骤 ↗</a><br>不买优惠 QR 票时，可在机场 JR 绿色售票机／窗口买去京都的基本车票和 HARUKA 特急票；用 ICOCA 付基本车费时，仍要另买 HARUKA 特急票。</li><li><strong>机场大巴：</strong>京都站单程 ¥2,800，直达；可在机场售票机买，支持交通 IC 的关西机场交通车辆也能刷 ICOCA。时间会受路况影响。<a href="https://www.kate.co.jp/en/timetable/detail/KY" target="_blank" rel="noopener">官方时刻表、票价和支付方式 ↗</a></li><li><strong>南海转乘：</strong>南海机场急行刷 ICOCA 付普通车费；若坐 Rapi:t，需另买特急券。之后还要换乘去京都，去京都站还是河原町会影响路线。<a href="https://www.nankai.co.jp/en_railway/traffic/rapit.html" target="_blank" rel="noopener">南海 Rapi:t 票价规则 ↗</a></li></ol><p class="note"><strong>周票／日票：</strong>WEST QR 关西迷你票 ¥3,000、连续 3 天，只含 JR 普通／快速，不含 HARUKA 特急、地铁、私铁或巴士。三天内有多段 JR 行程才可能回本；你现在行程灵活，先用 ICOCA 更合适。<a href="https://www.westjr.co.jp/global/en/ticket/westqr/kansaimini/" target="_blank" rel="noopener">JR 西日本：关西迷你票范围 ↗</a></p></details>`;
  const queries={'关西机场站（JR／南海）':'Kansai-airport Station, Japan','京都站（JR）':'Kyoto Station, Japan','京都河原町站（阪急）':'Kyoto-Kawaramachi Station, Japan','大阪站（JR）':'Osaka Station, Japan','大阪梅田站（阪急）':'Osaka-Umeda Station, Japan','南海难波站':'Nankai Namba Station, Osaka, Japan','大阪难波站（近铁／阪神）':'Osaka-Namba Station, Japan','近铁奈良站':'Kintetsu-Nara Station, Japan','JR奈良站':'JR Nara Station, Japan','神户三宫站':'Sannomiya Station, Kobe, Japan'};

  root.querySelector('#stationNotes').innerHTML=stationGuide+ticketGuide;
  const from=root.querySelector('#routeOrigin');
  const to=root.querySelector('#routeDestination');
  const link=root.querySelector('#mapsLink');
  const swap=root.querySelector('#routeSwap');
  const stops=root.querySelector('#railStops').options;

  function mapQuery(value){
    if(Object.hasOwn(queries,value))return queries[value];
    const place=Array.from(stops).find(option=>option.value===value && option.dataset.query);
    return place?.dataset.query || value;
  }
  function updateRoute(){
    const origin=from.value.trim(),destination=to.value.trim();
    const explicitOrigin=origin && origin!=='当前位置';
    const samePlace=explicitOrigin && mapQuery(origin)===mapQuery(destination);
    swap.disabled=!explicitOrigin || !destination || destination==='当前位置' || samePlace;
    let message='';
    if(!destination)message='请先填写目的地';
    else if(destination==='当前位置')message='终点请填写车站或地点';
    else if(samePlace)message='请选择不同的起点和终点';
    if(message){
      link.removeAttribute('href');
      link.setAttribute('aria-disabled','true');
      link.textContent=message;
      return;
    }
    const params=new URLSearchParams({api:'1',destination:mapQuery(destination),travelmode:'transit'});
    if(explicitOrigin)params.set('origin',mapQuery(origin));
    link.href='https://www.google.com/maps/dir/?'+params;
    link.removeAttribute('aria-disabled');
    link.textContent='用 Google 地图查班次与换乘 ↗';
  }
  from.addEventListener('input',updateRoute);
  to.addEventListener('input',updateRoute);
  from.addEventListener('blur',()=>{if(!from.value.trim()){from.value='当前位置';updateRoute()}});
  root.querySelector('#routeHere').onclick=()=>{from.value='当前位置';updateRoute()};
  swap.onclick=()=>{[from.value,to.value]=[to.value,from.value];updateRoute()};
  for(const button of root.querySelectorAll('[data-from]')){
    button.onclick=()=>{from.value=button.dataset.from;to.value=button.dataset.to;updateRoute()};
  }
  updateRoute();
}
