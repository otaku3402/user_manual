// 날짜 표기
(function() {
  const d = new Date();
  const fmt = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  const last = document.getElementById('lastUpdated');
  if (last) last.textContent = fmt;
  const year = document.getElementById('year');
  if (year) year.textContent = String(d.getFullYear());
})();

// ID 슬러그 생성
function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s\t\n]+/g, '-')
    .replace(/[^a-z0-9\-가-힣_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// 목차 생성 및 스크롤 스파이
(function buildTOC() {
  const content = document.getElementById('content');
  const tocEl = document.getElementById('toc');
  if (!content || !tocEl) return;

  const headings = Array.from(content.querySelectorAll('h2, h3'));
  const list = document.createElement('ul');

  const SCROLL_OFFSET = 84;

  function ensureId(h) {
    if (h.id) return h.id;
    let base = slugify(h.textContent || 'section');
    let id = base || 'section';
    let i = 2;
    while (document.getElementById(id)) {
      id = base + '-' + i++;
    }
    h.id = id;
    return id;
  }

  headings.forEach(h => {
    const id = ensureId(h);
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + id;
    a.textContent = h.textContent || '';
    a.className = h.tagName === 'H2' ? 'level-2' : 'level-3';
    li.appendChild(a);
    list.appendChild(li);
    // 스크롤 여백(앵커 상단 여백) 적용
    h.style.scrollMarginTop = SCROLL_OFFSET + 'px';
  });

  tocEl.innerHTML = '';
  tocEl.appendChild(list);

  // 현재 섹션 하이라이트
  const links = Array.from(tocEl.querySelectorAll('a'));
  const linkMap = new Map();
  headings.forEach((h, i) => linkMap.set(h.id, links[i]));

  const OFFSET = SCROLL_OFFSET;

  function setActiveById(id) {
    links.forEach(l => l.classList.remove('active'));
    const link = linkMap.get(id);
    if (link) link.classList.add('active');
  }

  function currentHashId() {
    return location.hash ? location.hash.slice(1) : '';
  }

  function setHashAndActive(id, usePush) {
    if (!id) return;
    const current = currentHashId();
    if (current === id) {
      setActiveById(id);
      return;
    }
    const url = '#' + id;
    if (usePush) history.pushState(null, '', url);
    else history.replaceState(null, '', url);
    setActiveById(id);
  }

  function updateActiveOnScroll() {
    let bestId = null;
    let bestDelta = -Infinity;
    let nextId = null;
    let nextDelta = Infinity;

    for (const h of headings) {
      const rect = h.getBoundingClientRect();
      const delta = rect.top - OFFSET;
      if (delta <= 0 && delta > bestDelta) {
        bestDelta = delta;
        bestId = h.id;
      }
      if (delta > 0 && delta < nextDelta) {
        nextDelta = delta;
        nextId = h.id;
      }
    }

    const targetId = bestId || nextId || (headings[0] && headings[0].id);
    if (targetId) setHashAndActive(targetId, false);
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateActiveOnScroll();
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener('resize', updateActiveOnScroll);

  // 초기 활성화 상태 설정
  if (location.hash) {
    const initId = location.hash.slice(1);
    if (linkMap.has(initId)) {
      setActiveById(initId);
    } else {
      updateActiveOnScroll();
    }
  } else {
    updateActiveOnScroll();
  }
  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (id) setActiveById(id);
  });

  // 앵커 클릭 시 부드러운 스크롤 + 주소 해시 유지
  links.forEach(a => {
    a.addEventListener('click', (ev) => {
      // 기본 동작으로도 smooth 적용되지만, 일부 브라우저 대응
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        ev.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setHashAndActive(id, true);
      }
    });
  });
})();

// 맨 위로 이동 링크 보정
(function() {
  const link = document.getElementById('backToTop');
  if (!link) return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.pushState(null, '', '#');
  });
})();

// 10덕대장경 내 등급별 리스트 가나다(ko) 자동 정렬
(function sortAnimeLists() {
  // 대상: #content 하위의 details.toggle 중 직접 자식으로 <ol>을 가진 요소들(S/A/B/C/D)
  const lists = document.querySelectorAll('#content details.toggle > ol');
  if (!lists.length) return;

  const collator = new Intl.Collator('ko', { sensitivity: 'base', numeric: true });
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();

  lists.forEach((ol) => {
    const items = Array.from(ol.querySelectorAll('li'));
    items.sort((a, b) => collator.compare(norm(a.textContent), norm(b.textContent)));
    items.forEach((li) => ol.appendChild(li));
  });
})();