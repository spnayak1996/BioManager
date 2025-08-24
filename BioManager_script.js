const links = document.querySelectorAll(".nav-link");
const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");
const pageContent = document.getElementById("page-content");

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
    // mm/dd/yyyy
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

function renderStats({ total, submitted, inReview, approved, live }) {
  const tiles = [
    { key: "total",     value: total,     meta: statusTileMeta.total },
    { key: "submitted", value: submitted, meta: statusTileMeta.submitted },
    { key: "inReview",  value: inReview,  meta: statusTileMeta.inReview },
    { key: "approved",  value: approved,  meta: statusTileMeta.approved },
    { key: "live",      value: live,      meta: statusTileMeta.live }
  ];

  return `
    <div class="stats-wrapper">
      <div class="stats">
        ${tiles.map(t => `
          <div class="stat stat--tab"
               style="border:1px solid ${t.meta.border}; color:${t.meta.color}">
            <div class="stat-head">
              <img src="${t.meta.icon}" alt="${t.meta.label}" class="stat-icon" />
              <span class="stat-label-text">${t.meta.label}</span>
            </div>
            <div class="stat-value">${t.value}</div>
          </div>
        `).join("")}
      </div>
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

  // Page skeleton
  pageContent.innerHTML = `
    ${renderStats(stats)}
    <div class="card">
      <div class="search-filter">
        <input id="bio-search" type="text" placeholder="Search bios (name or email)..." />
        <select id="bio-status">
          <option value="All Status">All Status</option>
          <option value="Submitted">Submitted</option>
          <option value="Ready for Review">In Review</option>
          <option value="Approved">Approved</option>
          <option value="Live">Live</option>
        </select>
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

  // Wire filters
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

    // Update stats to reflect current full list (not filtered) — like screenshot
    // If you want stats to reflect filtered results, swap `bios` => `filtered` below:
    const s = computeStats(bios);
    pageContent.querySelector(".stats").outerHTML = renderStats(s);

    // Rows
    tbody.innerHTML = renderTableRows(filtered);
  }

  search.addEventListener("input", applyFilters);
  select.addEventListener("change", applyFilters);
}

/***********************
 * Boot
 ***********************/
updatePage("all-bios"); // default route
