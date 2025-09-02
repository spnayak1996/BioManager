// scripts/Manage-users_script.js
import { User } from "./User.js";

// DOM
const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");
const pageContent = document.getElementById("page-content");
const addBtn = document.getElementById("export-csv");

// Templates
const $ = (id) => document.getElementById(id);
const tplStatsWrapper = $("stats-wrapper-template");
const tplStatsTile = $("stats-tile-template");
const tplSearchCard = $("search-card-template");
const tplUsersList = $("users-list-template");
const tplUserItem  = $("user-item-template");
const clone = (tpl) => tpl.content.firstElementChild.cloneNode(true);

// Icons (swap to whatever you have in /icons)
const tileMeta = {
  totalUsers:    { label: "Total Users",     icon: "../icons/users.svg",        klass: "user-stat--gray"  },
  activeUsers:   { label: "Active Users",    icon: "../icons/user-check.svg", klass: "user-stat--green" },
  compliance:    { label: "Compliance Team", icon: "../icons/shield.svg",    klass: "user-stat--blue"  },
  inactiveUsers: { label: "Inactive Users",  icon: "../icons/user-x.svg",        klass: "user-stat--red"   },
};

const statusImages = {
  active: "../icons/user-check.svg",
  compliance: "../icons/shield.svg",
  inactive: "../icons/user-x.svg",
};

const statusChipClass = { active: "active", compliance: "compliance", inactive: "inactive" };

// --- Stats helpers ---
function computeUserStats(users) {
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "active").length;
  const compliance  = users.filter(u => u.status === "compliance").length;
  const inactiveUsers = users.filter(u => u.status === "inactive").length;
  return { totalUsers, activeUsers, compliance, inactiveUsers };
}

function buildStatsTiles(statsObj) {
  const wrapper = clone(tplStatsWrapper);
  const grid = wrapper.querySelector(".stats");

  ["totalUsers", "activeUsers", "compliance", "inactiveUsers"].forEach(key => {
    const meta = tileMeta[key];
    const val = statsObj[key] ?? 0;

    const tile = clone(tplStatsTile);
    tile.classList.add(meta.klass);

    const icon = tile.querySelector(".stat-icon");
    const label = tile.querySelector(".stat-label-text");
    const value = tile.querySelector(".stat-value");

    icon.src = meta.icon;
    icon.alt = meta.label;
    label.textContent = meta.label;
    value.textContent = String(val);

    grid.appendChild(tile);
  });

  return wrapper;
}

// --- List helpers ---
function buildUserItem(user) {
  const row = clone(tplUserItem);
  row.dataset.id = user.id;

  row.querySelector(".js-name").textContent  = user.userName;
  row.querySelector(".js-email").textContent = user.email;
  row.querySelector(".js-role").textContent  = capitalize(user.role);

  const statusWrap = row.querySelector(".status");
  statusWrap.classList.add(statusChipClass[user.status] || "");

  const ico = row.querySelector(".status-icon");
  ico.src = statusImages[user.status] || "../icons/settings.svg";
  ico.alt = user.status;

  row.querySelector(".js-status-text").textContent = capitalize(user.status);
  row.querySelector(".js-created").textContent     = user.createdLabel;

  return row;
}

function buildUsersList(list) {
  const card   = clone(tplUsersList);
  const head   = card.querySelector(".users-head");
  const listEl = card.querySelector(".js-users-list");
  const count  = card.querySelector("#users-count");
  count.textContent = String(list.length);

  if (list.length === 0) {
    if (head) head.style.display = "none";
    listEl.classList.add("is-empty");
    const empty = document.createElement("div");
    empty.className = "users-row users-grid empty-state";
    empty.textContent = "No results";
    listEl.appendChild(empty);
  } else {
    if (head) head.style.display = "";
    listEl.classList.remove("is-empty");
    const frag = document.createDocumentFragment();
    for (const u of list) frag.appendChild(buildUserItem(u));
    listEl.appendChild(frag);
  }

  return card;
}

// --- Page render ---
function renderManageUsers() {
  const users = User.all();
  const stats = computeUserStats(users);

  const statsEl  = buildStatsTiles(stats);
  const searchEl = clone(tplSearchCard);
  const listEl   = buildUsersList(users);

  pageContent.replaceChildren(statsEl, searchEl, listEl);

  const search   = searchEl.querySelector("#user-search");
  const select   = searchEl.querySelector("#user-status");
  const rowsWrap = listEl.querySelector(".js-users-list");
  const countEl  = listEl.querySelector("#users-count");
  const head     = listEl.querySelector(".users-head");

  function applyFilters() {
    const q = (search.value || "").trim().toLowerCase();
    const status = select.value; // "all" | "active" | "inactive" | "compliance"

    const filtered = users.filter(u => {
      const matchesText =
        !q || u.userName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesStatus = status === "all" || u.status === status;
      return matchesText && matchesStatus;
    });

    // toggle header + list
    if (head) head.style.display = filtered.length ? "" : "none";
    rowsWrap.replaceChildren();

    if (filtered.length === 0) {
      rowsWrap.classList.add("is-empty");
      const empty = document.createElement("div");
      empty.className = "users-row users-grid empty-state";
      empty.textContent = "No results";
      rowsWrap.appendChild(empty);
    } else {
      rowsWrap.classList.remove("is-empty");
      const frag = document.createDocumentFragment();
      for (const u of filtered) frag.appendChild(buildUserItem(u));
      rowsWrap.appendChild(frag);
    }

    countEl.textContent = String(filtered.length);
  }

  search.addEventListener("input", applyFilters);
  select.addEventListener("change", applyFilters);
}

// Boot
window.addEventListener("load", () => {
  pageTitle.textContent = "Manage Users";
  pageSubtitle.textContent = "Manage user accounts and permissions";
  renderManageUsers();
});

if (addBtn) addBtn.onclick = () => alert("Add User clicked");

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
