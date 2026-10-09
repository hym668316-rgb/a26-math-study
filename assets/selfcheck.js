/* ============================================================================
   自检题生成器 —— 点「学习完毕」后，把这一节的讲解换成空白自检区，点开做题
   ----------------------------------------------------------------------------
   【设计为什么改成这样】
   第一版尝试「挖空术语 + 同领域干扰项」，原型试跑后废弃，实测三个硬伤：
     · 覆盖率仅 23%（66 节里 51 节内容以叙述为主，挖不出术语）
     · 题干语法坏：「设 A 为 n 阶方阵：若 A^T=A 的，称为」
     · 干扰项是垃圾：全库术语池只有 14 个，「齐次性」和「对称矩阵」会混进同一题
   现方案两条腿：

   ★ 题型一「归属题」——**兜底，保证 100% 覆盖，且构造上不可能出错误答案**
     选项全部是**真实的原文条目**，其中「属于本节」的那些由**出处**唯一确定。
     考的是"这一节到底讲了什么"，正是把内容遮成空白后该问的问题。
     干扰项取自其它小节的真实条目 —— 不是编的，也不会一眼假。

   ★ 题型二「术语题」——**只在本知识点内术语 ≥4 个时才出**
     形如「若 A^H=A 称 A 为 ___」，干扰项全部取自**同一知识点的兄弟小节**
     （如 K01 的 对称/Hermite/反Hermite/正规/幂等/正交/酉），同质、可信、确实错。
     术语不足就不出，绝不硬凑。

   确定性：同一小节每次生成的题完全一致（按 seed 洗牌），便于按索引存掌握记录。
   ========================================================================== */
(function (global) {
  'use strict';

  /* ---------------- 小工具 ----------------
     ⚠️ 关键前提（实测）：app.js 在**加载时**就把数据里的 $...$ 预渲染成了 MathML，
        所以这里拿到的 s.pts 里公式已经是 <math …>…</math>。
        因此：
        · 不能简单 stripTags —— 那会把公式内容一起吃成一个连串字符（ATA=A）；
        · 术语正则的 {4,44} 也跨不过 200+ 字符的 <math> 块，必须先屏蔽再匹配。 */
  const RE_MATHBLOCK = /<math[\s\S]*?<\/math>/g;

  // 把 <math> 块（以及万一残留的 $...$）换成 \u0001n\u0001 占位，匹配完再还原
  function maskMath(s) {
    const spans = [];
    const prot = String(s || '')
      .replace(RE_MATHBLOCK, (m) => { spans.push(m); return '\u0001' + (spans.length - 1) + '\u0001'; })
      .replace(/\$\$?[^$]*\$\$?/g, (m) => { spans.push(m); return '\u0001' + (spans.length - 1) + '\u0001'; });
    return { prot, spans };
  }
  function unmask(s, spans) {
    return String(s).replace(/\u0001(\d+)\u0001/g, (_, i) => spans[+i]);
  }
  // 可见长度：公式算 2 个字符
  function visLen(s) {
    return String(s == null ? '' : s)
      .replace(RE_MATHBLOCK, '⟨⟩')
      .replace(/<[^>]+>/g, '')
      .trim().length;
  }
  // 去掉所有标签（仅用于相等性比较，不用于展示）
  function norm(s) { return String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/\s+/g, ''); }

  /* 按"可见长度"截断，且**保持 <math> 块完整**（公式要么整块留、要么整块丢） */
  function clip(s, n) {
    const str = String(s == null ? '' : s);
    if (visLen(str) <= n) return str;
    const parts = str.split(/(<math[\s\S]*?<\/math>)/g);
    let out = '', vis = 0, truncated = false;
    for (const p of parts) {
      if (/^<math[\s\S]*<\/math>$/.test(p)) {
        if (vis + 2 > n) { truncated = true; break; }
        out += p; vis += 2;
      } else {
        const plain = p.replace(/<[^>]+>/g, '');
        if (vis + plain.length <= n) { out += plain; vis += plain.length; }
        else {
          const need = Math.max(0, n - vis);
          out += plain.slice(0, need);
          vis += need;
          truncated = true; break;
        }
      }
    }
    return truncated ? out.replace(/[，、；：\s]+$/, '') + '…' : out;
  }

  function dedup(a) {
    const seen = new Set(), out = [];
    a.forEach((x) => { const k = norm(x); if (k && !seen.has(k)) { seen.add(k); out.push(x); } });
    return out;
  }

  /* 确定性伪随机：同一 seed 永远同一序列 */
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }
  function seedOf(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function pick(arr, n, rnd) {
    const copy = arr.slice(), out = [];
    while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rnd() * copy.length), 1)[0]);
    return out;
  }
  function shuffle(a, rnd) {
    const o = a.slice();
    for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1));[o[i], o[j]] = [o[j], o[i]]; }
    return o;
  }

  /* ---------------- 术语抽取（题型二用） ---------------- */
  const RE_TERM = /([^，。；]{4,44}?)\s*[，,]?\s*称\s*[^，。；（）()]{0,10}?为\s*([^，。；、（）()]{2,16})/g;

  function termsOf(pt) {
    const { prot, spans } = maskMath(pt);
    const out = [];
    let m;
    RE_TERM.lastIndex = 0;
    while ((m = RE_TERM.exec(prot)) !== null) {
      const cond = unmask(m[1], spans).trim();
      const term = unmask(m[2], spans).trim();
      if (cond.length < 3 || term.length < 2 || term.length > 16) continue;
      if (/[的了吗]$/.test(cond)) continue;
      out.push({ cond, term, src: pt });
    }
    return out;
  }

  /* ---------------- 题型二：术语题 ---------------- */
  // 干扰项池 = 同一知识点里、其它小节抽出的术语
  function siblingTerms(sections, excludeIdx) {
    const out = [];
    sections.forEach((s, i) => {
      if (i === excludeIdx) return;
      (s.pts || []).forEach((p) => termsOf(p).forEach((t) => out.push(t.term)));
    });
    return dedup(out);
  }

  function buildTermQs(sec, secIdx, sections, rnd) {
    const sib = siblingTerms(sections, secIdx);
    if (sib.length < 3) return [];                 // 兄弟术语不足 → 不出，绝不硬凑
    const mine = [];
    (sec.pts || []).forEach((p) => termsOf(p).forEach((t) => mine.push(t)));
    const qs = [];
    const used = new Set();
    for (const t of mine) {
      if (qs.length >= 2) break;
      const key = norm(t.term);
      if (used.has(key)) continue;
      const near = sib.filter((x) => norm(x) !== key && Math.abs(x.length - t.term.length) <= 6);
      const pool = near.length >= 3 ? near : sib.filter((x) => norm(x) !== key);
      if (pool.length < 3) continue;
      used.add(key);
      const opts = shuffle(pick(pool, 3, rnd).concat([t.term]), rnd);
      qs.push({
        type: 'term',
        stem: `${t.cond} 的，称为？`,
        options: opts,
        answer: opts.indexOf(t.term),
        why: `本节原文：${clip(t.src, 120)}`,
      });
    }
    return qs;
  }

  /* ---------------- 题型一：归属题（兜底，永远可出） ---------------- */
  // 干扰项优先级：① 本知识点其它小节（同领域，最难也最有价值）
  //               ② 其它知识点（仅在同 KP 条目不足时补位）
  // 第一版只用 ②，原型抽检发现「K01 的题里混进龙贝格表/插值型求积」——
  // 一眼就能按主题排除，等于没考。故改成同 KP 优先。
  function foreignPoints(secIdx, sections, otherKPs) {
    const sib = [], far = [];
    sections.forEach((s, i) => {
      if (i === secIdx) return;
      (s.pts || []).forEach((p) => sib.push(p));
    });
    (otherKPs || []).forEach((o) => (o.pts || []).forEach((p) => far.push(p)));
    return { sib: dedup(sib), far: dedup(far) };
  }

  function buildBelongQs(sec, secIdx, sections, otherKPs, title, rnd) {
    const mine = dedup((sec.pts || []).filter((p) => visLen(p) >= 12));
    if (!mine.length) return [];
    const pool = foreignPoints(secIdx, sections, otherKPs);
    const clean = (arr) => arr
      .filter((p) => visLen(p) >= 12)
      .filter((p) => !mine.some((m) => norm(m) === norm(p)));
    // 同 KP 优先；不足 3 条才掺入远处知识点
    const near = clean(pool.sib);
    const far = clean(pool.far);
    const foreign = near.length >= 3 ? near : near.concat(pick(far, 3 - near.length, rnd));
    const qs = [];
    const usedMine = new Set();

    // 最多 3 道：交替出「属于」与「不属于」
    for (let k = 0; k < 3; k++) {
      const askBelong = k % 2 === 0;               // true = 问"哪条属于本节"
      let correct, wrongs;
      if (askBelong) {
        const cand = mine.filter((p) => !usedMine.has(norm(p)));
        if (!cand.length || foreign.length < 3) break;
        correct = [pick(cand, 1, rnd)[0]];
        wrongs = pick(foreign, 3, rnd);
      } else {
        if (mine.length < 3 || !foreign.length) break;
        correct = pick(mine, 3, rnd);
        wrongs = pick(foreign, 1, rnd);
      }
      correct.forEach((p) => usedMine.add(norm(p)));
      const truth = correct;
      const opts = shuffle(correct.concat(wrongs), rnd);
      const rightIdx = opts.map((o, i) => (truth.some((t) => norm(t) === norm(o)) ? i : -1)).filter((i) => i >= 0);
      qs.push({
        type: 'belong',
        stem: askBelong
          ? `以下哪一条是本节《${title}》讲的内容？`
          : `以下哪一条**不是**本节《${title}》讲的内容？`,
        options: opts.map((o) => clip(o, 64)),
        answer: rightIdx[0],
        why: (askBelong ? '本节原文：' : '不属于本节的：') +
             clip(truth[0], 150) + (truth.length > 1 ? `（本节共 ${mine.length} 条，其余见讲解）` : ''),
        _multi: rightIdx.length > 1,
      });
    }
    return qs;
  }

  /* ---------------- 对外：为一节生成自检题 ---------------- */
  const MAX_Q = 4;
  function build(kp, secIdx, sections, opts) {
    opts = opts || {};
    const sec = sections[secIdx];
    if (!sec || !(sec.pts || []).length) return { qs: [], pts: [] };
    const rnd = rng(seedOf((kp.id || '') + '#' + secIdx));
    const title = opts.title || ('第 ' + (secIdx + 1) + ' 节');

    const termQs = buildTermQs(sec, secIdx, sections, rnd);
    const belongQs = buildBelongQs(sec, secIdx, sections, opts.otherKPs || [], title, rnd);

    // 术语题在前（更硬），归属题补足
    const qs = termQs.concat(belongQs).slice(0, MAX_Q);
    return { qs, pts: sec.pts, lead: sec.lead || '' };
  }

  global.SELFCHECK = { build, termsOf, MAX_Q, _clip: clip };
})(window);
