const chapters = [
  { id: "history", file: "content/history.md", title: "Історія", season: "SPRING", description: "Від ранніх басових інструментів до сучасної глобальної екосистеми віолончелі." },
  { id: "organology", file: "content/organology.md", title: "Будова і акустика", season: "SPRING", description: "Корпус, душа, підставка, струни, смичок, регістри, тембр і тілесність гри." },
  { id: "schools", file: "content/schools.md", title: "Виконавські школи", season: "SPRING", description: "Національні та педагогічні лінії, що формують школу звуку і смаку." },
  { id: "composers", file: "content/composers-and-works.md", title: "Композитори і твори", season: "SUMMER", description: "Канон віолончельного репертуару від Баха до модерного і сучасного корпусу." },
  { id: "orchestra", file: "content/orchestra.md", title: "В оркестрі", season: "SUMMER", description: "Бас, мелодичний центр, гармонічне тіло і солістична присутність." },
  { id: "chamber", file: "content/chamber-music.md", title: "Камерна музика", season: "SUMMER", description: "Соната, квартет, тріо й мистецтво ансамблевого діалогу." },
  { id: "cellists", file: "content/cellists.md", title: "Віолончелісти", season: "SUMMER", description: "Постаті, які змінили історію інструмента через звук, смак і присутність." },
  { id: "modern", file: "content/modern-styles.md", title: "Сучасні стилі", season: "AUTUMN", description: "Кросовер, кіно, електрична віолончель, цифрові медіа і нові контексти." },
  { id: "extended-techniques", file: "content/extended-techniques.md", title: "Extended Techniques", season: "AUTUMN", description: "Розширені техніки як лабораторія майбутнього звуку." },
  { id: "pedagogy", file: "content/pedagogy.md", title: "Педагогіка", season: "WINTER", description: "Навчальний канон, школа тіла, етика звуку і передача традиції." },
  { id: "diskography", file: "content/diskography.md", title: "Дискографія", season: "WINTER", description: "Запис як архів інтерпретацій, пам'ять шкіл і друга історія віолончелі." },
];

const chapterNav = document.querySelector("#chapter-nav");
const readerTitle = document.querySelector("#reader-title");
const readerMeta = document.querySelector("#reader-meta");
const readerContent = document.querySelector("#reader-content");
const readerToc = document.querySelector("#reader-toc");
const matrixGrid = document.querySelector("#matrix-grid");
const matrixSearch = document.querySelector("#matrix-search");
const seasonFilter = document.querySelector("#season-filter");
const readerControls = document.querySelector("#reader-controls");
const prevButton = document.querySelector("#prev-chapter");
const nextButton = document.querySelector("#next-chapter");
const progressBar = document.querySelector("#progress-bar");
const navBreadcrumbs = document.querySelector("#nav-breadcrumbs");

let matrixEntries = [];
let currentSeason = "ALL";

function renderNav() {
  const seasons = ["SPRING", "SUMMER", "AUTUMN", "WINTER"];
  const seasonLabels = { SPRING: "Genesis", SUMMER: "Canon", AUTUMN: "Decon", WINTER: "Reflect" };
  
  chapterNav.innerHTML = seasons.map(s => {
    const sChapters = chapters.filter(c => c.season === s);
    return `
      <div class="nav-season-group">
        <div class="mini-label" style="margin: 10px 16px 5px;">${seasonLabels[s]}</div>
        ${sChapters.map(c => `
          <a class="chapter-link" href="#chapter/${c.id}" data-chapter-id="${c.id}">
            <div class="link-title">${c.title}</div>
          </a>
        `).join("")}
      </div>
    `;
  }).join("");
}

function setActiveLink(chapterId) {
  document.querySelectorAll(".chapter-link").forEach(link => {
    const isActive = link.dataset.chapterId === chapterId;
    link.classList.toggle("active", isActive);
    if (isActive) link.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const html = [];
  let inUl = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { if(inUl) { html.push("</ul>"); inUl = false; } continue; }

    if (trimmed.startsWith("## ")) {
      const title = trimmed.slice(3);
      const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      html.push(`<h2 id="${id}">${title}</h2>`);
    } else if (trimmed.startsWith("### ")) {
      const title = trimmed.slice(4);
      const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      html.push(`<h3 id="${id}">${title}</h3>`);
    } else if (trimmed.startsWith("- ")) {
      if (!inUl) { html.push("<ul>"); inUl = true; }
      html.push(`<li>${inlineMarkdown(trimmed.slice(2))}</li>`);
    } else {
      if (inUl) { html.push("</ul>"); inUl = false; }
      html.push(`<p>${inlineMarkdown(trimmed)}</p>`);
    }
  }
  return html.join("");
}

function inlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function generateTOC() {
  const headings = readerContent.querySelectorAll("h2, h3");
  if (headings.length === 0) { readerToc.innerHTML = ""; return; }
  
  let html = `<div class="toc-title">У цій главі</div><ul class="toc-list">`;
  headings.forEach(h => {
    html += `<li class="toc-item" onclick="document.getElementById('${h.id}').scrollIntoView({behavior:'smooth'})">${h.textContent}</li>`;
  });
  html += `</ul>`;
  readerToc.innerHTML = html;
}

async function loadChapter(chapterId) {
  const chapter = chapters.find(c => c.id === chapterId) || chapters[0];
  setActiveLink(chapter.id);
  navBreadcrumbs.textContent = `Атлас / ${chapter.title}`;
  readerTitle.textContent = chapter.title;
  readerMeta.textContent = chapter.description;
  
  try {
    const res = await fetch(chapter.file);
    const text = await res.text();
    readerContent.style.opacity = 0;
    readerContent.innerHTML = markdownToHtml(text);
    generateTOC();
    updateControls(chapterId);
    setTimeout(() => { readerContent.style.transition = "opacity 0.4s"; readerContent.style.opacity = 1; }, 50);
  } catch (e) {
    readerContent.innerHTML = "<p>Помилка завантаження глави.</p>";
  }
}

function updateControls(currentId) {
  const idx = chapters.findIndex(c => c.id === currentId);
  readerControls.style.display = idx === -1 ? "none" : "flex";
  if (idx > 0) {
    prevButton.style.visibility = "visible";
    prevButton.onclick = () => window.location.hash = `#chapter/${chapters[idx-1].id}`;
    prevButton.textContent = `← ${chapters[idx-1].title}`;
  } else prevButton.style.visibility = "hidden";

  if (idx < chapters.length - 1) {
    nextButton.style.visibility = "visible";
    nextButton.onclick = () => window.location.hash = `#chapter/${chapters[idx+1].id}`;
    nextButton.textContent = `${chapters[idx+1].title} →`;
  } else nextButton.style.visibility = "hidden";
}

async function loadMatrix() {
  try {
    const res = await fetch("docs/CELLO_SUBIT_MATRIX.md");
    const text = await res.text();
    matrixEntries = parseMatrixEntries(text);
    window.matrixEntries = matrixEntries;
    renderSeasonFilter();
    renderMatrix();
  } catch (e) {}
}

function parseMatrixEntries(markdown) {
  const lines = markdown.split("\n");
  const entries = [];
  let s = "";
  for (const l of lines) {
    const t = l.trim();
    if (t.startsWith("## ")) { s = t.slice(3).trim(); continue; }
    const m = t.match(/^(\d+)\.\s+`([^`]+)`:\s+(.+)$/);
    if (m) entries.push({ index: Number(m[1]), label: m[2], text: m[3], season: s });
  }
  return entries;
}

function renderSeasonFilter() {
  const seasons = ["ALL", ...new Set(matrixEntries.map(e => e.season))];
  seasonFilter.innerHTML = seasons.map(s => `
    <button class="season-chip ${s === currentSeason ? "active" : ""}" onclick="setSeason('${s}')">
      ${s === "ALL" ? "Усі сезони" : s}
    </button>
  `).join("");
}

window.setSeason = (s) => { currentSeason = s; renderSeasonFilter(); renderMatrix(); };

function renderMatrix() {
  const query = matrixSearch.value.trim().toLowerCase();
  const filteredMatrix = matrixEntries.filter(e => (currentSeason === "ALL" || e.season === currentSeason) && (!query || `${e.label} ${e.text}`.toLowerCase().includes(query)));
  const matchedChapters = query.length > 2 ? chapters.filter(c => c.title.toLowerCase().includes(query) || c.description.toLowerCase().includes(query)) : [];

  let html = "";
  if (matchedChapters.length > 0) {
    html += `<div class="mini-label" style="grid-column: 1/-1; margin: 20px 0 10px;">Знайдено в главах</div>`;
    html += matchedChapters.map(c => `
      <article class="matrix-card" onclick="openChapter('${c.id}')" style="border-color:var(--accent)">
        <h3>${c.title}</h3>
        <p>${c.description}</p>
      </article>
    `).join("");
    html += `<div class="mini-label" style="grid-column: 1/-1; margin: 40px 0 10px;">Матриця SUBIT</div>`;
  }

  html += filteredMatrix.map(e => `
    <article class="matrix-card" onclick="openChapter('history')">
      <span class="season-tag">${e.season}</span>
      <h3>${e.index}. ${e.label}</h3>
      <p>${e.text}</p>
    </article>
  `).join("");

  matrixGrid.innerHTML = html || "<p>Нічого не знайдено.</p>";
}

function openChapter(id) { window.location.hash = `#chapter/${id}`; window.scrollTo({top:0, behavior:'smooth'}); }
window.openChapterFromMatrix = openChapter;

function onHashChange() {
  const m = (window.location.hash || "#chapter/history").match(/^#chapter\/(.+)$/);
  if (m) loadChapter(m[1]);
}

window.addEventListener("scroll", () => {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  progressBar.style.width = scrolled + "%";
});

matrixSearch.addEventListener("input", renderMatrix);
window.addEventListener("hashchange", onHashChange);
window.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); matrixSearch.focus(); matrixSearch.scrollIntoView({behavior:'smooth', block:'center'}); } });

window.toggleReadingMode = () => {
  document.body.classList.toggle("reading-mode");
  const btn = document.getElementById("reading-mode-btn");
  const isZen = document.body.classList.contains("reading-mode");
  btn.innerHTML = isZen ? `<span class="icon">🏠</span>` : `<span class="icon">📖</span>`;
  btn.title = isZen ? "Вийти з режиму читання" : "Режим читання (Zen Mode)";
  if (isZen) document.getElementById("reader").scrollIntoView({ behavior: "smooth" });
};

renderNav();
loadMatrix();
onHashChange();
