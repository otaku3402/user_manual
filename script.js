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

  const idMap = new Map();
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
    h.style.scrollMarginTop = '84px';
  });

  tocEl.innerHTML = '';
  tocEl.appendChild(list);

  // 현재 섹션 하이라이트
  const links = Array.from(tocEl.querySelectorAll('a'));
  const map = new Map();
  headings.forEach((h, i) => map.set(h.id, links[i]));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      links.forEach(l => l.classList.remove('active'));
      const link = map.get(id);
      if (link) link.classList.add('active');
    });
  }, { rootMargin: '0px 0px -70% 0px', threshold: 0.01 });

  headings.forEach(h => io.observe(h));

  // 초기 활성화 상태 설정
  if (links[0]) links[0].classList.add('active');

  // 앵커 클릭 시 부드러운 스크롤 + 주소 해시 유지
  links.forEach(a => {
    a.addEventListener('click', (ev) => {
      // 기본 동작으로도 smooth 적용되지만, 일부 브라우저 대응
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        ev.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', '#' + id);
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
