export const SUNTORY_PLACE_ID = 'p146';

export function bookingPlaceId(booking) {
  // Older bookings lacked a place ID. An explicit empty selection opts out.
  if (Object.hasOwn(booking, 'placeId')) return booking.placeId === SUNTORY_PLACE_ID ? SUNTORY_PLACE_ID : '';
  return /三得利.*(?:啤酒|ビール)|サントリー.*ビール工場|suntory.*(?:brewery|beer)/i.test(booking.name) ? SUNTORY_PLACE_ID : '';
}

const access = 'https://www.suntory.co.jp/factory/kyoto/access/';
const notices = 'https://www.suntory.co.jp/factory/kyoto/news/';
const busPdf = 'https://www.suntory.co.jp/factory/kyoto/assets/pdf/bus_kyoto.pdf';
const hotel = 'ザ ロイヤルパークホテル 京都梅小路';
const umekoji = '梅小路京都西駅';
const west = 'JR長岡京駅 西口';
const stop = '西口バスターミナル 1番のりば';
const hankyu = '阪急 西山天王山駅 東口';
const jr = 'https://timetable.jr-odekake.net/';
const jrInfo = 'https://trafficinfo.westjr.co.jp/kinki.html';
const phone = '075-952-2020';
const railTimetableDate = '2026-12-12';
const researchDate = '2026-11-24';
const outbound = [['10:00', '10:10'], ['10:50', '11:00'], ['12:30', '12:40'], ['13:20', '13:30'], ['14:10', '14:20']];
const inbound = [['12:20', '12:30'], ['13:10', '13:20'], ['14:50', '15:00'], ['15:40', '15:50'], ['16:30', '16:40']];
const photos = {
  west: ['长冈京站西口广场', '2013 年实景。可辨认西口环岛、巴士候车棚和出租车等候区。找 1 号点时看现场站牌。', 'Nagaokakyo_Station_West_Exit_Square_-_May_1,_2013.jpg', 'Toshiyuki IMAI', 'CC BY-SA 2.0', 'licenses/by-sa/2.0/'],
  shuttle: ['三得利工厂接驳车', '2011 年车辆实照。识别 SUNTORY 字样，现场向司机确认目的地。', 'ISUZU_ERGAmio,_SUNTORY_Kyoto_Brewery_Plant_(Right_rear_perspective_view).jpg', 'Mj-bird', 'CC BY-SA 3.0', 'licenses/by-sa/3.0/'],
  factory: ['工厂建筑地标', '2009 年厂区实景。可辨认银色罐体和 SUNTORY 字样，正门位置看官方道路图。', 'Suntory_Kyoto_Brewery.JPG', 'Whity（Kirakirameister）', 'CC BY-SA 3.0', 'licenses/by-sa/3.0/'],
  hankyu: ['西山天王山站外观', '2016 年实景。找高架下的站名，步行路线从东口开始。', 'Nishiyama-tennozan_Station,_ekisha.jpg', 'Saigen Jiro', 'CC0 1.0', 'publicdomain/zero/1.0/']
};

const minutes = time => {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
};
const clockTime = value => value < 0 ? '' : [Math.floor(value / 60), value % 60].map(n => String(n).padStart(2, '0')).join(':');

export function suntoryPlan(booking) {
  if (booking.status !== 'confirmed' || !booking.date || !booking.time) return {};
  const cutoff = minutes(booking.time);
  const target = cutoff - 30;
  // Reserve half an hour for the walk from the stop, payment and check-in.
  // The first service may be dropped on special-event days.
  const bus = outbound.findLast(([,arrival]) => minutes(arrival) <= target);
  const stationTarget = bus ? minutes(bus[0]) - 20 : null;
  const returnBus = booking.endTime ? inbound.find(([departure]) => minutes(departure) >= minutes(booking.endTime) + 15) : null;
  const laterBus = bus ? outbound[outbound.indexOf(bus) + 1] : null;
  const laterBuffer = laterBus ? cutoff - minutes(laterBus[1]) : 0;
  return {
    hotelTime: stationTarget === null ? '' : clockTime(stationTarget - 60),
    stationTime: stationTarget === null ? '' : clockTime(stationTarget),
    arrivalTarget: clockTime(target),
    bus,
    laterBus: laterBuffer > 0 ? laterBus : null,
    laterBuffer,
    returnBus,
    datedRail: booking.date === railTimetableDate && stationTarget >= minutes('12:50') && stationTarget < minutes('13:10')
  };
}

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;', '"':'&quot;',"'":'&#39;'}[c]));
const online = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
const mapSearch = query => `https://www.google.com/maps/search/?${new URLSearchParams({api:'1',query})}`;
const directions = (origin,destination,travelmode) => `https://www.google.com/maps/dir/?${new URLSearchParams({api:'1',origin,destination,travelmode})}`;
const phrase = (label,japanese,place='') => `<button type="button" class="wallet-action" data-phrase="${esc(japanese)}" data-phrase-place="${esc(place)}">${label}</button>`;
const row = (time,kind,title,description) => `<li><div class="suntory-time"><strong>${esc(time)}</strong><small>${kind}</small></div><div><h4>${title}</h4><p>${description}</p></div></li>`;
const photoFile = key => `suntory-photos/${key}.jpg`;

function photo(key) {
  const [title,caption,file,author,license,licensePath] = photos[key];
  return `<figure class="suntory-photo">
    <button type="button" data-photo="${key}" aria-label="放大看${title}"><img src="${photoFile(key)}" alt="${title}" loading="lazy" width="960" height="${key==='hankyu'?630:720}"></button>
    <figcaption><strong>${title}</strong><br>${caption}<br>${online(`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`,esc(author))} · ${online(`https://creativecommons.org/${licensePath}`,license)} · 缩放版</figcaption>
  </figure>`;
}

function timetable(first,second,rows) {
  return `<table class="suntory-table"><thead><tr><th scope="col">${first}</th><th scope="col">${second}</th></tr></thead><tbody>${rows.map(([a,b])=>`<tr><td>${a}</td><td>${b}</td></tr>`).join('')}</tbody></table>`;
}

function renderGuide(booking,place) {
  const plan = suntoryPlan(booking);
  const date = esc(booking.date || '日期待补');
  const time = esc(booking.time || '开始时间待补');
  const end = booking.endTime ? `–${esc(booking.endTime)}` : '';
  const factory = [place?.japaneseName,place?.address].filter(Boolean).join(' ');
  const gate = place?.gate?.name || '工場正門';
  const gateQuery = [gate,place?.address].filter(Boolean).join(' ');
  const gateLink = place?.gate?.mapUrl || place?.mapSearchUrl || access;
  const paymentNotice = place?.ticket?.sources.find(source=>source.kind==='special-tasting')?.url;
  const dateQuery = booking.date ? `?date=${booking.date.replaceAll('-','')}` : '';
  const bus = plan.bus;
  const back = plan.returnBus;
  const next = plan.laterBus;
  const rail = plan.datedRail ? `JR 嵯峨野线 <strong>12:17 梅小路京都西 → 12:20 京都</strong>。换 JR 京都线大阪方向 <strong>12:39 京都 → 12:50 长冈京</strong>，京都站时刻表列 5 号站台。` : '搭 JR 嵯峨野线往京都，在京都换乘 JR 京都线大阪方向，选停靠长冈京的列车。按预约日期核对班次。';
  const bookingStatus = booking.status === 'pending' ? '待确认' : '已预约';
  return `
    <section class="suntory-summary" aria-label="预约和登记时间">
      <p class="suntory-kicker">本机预约 · ${bookingStatus} · 日本时间</p>
      <h3>${date} <span>${time}${end}</span></h3>
      <p>${esc(booking.name || '工厂参观')}${booking.payment ? ` · ${esc(booking.payment)}` : ''}</p>
      ${bus ? `<p><strong>${plan.hotelTime} 出发 · ${bus[0]} 接驳（常规）</strong></p>` : ''}
      <p>${plan.arrivalTarget ? `<strong>建议 ${plan.arrivalTarget} 前到厂</strong>。以确认单的到场、付款和登记要求为准。` : '补齐并确认预约后查看接驳建议。'}</p>
      ${booking.payment ? `<p class="suntory-small">同类特饮公告写明事前付款，请核对确认单。${paymentNotice ? online(paymentNotice,'官方公告') : ''}</p>` : ''}
      <div class="suntory-actions"><a href="#suntoryStop" data-suntory-jump>找站点</a><a href="#suntoryFallback" data-suntory-jump>满员／误车</a><a href="#suntoryPhrases" data-suntory-jump>日文求助</a>${online(notices,'当天公告')}</div>
    </section>
    <p class="suntory-offline"><strong id="suntoryNetwork"></strong> · 首次联网加载后，路线、时刻摘录、场景照片和日文卡可离线查看。带 ↗ 的链接需联网。</p>
    <section aria-labelledby="suntoryOutbound">
      <h3 id="suntoryOutbound">去程与回程</h3>
      <ol class="suntory-steps">
        ${row(plan.hotelTime,'建议出发','京都梅小路皇家花园酒店','步行约 1 分钟至 <span lang="ja">梅小路京都西駅</span>。 ' + online(directions(hotel,umekoji,'walking'),'酒店到车站'))}
        ${row(plan.stationTime ? `≤ ${plan.stationTime}` : '', '目标到站','JR 京都站换乘 → 长冈京站',rail + ' 上车前核对现场屏幕的停站和站台。')}
        ${row(bus?.[0],'官方常规','西口巴士总站 1 号点','免费接驳，先到先上。' + (bus ? `如按常规运行，预计 ${bus[1]} 到厂。` : '请按当日安排选择接驳或备用交通。'))}
        ${row(bus?.[1],'估算到厂','到工厂正门后去受付','预留付款和登记时间，出示预约确认单。')}
        ${row(`${booking.time || ''}${end}`,bookingStatus,'参观与试饮','返程上车点可在登记时一并确认。')}
        ${row(back?.[0],'常规返程','工厂 → JR 长冈京站',back ? `计划搭乘，预计 ${back[1]} 到站。到厂后问当天是否运行。` : '按实际结束时间确认返程班次。没有合适班次时，走到阪急站或请工厂叫车。')}
      </ol>
      ${plan.datedRail ? '<p class="suntory-small">JR 备选为 12:31 梅小路京都西 → 12:34 京都，再搭 12:54 京都 → 13:05 长冈京。到站后确认来得及走到接驳点。</p>' : ''}
      <p class="suntory-small">${plan.datedRail ? `JR 时刻按 ${date} 西日本旅客铁道公布的当日表核对。` : 'JR 班次与站台待按预约日期核对。'}工厂时刻表为 2026 年 10 月常规版。截至 ${researchDate}，未取得 ${date} 的接驳运行确认。</p>
      <div class="suntory-actions">${online(`${jr}station-timetable/11141055002${dateQuery}`,'梅小路京都西时刻')}${online(`${jr}station-timetable/2784011001${dateQuery}`,'京都站时刻')}${online(jrInfo,'JR 实时运行')}</div>
    </section>
    <section id="suntoryFallback" class="suntory-fallback" tabindex="-1" aria-labelledby="suntoryFallbackTitle">
      <h3 id="suntoryFallbackTitle">赶不上接驳时</h3>
      <p><strong>${booking.status==='confirmed'&&booking.time?`先看能否在 ${time} 前付款（如适用）并完成登记。`:'先按确认单的到场要求倒推。'}</strong> 把等车、路上和办手续的时间都算进去。</p>
      <dl class="suntory-decisions">
        <dt>满员／错过</dt><dd>${next ? `常规下一班 ${next[0]}，表定 ${next[1]} 到厂，只剩 ${plan.laterBuffer} 分钟。只有确认运行、能上车且赶得及登记才等。` : '先问下一班实际发车时间和能否上车。'}信息不明或时间紧，去西口出租车点。</dd>
        <dt>临时换站台／换乘车点</dt><dd>看现场电子屏、公告或问站员；以当日指示为准。接驳停运时直接换出租车，尚未到长冈京可比较阪急方案。</dd>
        <dt>断网</dt><dd>对照站名、指示牌和离线照片，出示下方日文卡。无法确认还有接驳时，按出租车或已到阪急站后的步行路线走。</dd>
        <dt>可能迟到</dt><dd>尽快联系工厂，确认最晚受付时间和能否参加。日本时间 9:30–17:00 可致电 <a href="tel:${phone}">${phone}</a>。</dd>
      </dl>
      <div class="suntory-actions">${online(mapSearch('長岡京駅西口 タクシー乗り場'),'西口出租车点')}${online(factory ? directions(west,gateQuery,'driving') : gateLink,'估出租车车程')}${phrase('给司机看', `${gate}までお願いします。府道204号沿いの入口です。`, factory)}</div>
    </section>
    <section id="suntoryPhrases" tabindex="-1" aria-labelledby="suntoryPhrasesTitle">
      <h3 id="suntoryPhrasesTitle">给工作人员看</h3>
      <div class="suntory-actions">
        ${phrase('这班车停长冈京吗？','この電車は長岡京駅に停まりますか？ 乗り場を教えていただけますか？','JR長岡京駅')}
        ${phrase('问接驳站点和发车','ビール工場の無料シャトルバスは、今日どこから何時に出ますか？',factory)}
        ${phrase('问最晚登记时间',booking.time?`工場見学は${booking.time}の予定です。受付は何時までに済ませればよいですか？`:'工場見学の受付は何時までに済ませればよいですか？',factory)}
        ${phrase('问付款和登记处','受付と支払いはどこですか？ 当日支払いですか？',factory)}
      </div>
    </section>
    <details open id="suntoryStop" class="suntory-details" tabindex="-1">
      <summary>长冈京西口、1 号点与接驳车</summary>
      <p>出闸看 <strong lang="ja">西口</strong>，到西口环岛找 <strong lang="ja">${stop}</strong>。同一站台也有普通巴士，上车前问是否去三得利工厂。</p>
      <div class="suntory-actions">${online(mapSearch(west),'西口地图')}${online(mapSearch('JR長岡京駅 '+stop),'1 号点地图')}${online('https://eki.jr-odekake.net/premises?id=0610120','JR 官方西口站内图')}${online(busPdf,'三得利官方站点、车型和时刻表 PDF')}</div>
      <div class="suntory-photos">${photo('west')}${photo('shuttle')}</div>
    </details>
    <details class="suntory-details">
      <summary>常规时刻表 · 日本时间</summary>
      <div class="suntory-tables">${timetable('长冈京站发','工厂到',outbound)}${timetable('工厂发','长冈京站到',inbound)}</div>
      <p class="suntory-small">2026 年 10 月版的常规班次摘录。夕暮体验日取消首班往返并有特班；运营可能临时调整。</p>
      <div class="suntory-actions">${online(busPdf,'放大看三得利官方原表')}${online(notices,'核对当天公告')}</div>
    </details>
    <details class="suntory-details">
      <summary>工厂正门与阪急步行备选</summary>
      <p>正门在 <strong lang="ja">府道204号</strong> 沿线。地址为 <span lang="ja">${esc(place?.address||'请查看工厂官方交通指南')}</span>。地图若导向后门，按官方道路图走正门。</p>
      <p><strong>从阪急西山天王山站东口约走 10 分钟。</strong> 出东口，把 <span lang="ja">西山天王山交番</span> 留在右手，沿府道 10 号往淀方向。过 <span lang="ja">調子八角</span> 路口后沿 <span lang="ja">サントリー通り</span> 直走，穿过 JR 高架后继续到正门。</p>
      <div class="suntory-actions">${online(gateLink,'正门导航')}${online(factory ? directions(hankyu,gateQuery,'walking') : access,'阪急东口步行路线')}${online(access,'三得利官方步行实照和正门图')}</div>
      <div class="suntory-photos">${photo('factory')}${photo('hankyu')}</div>
    </details>
    <p class="suntory-small">${online(place?.officialUrl || access,'工厂官网')} · ${online('https://www.royalparkhotels.co.jp/the/kyotoumekoji/about/access/index.html','酒店交通')} · ${online('https://www.city.nagaokakyo.lg.jp/0000001955.html','长冈京市乘车点')}</p>`;
}

export function openSuntoryGuide(booking,place) {
  const dialog = document.querySelector('#suntoryDialog');
  const content = document.querySelector('#suntoryContent');
  content.innerHTML = renderGuide(booking,place);
  const network = content.querySelector('#suntoryNetwork');
  const updateNetwork = () => { network.textContent = navigator.onLine ? '离线指引' : '手机已离线'; };
  const networkListeners = new AbortController();
  for (const event of ['online','offline']) window.addEventListener(event,updateNetwork,{signal:networkListeners.signal});
  dialog.addEventListener('close',()=>networkListeners.abort(),{once:true});
  updateNetwork();
  content.onclick = event => {
    const jump = event.target.closest('[data-suntory-jump]');
    if (jump) {
      event.preventDefault();
      const target = document.getElementById(jump.hash.slice(1));
      if(target instanceof HTMLDetailsElement)target.open=true;
      target.focus();
    }
    const key = event.target.closest('[data-photo]')?.dataset.photo;
    if (!key) return;
    const viewer = document.querySelector('#suntoryPhoto');
    const [title,caption] = photos[key];
    const image = viewer.querySelector('img');
    image.src = photoFile(key);
    image.alt = title;
    viewer.querySelector('p').textContent = `${title} · ${caption}`;
    viewer.showModal();
  };
  dialog.showModal();
  dialog.scrollTop = 0;
}
