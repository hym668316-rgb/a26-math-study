// 数据校验器：加载所有 KP_* 数据文件，检查结构完整性与内容质量。
// 用法: node validate.js        （在 assets/ 目录下运行）
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const files = fs.readdirSync(DIR).filter(f => /^data-[a-z]\.js$/.test(f)).sort();
const ALLWIN = {};

let loaded = [];
for (const f of files) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const win = {};                       // 每个文件独立沙箱，避免跨文件复用键名
  try {
    // 数据文件是 window.KP_X = [...] 形式，直接在沙箱里 eval
    new Function('window', src)(win);
    const keys = Object.keys(win);
    const key = keys.find(k => k.startsWith('KP_'));
    if (!key) { console.log(`[skip]   ${f}  (非知识点数据文件: ${keys.join(',') || '无导出'})`); continue; }
    const n = (win[key] || []).length;
    Object.assign(ALLWIN, win);
    loaded.push({ file: f, key, count: n });
    console.log(`[loaded] ${f}  ->  window.${key}  (${n} 个知识点)`);
  } catch (e) {
    console.log(`[FAIL]   ${f}  加载失败: ${e.message}`);
    process.exitCode = 1;
  }
}

const KP = [];
for (const k of Object.keys(ALLWIN)) if (k.startsWith('KP_')) KP.push(...ALLWIN[k]);
// 与 app.js 同一套全局层级重排（各模块自报的 level 只是模块内相对值）
const ORDER = ['K01','K02','K03','K04','K05','K06','K07','K08','K09','K10','K11',
               'K12','K13','K14','K15','K16','K17','K18'];
KP.forEach(k => { const i = ORDER.indexOf(k.id); k.level = i >= 0 ? i + 1 : (k.level || 99); });
KP.sort((a, b) => a.level - b.level);

console.log(`\n合计 ${KP.length} 个知识点\n`);
console.log('='.repeat(96));

const REQ = ['id', 'title', 'module', 'level', 'importance', 'stars', 'summary', 'why',
             'concept', 'formulas', 'prereq', 'serves', 'examples', 'quiz', 'faq'];
const errs = [], warns = [];
const ids = new Set(KP.map(k => k.id));

// 重要度 -> 应有例题数
const NEED = { core: 6, key: 4, basic: 2 };

console.log('id    星级 重要度  层级  例题  习题  FAQ  前置           服务');
console.log('-'.repeat(96));
for (const k of KP) {
  for (const f of REQ) if (k[f] === undefined) errs.push(`${k.id}: 缺字段 ${f}`);
  if (k.importance === 'core' && k.stars !== 3) errs.push(`${k.id}: core 但 stars=${k.stars}`);
  if (k.importance === 'key' && k.stars !== 2) errs.push(`${k.id}: key 但 stars=${k.stars}`);
  if (k.importance === 'basic' && k.stars !== 1) errs.push(`${k.id}: basic 但 stars=${k.stars}`);
  const need = NEED[k.importance];
  const have = (k.examples || []).length;
  if (have < need) warns.push(`${k.id}(${k.importance}): 例题 ${have} 道 < 应配 ${need} 道`);
  const stars = '★'.repeat(k.stars) + '☆'.repeat(3 - k.stars);
  console.log(
    `${k.id.padEnd(6)}${stars} ${String(k.importance).padEnd(7)}${String(k.level).padStart(3)}` +
    `${String(have).padStart(6)}${String((k.quiz || []).length).padStart(6)}` +
    `${String((k.faq || []).length).padStart(6)}  ` +
    `${(k.prereq || []).join(',').padEnd(15)}${(k.serves || []).join(',')}`);
}

// 交叉引用有效性
console.log('\n--- 引用完整性 ---');
for (const k of KP) {
  for (const p of (k.prereq || [])) if (!ids.has(p)) errs.push(`${k.id}: prereq 指向不存在的 ${p}`);
  for (const s of (k.serves || [])) if (!ids.has(s)) errs.push(`${k.id}: serves 指向不存在的 ${s}`);
}
// 双向一致性：若 A.serves 含 B，则 B.prereq 应含 A
for (const k of KP) {
  for (const s of (k.serves || [])) {
    const t = KP.find(x => x.id === s);
    if (t && !(t.prereq || []).includes(k.id)) {
      warns.push(`${k.id}.serves 含 ${s}，但 ${s}.prereq 不含 ${k.id}（单向，app.js 会自动派生补齐）`);
    }
  }
}
console.log(errs.length ? errs.join('\n') : '引用全部有效 ✓');

// 例题/习题字段完整性
let exTotal = 0, quizTotal = 0, faqTotal = 0, laTeX = 0;
for (const k of KP) {
  (k.examples || []).forEach((e, i) => {
    exTotal++;
    for (const f of ['title', 'problem', 'steps', 'answer', 'source'])
      if (!e[f]) errs.push(`${k.id} 例${i + 1}: 缺 ${f}`);
    if (!Array.isArray(e.steps) || e.steps.length < 2)
      warns.push(`${k.id} 例${i + 1}: steps 少于 2 步`);
  });
  (k.quiz || []).forEach((q, i) => {
    quizTotal++;
    if (q.type === 'choice') {
      if (!Array.isArray(q.options) || q.options.length !== 4)
        errs.push(`${k.id} 习题${i + 1}: choice 选项数 != 4`);
      if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3)
        errs.push(`${k.id} 习题${i + 1}: choice answer 不是 0-3 的索引`);
    } else if (q.type === 'fill') {
      if (typeof q.answer !== 'string' || !q.answer)
        errs.push(`${k.id} 习题${i + 1}: fill 缺 answer`);
    } else errs.push(`${k.id} 习题${i + 1}: 未知 type ${q.type}`);
  });
  faqTotal += (k.faq || []).length;
  // LaTeX 转义自检
  const blob = JSON.stringify(k);
  const m = blob.match(/\$[^$]*\$/g) || [];
  laTeX += m.length;
  if (/\\[a-z]/.test(blob.replace(/\\\\/g, ''))) {
    const bad = blob.match(/(?<!\\)\\[a-z]{2,}/g);
    if (bad) warns.push(`${k.id}: 可能未双写的反斜杠 ${[...new Set(bad)].slice(0,3).join(' ')}`);
  }
}

console.log('\n--- 汇总 ---');
console.log(`知识点 ${KP.length} 个 | 例题 ${exTotal} 道 | 习题 ${quizTotal} 道 | FAQ ${faqTotal} 条 | LaTeX 片段 ${laTeX} 处`);
const byImp = { core: 0, key: 0, basic: 0 };
KP.forEach(k => byImp[k.importance]++);
console.log(`核心 ★★★ ${byImp.core} 个 | 重点 ★★☆ ${byImp.key} 个 | 了解 ★☆☆ ${byImp.basic} 个`);
console.log(`\n错误 ${errs.length} 项，警告 ${warns.length} 项`);
if (warns.length) { console.log('\n警告:'); warns.forEach(w => console.log('  ! ' + w)); }
if (errs.length) { console.log('\n错误:'); errs.forEach(e => console.log('  X ' + e)); process.exitCode = 1; }
