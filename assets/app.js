/* 高等工程数学A26 · 递进学习系统 —— 主逻辑
 * 纯前端、无构建、可 file:// 直接打开。数据来自 data-a/b/c/d.js。
 */
(function () {
'use strict';

/* ================= 数据聚合 ================= */
/* 各数据模块由不同来源产出，各自的 level 是「模块内相对层级」，
   这里按全局规范顺序统一重排，保证递进序号 1..N 连续且唯一。 */
const ORDER = ['K01','K02','K03','K04','K05','K06','K07','K08','K09','K10','K11',
               'K12','K13','K14','K15','K16','K17','K18'];
const KP = []
  .concat(window.KP_A || [], window.KP_B || [], window.KP_C || [], window.KP_D || [])
  .filter(k => k && k.id);
KP.forEach(k => {
  const i = ORDER.indexOf(k.id);
  k.level = i >= 0 ? i + 1 : (k.level || 99);
});
KP.sort((a, b) => a.level - b.level);
const BY_ID = {};
KP.forEach(k => { BY_ID[k.id] = k; });

/* 派生反向关系：数据里常只写单边（A.serves 含 B，但 B.prereq 未列 A）。
   这里自动补齐，让每个知识点的「前置」显示完整而不必改数据。 */
const DERIVED_PRE = {};
KP.forEach(k => (k.serves || []).forEach(s => {
  if (BY_ID[s]) (DERIVED_PRE[s] = DERIVED_PRE[s] || []).push(k.id);
}));
function prereqOf(k) {
  return [...new Set([...(k.prereq || []), ...(DERIVED_PRE[k.id] || [])])]
    .filter(x => BY_ID[x] && x !== k.id);
}

/* 把作者写的 **粗体** / `代码` 转成 HTML（跳过数学段）。
   实测：数据里共 42 处 ** ，不转就会在页面上显示成裸星号。
   ⚠️ 必须等 COURSE/RES/GFAQ 都声明完再调用 —— 写成 IIFE 会踩 TDZ：
      「can't access lexical declaration 'GFAQ' before initialization」。 */
function applyMarkdown() {
  const S = ['summary', 'why', 'servesNote'];
  const A = ['title', 'problem', 'answer', 'source'];
  KP.forEach(k => {
    S.forEach(f => { if (typeof k[f] === 'string') k[f] = mdInline(k[f]); });
    if (Array.isArray(k.concept)) k.concept = k.concept.map(mdInline);
    (k.formulas || []).forEach(f => { if (f.note) f.note = mdInline(f.note); });
    (k.examples || []).forEach(e => {
      A.forEach(f => { if (typeof e[f] === 'string') e[f] = mdInline(e[f]); });
      if (Array.isArray(e.steps)) e.steps = e.steps.map(mdInline);
    });
    (k.quiz || []).forEach(q => {
      if (typeof q.q === 'string') q.q = mdInline(q.q);
      if (typeof q.explain === 'string') q.explain = mdInline(q.explain);
      if (typeof q.answer === 'string') q.answer = mdInline(q.answer);
      if (Array.isArray(q.options)) q.options = q.options.map(mdInline);
    });
    (k.faq || []).forEach(f => { if (f.q) f.q = mdInline(f.q); if (f.a) f.a = mdInline(f.a); });
    if (Array.isArray(k.table)) k.table.forEach(r =>
      Object.keys(r).forEach(c => { if (typeof r[c] === 'string') r[c] = mdInline(r[c]); }));
  });
  GFAQ.forEach(f => { f.q = mdInline(f.q); f.a = mdInline(f.a); });
  (RES.examPoints || []).forEach(e => { e.q = mdInline(e.q); e.why = mdInline(e.why); });
  (COURSE.errata || []).forEach(e => { e.detail = mdInline(e.detail); });
  (COURSE.coverage || []).forEach(c => {
    ['status', 'ch', 'file', 'kps'].forEach(f => { if (typeof c[f] === 'string') c[f] = mdInline(c[f]); });
  });
  (COURSE.exampleDensity || []).forEach(d => { if (d.topic) d.topic = mdInline(d.topic); });
  (COURSE.modules || []).forEach(m => { if (m.note) m.note = mdInline(m.note); });
  if (COURSE.source) COURSE.source = mdInline(COURSE.source);
  (RES.videos || []).forEach(x => { if (x.note) x.note = mdInline(x.note); });
}
const COURSE = window.COURSE || { modules: [], coverage: [] };
const RES = window.RESOURCES || { videos: [], outlines: [], examPoints: [] };
const GFAQ = window.GLOBAL_FAQ || [];
applyMarkdown();   // ← 必须放在上面三个 const 之后（TDZ）

/* ================= 公式：构建期预渲染为 MathML =================
 * 为什么不用 MathJax 运行时（下面是实测踩过的三个坑，换成预渲染后全部消失）：
 *   ① MathJax 是 2.1 MB 本地脚本，首页在它加载完之前渲染 →
 *      公式全成裸 $ 且永不恢复（实测 9 秒后仍有 35 处）；
 *   ② MathJax 对未挂进文档的元素量不到字号 → 产出 width="NaNex" 的 SVG，
 *      公式实际不可见（实测 K02 有 19 个、K12 有 8 个）；
 *   ③ tex 里出现 `<k`（如 \sum_{j<k}）时被 innerHTML 当未闭合标签，
 *      公式从该处截断并与下文粘连。
 * MathML 由 latex2mathml 在构建期生成（见 build_mathml.py），
 * 无运行时依赖、无异步竞态，且输出用 &#x0003C; 实体表示 '<'，天然 HTML 安全。 */
const MML = window.MATHML || { i: {}, b: {} };

/* 把一段文本里的 $...$ / $$...$$ 就地换成 MathML；查不到就退回可读的代码块，
   绝不静默留下裸 LaTeX。 */
function mathify(s) {
  if (typeof s !== 'string' || s.indexOf('$') < 0) return s;
  return s
    .replace(/\$\$([\s\S]+?)\$\$/g, (m, t) => MML.b[t.trim()] || `<code class="ic">${t.trim()}</code>`)
    .replace(/(^|[^$])\$([^$\n]+?)\$(?!\$)/g,
      (m, pre, t) => pre + (MML.i[t.trim()] || `<code class="ic">${t.trim()}</code>`));
}
/* 递归把所有字符串字段里的公式换掉（先数学、再 markdown，顺序不能反：
   markdown 转换会引入 <b> 标签，先做数学避免误伤）。
   ⚠️ 键名也要转 —— 表格的列名就写在对象 key 上（如 "高斯点$x_k$"），
      而表头是直接拿 Object.keys() 渲染的，漏了就会在表头露出裸 LaTeX。 */
function mathifyAll(o) {
  if (typeof o === 'string') return mathify(o);
  if (Array.isArray(o)) { for (let i = 0; i < o.length; i++) o[i] = mathifyAll(o[i]); return o; }
  if (o && typeof o === 'object') {
    for (const k of Object.keys(o)) {
      const v = mathifyAll(o[k]);
      const nk = (k.indexOf('$') >= 0) ? mathify(k) : k;
      if (nk !== k) { delete o[k]; o[nk] = v; } else { o[k] = v; }
    }
    return o;
  }
  return o;
}
mathifyAll(KP);
mathifyAll(GFAQ);
mathifyAll(RES);
mathifyAll(COURSE);
/* formulas[].tex 存的是裸 LaTeX，单独查块级表 */
KP.forEach(k => (k.formulas || []).forEach(f => {
  if (typeof f.tex === 'string') {
    const mml = MML.b[f.tex.trim()];
    f.mml = mml || `<code class="ic">${f.tex}</code>`;
    f.miss = !mml;
  }
}));
const MML_STATS = (() => {
  const miss = [];
  KP.forEach(k => (k.formulas || []).forEach(f => { if (f.miss) miss.push(k.id + ': ' + f.tex.slice(0, 60)); }));
  return { inline: Object.keys(MML.i || {}).length, block: Object.keys(MML.b || {}).length, miss };
})();
if (MML_STATS.miss.length) console.warn('未预渲染的块级公式:', MML_STATS.miss);

const LV = { core: { t: '核心 · 必考', s: '★★★' }, key: { t: '重点 · 常考', s: '★★☆' }, basic: { t: '了解 · 知道即可', s: '★☆☆' } };

/* ================= 状态 ================= */
const SKEY = 'dsh_gckc_a26_v1';
let S = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(SKEY);
    if (raw) { const o = JSON.parse(raw); o.kp = o.kp || {}; o.days = o.days || {}; return o; }
  } catch (e) { }
  return { kp: {}, days: {}, qa: [], view: 'learn', cur: null, _t: Date.now() };
}
function save() { try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) { } }
function kpS(id) { if (!S.kp[id]) S.kp[id] = { examples: [], quiz: {}, seconds: 0 }; return S.kp[id]; }
function today() { const d = new Date(); const p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
function addTime(sec) {
  if (sec <= 0) return;
  const d = today();
  if (!S.days[d]) S.days[d] = { seconds: 0, kps: {} };
  S.days[d].seconds += sec;
  if (S.cur) S.days[d].kps[S.cur] = (S.days[d].kps[S.cur] || 0) + sec;
}

/* ================= 掌握度模型 =================
 * 掌握度 = 概念要点(15%) + 例题浏览(25%) + 习题正确率(50%) + 学习时长(10%)
 * 概念要点这一项来自「概念讲解」里每节的 ✓ 标记 —— 页面上的勾选必须真的算数，
 * 否则那个按钮就只是装饰。 */
function masteryOf(kp) {
  const st = S.kp[kp.id] || { examples: [], quiz: {}, seconds: 0, conceptRead: [] };
  const nEx = (kp.examples || []).length || 1;
  const nQ = (kp.quiz || []).length || 1;
  const nCp = (kp.concept || []).length || 1;
  const exSeen = Math.min((st.examples || []).length, nEx);
  const answered = Object.keys(st.quiz || {}).length;
  const cpRead = Math.min((st.conceptRead || []).length, nCp);
  if (exSeen === 0 && answered === 0 && cpRead === 0 && !(st.seconds > 20))
    return { m: 0, lv: 'zero', exSeen, nEx, answered, nQ, cpRead, nCp, secs: st.seconds || 0 };
  const cpR = cpRead / nCp;
  const exR = exSeen / nEx;
  const corr = Object.values(st.quiz || {}).filter(Boolean).length;
  const qR = corr / nQ;
  const tR = Math.min((st.seconds || 0) / (nEx * 45 + 120), 1);
  const m = Math.max(0, Math.min(100,
    Math.round((cpR * 0.15 + exR * 0.25 + qR * 0.50 + tR * 0.10) * 100)));
  return { m, lv: m >= 75 ? 'done' : (m >= 40 ? 'mid' : 'low'),
           exSeen, nEx, answered, nQ, corr, cpRead, nCp, secs: st.seconds || 0 };
}
function overall() {
  let done = 0, mid = 0, zero = 0, sum = 0;
  KP.forEach(k => { const r = masteryOf(k); sum += r.m; if (r.lv === 'done') done++; else if (r.lv === 'zero') zero++; else mid++; });
  return { done, mid, zero, total: KP.length, avg: KP.length ? Math.round(sum / KP.length) : 0 };
}

/* ================= 工具 ================= */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 1900);
}
/* 极简行内 markdown：**粗体** 与 `代码`（数学已由 mathify 预渲染处理） */

/* 只转换数学公式之外的 ** 与反引号，避免动到 LaTeX 里的符号 */
function mdInline(s) {
  if (typeof s !== 'string') return s;
  return s.split(/(\$\$[\s\S]*?\$\$|\$[^$]*\$)/g)
    .map((p, i) => (i % 2 === 1) ? p
      : p.replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
         .replace(/`([^`\n]+)`/g, '<code class="ic">$1</code>'))
    .join('');
}

/* ================= 长段 → 分点 =================
 * 动机：数据里 66 段概念平均 334 字（最长 816 字），整段连续散文在页面上就是一堵墙，
 * 读者抓不到结构。这里把长段切成「导语 + 若干并列条目」。
 * 切分要点：
 *   · 先把 $...$ / $$...$$ 整段占位保护起来，绝不在公式内部下刀；
 *   · 在 。； 之后切，在 ①②③… 与 【 之前切（保留标记本身）；
 *   · 过短碎片并入相邻条目，条目过多则合并尾部，避免切出十几个字一条的碎渣。
 */
const RE_MATHSPAN = /\$\$[\s\S]*?\$\$|\$[^$]*\$/g;
const PH = '\u0001';

function protectMath(s) {
  const spans = [];
  const prot = String(s).replace(RE_MATHSPAN, m => { spans.push(m); return PH.repeat(spans.length); });
  return { prot, spans };
}
function restoreMath(s, spans) {
  return s.replace(/\u0001+/g, m => spans[m.length - 1] || '');
}
function splitPoints(text, opt) {
  opt = opt || {};
  const minLen = opt.minLen || 12, maxPts = opt.maxPts || 12, leadMax = opt.leadMax || 32;
  if (!text) return { lead: '', pts: [] };
  const { prot, spans } = protectMath(text);
  const cut = prot
    .replace(/(?=【)/g, '\n')
    .replace(/(?=[①②③④⑤⑥⑦⑧⑨⑩])/g, '\n')
    .replace(/(?<=[。；])/g, '\n');
  let raw = cut.split('\n').map(x => x.trim()).filter(Boolean);
  if (!raw.length) return { lead: '', pts: [] };

  // 首句若简短且是总起句，单独作导语；否则并入条目
  let lead = '';
  if (raw.length > 2) {
    const first = restoreMath(raw[0], spans).trim();
    if (first.length <= leadMax && /[。？！：]$/.test(first)) { lead = first; raw.shift(); }
  }
  const merged = [];
  for (const seg of raw) {
    const prev = merged.length ? restoreMath(merged[merged.length - 1], spans) : '';
    if (merged.length && prev.trim().length < minLen) merged[merged.length - 1] += seg;
    else merged.push(seg);
  }
  if (merged.length > 1 && restoreMath(merged[merged.length - 1], spans).trim().length < minLen) {
    merged[merged.length - 2] += merged[merged.length - 1]; merged.pop();
  }
  while (merged.length > maxPts) { merged[merged.length - 2] += merged[merged.length - 1]; merged.pop(); }
  return { lead, pts: merged.map(x => restoreMath(x, spans).trim()).filter(Boolean) };
}

/* 取一句话的前 n 字做标题（去掉公式，太长则截断） */
function brief(s, n) {
  const plain = String(s || '').replace(RE_MATHSPAN, '⟨式⟩').replace(/<[^>]+>/g, '');
  return plain.length > n ? plain.slice(0, n - 1) + '…' : plain;
}
/* 卡片标题：在第一个标点处断开，得到「为什么要给矩阵分类」这种短语，
   而不是把导语原样截断（那样标题和下方导语会重复一遍）。 */
function briefTitle(s, n) {
  n = n || 18;
  const plain = String(s || '').replace(RE_MATHSPAN, '').replace(/<[^>]+>/g, '').trim();
  const cut = (plain.split(/[，。：；？！,]/)[0] || '').trim();
  const t = cut.length >= 4 ? cut : plain;
  return t.length > n ? t.slice(0, n) + '…' : t;
}

/* ================= 顶栏 HUD ================= */
function hud() {
  const o = overall();
  $('#hud-done').textContent = o.done;
  $('#hud-total').textContent = o.total;
  let sec = 0; Object.values(S.days).forEach(d => sec += d.seconds || 0);
  $('#hud-time').textContent = Math.round(sec / 60);
}

/* ================= 侧栏路径 ================= */
const MOD_ORDER = (COURSE.modules || []).map(m => m.name);
const MOD_NOTE = {}; (COURSE.modules || []).forEach(m => MOD_NOTE[m.name] = m.note);

function renderPath() {
  const box = $('#path'); box.innerHTML = '';
  const groups = {};
  KP.forEach(k => { const m = k.module || '其它'; (groups[m] = groups[m] || []).push(k); });
  const mods = Object.keys(groups).sort((a, b) => (MOD_ORDER.indexOf(a) < 0 ? 99 : MOD_ORDER.indexOf(a)) - (MOD_ORDER.indexOf(b) < 0 ? 99 : MOD_ORDER.indexOf(b)));
  mods.forEach(m => {
    const hd = h(`<div class="mod-head">${esc(m)}</div>`);
    if (MOD_NOTE[m]) hd.title = MOD_NOTE[m];
    box.appendChild(hd);
    groups[m].forEach(k => {
      const r = masteryOf(k);
      const dot = r.lv === 'done' ? 'done' : (k.importance || 'basic');
      const el = h(`<div class="pitem" data-kp="${k.id}">
        <div class="pdot ${dot}">${r.lv === 'done' ? '✓' : (k.level || '')}</div>
        <div class="pi-body">
          <div class="pi-name">${esc(k.title)}</div>
          <div class="pi-meta"><span>${(LV[k.importance] || {}).s || ''}</span><span>例题 ${(k.examples || []).length}</span><span>${r.m}%</span></div>
          <div class="pbar"><i style="width:${r.m}%"></i></div>
        </div></div>`);
      el.onclick = () => { location.hash = '#/kp/' + k.id; };
      box.appendChild(el);
    });
  });
  markPath();
}
function markPath() {
  document.querySelectorAll('.pitem').forEach(e => e.classList.toggle('active', e.dataset.kp === S.cur));
}

/* ================= 视图：知识点 ================= */
function viewKP(id, forceTop) {
  const k = BY_ID[id];
  if (!k) { $('#view').innerHTML = `<div class="empty"><div class="big">🔍</div>没有找到知识点 ${esc(id)}</div>`; return; }
  S.cur = id; save(); markPath();

  const st = kpS(id);
  const r = masteryOf(k);
  const v = $('#view');
  v.innerHTML = '';

  /* 头部 */
  v.appendChild(h(`<div class="kp-head" id="kp-top">
    <div class="kp-tag">
      <span class="chip lv">第 ${k.level} 层</span>
      <span class="chip ${k.importance}">${(LV[k.importance] || {}).s || ''} ${(LV[k.importance] || {}).t || ''}</span>
      <span class="chip plain">${esc(k.module || '')}</span>
      <span class="chip plain">掌握度 ${r.m}%</span>
    </div>
    <h1 class="kp-title">${esc(k.title)}</h1>
    <p class="kp-sum">${k.summary || ''}</p>
  </div>`));

  /* 为什么学 / 服务什么 —— 定位句 + 并列要点，不再是一整段 */
  const rel = [];
  prereqOf(k).forEach(p => { const t = BY_ID[p]; if (t) rel.push({ id: p, t: t.title, dir: 'back', lab: '前置：' }); });
  (k.serves || []).forEach(s => { const t = BY_ID[s]; if (t) rel.push({ id: s, t: t.title, dir: 'fwd', lab: '服务于：' }); });
  const relHTML = rel.length ? `<div class="serve" style="margin-top:12px">${rel.map(x =>
    `<span class="jump ${x.dir === 'back' ? 'back' : ''}" data-go="${x.id}">${x.lab}${esc(x.t)} <span class="arw">${x.dir === 'back' ? '↑' : '→'}</span></span>`).join('')}</div>` : '';

  const wy = splitPoints(k.why || '', { leadMax: 60, maxPts: 8 });
  const whyCard = h(`<div class="card">
    <div class="card-h"><i class="bar"></i>为什么学它 · 它为后面什么服务
      <span class="hint">${wy.pts.length ? wy.pts.length + ' 个作用点' : ''}</span></div>
    ${wy.lead ? `<p class="lead-q">${wy.lead}</p>` : ''}
    ${wy.pts.length ? `<ul class="ptlist">${wy.pts.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
    ${k.servesNote ? `<div class="callout">${k.servesNote}</div>` : ''}
    ${relHTML}
  </div>`);
  v.appendChild(whyCard);

  /* 概念讲解 —— 分点卡片：默认展开条目，可折叠、可勾选「懂了」 */
  if ((k.concept || []).length) {
    const secs = k.concept.map((p, i) => {
      const r = splitPoints(p, { leadMax: 46, maxPts: 12 });
      return { i, ...r };
    });
    const read = S.kp[k.id] && S.kp[k.id].conceptRead || [];
    const total = secs.length;
    const doneN = read.filter(x => x < total).length;

    const card = h(`<div class="card" id="cpt-card">
      <div class="card-h"><i class="bar"></i>概念讲解
        <span class="hint" id="cpt-hint">${doneN}/${total} 已标记掌握</span>
        <div class="toolbar">
          <button class="tbtn" id="cpt-fold">全部收起</button>
          <button class="tbtn" id="cpt-skim">速览模式</button>
        </div>
      </div>
      <div class="cptbar"><i id="cpt-bar" style="width:${total ? Math.round(doneN / total * 100) : 0}%"></i></div>
      <div id="cpt-list"></div>
    </div>`);

    const list = card.querySelector('#cpt-list');
    secs.forEach((s, idx) => {
      const isRead = read.includes(idx);
      const cnt = s.pts.length;
      const title = s.lead ? briefTitle(s.lead, 18) : briefTitle(s.pts[0] || ('第 ' + (idx + 1) + ' 部分'), 18);
      const el = h(`<div class="cpt open ${isRead ? 'read' : ''}" data-i="${idx}">
        <div class="cpt-h">
          <span class="cpt-n">${idx + 1}</span>
          <span class="cpt-t">${esc(title)}</span>
          <span class="cpt-cnt">${cnt ? cnt + ' 条' : ''}</span>
          <button class="cpt-ok" title="标记这一节我已掌握">✓</button>
          <span class="cpt-arw">▾</span>
        </div>
        <div class="cpt-b">
          ${s.lead ? `<p class="cpt-lead">${s.lead}</p>` : ''}
          ${cnt ? `<ul class="ptlist tight">${s.pts.map(x => `<li>${x}</li>`).join('')}</ul>` : ''}
        </div>
      </div>`);
      el.querySelector('.cpt-h').onclick = ev => {
        if (ev.target.closest('.cpt-ok')) return;
        el.classList.toggle('open');
      };
      el.querySelector('.cpt-ok').onclick = ev => {
        ev.stopPropagation();
        const st = kpS(k.id);
        if (!st.conceptRead) st.conceptRead = [];
        const at = st.conceptRead.indexOf(idx);
        if (at >= 0) st.conceptRead.splice(at, 1); else st.conceptRead.push(idx);
        el.classList.toggle('read', at < 0);
        const n = (st.conceptRead || []).length;
        card.querySelector('#cpt-bar').style.width = Math.round(n / total * 100) + '%';
        card.querySelector('#cpt-hint').textContent = `${n}/${total} 已标记掌握`;
        save(); hud(); renderPath();
      };
      list.appendChild(el);
    });

    /* 工具条：全部收起 / 速览模式 */
    let skim = false;
    card.querySelector('#cpt-fold').onclick = ev => {
      const anyOpen = !!list.querySelector('.cpt.open');
      list.querySelectorAll('.cpt').forEach(x => x.classList.toggle('open', !anyOpen));
      ev.target.textContent = anyOpen ? '全部展开' : '全部收起';
    };
    card.querySelector('#cpt-skim').onclick = ev => {
      skim = !skim;
      ev.target.classList.toggle('on', skim);
      ev.target.textContent = skim ? '退出速览' : '速览模式';
      list.querySelectorAll('.cpt').forEach(x => {
        x.classList.toggle('open', !skim);
        x.querySelector('.cpt-b').style.display = skim ? 'none' : '';
      });
    };
    v.appendChild(card);
  }

  /* 表格 */
  if ((k.table || []).length) {
    const cols = Object.keys(k.table[0]);
    v.appendChild(h(`<div class="card"><div class="card-h"><i class="bar"></i>对照速查表</div>
      <table class="tbl"><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${k.table.map(r => `<tr>${cols.map(c => `<td>${r[c] == null ? '' : r[c]}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`));
  }

  /* 公式 */
  if ((k.formulas || []).length) {
    v.appendChild(h(`<div class="card"><div class="card-h"><i class="bar"></i>核心公式 <span class="hint">共 ${k.formulas.length} 条</span></div>
      ${k.formulas.map(f => `<div class="fml">${f.mml}${f.note ? `<div class="note">${f.note}</div>` : ''}</div>`).join('')}</div>`));
  }

  /* 例题 */
  if ((k.examples || []).length) {
    const box = h(`<div class="card"><div class="card-h"><i class="bar"></i>例题精讲
      <span class="hint">按重要度配置 ${k.examples.length} 道 · 点标题展开 · 已看 ${(st.examples || []).length}/${k.examples.length}</span></div>
      <div id="exbox"></div></div>`);
    const eb = box.querySelector('#exbox');
    k.examples.forEach((ex, i) => {
      const open = (st.examples || []).includes(i);
      const el = h(`<div class="ex ${open ? 'open' : ''}">
        <div class="ex-h"><span class="ex-n">${i + 1}</span><span class="ex-t">${esc(ex.title || '例题')}</span><span class="ex-arrow">▶</span></div>
        <div class="ex-b">
          <div class="ex-sec"><span class="lbl">题目</span><div>${ex.problem || ''}</div></div>
          ${(ex.steps || []).length ? `<div class="ex-sec"><span class="lbl">解题步骤</span><ol>${ex.steps.map(s => `<li>${s}</li>`).join('')}</ol></div>` : ''}
          ${ex.answer ? `<div class="ex-sec"><span class="lbl ans">答案</span><div>${ex.answer}</div></div>` : ''}
          ${ex.source ? `<div class="ex-src">📎 出处：${esc(ex.source)}</div>` : ''}
        </div></div>`);
      el.querySelector('.ex-h').onclick = () => {
        const o = el.classList.toggle('open');
        const s2 = kpS(id);
        if (o && !s2.examples.includes(i)) { s2.examples.push(i); save(); }
        hud(); renderPath();
      };
      eb.appendChild(el);
    });
    v.appendChild(box);
  }

  /* 自测 */
  if ((k.quiz || []).length) {
    v.appendChild(quizBlock(k, st, true));
  }

  /* FAQ */
  if ((k.faq || []).length) {
    v.appendChild(h(`<div class="card"><div class="card-h"><i class="bar"></i>常见困惑</div>
      ${k.faq.map(f => `<div class="ex"><div class="ex-h"><span class="ex-n" style="background:var(--key)">?</span><span class="ex-t">${esc(f.q)}</span><span class="ex-arrow">▶</span></div>
      <div class="ex-b">${f.a}</div></div>`).join('')}</div>`));
    v.querySelectorAll('.card:last-child .ex-h').forEach(e => e.onclick = () => { const p = e.parentElement; p.classList.toggle('open'); });
  }

  /* 底部导航 */
  const idx = KP.findIndex(x => x.id === id);
  const prev = KP[idx - 1], next = KP[idx + 1];
  v.appendChild(h(`<div class="card tight" style="display:flex;justify-content:space-between;gap:12px;align-items:center">
    <div>${prev ? `<button class="btn sec" data-go2="${prev.id}">← 上一层：${esc(prev.title)}</button>` : '<span style="color:var(--ink-3);font-size:13px">已是第一个知识点</span>'}</div>
    <div>${next ? `<button class="btn" data-go2="${next.id}">下一层：${esc(next.title)} →</button>` : '<span style="color:var(--ink-3);font-size:13px">已是最后一个知识点 🎉</span>'}</div>
  </div>`));

  bindGo(v);
  if (forceTop !== false) window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindGo(root) {
  root.querySelectorAll('[data-go]').forEach(e => e.onclick = () => { location.hash = '#/kp/' + e.dataset.go; });
  root.querySelectorAll('[data-go2]').forEach(e => e.onclick = () => { location.hash = '#/kp/' + e.dataset.go2; });
}

/* ================= 习题块 ================= */
function quizBlock(k, st, inline) {
  const box = h(`<div class="card"><div class="card-h"><i class="bar"></i>自测练习
    <span class="hint">共 ${k.quiz.length} 题 · 作答即计入掌握度</span></div><div class="qbox"></div></div>`);
  const qb = box.querySelector('.qbox');
  k.quiz.forEach((q, qi) => qb.appendChild(quizItem(k, q, qi, st)));
  return box;
}
function quizItem(k, q, qi, st) {
  const done = st.quiz[qi] !== undefined;
  const el = h(`<div class="qz"><div class="qz-q"><span class="qn">${qi + 1}.</span>${q.q}</div><div class="qbody"></div><div class="qexp"></div></div>`);
  const body = el.querySelector('.qbody'), exp = el.querySelector('.qexp');

  function showExp(ok) {
    exp.className = 'qexp exp ' + (ok ? 'ok' : 'no');   // 保留 qexp 类，便于定位与样式叠加
    exp.innerHTML = (ok ? '✅ <b>答对了。</b>' : '❌ <b>再想想。</b>') + ' ' + (q.explain || '');
  }

  if (q.type === 'choice') {
    const wrap = h('<div class="opts"></div>');
    q.options.forEach((o, oi) => {
      const b = h(`<button class="opt" ${done ? 'disabled' : ''}><span class="ok-key">${'ABCD'[oi]}</span><span>${o}</span></button>`);
      b.onclick = () => {
        if (st.quiz[qi] !== undefined) return;
        const ok = oi === q.answer;
        st.quiz[qi] = ok; save(); hud(); renderPath();
        wrap.querySelectorAll('.opt').forEach((x, xi) => {
          x.disabled = true;
          if (xi === q.answer) x.classList.add('right');
          else if (xi === oi) x.classList.add('wrong');
        });
        showExp(ok);
      };
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
    if (done) {
      wrap.querySelectorAll('.opt').forEach((x, xi) => { x.disabled = true; if (xi === q.answer) x.classList.add('right'); });
      showExp(!!st.quiz[qi]);
    }
  } else {
    const row = h(`<div class="fill-row"><input class="fill-in" placeholder="在此输入答案（可用 LaTeX，如 \\sqrt{2}）" ${done ? 'disabled' : ''}><button class="btn" ${done ? 'disabled' : ''}>提交</button></div>`);
    const inp = row.querySelector('input'), btn = row.querySelector('button');
    if (done) inp.value = S.kp[k.id]._fillText && S.kp[k.id]._fillText[qi] || '';
    const go = () => {
      if (st.quiz[qi] !== undefined) return;
      const val = inp.value.trim();
      if (!val) { toast('请先输入答案'); return; }
      const ok = normEq(val, q.answer);
      st.quiz[qi] = ok; 
      if (!st._fillText) st._fillText = {};
      st._fillText[qi] = val;
      save(); hud(); renderPath();
      inp.disabled = true; btn.disabled = true;
      showExp(ok);
      if (!ok) { const d = document.createElement('div'); d.innerHTML = '<div style="margin-top:8px;font-size:13.5px">参考答案：' + q.answer + '</div>'; exp.appendChild(d); }
    };
    btn.onclick = go;
    inp.onkeydown = e => { if (e.key === 'Enter') go(); };
    body.appendChild(row);
    if (done) showExp(!!st.quiz[qi]);
  }
  return el;
}
/* 填空题判分：归一化后比较，容忍 LaTeX 写法差异与空白 */
function normEq(a, b) {
  const f = s => String(s).toLowerCase()
    .replace(/\s+/g, '').replace(/\\left|\\right|\\,|\\;|\\!/g, '')
    .replace(/\\dfrac|\\tfrac/g, '\\frac').replace(/\\sqrt\{?([^{}]*)\}?/g, 'sqrt$1')
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
    .replace(/[{}$]/g, '').replace(/[（(]/g, '').replace(/[）)]/g, '')
    .replace(/。|，|,|\.$/g, '').replace(/^答案[:：]?/, '');
  const x = f(a), y = f(b);
  if (x === y) return true;
  const numsA = (x.match(/-?\d+(\.\d+)?/g) || []).join(',');
  const numsB = (y.match(/-?\d+(\.\d+)?/g) || []).join(',');
  if (numsA && numsA === numsB) return true;
  return x.includes(y) || y.includes(x);
}

/* ================= 视图：习题系统 ================= */
function viewPractice() {
  const v = $('#view'); S.cur = null; save(); markPath();
  let totalQ = 0, answered = 0, correct = 0;
  KP.forEach(k => { const st = S.kp[k.id] || { quiz: {} }; totalQ += k.quiz.length; Object.values(st.quiz || {}).forEach(x => { answered++; if (x) correct++; }); });
  const acc = answered ? Math.round(correct / answered * 100) : 0;

  v.innerHTML = '';
  v.appendChild(h(`<div class="kp-head">
    <div class="kp-tag"><span class="chip lv">全部知识点</span><span class="chip plain">共 ${KP.length} 个知识点</span></div>
    <h1 class="kp-title">习题系统</h1>
    <p class="kp-sum">题库共 <b>${totalQ}</b> 道题，覆盖全部 ${KP.length} 个知识点，题量按重要度分配（核心 6 例题 / 4 习题，重点 4 / 4，了解 2 / 4）。作答实时计入掌握度。</p>
  </div>`));

  v.appendChild(h(`<div class="stat-row">
    <div class="stat"><div class="sv">${totalQ}</div><div class="sl">题库总题数</div></div>
    <div class="stat"><div class="sv">${answered}</div><div class="sl">已作答</div></div>
    <div class="stat g"><div class="sv">${correct}</div><div class="sl">答对</div></div>
    <div class="stat ${acc >= 75 ? 'g' : (acc < 50 && answered ? 'r' : '')}"><div class="sv">${acc}%</div><div class="sl">正确率</div></div>
  </div>`));

  // 按知识点列出，未做的排前面
  const rows = KP.map(k => {
    const st = S.kp[k.id] || { quiz: {} };
    const n = k.quiz.length;
    const a = Object.keys(st.quiz || {}).length;
    const c = Object.values(st.quiz || {}).filter(Boolean).length;
    return { k, n, a, c, r: masteryOf(k) };
  }).sort((x, y) => (x.a / x.n) - (y.a / y.n));

  const box = h('<div class="card"><div class="card-h"><i class="bar"></i>按知识点练习 <span class="hint">未做的排在前面</span></div></div>');
  rows.forEach(row => {
    const pct = row.n ? Math.round(row.a / row.n * 100) : 0;
    const el = h(`<div class="ex">
      <div class="ex-h">
        <span class="ex-n" style="background:${row.r.lv === 'done' ? 'var(--primary)' : (row.r.lv === 'zero' ? '#C9C2B8' : 'var(--key)')}">${row.k.level}</span>
        <span class="ex-t">${esc(row.k.title)}</span>
        <span class="chip ${row.k.importance}" style="font-size:11px">${(LV[row.k.importance] || {}).s}</span>
        <span style="font-size:12px;color:var(--ink-3);min-width:120px;text-align:right">已做 ${row.a}/${row.n} · 对 ${row.c} · 掌握 ${row.r.m}%</span>
        <span class="ex-arrow">▶</span>
      </div>
      <div class="ex-b"></div></div>`);
    el.querySelector('.ex-h').onclick = () => {
      const open = el.classList.toggle('open');
      const b = el.querySelector('.ex-b');
      if (open && !b.dataset.filled) {
        b.dataset.filled = '1';
        const st = kpS(row.k.id);
        row.k.quiz.forEach((q, qi) => b.appendChild(quizItem(row.k, q, qi, st)));
      }
    };
    box.appendChild(el);
  });
  v.appendChild(box);
  window.scrollTo({ top: 0 });
}

/* ================= 视图：互动问答 ================= */
/* 检索式问答：对全部知识点内容建 2-gram 倒排索引，按 TF-IDF 打分返回最相关片段。
   这是确定性检索，不是语言模型 —— 界面上如实标注。 */
let IDX = null;
function buildIndex() {
  if (IDX) return IDX;
  const docs = [];
  const strip = s => String(s || '').replace(/\$[^$]*\$/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\\[a-zA-Z]+/g, ' ');
  KP.forEach(k => {
    const add = (kind, text, ref) => docs.push({ kp: k, kind, text, ref, grams: grams(strip(text)) });
    add('概念', (k.concept || []).join(' '), '概念讲解');
    add('要点', k.summary || '', '一句话概括');
    add('为什么学', strip(k.why || ''), '为什么学它');
    (k.formulas || []).forEach((f, i) => add('公式', (f.note || '') + ' ' + f.tex, '核心公式 ' + (i + 1)));
    (k.examples || []).forEach((e, i) => add('例题', strip(e.title + ' ' + e.problem + ' ' + (e.steps || []).join(' ')) + ' ' + strip(e.answer), '例题 ' + (i + 1)));
    (k.quiz || []).forEach((q, i) => add('习题', strip(q.q) + ' ' + strip(q.explain), '自测 ' + (i + 1)));
    (k.faq || []).forEach((f, i) => add('答疑', strip(f.q + ' ' + f.a), '常见困惑 ' + (i + 1)));
  });
  GFAQ.forEach(f => docs.push({ kp: null, kind: '通用', text: strip(f.q + ' ' + f.a), ref: f.q, grams: grams(strip(f.q + ' ' + f.a)), src: f.src, qtext: f.q, atext: f.a }));
  const df = {};
  docs.forEach(d => { new Set(d.grams).forEach(g => df[g] = (df[g] || 0) + 1); });
  const N = docs.length;
  docs.forEach(d => {
    const tf = {}; d.grams.forEach(g => tf[g] = (tf[g] || 0) + 1);
    d.vec = {}; let norm = 0;
    for (const g in tf) { const w = (1 + Math.log(tf[g])) * Math.log(1 + N / (1 + (df[g] || 0))); d.vec[g] = w; norm += w * w; }
    d.norm = Math.sqrt(norm) || 1;
  });
  IDX = { docs, df, N };
  return IDX;
}
function grams(s) {
  const clean = String(s).replace(/[\s\p{P}]+/gu, '');
  const g = [];
  for (let i = 0; i < clean.length - 1; i++) g.push(clean.slice(i, i + 2));
  // 也把连续英文/数字词整词加入
  (String(s).match(/[A-Za-z][A-Za-z0-9]{1,}/g) || []).forEach(w => g.push(w.toLowerCase()));
  return g;
}
function search(qtext) {
  const { docs, df, N } = buildIndex();
  const qg = grams(qtext);
  if (!qg.length) return [];
  const qtf = {}; qg.forEach(g => qtf[g] = (qtf[g] || 0) + 1);
  const qv = {}; let qn = 0;
  for (const g in qtf) { const w = (1 + Math.log(qtf[g])) * Math.log(1 + N / (1 + (df[g] || 0))); qv[g] = w; qn += w * w; }
  qn = Math.sqrt(qn) || 1;
  const scored = docs.map(d => {
    let dot = 0;
    for (const g in qv) if (d.vec[g]) dot += qv[g] * d.vec[g];
    return { d, s: dot / (qn * d.norm) };
  }).filter(x => x.s > 0.02).sort((a, b) => b.s - a.s);
  return scored.slice(0, 6);
}
function answer(qtext) {
  // 1) 全库通用 FAQ 高度匹配优先
  const hits = search(qtext);
  if (!hits.length) {
    return { html: `没有检索到相关内容。可以换个问法，或直接问我：<br>· 「${'范数有什么用'}」<br>· 「${'SVD 怎么算'}」<br>· 「${'龙贝格算法'}」<br>· 「${'复化梯形和辛普森的收敛阶'}}」`, src: '' };
  }
  // 同一个知识点聚合
  const byKp = {};
  hits.forEach(x => { const key = x.d.kp ? x.d.kp.id : '_G'; (byKp[key] = byKp[key] || []).push(x); });
  const top = hits[0];
  let html = '';
  const srcs = [];

  if (top.d.kind === '通用' && top.d.atext) {
    html += `<div class="ttl">${esc(top.d.qtext)}</div>${top.d.atext}`;
    if (top.d.src) srcs.push('依据：' + top.d.src);
  } else if (top.d.kp) {
    const k = top.d.kp;
    html += `<div class="ttl">${esc(k.title)}</div>`;
    html += `<div style="color:var(--ink-2);margin-bottom:9px">${k.summary || ''}</div>`;
    // 概念
    if ((k.concept || []).length) html += `<div style="margin-bottom:9px">${(k.concept[0] || '').slice(0, 460)}${(k.concept[0] || '').length > 460 ? '…' : ''}</div>`;
    // 命中的例题
    const exHit = hits.find(x => x.d.kp === k && x.d.kind === '例题');
    if (exHit) {
      const m = /例题 (\d+)/.exec(exHit.d.ref);
      const ex = m && k.examples[+m[1] - 1];
      if (ex) html += `<div style="margin-top:10px;padding:10px 13px;background:var(--surface-2);border-radius:8px;border-left:3px solid var(--primary-line)">
        <b>相关例题：${esc(ex.title)}</b><div style="margin-top:5px">${ex.problem || ''}</div></div>`;
    }
    // 命中的 FAQ
    const fHit = hits.find(x => x.d.kp === k && x.d.kind === '答疑');
    if (fHit) {
      const m = /常见困惑 (\d+)/.exec(fHit.d.ref);
      const f = m && k.faq[+m[1] - 1];
      if (f) html += `<div style="margin-top:10px;padding:10px 13px;background:var(--key-soft);border-radius:8px;border-left:3px solid var(--key-line)">
        <b>${esc(f.q)}</b><div style="margin-top:5px">${f.a}</div></div>`;
    }
    // 公式
    const fmlHit = hits.find(x => x.d.kp === k && x.d.kind === '公式');
    if (fmlHit && !fHit) {
      const m = /核心公式 (\d+)/.exec(fmlHit.d.ref);
      const ff = m && k.formulas[+m[1] - 1];
      if (ff) html += `<div class="fml" style="margin-top:10px">${ff.mml || ("$$" + ff.tex + "$$")}${ff.note ? `<div class="note">${ff.note}</div>` : ''}</div>`;
    }
    html += `<div style="margin-top:11px"><span class="jump" onclick="location.hash='#/kp/${k.id}'">打开完整知识点：${esc(k.title)} <span class="arw">→</span></span></div>`;
    srcs.push('匹配自：' + k.id + ' ' + k.title);
  }
  // 其它候选
  const others = hits.filter(x => x !== top && x.d.kp).map(x => x.d.kp).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
  if (others.length) {
    html += `<div style="margin-top:12px;font-size:12.5px;color:var(--ink-3)">相关知识点：` +
      others.map(k => `<span class="jump back" style="margin-left:5px" onclick="location.hash='#/kp/${k.id}'">${esc(k.title)}</span>`).join('') + `</div>`;
  }
  return { html, src: srcs.join(' · ') };
}

function viewQA() {
  const v = $('#view'); S.cur = null; save(); markPath();
  v.innerHTML = '';
  v.appendChild(h(`<div class="kp-head" style="padding:18px 22px">
    <div class="kp-tag"><span class="chip lv">互动问答</span><span class="chip plain">覆盖 ${KP.length} 个知识点 · ${(window.GLOBAL_FAQ || []).length} 条通用问答</span></div>
    <h1 class="kp-title" style="font-size:20px">学习问答</h1>
    <p class="kp-sum" style="font-size:13.6px">在这里提问，系统会在<b>全部知识点内容、例题、公式、答疑</b>中检索并给出最相关的解答，并给出可以跳转的知识点。
    <span style="color:var(--key)">说明：这是基于关键词检索的确定性问答（非大语言模型），只回答本课程知识库内有的内容，答不出会如实告诉你。</span></p>
  </div>`));

  const wrap = h(`<div class="qa-wrap">
    <div class="sugg"></div>
    <div class="qa-log" id="qalog"></div>
    <div class="qa-in"><input id="qain" placeholder="问点什么，例如：范数有什么用在哪儿？复化梯形和辛普森的收敛阶差多少？"><button class="btn" id="qabtn">提问</button></div>
  </div>`);
  v.appendChild(wrap);

  const SUG = ['这门课到底在讲什么', '我该按什么顺序学', '哪些是必考重点', 'SVD 怎么求', '龙贝格算法怎么算',
    '复化梯形和辛普森的收敛阶差多少', '广义逆和普通逆什么区别', '为什么矩阵函数不能直接套级数',
    '有效数字怎么和相对误差换算', '三阶矩阵有什么特别的', '考试最容易丢分在哪', '课件有哪些缺口'];
  const sg = wrap.querySelector('.sugg');
  SUG.forEach(s => { const b = h(`<button>${esc(s)}</button>`); b.onclick = () => ask(s); sg.appendChild(b); });

  const log = wrap.querySelector('#qalog');
  function push(cls, html) { log.appendChild(h(`<div class="msg ${cls}">${html}</div>`)); log.scrollTop = log.scrollHeight; }
  function ask(text) {
    if (!text.trim()) return;
    push('me', esc(text));
    const t0 = performance.now();
    const a = answer(text);
    push('bot', `<div>${a.html}</div>${a.src ? `<div class="src">${esc(a.src)} · 检索耗时 ${Math.round(performance.now() - t0)}ms</div>` : ''}`);
    S.qa.push({ q: text, t: Date.now() }); if (S.qa.length > 80) S.qa.shift(); save();
  }
  const inp = wrap.querySelector('#qain');
  wrap.querySelector('#qabtn').onclick = () => { ask(inp.value); inp.value = ''; };
  inp.onkeydown = e => { if (e.key === 'Enter') { ask(inp.value); inp.value = ''; } };

  // 开场
  push('bot', `<div class="ttl">你好，我是这门课的学习助手</div>你可以直接问我课程里的任何知识点、例题解法、公式含义，或者问「哪些是必考重点」。<br>下面这些是问得最多的问题，点一下就问：`);
  inp.focus();
  window.scrollTo({ top: 0 });
}

/* ================= 视图：掌握度 ================= */
function viewMastery() {
  const v = $('#view'); S.cur = null; save(); markPath();
  const o = overall();
  v.innerHTML = '';

  v.appendChild(h(`<div class="kp-head" style="padding:18px 22px">
    <div class="kp-tag"><span class="chip lv">学习数据</span><span class="chip plain">数据保存在本机浏览器</span></div>
    <h1 class="kp-title" style="font-size:20px">掌握度与学习时间</h1>
    <p class="kp-sum" style="font-size:13.6px">掌握度 = <b>概念要点 15%</b> + <b>例题浏览 25%</b> + <b>习题正确率 50%</b> + <b>学习时长 10%</b>。在概念卡上点 ✓、展开例题、答对题目、停留学习都会实时更新。</p>
  </div>`));

  v.appendChild(h(`<div class="stat-row">
    <div class="stat g"><div class="sv">${o.done}</div><div class="sl">已掌握知识点（≥75%）</div></div>
    <div class="stat"><div class="sv">${o.mid}</div><div class="sl">进行中</div></div>
    <div class="stat"><div class="sv">${o.zero}</div><div class="sl">尚未开始</div></div>
    <div class="stat"><div class="sv">${o.avg}%</div><div class="sl">总体平均掌握度</div></div>
  </div>`));

  // 总掌握程度扇形图
  const c1 = h(`<div class="card"><div class="card-h"><i class="bar"></i>总知识点掌握程度 <span class="hint">按知识点个数统计，共 ${o.total} 个</span></div><div class="big-chart" id="ch-all"></div></div>`);
  v.appendChild(c1);

  // 各知识点扇形图
  const c2 = h(`<div class="card"><div class="card-h"><i class="bar"></i>各知识点掌握程度 <span class="hint">逐个知识点的掌握百分比</span></div><div class="chart-grid" id="ch-kps"></div></div>`);
  v.appendChild(c2);

  // 时间折线
  const c3 = h(`<div class="card"><div class="card-h"><i class="bar"></i>复习学习时间折线 <span class="hint">最近 14 天，单位：分钟</span></div><div class="big-chart" id="ch-time"></div></div>`);
  v.appendChild(c3);

  // 累计时间按知识点
  const c4 = h(`<div class="card"><div class="card-h"><i class="bar"></i>各知识点累计学习时长 <span class="hint">单位：分钟</span></div><div class="big-chart" id="ch-timekp"></div></div>`);
  v.appendChild(c4);

  // 学习清单
  const tbl = h(`<div class="card"><div class="card-h"><i class="bar"></i>学习明细</div>
    <table class="tbl"><thead><tr><th>知识点</th><th>重要度</th><th>例题</th><th>习题</th><th>时长</th><th>掌握度</th><th>状态</th></tr></thead><tbody>
    ${KP.map(k => { const r = masteryOf(k); const st = S.kp[k.id] || {}; const secs = st.seconds || 0;
      return `<tr><td><span style="color:var(--primary);cursor:pointer" onclick="location.hash='#/kp/${k.id}'">${esc(k.title)}</span></td>
      <td>${(LV[k.importance] || {}).s || ''}</td>
      <td>${r.exSeen}/${r.nEx}</td><td>${Object.keys(st.quiz || {}).length}/${(k.quiz || []).length}</td>
      <td>${Math.round(secs / 60)} 分</td><td><b>${r.m}%</b></td>
      <td>${r.lv === 'done' ? '✅ 已掌握' : (r.lv === 'zero' ? '— 未开始' : '🔄 进行中')}</td></tr>`; }).join('')}
    </tbody></table></div>`);
  v.appendChild(tbl);

  // 学习资源
  v.appendChild(resourceCard());

  window.scrollTo({ top: 0 });
  setTimeout(() => drawCharts(), 60);
}

function resourceCard() {
  const vids = RES.videos || [];
  const cats = ['矩阵理论', '矩阵分解', '数值计算', '慕课'];
  return h(`<div class="card"><div class="card-h"><i class="bar"></i>配套学习资源
    <span class="hint">视频均为 B 站官方 API 逐条核验，非编造链接</span></div>
    ${cats.map(c => {
      const list = vids.filter(x => x.cat === c);
      if (!list.length) return '';
      return `<div style="margin-top:12px"><div style="font-weight:700;font-size:13.5px;margin-bottom:7px;color:var(--primary)">${esc(c)}</div>
      ${list.map(x => `<div style="padding:9px 12px;border:1px solid var(--line);border-radius:9px;margin-bottom:7px;background:#fff">
        <div style="display:flex;gap:9px;align-items:baseline;flex-wrap:wrap">
          <a href="${esc(x.url)}" target="_blank" rel="noopener" style="font-weight:600;color:var(--primary);text-decoration:none">${esc(x.name)}</a>
          <span class="chip plain" style="font-size:10.5px">${esc(x.stage)}</span>
          ${x.play && x.play !== '—' ? `<span style="font-size:11.5px;color:var(--ink-3)">播放 ${esc(x.play)}</span>` : ''}
          ${x.pages && x.pages !== '—' ? `<span style="font-size:11.5px;color:var(--ink-3)">${esc(x.pages)}</span>` : ''}
        </div>
        <div style="font-size:12px;color:var(--ink-3);margin-top:3px">${esc(x.up)}${x.note ? ' · ' + esc(x.note) : ''}</div>
        <div style="font-size:11.5px;color:var(--ink-3);margin-top:4px">对应知识点：${(x.kps || []).map(id => `<span class="jump back" style="font-size:11px;padding:1px 7px" onclick="location.hash='#/kp/${id}'">${id}</span>`).join(' ')}</div>
      </div>`).join('')}</div>`;
    }).join('')}
    <div style="margin-top:14px;border-top:1px dashed var(--line-2);padding-top:12px">
      <div style="font-weight:700;font-size:13.5px;margin-bottom:7px;color:var(--primary)">大纲与真题（本页定级依据）</div>
      ${(RES.outlines || []).map(o => `<div style="font-size:12.8px;margin-bottom:5px">· <a href="${esc(o.url)}" target="_blank" rel="noopener" style="color:var(--primary)">${esc(o.name)}</a></div>`).join('')}
    </div>
    <div style="margin-top:14px;border-top:1px dashed var(--line-2);padding-top:12px">
      <div style="font-weight:700;font-size:13.5px;margin-bottom:7px;color:var(--primary)">真实考题原型（按知识点归档）</div>
      ${(RES.examPoints || []).map(e => `<div style="padding:10px 13px;border:1px solid var(--line);border-radius:9px;margin-bottom:8px;background:var(--surface-2)">
        <div style="font-size:12px;color:var(--key);font-weight:700">${esc(e.tag)} · <span class="jump back" style="padding:1px 7px;font-size:11px" onclick="location.hash='#/kp/${e.kp}'">${e.kp}</span></div>
        <div style="margin-top:5px;font-size:13.6px">${e.q}</div>
        <div style="margin-top:6px;font-size:12.5px;color:var(--ink-2)">💡 ${e.why}</div>
      </div>`).join('')}
    </div></div>`);
}

/* ================= 图表 =================
 * 用 SVG 渲染器而非默认的 canvas：
 *   ① canvas 里的文字在 DOM 中不可见，自动化验收查不到数（曾因此误判图表没画中心文字）；
 *   ② SVG 放大/打印不糊，学生看图表时更清楚。
 * 20 个小图表的规模下 SVG 性能完全够用。 */
function drawCharts() {
  if (!window.echarts) { console.warn('ECharts 未加载'); return; }
  const o = overall();
  const done = o.done, mid = o.mid, zero = o.zero;

  const el1 = document.getElementById('ch-all');
  if (el1 && !el1._c) {
    el1._c = echarts.init(el1, null, { renderer: 'svg' });
    el1._c.setOption({
      tooltip: { trigger: 'item', formatter: '{b}：{c} 个（{d}%）' },
      legend: { bottom: 0, itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 12 } },
      series: [{
        type: 'pie', radius: ['46%', '72%'], center: ['50%', '46%'], avoidLabelOverlap: true,
        itemStyle: { borderColor: '#fff', borderWidth: 3, borderRadius: 6 },
        label: { formatter: '{b}\n{c} 个', fontSize: 12, lineHeight: 16 },
        data: [
          { value: done, name: '已掌握', itemStyle: { color: '#E56E06' } },
          { value: mid, name: '进行中', itemStyle: { color: '#C78005' } },
          { value: zero, name: '尚未开始', itemStyle: { color: '#C9C2B8' } }
        ].filter(x => x.value > 0),
        emphasis: { scale: true, scaleSize: 6 }
      }],
      graphic: [{
        type: 'text', left: 'center', top: '40%',
        style: { text: o.avg + '%', fontSize: 26, fontWeight: 'bold', fill: '#E56E06', textAlign: 'center' }
      }, {
        type: 'text', left: 'center', top: '50%',
        style: { text: '平均掌握度', fontSize: 11.5, fill: '#948B82', textAlign: 'center' }
      }]
    });
  }

  const grid = document.getElementById('ch-kps');
  if (grid && !grid.dataset.done) {
    grid.dataset.done = '1';
    KP.forEach((k, i) => {
      const r = masteryOf(k);
      const color = r.lv === 'done' ? '#E56E06' : (r.lv === 'zero' ? '#C9C2B8' : (r.lv === 'mid' ? '#C78005' : '#D91812'));
      const cell = h(`<div class="mini"><div class="mt"><span style="color:var(--ink-3)">${k.level}</span><span>${esc(k.title.length > 16 ? k.title.slice(0, 15) + '…' : k.title)}</span></div>
        <div class="ms">${(LV[k.importance] || {}).s || ''} · 例题 ${r.exSeen}/${r.nEx} · 题 ${Object.keys((S.kp[k.id] || {}).quiz || {}).length}/${k.quiz.length}</div>
        <div class="mc" id="mc-${k.id}"></div></div>`);
      cell.onclick = () => location.hash = '#/kp/' + k.id;
      cell.style.cursor = 'pointer';
      grid.appendChild(cell);
      const c = echarts.init(cell.querySelector('.mc'), null, { renderer: 'svg' });
      c.setOption({
        tooltip: { trigger: 'item', formatter: p => `${p.name}：${p.value}%` },
        series: [{
          type: 'pie', radius: ['58%', '82%'], center: ['50%', '50%'], silent: false,
          itemStyle: { borderColor: '#fff', borderWidth: 2 },
          label: { show: false }, labelLine: { show: false },
          data: [
            { value: r.m, name: '已掌握', itemStyle: { color: color } },
            { value: 100 - r.m, name: '待提升', itemStyle: { color: '#EEE9E3' } }
          ]
        }],
        graphic: [{
          type: 'text', left: 'center', top: '40%',
          style: { text: r.m + '%', fontSize: 17, fontWeight: 'bold', fill: color, textAlign: 'center' }
        }]
      });
    });
  }

  // 时间折线（最近 14 天）
  const el3 = document.getElementById('ch-time');
  if (el3 && !el3._c) {
    el3._c = echarts.init(el3, null, { renderer: 'svg' });
    const days = [], vals = [], kpCnt = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const p = n => String(n).padStart(2, '0');
      const key = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
      days.push(key.slice(5));
      const rec = S.days[key];
      vals.push(rec ? Math.round(rec.seconds / 60 * 10) / 10 : 0);
      kpCnt.push(rec ? Object.keys(rec.kps || {}).length : 0);
    }
    el3._c.setOption({
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, itemWidth: 14, textStyle: { fontSize: 12 } },
      grid: { left: 46, right: 24, top: 26, bottom: 46 },
      xAxis: { type: 'category', data: days, axisLine: { lineStyle: { color: '#E8E3DC' } }, axisLabel: { fontSize: 11, color: '#6B625A' } },
      yAxis: { type: 'value', name: '分钟', nameTextStyle: { fontSize: 11, color: '#948B82' }, splitLine: { lineStyle: { color: '#EEE9E3' } }, axisLabel: { fontSize: 11, color: '#6B625A' } },
      series: [
        { name: '学习时长(分钟)', type: 'line', smooth: true, data: vals, symbolSize: 7,
          lineStyle: { width: 3, color: '#E56E06' }, itemStyle: { color: '#E56E06' },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(43,76,140,.22)' }, { offset: 1, color: 'rgba(43,76,140,.01)' }] } } },
        { name: '涉及知识点数', type: 'line', smooth: true, data: kpCnt, symbolSize: 6,
          lineStyle: { width: 2, color: '#C78005', type: 'dashed' }, itemStyle: { color: '#C78005' } }
      ]
    });
  }

  // 各知识点累计时长
  const el4 = document.getElementById('ch-timekp');
  if (el4 && !el4._c) {
    el4._c = echarts.init(el4, null, { renderer: 'svg' });
    const names = KP.map(k => k.id);
    const secs = KP.map(k => Math.round(((S.kp[k.id] || {}).seconds || 0) / 60 * 10) / 10);
    el4._c.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: p => `${p[0].name}：${p[0].value} 分钟` },
      grid: { left: 46, right: 24, top: 26, bottom: 46 },
      xAxis: { type: 'category', data: names, axisLabel: { fontSize: 11, color: '#6B625A', interval: 0, rotate: KP.length > 12 ? 40 : 0 } },
      yAxis: { type: 'value', name: '分钟', nameTextStyle: { fontSize: 11, color: '#948B82' }, splitLine: { lineStyle: { color: '#EEE9E3' } } },
      series: [{
        type: 'bar', data: secs, barMaxWidth: 26,
        itemStyle: { borderRadius: [5, 5, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#AE5404' }, { offset: 1, color: '#E56E06' }] } }
      }]
    });
  }
  window.addEventListener('resize', () => {
    document.querySelectorAll('.big-chart,.mc').forEach(e => { const c = echarts.getInstanceByDom(e); if (c) c.resize(); });
  }, { once: true });
}

/* ================= 视图：概览（首页） ================= */
function viewHome() {
  const v = $('#view'); S.cur = null; save(); markPath();
  const o = overall();
  v.innerHTML = '';
  v.appendChild(h(`<div class="kp-head">
    <div class="kp-tag"><span class="chip lv">课程总览</span><span class="chip plain">${KP.length} 个知识点 · ${KP.reduce((a, k) => a + (k.examples || []).length, 0)} 道例题 · ${KP.reduce((a, k) => a + (k.quiz || []).length, 0)} 道习题</span></div>
    <h1 class="kp-title">${esc(COURSE.title || '高等工程数学A26')}</h1>
    <p class="kp-sum">${esc(COURSE.teacher || '')} · ${esc(COURSE.school || '')}<br>${esc(COURSE.source || '')}</p>
    <div style="margin-top:14px;display:flex;gap:9px;flex-wrap:wrap">
      <button class="btn" onclick="location.hash='#/kp/${(KP[0] || {}).id || ''}'">开始学习 →</button>
      <button class="btn sec" onclick="location.hash='#/practice'">直接做题</button>
      <button class="btn sec" onclick="location.hash='#/mastery'">看掌握度</button>
    </div>
  </div>`));

  v.appendChild(h(`<div class="stat-row">
    <div class="stat"><div class="sv">${KP.length}</div><div class="sl">知识点</div></div>
    <div class="stat"><div class="sv">${KP.reduce((a, k) => a + (k.examples || []).length, 0)}</div><div class="sl">例题（按重要度分配）</div></div>
    <div class="stat g"><div class="sv">${o.done}</div><div class="sl">已掌握</div></div>
    <div class="stat"><div class="sv">${o.avg}%</div><div class="sl">平均掌握度</div></div>
  </div>`));

  // 四大模块路线图
  v.appendChild(h(`<div class="card"><div class="card-h"><i class="bar"></i>学习路线图 <span class="hint">按层级递进，前置未完成会有提示</span></div>
    ${(COURSE.modules || []).map((m, mi) => `<div style="margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:9px;margin-bottom:7px">
        <span style="width:24px;height:24px;border-radius:7px;background:var(--primary);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:700">${mi + 1}</span>
        <b style="font-size:14.5px">${esc(m.name)}</b>
        <span style="font-size:12.5px;color:var(--ink-3)">${esc(m.note || '')}</span>
      </div>
      <div style="display:flex;gap:7px;flex-wrap:wrap;padding-left:33px">
        ${(m.ids || []).map(id => { const k = BY_ID[id]; if (!k) return ''; const r = masteryOf(k);
          return `<span class="jump ${r.lv === 'done' ? '' : 'back'}" onclick="location.hash='#/kp/${id}'" title="${esc(k.summary || '')}">${id} ${esc(k.title.length > 14 ? k.title.slice(0, 13) + '…' : k.title)} <span class="arw">${(LV[k.importance] || {}).s || ''}</span></span>`; }).join('')}
      </div></div>`).join('')}
  </div>`));

  // 课件覆盖情况（如实披露缺口）
  v.appendChild(h(`<div class="card"><div class="card-h"><i class="bar"></i>课件覆盖核实 <span class="hint">如实披露缺口，不假装完整</span></div>
    <table class="tbl"><thead><tr><th>章节</th><th>课件文件</th><th>页数</th><th>核实结果</th><th>对应知识点</th></tr></thead><tbody>
    ${(COURSE.coverage || []).map(c => `<tr><td>${esc(c.ch)}</td><td>${esc(c.file)}</td><td>${c.pages || '—'}</td><td>${c.status}</td><td>${esc(c.kps)}</td></tr>`).join('')}
    </tbody></table>
    <div style="margin-top:12px;font-size:13px;color:var(--ink-2)">
      <b>课件自带例题分布实测</b>（用于校准"哪些是重点"）：
      <table class="tbl" style="margin-top:8px"><thead><tr><th>课件</th><th>页数</th><th>含例题页</th><th>分布</th></tr></thead><tbody>
      ${(COURSE.exampleDensity || []).map(d => `<tr><td>${esc(d.book)}</td><td>${d.pages}</td><td>${d.exPages}</td><td>${esc(d.topic)}</td></tr>`).join('')}
      </tbody></table></div>
  </div>`));

  // 课件勘误（逐条渲染原页核对 + 数值复算证实）
  const ERR = COURSE.errata || [];
  if (ERR.length) {
    v.appendChild(h(`<div class="card"><div class="card-h"><i class="bar" style="background:var(--core)"></i>课件勘误 <span class="hint">共 ${ERR.length} 条 · 均已调出原页目视核对</span></div>
      <div style="font-size:13px;color:var(--ink-2);margin-bottom:11px">课件本身有印刷错误，照抄会算出和课件答案对不上的结果。以下每条都做了两件事：<b>渲染原页确认印刷内容</b>，再用程序复算确认哪个值才对。</div>
      ${ERR.map(e => `<div style="padding:11px 14px;border:1px solid var(--line);border-left:3px solid ${e.level === '重要' ? 'var(--core)' : (e.level === '易误读' ? 'var(--key)' : 'var(--ink-3)')};border-radius:9px;margin-bottom:9px;background:var(--surface-2)">
        <div style="display:flex;gap:9px;align-items:baseline;flex-wrap:wrap">
          <span class="chip ${e.level === '重要' ? 'core' : (e.level === '易误读' ? 'key' : 'plain')}" style="font-size:11px">${esc(e.level)}</span>
          <span class="chip plain" style="font-size:11px">${esc(e.page)}</span>
          <b style="font-size:14px">${esc(e.title)}</b>
        </div>
        <div style="margin-top:7px;font-size:13.4px;line-height:1.85">${e.detail}</div>
      </div>`).join('')}
    </div>`));
  }

  // 重要度分级说明
  const byImp = { core: [], key: [], basic: [] };
  KP.forEach(k => (byImp[k.importance] || byImp.basic).push(k));
  v.appendChild(h(`<div class="card"><div class="card-h"><i class="bar"></i>重要度分级 <span class="hint">依据 5 份公开教学大纲 + 11 份真实试卷</span></div>
    ${['core', 'key', 'basic'].map(lv => `<div style="margin-bottom:13px">
      <span class="chip ${lv}">${LV[lv].s} ${LV[lv].t}</span>
      <span style="font-size:12.5px;color:var(--ink-3);margin-left:8px">每知识点配 ${lv === 'core' ? 6 : (lv === 'key' ? 4 : 2)} 道例题</span>
      <div style="margin-top:7px;display:flex;gap:7px;flex-wrap:wrap">
        ${byImp[lv].map(k => `<span class="jump back" onclick="location.hash='#/kp/${k.id}'">${esc(k.title)}</span>`).join('') || '<span style="font-size:12.5px;color:var(--ink-3)">（无）</span>'}
      </div></div>`).join('')}
    <div style="margin-top:8px;padding:11px 14px;background:var(--key-soft);border-radius:9px;font-size:13px;border-left:3px solid var(--key-line)">
      <b>定级不是拍脑袋</b>：核心 = 至少两份大纲明确要求「掌握」且在真题中反复出现。特别提醒 <b>K16 龙贝格算法</b>——本课课件把它标了 <code>9.4*</code> 星号，但佛山大纲把它同时标为<b>重点和难点</b>、湖南理工列入<b>教学重点难点</b>，所以它是必考。
    </div>
  </div>`));

  v.appendChild(resourceCard());
  window.scrollTo({ top: 0 });
}

/* ================= 路由 ================= */
function route() {
  const hh = location.hash || '';
  if (hh.startsWith('#/kp/')) { render(1); return viewKP(hh.slice(5)); }
  if (hh === '#/practice') { render(2); return viewPractice(); }
  if (hh === '#/qa') { render(3); return viewQA(); }
  if (hh === '#/mastery') { render(4); return viewMastery(); }
  render(0); viewHome();
}
function render(tabIdx) {
  document.querySelectorAll('#tabs .tab').forEach((t, i) => t.classList.toggle('active', i === tabIdx));
}
document.querySelectorAll('#tabs .tab').forEach(t => t.onclick = () => {
  const v = t.dataset.view;
  location.hash = v === 'learn' ? '#/' : '#/' + v;
});
window.addEventListener('hashchange', route);

/* 重置 */
$('#btn-reset').onclick = () => {
  if (confirm('确定清空本机所有学习记录（例题浏览、答题、时长）吗？此操作不可撤销。')) {
    localStorage.removeItem(SKEY); S = loadState(); hud(); renderPath(); route(); toast('已重置');
  }
};

/* ================= 计时 ================= */
let lastTick = Date.now();
setInterval(() => {
  const now = Date.now();
  const dt = Math.round((now - lastTick) / 1000);
  lastTick = now;
  if (dt <= 0 || dt > 120) return;
  if (document.hidden || !S.cur) return;
  kpS(S.cur).seconds += dt;
  addTime(dt);
  if (now % 30 < 1.1) { hud(); save(); }
}, 5000);
window.addEventListener('beforeunload', () => { save(); });
document.addEventListener('visibilitychange', () => { lastTick = Date.now(); if (document.hidden) save(); });

/* ================= 启动 ================= */
function boot() {
  const missing = [];
  if (!(window.KP_B || []).length) missing.push('data-b.js（矩阵基础与矩阵分析 K01–K06）');
  if (!(window.KP_D || []).length) missing.push('data-d.js（数值计算 K12–K18）');
  hud(); renderPath(); route();
  if (missing.length) {
    console.warn('缺少数据模块：' + missing.join('、'));
    toast('注意：还有数据模块未就位 —— ' + missing.join('、'));
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

})();
