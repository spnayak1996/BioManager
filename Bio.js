export class Bio {
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

  static all() {
    return Bio.DATA.map((d) => new Bio(d));
  }
}

Bio.DATA = [
  { id: "1", name: "Achal Aggarwal",  email: "achal@bornwest.com",   status: "Live",              created: "2025-07-14" },
  { id: "2", name: "Prateek Sharma",  email: "prateek@bornwest.com", status: "Approved",          created: "2025-07-07" },
  { id: "3", name: "Himalaya Rajput", email: "himalaya@bornwest.com",status: "Ready for Review",  created: "2025-08-01" },
  { id: "4", name: "Sumit Raj",       email: "sumit@bornwest.com",   status: "Submitted",         created: "2025-08-14" },
];