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
const umekojiMap = 'https://eki.jr-odekake.net/premises?id=0610708';
const kyotoMap = 'https://eki.jr-odekake.net/premises?id=0610116';
const kyotoMapPdf = 'https://eki.jr-odekake.net/premises/0610116_79dd66fc-ebf6-4fc7-a44a-606247cfe8ae.pdf';
const kyotoMap3d = 'https://3dmap.jrnc.jp/JRW/mobile/#/kyotoja/';
const phone = '075-952-2020';
const railTimetableDate = '2026-12-12';
const researchDate = '2026-11-24';
const outbound = [['10:00', '10:10'], ['10:50', '11:00'], ['12:30', '12:40'], ['13:20', '13:30'], ['14:10', '14:20']];
const inbound = [['12:20', '12:30'], ['13:10', '13:20'], ['14:50', '15:00'], ['15:40', '15:50'], ['16:30', '16:40']];
const photos = {
  'kyoto-christmas': ['京都站大阶梯与往年圣诞布置', '2016 年实景。2026 年圣诞树在车站北侧 1 楼站前广场，大阶梯灯光在站楼 4 楼。', '嵐山_2016_(33840954606).jpg', 'zaopharm', 'CC BY 2.0', 'licenses/by/2.0/', 840, 473],
  'toji-night': ['东寺五重塔与红叶夜景', '2020 年夜间点灯实景。夜间东门入口以当期公告为准。', 'Toji_Temple_light-up_(51473618820).jpg', 'Raita Futo', 'CC BY 2.0', 'licenses/by/2.0/', 840, 560],
  'umekoji-entrance': ['梅小路京都西站入口', '2019 年实景。找 JR 标志和「梅小路京都西駅」站名。', 'Umekoji-Kyotonishi_Station_entrance_20190317.jpg', 'Rsa', 'CC BY-SA 3.0', 'licenses/by-sa/3.0/', 840, 560],
  'umekoji-gates': ['梅小路京都西站闸机', '2019 年实景。过中央改札口后，看「1」的箭头去京都方向。', 'Umekoji-Kyotonishi_Station_nov_24_2019_various_09_26_45_511000.jpeg', 'Nesnad', 'CC BY 4.0', 'licenses/by/4.0/', 840, 630],
  'umekoji-platform': ['梅小路京都西站 1 号站台', '2019 年从 2 号站台拍摄。照片左侧、轨道对面是往京都的 1 号站台。', 'Umekoji-Kyotonishi_Station_nov_24_2019_various.jpeg', 'Nesnad', 'CC BY 4.0', 'licenses/by/4.0/', 840, 630],
  'kyoto-transfer': ['京都站换乘指示牌', '2025 年实景。认蓝色 A 和「JR京都線」「新大阪・大阪」字样。站台以现场发车屏为准。', '202505_Sign_indicating_platform_directions_in_Kyoto_Station.jpg', 'Jonashtand', 'CC BY-SA 4.0', 'licenses/by-sa/4.0/', 840, 498, '裁切缩放版'],
  'kyoto-departures': ['京都站 4／5 号站台发车屏', '2022 年实景。核对车种、出发时间、行先和站台，照片里的班次仅供辨认屏幕。', 'JR_West_Kyōto_Station_JR_Line_Platform_4・5.jpg', 'Mister0124', 'CC BY-SA 4.0', 'licenses/by-sa/4.0/', 365, 155, '裁切版'],
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
const row = (time,kind,title,description,details='') => `<li><div class="suntory-time"><strong>${esc(time)}</strong><small>${kind}</small></div><div><h4>${title}</h4><p>${description}</p>${details}</div></li>`;
const photoFile = key => `suntory-photos/${key}.jpg`;

function photo(key) {
  const [title,caption,file,author,license,licensePath,width=960,height=key==='hankyu'?630:720,edition='缩放版'] = photos[key];
  return `<figure class="suntory-photo">
    <button type="button" data-photo="${key}" aria-label="放大看${title}"><img src="${photoFile(key)}" alt="${title}" loading="lazy" width="${width}" height="${height}"></button>
    <figcaption><strong>${title}</strong><br>${caption}<br>${online(`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`,esc(author))} · ${online(`https://creativecommons.org/${licensePath}`,license)} · ${edition}</figcaption>
  </figure>`;
}

function timetable(first,second,rows) {
  return `<table class="suntory-table"><thead><tr><th scope="col">${first}</th><th scope="col">${second}</th></tr></thead><tbody>${rows.map(([a,b])=>`<tr><td>${a}</td><td>${b}</td></tr>`).join('')}</tbody></table>`;
}

function renderNightReturn(places, factory) {
  const bambio = 'バンビオ広場公園';
  const kyoto = 'JR京都駅';
  const stairs = '京都駅ビル 大階段';
  const tree = '京都駅ビル 烏丸口 駅前広場';
  const hachijo = '京都駅 八条口';
  const toji = places.find(item=>item.id==='p087');
  const eastGate = `${toji?.japaneseName||'東寺'} 慶賀門（東門） 京都市南区九条町1番地`;
  const ramen = places.find(item=>item.id==='nae787fac6fb1');
  const yakiniku = places.find(item=>item.id==='n11240048d43b');
  const date = railTimetableDate.replaceAll('-','');
  const nagaokaTimetable = `${jr}station-timetable/2787011001?date=${date}`;
  const saganoTimetable = `${jr}station-timetable/2784055001?date=${date}`;
  const route = (from,to,mode,label) => online(directions(from,to,mode),label);
  const ramenOfficial = 'https://www.kyoto-station-building.co.jp/ramen_koji/';
  const hiroOfficial = 'https://yakiniku-hiro.com/shop/ekimae.php';
  return `<section id="suntoryNight" aria-labelledby="suntoryNightTitle">
    <h3 id="suntoryNightTitle">12月12日·返程及夜游候选</h3>
    <p class="suntory-small">2026 年 12 月 12 日，日本当地时间。夜游均可跳过。时间轴是个人参考，含步行、等车和进出站缓冲。车次另注明出处，步行和道路距离为估算。当天可先核对接驳与 JR 运行。</p>
    <div class="suntory-actions"><a href="#suntoryEarlyReturn" data-suntory-jump>提前回酒店</a>${online(notices,'工厂运行公告')}${online(jrInfo,'JR 实时运行')}</div>
    <h4>返程时间轴与交通衔接</h4>
    <ol class="suntory-steps">
      ${row('16:30–16:40','常规接驳','工厂 → JR 长冈京站西口',`免费接驳｜道路约 2–3 公里（估算）｜表定车程 10 分钟。建议 16:25 前到工厂返程上车点，先确认当天运行及位置。${online(busPdf,'官方接驳表')}${route(factory||'サントリー京都ビール工場 正門',west,'driving','到站道路参考')}`)}
      ${row('16:40–17:00','步行＋等候','西口下车点 → Bambio 广场',`约 100–200 米（估算）｜步行 2–5 分钟。到西口广场附近休息，等 17:00 点灯。${route(west,bambio,'walking','步行导航')}`)}
      ${row('17:00–17:30','可选','长冈京冬季灯光节','在西口广场逛一圈。想搭 17:40 的车，17:30 左右离开广场。')}
      ${row('17:30–18:00','步行＋JR','长冈京 → 京都站',`步行回西口进站，乘 JR 京都线往京都／草津方向。铁路 10.1 公里。12 月 12 日表列 <strong>17:40 → 17:52</strong>，乘车 12 分钟，其余时间给进站、等车和京都站出闸。若已在站内可考虑 <strong>17:35 → 17:47</strong>。错过则顺延晚饭。${online(nagaokaTimetable,'当天 JR 时刻')}${route('JR長岡京駅',kyoto,'transit','乘车导航')}`)}
      ${row('18:00–19:20','晚饭＋可选','京都站晚饭和灯光',`18:00–18:50 吃饭预留约 50 分钟（含排队）。18:50–19:10 看北侧站前广场圣诞树和 4 楼大阶梯。19:10–19:20 经南北自由通道到八条口。站内步行总计约 0.4–0.8 公里、15–25 分钟（估算，含换楼层），分散计入各阶段。排队久就只看一处或直接去东寺。${route(tree,stairs,'walking','广场到大阶梯')}${route(stairs,hachijo,'walking','大阶梯去八条口')}`)}
      ${row('19:20–19:40','步行','京都站八条口 → 东寺东门',`约 1.1 公里（东寺官方参考），规划 20 分钟，含过路口缓冲。从八条口出站后走向 <span lang="ja">慶賀門</span>，夜间从东门排队购票。${route(hachijo,eastGate,'walking','导航到东门')}${online('https://ja.kyoto.travel/feature/traffic/access.php?id=6','京都市步行指引')}`)}
      ${row('19:40–20:40','可选','东寺夜间特别参观','19:40 到东门，先留约 10–15 分钟购票入场。官方最晚受理 21:00。若预计 20:30 后才到且队伍较长，直接回酒店。')}
      ${row('20:40–21:10','步行','东寺东门 → 梅小路皇家花园酒店',`约 1.3–1.6 公里（估算）｜向北步行约 25–30 分钟，含离场和过街。跟导航走公共道路。${route(eastGate,hotel,'walking','步行回酒店')}`)}
    </ol>
    <details class="suntory-details"><summary>京都站晚饭 · 已有收藏</summary>
      ${ramen ? `<p><strong>${esc(ramen.name)}</strong> · 京都站楼 10 楼拉面小路。常规 11:00–22:00，最后点单 21:30。${online(ramenOfficial,'站楼营业信息')}${online(ramen.mapSearchUrl,'收藏地点地图')}</p>` : `<p>京都站楼 10 楼拉面小路可作站内晚饭备选。${online(ramenOfficial,'官方营业信息')}</p>`}
      ${yakiniku ? `<p><strong>${esc(yakiniku.name)}</strong> · 官网列日常 17:00–23:00，车站步行约 5 分钟。只有能及时入座并留出回站时间才选。${online(hiroOfficial,'店铺官方')}${online(yakiniku.mapSearchUrl,'收藏地点地图')}</p>` : ''}
    </details>
    <h4>可选游玩卡片</h4>
    <div class="wallet-grid">
    <article class="wallet-card">
      <h4>长冈京冬季灯光节</h4><p lang="ja">バンビオイルミネーション2026</p>
      <p lang="ja">京都府長岡京市神足2丁目3-1（バンビオ1番館旁，JR 長岡京駅西口广场）</p>
      <p><strong>官方举办日期</strong> 2026.12.11–2027.01.11<br><strong>每日点灯</strong> 17:00–23:00，沿街树灯至 22:00。首日点灯仪式为特例。<br><strong>最晚入场</strong> 开放广场，官方未单列截止。<br><strong>费用</strong> 免费<br><strong>个人计划</strong> 17:00–17:30</p>
      <div class="suntory-actions">${online('https://www.city.nagaokakyo.lg.jp/0000016194.html','市政府活动与灯景参考')}${online(mapSearch(bambio),'Google Maps')}</div>
      <details class="suntory-details"><summary>看西口广场实照</summary>${photo('west')}<p class="suntory-small">广场白天位置参考。灯光布置请查看市政府活动页。</p></details>
    </article>
    <article class="wallet-card">
      <h4>京都站圣诞树与大阶梯灯光</h4><p lang="ja">駅ビルクリスマスツリー／大階段グラフィカルイルミネーションPlus</p>
      <p lang="ja">京都府京都市下京区烏丸通塩小路下ル東塩小路町901（树在北侧 1F 站前广场，灯光在站楼 4F 大阶梯）</p>
      <p><strong>官方举办日期</strong> 圣诞树 2026.11.18–12.25，大阶梯通年。<br><strong>每日点灯</strong> 圣诞树 15:00–23:00，大阶梯冬季 15:00–22:00。<br><strong>最晚入场</strong> 两处均未单列，分别以熄灯时间为准。<br><strong>费用</strong> 免费<br><strong>个人计划</strong> 18:50–19:10，可只看一处</p>
      <div class="suntory-actions">${online('https://www.kyoto-station-building.co.jp/events/ksb-christmas/','圣诞树官方')}${online('https://www.kyoto-station-building.co.jp/graphical_illumination/','大阶梯官方')}${online(mapSearch(tree),'站前广场导航')}${online(mapSearch(stairs),'大阶梯导航')}</div>
      <details class="suntory-details"><summary>看京都站往年圣诞实照</summary>${photo('kyoto-christmas')}</details>
    </article>
    <article class="wallet-card">
      <h4>${esc(toji?.name||'东寺')}夜间特别参观</h4><p lang="ja">東寺 紅葉ライトアップと金堂・講堂夜間特別拝観</p>
      <p lang="ja">京都府京都市南区九条町1番地 · 東門（慶賀門）</p>
      <p><strong>官方举办日期</strong> 2026.10.31–12.13，会期内每日开放。<br><strong>每日开放</strong> 18:00–21:30<br><strong>最晚入场</strong> 21:00，东门受理<br><strong>费用</strong> 成人及高中生 1,000 日元，初中生及以下 500 日元<br><strong>个人计划</strong> 19:40–20:40，含东门排队和购票</p>
      <div class="suntory-actions">${online('https://toji.or.jp/search/ten/','东寺官方活动')}${online(mapSearch(eastGate),'东门 Google Maps')}</div>
      <details class="suntory-details"><summary>看东寺夜景实照</summary>${photo('toji-night')}</details>
    </article>
    </div>
    <section id="suntoryEarlyReturn" class="suntory-fallback" tabindex="-1" aria-labelledby="suntoryEarlyTitle">
      <h4 id="suntoryEarlyTitle">提前回酒店</h4>
      <p><strong>从长冈京直接回。</strong> 接驳若 16:40 到，走进 JR 站后可参考 16:50 长冈京 → 17:02 京都。留出从西口下车、进闸及站内换乘时间，错过就搭下一班。${online(nagaokaTimetable,'当天时刻')}${route('JR長岡京駅',kyoto,'transit','长冈京到京都')}</p>
      <p><strong>从京都站回。</strong> 留在 JR 在来线付费区，跟 <span lang="ja">嵯峨野線（E）・亀岡／園部方面</span>，找停靠梅小路京都西的普通车，坐 1 站（约 1.7 公里）。12 月 12 日表列 17:15 → 17:17、17:32 → 17:34 可作早回参考，站台以电子屏为准。出站步行约 1 分钟到酒店。京都站到酒店预留约 20–35 分钟（含换乘走路、等车和出闸）。${online(saganoTimetable,'嵯峨野线当天时刻')}${route(kyoto,hotel,'transit','京都站回酒店')}${route(umekoji,hotel,'walking','出站步行导航')}</p>
      <p><strong>若已到东寺。</strong> 可直接从东门步行回酒店，约 25–30 分钟；如果太累，可在东门附近安全上车处叫出租车。${route(eastGate,hotel,'walking','东门回酒店')}${route(eastGate,hotel,'driving','出租车道路参考')}</p>
    </section>
  </section>`;
}

function renderGuide(booking,place,places) {
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
        ${row(plan.hotelTime,'建议出发','酒店 → 梅小路京都西站',`<strong>京都梅小路皇家花园酒店</strong><br><span lang="ja">${hotel}</span><br><span lang="ja">〒600-8835 京都府京都市下京区観喜寺町9-3</span><br>步行约 1 分钟到 <strong>梅小路京都西站</strong><br><span lang="ja">${umekoji} · 京都府京都市下京区観喜寺町3番地</span>`, `
          <p>在 <strong lang="ja">中央改札口</strong> 刷交通卡进站，上 2 楼找 <strong lang="ja">1番のりば・京都方面</strong>。搭 JR 嵯峨野线（Google Maps 可显示为「山阴本线」），坐 <strong>1 站</strong>到京都。${plan.datedRail?'计划 <strong>12:17 发 → 12:20 到</strong>。':''}</p>
          <div class="suntory-actions">${online(directions(hotel,umekoji,'walking'),'酒店到车站')}${online(umekojiMap,'JR 官方站内图')}</div>
          <details class="suntory-details"><summary>看入口、闸机和站台照片</summary><div class="suntory-photos">${photo('umekoji-entrance')}${photo('umekoji-gates')}${photo('umekoji-platform')}</div></details>`)}
        ${row(plan.datedRail?'12:20':'','站内换乘','京都站换乘',`<strong>留在 JR 在来线付费区内</strong>，不用出站，也不用再刷交通卡。顺着 <strong lang="ja">JR京都線（A）／新大阪・大阪方面</strong> 的指示牌走。${plan.datedRail?'原计划 <strong>5 号站台</strong>，实际站台以当天发车屏为准。':'站台以当天发车屏为准。'}`,`
          <div class="suntory-actions">${online(kyotoMap,'京都站官方站内图')}${online(kyotoMapPdf,'放大看官方 PDF')}${online(kyotoMap3d,'官方 3D 换乘图')}</div>
          <details class="suntory-details"><summary>看换乘指示牌和发车屏</summary><div class="suntory-photos">${photo('kyoto-transfer')}${photo('kyoto-departures')}</div></details>`)}
        ${row(plan.datedRail?'12:39':'','计划发车','京都站 → 长冈京站',`搭 JR 京都线（Google Maps 可显示为「东海道本线」），往大阪方向。选停靠 <strong lang="ja">長岡京</strong> 的普通或快速。<strong>新快速不停长冈京。</strong>${plan.datedRail?'计划 <strong>12:50 到</strong>。':''}`,`
          <p>普通列车坐 <strong>4 站</strong><br><span lang="ja">京都 → 西大路 → 桂川 → 向日町 → 長岡京</span></p>`)}
        ${row(plan.stationTime ? `≤ ${plan.stationTime}` : '', '目标到站','长冈京站刷卡出站','用进站时的同一张交通卡刷卡出站，顺着 <strong lang="ja">西口</strong> 去 <strong lang="ja">西口バスターミナル 1番のりば</strong>。' + '<br><a href="#suntoryStop" data-suntory-jump>看西口和乘车点指引</a>')}
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
    <p class="suntory-small">${online(place?.officialUrl || access,'工厂官网')} · ${online('https://www.royalparkhotels.co.jp/the/kyotoumekoji/about/access/index.html','酒店交通')} · ${online('https://www.city.nagaokakyo.lg.jp/0000001955.html','长冈京市乘车点')}</p>
    ${renderNightReturn(places,factory)}`;
}

export function openSuntoryGuide(booking,place,places=[]) {
  const dialog = document.querySelector('#suntoryDialog');
  const content = document.querySelector('#suntoryContent');
  content.innerHTML = renderGuide(booking,place,places);
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
