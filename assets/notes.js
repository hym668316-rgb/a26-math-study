/* ============================================================================
   笔记照片 —— 把拍下来的笔记/板书/截图放进站点，任何设备打开都能看
   ----------------------------------------------------------------------------
   数据来自 assets/notes/manifest.js（由 collect_notes.py 生成）：
     window.NOTES = { generated, total, groups:[{name, items:[{t,f,s,w,h,kb}]}] }
   本文件自包含（不依赖 app.js 内部函数），只暴露 window.NOTES_VIEW.render(v)。
   ========================================================================== */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
  function h(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  let LB = null;          // 灯箱元素（只建一次）
  let flat = [];          // 当前筛选下的扁平列表，供左右切换

  function openLightbox(i) {
    if (!LB) {
      LB = h(`<div class="nlb" hidden>
        <div class="nlb-bg"></div>
        <button class="nlb-x" title="关闭（Esc）">✕</button>
        <button class="nlb-p" title="上一张（←）">‹</button>
        <button class="nlb-n" title="下一张（→）">›</button>
        <figure class="nlb-fig"><img alt=""><figcaption></figcaption></figure>
      </div>`);
      document.body.appendChild(LB);
      LB.querySelector('.nlb-bg').onclick = closeLightbox;
      LB.querySelector('.nlb-x').onclick = closeLightbox;
      LB.querySelector('.nlb-p').onclick = e => { e.stopPropagation(); step(-1); };
      LB.querySelector('.nlb-n').onclick = e => { e.stopPropagation(); step(1); };
      document.addEventListener('keydown', e => {
        if (LB.hidden) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') step(-1);
        else if (e.key === 'ArrowRight') step(1);
      });
    }
    LB.dataset.i = i;
    const it = flat[i];
    if (!it) return;
    LB.querySelector('img').src = it.f;
    LB.querySelector('img').alt = it.t;
    LB.querySelector('figcaption').innerHTML =
      `<b>${esc(it.t)}</b><span>${i + 1} / ${flat.length} · ${it.w}×${it.h} · ${it.kb} KB</span>`;
    LB.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (LB) LB.hidden = true;
    document.body.style.overflow = '';
  }
  function step(d) {
    const i = (+LB.dataset.i + d + flat.length) % flat.length;
    openLightbox(i);
  }

  function render(v) {
    const N = global.NOTES || { groups: [], total: 0, generated: '' };
    v.innerHTML = '';

    const head = h(`<div class="card"><div class="card-h"><i class="bar"></i>我的笔记照片
      <span class="hint">${N.total ? `共 ${N.total} 张 · 更新于 ${esc(N.generated)}` : '还没有照片'}</span>
      </div><div class="notes-body"></div></div>`);
    const body = head.querySelector('.notes-body');
    v.appendChild(head);

    if (!N.total) {
      body.appendChild(h(`<div class="notes-empty">
        <div class="ne-ico">📷</div>
        <div class="ne-t">还没有笔记照片</div>
        <div class="ne-s">把照片丢进本机文件夹 <code>高等工程数学A26_学习网页\\笔记照片\\</code>，
          双击 <code>更新笔记.bat</code> 就会自动压缩并发布到这里，手机和电脑都能看。<br>
          想分组就建子文件夹，例如 <code>笔记照片\\矩阵论\\</code>。</div>
      </div>`));
      return;
    }

    // 分组筛选
    const chips = h(`<div class="notes-chips"></div>`);
    const mk = (label, gi) => {
      const b = h(`<button class="nchip${gi === -1 ? ' on' : ''}">${esc(label)}</button>`);
      b.onclick = () => {
        chips.querySelectorAll('.nchip').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        paint(gi);
      };
      return b;
    };
    chips.appendChild(mk(`全部（${N.total}）`, -1));
    N.groups.forEach((g, gi) => chips.appendChild(mk(`${g.name}（${g.items.length}）`, gi)));
    body.appendChild(chips);

    const grid = h(`<div class="notes-grid"></div>`);
    body.appendChild(grid);

    function paint(gi) {
      grid.innerHTML = '';
      flat = [];
      const list = gi === -1 ? N.groups.flatMap(g => g.items.map(it => ({ ...it, g: g.name })))
                             : N.groups[gi].items.map(it => ({ ...it, g: N.groups[gi].name }));
      list.forEach((it) => {
        const idx = flat.length;
        flat.push(it);
        const cell = h(`<button class="ncell" title="${esc(it.t)}">
          <img loading="lazy" src="${esc(it.s)}" alt="${esc(it.t)}">
          <span class="ncap">${esc(it.t)}</span>
        </button>`);
        cell.onclick = () => openLightbox(idx);
        grid.appendChild(cell);
      });
    }
    paint(-1);
  }

  global.NOTES_VIEW = { render, closeLightbox };
})(window);
