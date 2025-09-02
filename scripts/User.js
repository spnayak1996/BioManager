export class User {
  /**
   * @param {object} o
   * @param {string} o.id
   * @param {string} o.userName
   * @param {string} o.email
   * @param {"admin"|"user"} o.role
   * @param {"active"|"inactive"|"compliance"} o.status
   * @param {Date|string} o.createdAt
   */
  constructor(o) {
    this.id = o.id;
    this.userName = o.userName;
    this.email = o.email;
    this.role = o.role;
    this.status = o.status;
    this.createdAt = o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt);
  }

  get createdLabel() {
    const m = String(this.createdAt.getMonth() + 1).padStart(2, "0");
    const d = String(this.createdAt.getDate()).padStart(2, "0");
    const y = this.createdAt.getFullYear();
    return `${m}/${d}/${y}`;
  }

  static all() {
    return User.DATA.map(d => new User(d));
  }
}

// Demo seed data — adjust as needed
User.DATA = [
  { id: "1", userName: "Ada Lovelace",  email: "ada@acme.io",   role: "admin", status: "active",     createdAt: "2024-11-12" },
  { id: "2", userName: "Grace Hopper",  email: "grace@acme.io", role: "user",  status: "inactive",   createdAt: "2025-01-07" },
  // { id: "3", userName: "Alan Turing",   email: "alan@acme.io",  role: "user",  status: "compliance", createdAt: "2025-02-15" },
];
