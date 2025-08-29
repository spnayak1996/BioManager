// BioManager_script.js — hide list headers when there are no bios
import { Bio } from "./Bio.js";

// ---------- DOM refs ----------
const links = document.querySelectorAll(".nav-link");
const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");
const pageContent = document.getElementById("page-content");
const exportBtn = document.getElementById("export-csv");
const logoutBtn = document.getElementById("user-logout");

// ---------- Templates ----------
const $ = (id) => document.getElementById(id);
const tplStatsWrapper = $("stats-wrapper-template");
const tplStatsTile = $("stats-tile-template");
const tplSearchCard = $("search-card-template");
const tplBiosList = $("bios-list-template");
const tplBioItem  = $("bio-item-template");
const tplComingSoon = $("coming-soon-template");

const clone = (tpl) => tpl.content.firstElementChild.cloneNode(true);

// ---------- Data / constants ----------
const statusImages = {
  "Submitted": "icons/clock.svg",
  "Ready for Review": "icons/circle-alert.svg",
  "Approved": "icons/circle-check.svg",
  "Live": "icons/building.svg",
};

const statusChipClass = {
  "Submitted": "submitted",
  "Ready for Review": "review",
  "Approved": "approved",
  "Live": "live",
};

const tileMeta = {
  total:     { label: "Total Bios",       icon: "icons/file-text.svg",    color: "#1f2937", border: "#d1d5db" },
  submitted: { label: "Submitted",        icon: "icons/clock.svg",        color: "#92400e", border: "#ffd699" },
  inReview:  { label: "In Review",        icon: "icons/circle-alert.svg", color: "#075985", border: "#93c5fd" },
  approved:  { label: "Approved",         icon: "icons/circle-check.svg", color: "#166534", border: "#86efac" },
  live:      { label: "Live",             icon: "icons/building.svg",     color: "#5b21b6", border: "#c4b5fd" },
};

// ---------- Helpers ----------
function computeStats(list) {
  const total = list.length;
  const submitted = list.filter(b => b.status === "Submitted").length;
  const inReview = list.filter(b => b.status === "Ready for Review").length;
  const approved = list.filter(b => b.status === "Approved").length;
  const live = list.filter(b => b.status === "Live").length;
  return { total, submitted, inReview, approved, live };
}

function buildStats(stats) {
  const wrapper = clone(tplStatsWrapper);
  const container = wrapper.querySelector(".stats");

  const order = [
    ["total", stats.total],
    ["submitted", stats.submitted],
    ["inReview", stats.inReview],
    ["approved", stats.approved],
    ["live", stats.live],
  ];

  for (const [key, value] of order) {
    const meta = tileMeta[key];
    const tile = clone(tplStatsTile);
    tile.dataset.key = key;
    tile.classList.add(`tab-${key}`);
    tile.style.border = `1px solid ${meta.border}`;
    tile.style.color = meta.color;

    const icon = tile.querySelector(".stat-icon");
    const label = tile.querySelector(".stat-label-text");
    const val = tile.querySelector(".stat-value");

    icon.src = meta.icon;
    icon.alt = meta.label;
    label.textContent = meta.label;
    val.textContent = value;

    container.appendChild(tile);
  }
  return wrapper;
}

function updateStatsCounts(wrapper, stats) {
  const map = {
    total: stats.total,
    submitted: stats.submitted,
    inReview: stats.inReview,
    approved: stats.approved,
    live: stats.live,
  };
  wrapper.querySelectorAll(".stat").forEach(tile => {
    const key = tile.dataset.key;
    const val = tile.querySelector(".stat-value");
    if (val && key in map) val.textContent = map[key];
  });
}

function buildSearchCard() {
  return clone(tplSearchCard);
}

function buildItem(bio) {
  const row = clone(tplBioItem);
  row.dataset.id = bio.id;

  row.querySelector(".js-name").textContent  = bio.name;
  row.querySelector(".js-email").textContent = bio.email;

  const statusWrap = row.querySelector(".status");
  statusWrap.classList.add(statusChipClass[bio.status] || "");

  const ico = row.querySelector(".status-icon");
  ico.src = statusImages[bio.status] || "icons/settings.svg";
  ico.alt = bio.status;

  row.querySelector(".js-status-text").textContent = bio.status;
  row.querySelector(".js-created").textContent     = bio.createdLabel;
  row.querySelector(".js-review-info").textContent = bio.reviewInfo;

  return row;
}

function buildList(list) {
  const card   = clone(tplBiosList);
  const head   = card.querySelector(".bios-head");          // <-- header row
  const listEl = card.querySelector(".js-bios-list");
  const count  = card.querySelector("#bios-count");
  count.textContent = String(list.length);

  if (list.length === 0) {
    // hide the list headers when there’s nothing to show
    if (head) head.style.display = "none";

    const empty = document.createElement("div");
    empty.className = "bios-row bios-grid";
    const span = document.createElement("span");
    span.textContent = "No results";
    span.style.color = "#6b7280";
    span.style.gridColumn = "1 / -1"; // span all columns
    empty.appendChild(span);
    listEl.appendChild(empty);
  } else {
    if (head) head.style.display = ""; // ensure visible when items exist
    const frag = document.createDocumentFragment();
    for (const b of list) frag.appendChild(buildItem(b));
    listEl.appendChild(frag);
  }

  return card;
}

// ---------- Page rendering ----------
function renderAllBios() {
  const bios  = Bio.all();
  const stats = computeStats(bios);

  const statsEl = buildStats(stats);
  const searchEl = buildSearchCard();
  const listEl   = buildList(bios);

  pageContent.replaceChildren(statsEl, searchEl, listEl);

  const search   = searchEl.querySelector("#bio-search");
  const select   = searchEl.querySelector("#bio-status");
  const rowsWrap = listEl.querySelector(".js-bios-list");
  const countEl  = listEl.querySelector("#bios-count");
  const head     = listEl.querySelector(".bios-head"); // header element to toggle

  function applyFilters() {
    const q = (search.value || "").trim().toLowerCase();
    const status = select.value;

    const filtered = bios.filter(b => {
      const matchesText =
        !q || b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q);
      const matchesStatus = status === "All Status" || b.status === status;
      return matchesText && matchesStatus;
    });

    updateStatsCounts(statsEl, computeStats(bios));

    // toggle header visibility based on results
    if (head) head.style.display = filtered.length ? "" : "none";

    // re-render rows
    rowsWrap.replaceChildren();
    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "bios-row bios-grid";
      const span = document.createElement("span");
      span.textContent = "No results";
      span.style.color = "#6b7280";
      span.style.gridColumn = "1 / -1";
      empty.appendChild(span);
      rowsWrap.appendChild(empty);
    } else {
      const frag = document.createDocumentFragment();
      for (const b of filtered) frag.appendChild(buildItem(b));
      rowsWrap.appendChild(frag);
    }

    countEl.textContent = String(filtered.length);
  }

  search.addEventListener("input", applyFilters);
  select.addEventListener("change", applyFilters);
}

function renderComingSoon() {
  pageContent.replaceChildren(clone(tplComingSoon));
}

function updatePage(section) {
  switch (section) {
    case "all-bios":
      pageTitle.textContent = "All Bios";
      pageSubtitle.textContent = "Overview of all employee bio submissions";
      renderAllBios();
      break;
    default:
      pageTitle.textContent = section.replace("-", " ").toUpperCase();
      pageSubtitle.textContent = "";
      renderComingSoon();
  }
}

// ---------- Nav + buttons ----------
links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    links.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    const section = link.getAttribute("href").replace("#", "");
    updatePage(section);
  });
});

if (exportBtn) {
  exportBtn.onclick = () => {
    console.log("Export CSV button tapped!");
    alert("Export CSV button tapped!");
  };
}

if (logoutBtn) {
  logoutBtn.onclick = () => {
    console.log("logout button tapped!");
    alert("logout button tapped!");
  };
}

// ---------- Boot ----------
window.addEventListener("load", () => updatePage("all-bios"));
