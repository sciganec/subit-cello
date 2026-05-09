const chapters = [
  {
    id: "history",
    file: "history.md",
    title: "Історія",
    description: "Від ранніх басових інструментів до сучасної глобальної екосистеми віолончелі.",
  },
  {
    id: "organology",
    file: "organology.md",
    title: "Будова і акустика",
    description: "Корпус, душа, підставка, струни, смичок, регістри, тембр і тілесність гри.",
  },
  {
    id: "composers",
    file: "composers-and-works.md",
    title: "Композитори і твори",
    description: "Канон віолончельного репертуару від Баха до модерного і сучасного корпусу.",
  },
  {
    id: "schools",
    file: "schools.md",
    title: "Виконавські школи",
    description: "Національні та педагогічні лінії, що формують школу звуку і смаку.",
  },
  {
    id: "orchestra",
    file: "orchestra.md",
    title: "В оркестрі",
    description: "Бас, мелодичний центр, гармонічне тіло і солістична присутність.",
  },
  {
    id: "chamber",
    file: "chamber-music.md",
    title: "Камерна музика",
    description: "Соната, квартет, тріо й мистецтво ансамблевого діалогу.",
  },
  {
    id: "modern",
    file: "modern-styles.md",
    title: "Сучасні стилі",
    description: "Кросовер, кіно, електрична віолончель, цифрові медіа і нові контексти.",
  },
  {
    id: "cellists",
    file: "cellists.md",
    title: "Віолончелісти",
    description: "Постаті, які змінили історію інструмента через звук, смак і присутність.",
  },
  {
    id: "pedagogy",
    file: "pedagogy.md",
    title: "Педагогіка",
    description: "Навчальний канон, школа тіла, етика звуку і передача традиції.",
  },
  {
    id: "diskography",
    file: "diskography.md",
    title: "Дискографія",
    description: "Запис як архів інтерпретацій, пам'ять шкіл і друга історія віолончелі.",
  },
  {
    id: "extended-techniques",
    file: "extended-techniques.md",
    title: "Extended Techniques",
    description: "Розширені техніки як лабораторія майбутнього звуку.",
  },
];

const chapterNav = document.querySelector("#chapter-nav");
const readerTitle = document.querySelector("#reader-title");
const readerMeta = document.querySelector("#reader-meta");
const readerContent = document.querySelector("#reader-content");
const matrixGrid = document.querySelector("#matrix-grid");
const matrixSearch = document.querySelector("#matrix-search");
const seasonFilter = document.querySelector("#season-filter");

let matrixEntries = [];
let currentSeason = "ALL";

function renderNav() {
  chapterNav.innerHTML = chapters
    .map(
      (chapter) => `
        <a class="chapter-link" href="#chapter/${chapter.id}" data-chapter-id="${chapter.id}">
          <strong>${chapter.title}</strong>
          <span>${chapter.description}</span>
        </a>
      `
    )
    .join("");
}

function setActiveLink(chapterId) {
  document.querySelectorAll(".chapter-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.chapterId === chapterId);
  });
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const html = [];
  let inUl = false;
  let inOl = false;

  const closeUl = () => {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
  };

  const closeOl = () => {
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }
  };

  const closeLists = () => {
    closeUl();
    closeOl();
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      closeLists();
      continue;
    }

    if (line.startsWith("# ")) {
      closeLists();
      html.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith("## ")) {
      closeLists();
      html.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith("### ")) {
      closeLists();
      html.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith("- ")) {
      closeOl();
      if (!inUl) {
        html.push("<ul>");
        inUl = true;
      }
      html.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      continue;
    }

    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      closeUl();
      if (!inOl) {
        html.push("<ol>");
        inOl = true;
      }
      html.push(`<li>${inlineMarkdown(olMatch[1])}</li>`);
      continue;
    }

    closeLists();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  closeLists();
  return `<div class="rendered-markdown">${html.join("")}</div>`;
}

function inlineMarkdown(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

async function loadChapter(chapterId) {
  const chapter = chapters.find((item) => item.id === chapterId) || chapters[0];
  setActiveLink(chapter.id);
  readerTitle.textContent = chapter.title;
  readerMeta.textContent = chapter.description;
  readerContent.innerHTML = `
    <div class="empty-state">
      <h3>Завантажую розділ</h3>
      <p>Підтягуються локальні матеріали з репозиторію.</p>
    </div>
  `;

  try {
    const response = await fetch(chapter.file);
    const text = await response.text();
    readerContent.innerHTML = markdownToHtml(text);
  } catch (error) {
    readerContent.innerHTML = `
      <div class="empty-state">
        <h3>Не вдалося відкрити розділ</h3>
        <p>Найкраще запускати цей атлас через локальний сервер, а не напряму як <code>file://</code>.</p>
      </div>
    `;
  }
}

async function loadMatrix() {
  try {
    const response = await fetch("CELLO_SUBIT_MATRIX.md");
    const text = await response.text();
    matrixEntries = parseMatrixEntries(text);
    renderSeasonFilter();
    renderMatrix();
  } catch (error) {
    matrixGrid.innerHTML = `
      <div class="empty-state">
        <h3>Матриця недоступна</h3>
        <p>Щоб інтерактивна матриця працювала, відкрийте додаток через локальний HTTP-сервер.</p>
      </div>
    `;
  }
}

function parseMatrixEntries(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const entries = [];
  let currentSeasonName = "";

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("## ")) {
      currentSeasonName = trimmed.replace("## ", "").trim();
      continue;
    }

    const match = trimmed.match(/^(\d+)\.\s+`([^`]+)`:\s+(.+)$/);
    if (!match) continue;

    entries.push({
      index: Number(match[1]),
      label: match[2],
      text: match[3],
      season: currentSeasonName,
    });
  }

  return entries;
}

function renderSeasonFilter() {
  const seasons = ["ALL", ...new Set(matrixEntries.map((entry) => entry.season))];
  seasonFilter.innerHTML = seasons
    .map(
      (season) => `
        <button class="season-chip ${season === currentSeason ? "active" : ""}" data-season="${season}">
          ${season === "ALL" ? "Усі сезони" : season}
        </button>
      `
    )
    .join("");

  seasonFilter.querySelectorAll(".season-chip").forEach((button) => {
    button.addEventListener("click", () => {
      currentSeason = button.dataset.season;
      renderSeasonFilter();
      renderMatrix();
    });
  });
}

function renderMatrix() {
  const query = matrixSearch.value.trim().toLowerCase();
  const filtered = matrixEntries.filter((entry) => {
    const matchesSeason = currentSeason === "ALL" || entry.season === currentSeason;
    const haystack = `${entry.label} ${entry.text} ${entry.season}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesSeason && matchesQuery;
  });

  matrixGrid.innerHTML = filtered
    .map(
      (entry, idx) => `
        <article class="matrix-card" style="animation-delay:${idx * 20}ms">
          <span class="season-tag">${entry.season}</span>
          <h3>${entry.index}. ${entry.label}</h3>
          <p>${entry.text}</p>
        </article>
      `
    )
    .join("");

  if (!filtered.length) {
    matrixGrid.innerHTML = `
      <div class="empty-state">
        <h3>Нічого не знайдено</h3>
        <p>Спробуйте інший термін або поверніться до ширшого сезону матриці.</p>
      </div>
    `;
  }
}

function onHashChange() {
  const hash = window.location.hash || "#chapter/history";
  const match = hash.match(/^#chapter\/(.+)$/);
  if (match) {
    loadChapter(match[1]);
  }
}

matrixSearch.addEventListener("input", renderMatrix);
window.addEventListener("hashchange", onHashChange);

renderNav();
loadMatrix();
onHashChange();
