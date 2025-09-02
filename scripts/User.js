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

  // ---------- Storage ----------
  static get STORAGE_KEY() { return "bm_users"; }

  static _loadRaw() {
    const json = localStorage.getItem(User.STORAGE_KEY);
    if (json) {
      try { return JSON.parse(json); } catch { /* fall through */ }
    }
    // seed on first run
    const seed = [
      { id: "u1", userName: "Achal Aggarwal",  email: "achal@bornwest.com",   role: "admin", status: "active",     createdAt: "2025-07-14" },
      { id: "u2", userName: "Prateek Sharma",  email: "prateek@bornwest.com", role: "user",  status: "active",     createdAt: "2025-07-07" },
      { id: "u3", userName: "Himalaya Rajput", email: "himalaya@bornwest.com",role: "user",  status: "compliance", createdAt: "2025-08-01" },
      { id: "u4", userName: "Sumit Raj",       email: "sumit@bornwest.com",   role: "user",  status: "inactive",   createdAt: "2025-08-14" },
    ];
    localStorage.setItem(User.STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  static _saveRaw(arr) {
    localStorage.setItem(User.STORAGE_KEY, JSON.stringify(arr));
  }

  static all() {
    return User._loadRaw().map(o => new User(o));
  }

  static findById(id) {
    const raw = User._loadRaw();
    const obj = raw.find(r => r.id === id);
    return obj ? new User(obj) : null;
  }

  static existsEmail(email) {
    const raw = User._loadRaw();
    const needle = (email || "").trim().toLowerCase();
    return raw.some(r => (r.email || "").toLowerCase() === needle);
  }

  static create(o) {
    const raw = User._loadRaw();
    const id = (globalThis.crypto?.randomUUID?.() || `u_${Date.now()}_${Math.random().toString(36).slice(2,8)}`);
    const rec = {
      id,
      userName: o.userName,
      email: o.email,
      role: o.role,
      status: o.status,
      createdAt: (o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt)).toISOString(),
    };
    raw.push(rec);
    User._saveRaw(raw);
    return new User(rec);
  }

  static update(id, patch) {
    const raw = User._loadRaw();
    const idx = raw.findIndex(r => r.id === id);
    if (idx === -1) return null;
    const merged = { ...raw[idx], ...patch };
    raw[idx] = merged;
    User._saveRaw(raw);
    return new User(merged);
  }

  static remove(id) {
    const raw = User._loadRaw();
    const next = raw.filter(r => r.id !== id);
    User._saveRaw(next);
  }

  static emailInUse(email, excludeId = null) {
  const raw = User._loadRaw();
  const needle = (email || "").trim().toLowerCase();
  return raw.some(r => r.id !== excludeId && (r.email || "").toLowerCase() === needle);
}
}
