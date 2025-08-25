const links = document.querySelectorAll(".nav-link");
const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");
const pageContent = document.getElementById("page-content");
const exportBtn = document.getElementById("export-csv");
const logoutBtn = document.getElementById("user-logout");

const statusImages = {
  "Submitted": "icons/clock.svg",
  "Ready for Review" : "icons/circle-alert.svg",
  "Approved": "icons/circle-check.svg",
  "Live": "icons/building.svg"
};

const statusTileMeta = {
  total:     { label: "Total Bios",       icon: "icons/file-text.svg",    color: "#1f2937", border: "#d1d5db" },
  submitted: { label: "Submitted",        icon: "icons/clock.svg",        color: "#92400e", border: "#ffd699" },
  inReview:  { label: "In Review",        icon: "icons/circle-alert.svg", color: "#075985", border: "#93c5fd" },
  approved:  { label: "Approved",         icon: "icons/circle-check.svg", color: "#166534", border: "#86efac" },
  live:      { label: "Live",             icon: "icons/building.svg",     color: "#5b21b6", border: "#c4b5fd" }
};

links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    links.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    const section = link.getAttribute("href").replace("#", "");
    updatePage(section);
  });
});

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
      pageContent.innerHTML = `<div class="card">Coming Soon...</div>`;
  }
}

class Bio {
  /**
   * @param {object} o
   * @param {string} o.id
   * @param {string} o.name
   * @param {string} o.email
   * @param {"Submitted"|"Ready for Review"|"Approved"|"Live"} o.status
   * @param {Date|string} o.created
   * @param {string} o.reviewInfo
   */
  constructor(o) {
    this.id = o.id;
    this.name = o.name;
    this.email = o.email;
    this.status = o.status;
    this.created = o.created instanceof Date ? o.created : new Date(o.created);
    this.reviewInfo = o.status == "Submitted" || o.status == "Ready for Review" ? "Not reviewed" : "Reviewed";
  }

  get createdLabel() {
    const m = String(this.created.getMonth() + 1).padStart(2, "0");
    const d = String(this.created.getDate()).padStart(2, "0");
    const y = this.created.getFullYear();
    return `${m}/${d}/${y}`;
  }
}

//Edit this array to simulate dynamic data
let bios = [
  new Bio({
    id: "1",
    name: "Achal Aggarwal",
    email: "achal@bornwest.com",
    status: "Live",
    created: "2025-07-14",
  }),
  new Bio({
    id: "2",
    name: "Prateek Sharma",
    email: "prateek@bornwest.com",
    status: "Approved",
    created: "2025-07-07",
  }),
  new Bio({
    id: "3",
    name: "Himalaya Rajput",
    email: "himalaya@bornwest.com",
    status: "Ready for Review",
    created: "2025-08-01",
  }),
  new Bio({
    id: "3",
    name: "Sumit Raj",
    email: "sumit@bornwest.com",
    status: "Submitted",
    created: "2025-08-14",
  })
];

const statusChipClass = {
  "Submitted": "submitted",
  "Ready for Review": "review",
  "Approved": "approved",
  "Live": "live",
};

function computeStats(list) {
  const total = list.length;
  const submitted = list.filter(b => b.status === "Submitted").length;
  const inReview = list.filter(b => b.status === "Ready for Review").length;
  const approved = list.filter(b => b.status === "Approved").length;
  const live = list.filter(b => b.status === "Live").length;
  return { total, submitted, inReview, approved, live };
}

function renderStatsGrid({ total, submitted, inReview, approved, live }) {
  const tiles = [
    { key: "total",     value: total,     meta: { label: "Total Bios",    icon: "icons/file-text.svg",    color: "#1f2937", border: "#d1d5db" } },
    { key: "submitted", value: submitted, meta: { label: "Submitted",     icon: "icons/clock.svg",        color: "#92400e", border: "#ffd699" } },
    { key: "inReview",  value: inReview,  meta: { label: "In Review",     icon: "icons/circle-alert.svg", color: "#075985", border: "#93c5fd" } },
    { key: "approved",  value: approved,  meta: { label: "Approved",      icon: "icons/circle-check.svg", color: "#166534", border: "#86efac" } },
    { key: "live",      value: live,      meta: { label: "Live",          icon: "icons/building.svg",     color: "#5b21b6", border: "#c4b5fd" } }
  ];

  return `
    <div class="stats">
      ${tiles.map(t => `
        <div class="stat stat--tab tab-${t.key}"
             style="border:1px solid ${t.meta.border}; color:${t.meta.color}">
          <div class="stat-head">
            <img src="${t.meta.icon}" alt="${t.meta.label}" class="stat-icon" />
            <span class="stat-label-text">${t.meta.label}</span>
          </div>
          <div class="stat-value">${t.value}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderTableRows(list) {
  if (list.length === 0) {
    return `<tr><td colspan="5" style="color:#6b7280;">No results</td></tr>`;
  }

  return list.map(b => {
    const imgSrc = statusImages[b.status] || "icons/settings.svg";
    return `
      <tr data-id="${b.id}">
        <td>${b.name}<br><small>${b.email}</small></td>
        <td>
          <span class="status ${statusChipClass[b.status]}">
            <img src="${imgSrc}" alt="${b.status}" class="status-icon">
            ${b.status}
          </span>
        </td>
        <td>${b.createdLabel}</td>
        <td>${b.reviewInfo}</td>
        <td>
          <button class="view-btn">
            <img src="icons/eye.svg" alt="View" class="view-icon" />
            View
          </button>
        </td>
      </tr>
    `;
  }).join("");
}


function renderAllBios() {
  const stats = computeStats(bios);

  pageContent.innerHTML = `
    <div class="stats-wrapper" id="stats-root">
      ${renderStatsGrid(stats)}
    </div>

    <div class="card" id="search">
      <div class="search-row">
        <div class="search-input-wrap">
          <img src="icons/search.svg" class="search-ico" alt="" />
          <input id="bio-search" type="text" placeholder="Search bios..." />
        </div>

        <div class="select-wrap">
          <select id="bio-status" aria-label="Filter by status">
            <option value="All Status">All Status</option>
            <option value="Submitted">Submitted</option>
            <option value="Ready for Review">In Review</option>
            <option value="Approved">Approved</option>
            <option value="Live">Live</option>
          </select>
          <img src="icons/chevron-down.svg" class="select-caret" alt="" />
        </div>
      </div>
    </div>

    <div class="card" id="bios_table">
      <div class="table-header">
        <h2 class="table-title">Bios (<span id="bios-count">${bios.length}</span>)</h2>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Status</th>
            <th>Created</th>
            <th>Review Info</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="bios-tbody">
          ${renderTableRows(bios)}
        </tbody>
      </table>
    </div>
  `;

  const search = document.getElementById("bio-search");
  const select = document.getElementById("bio-status");
  const tbody  = document.getElementById("bios-tbody");

  function applyFilters() {
    const q = search.value.trim().toLowerCase();
    const status = select.value;

    const filtered = bios.filter(b => {
      const matchesText = !q || b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q);
      const matchesStatus = status === "All Status" || b.status === status;
      return matchesText && matchesStatus;
    });

    // keep stat tiles as-is (whole dataset)
    const s = computeStats(bios);
    document.getElementById("stats-root").innerHTML = renderStatsGrid(s);

    // update table rows
    tbody.innerHTML = renderTableRows(filtered);

    // 🔹 update the count to reflect *filtered* rows
    const countEl = document.getElementById("bios-count");
    if (countEl) countEl.textContent = filtered.length;
  }

  search.addEventListener("input", applyFilters);
  select.addEventListener("change", applyFilters);
}


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

updatePage("all-bios");
