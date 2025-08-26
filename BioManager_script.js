// BioManager_script.js (refactored to use templates; no embedded HTML strings)
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
const tplBiosTable = $("bios-table-template");
const tplBioRow = $("bio-row-template");
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

function buildRow(bio) {
  const tr = clone(tplBioRow);
  tr.dataset.id = bio.id;

  tr.querySelector(".js-name").textContent = bio.name;
  tr.querySelector(".js-email").textContent = bio.email;

  const statusWrap = tr.querySelector(".status");
  statusWrap.classList.add(statusChipClass[bio.status] || "");

  const ico = tr.querySelector(".status-icon");
  ico.src = statusImages[bio.status] || "icons/settings.svg";
  ico.alt = bio.status;

  tr.querySelector(".js-status-text").textContent = bio.status;
  tr.querySelector(".js-created").textContent = bio.createdLabel;
  tr.querySelector(".js-review-info").textContent = bio.reviewInfo;

  return tr;
}

function buildTable(list) {
  const card = clone(tplBiosTable);
  const tbody = card.querySelector(".js-bios-tbody");
  const count = card.querySelector("#bios-count");
  count.textContent = String(list.length);

  const frag = document.createDocumentFragment();
  if (list.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.style.color = "#6b7280";
    td.textContent = "No results";
    tr.appendChild(td);
    frag.appendChild(tr);
  } else {
    for (const b of list) frag.appendChild(buildRow(b));
  }

  tbody.appendChild(frag);
  return card;
}

// ---------- Page rendering ----------
function renderAllBios() {
  const bios = Bio.all();
  const stats = computeStats(bios);

  const statsEl = buildStats(stats);
  const searchEl = buildSearchCard();
  const tableEl = buildTable(bios);

  pageContent.replaceChildren(statsEl, searchEl, tableEl);

  const search = searchEl.querySelector("#bio-search");
  const select = searchEl.querySelector("#bio-status");
  const tbody = tableEl.querySelector(".js-bios-tbody");
  const countEl = tableEl.querySelector("#bios-count");

  function applyFilters() {
    const q = (search.value || "").trim().toLowerCase();
    const status = select.value;

    const filtered = bios.filter(b => {
      const matchesText = !q || b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q);
      const matchesStatus = status === "All Status" || b.status === status;
      return matchesText && matchesStatus;
    });

    // stats reflect the full dataset (unchanged), but keep values in sync anyway
    updateStatsCounts(statsEl, computeStats(bios));

    // update rows
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
    if (filtered.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.style.color = "#6b7280";
      td.textContent = "No results";
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      const frag = document.createDocumentFragment();
      for (const b of filtered) frag.appendChild(buildRow(b));
      tbody.appendChild(frag);
    }

    // update count to reflect filtered rows
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
