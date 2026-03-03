/* =========================================================
   AUTH CORE (Demo-ready + easy API hookup)
   - Theme switcher (cyber/pink/acid) persisted in localStorage (neo_theme)
   - Demo user store in localStorage (neo_users)
   - Session store in localStorage (neo_session)
   - Verify + Reset flows (tokens)
   - Guard for dashboard
   ========================================================= */

const Auth = (() => {
  const KEYS = {
    theme: "neo_theme",
    users: "neo_users",
    session: "neo_session",
    verify: "neo_verify_tokens",
    reset: "neo_reset_tokens",
  };

  const CONFIG = {
    mode: "demo", // "demo" | "api"
    apiBase: "",  // e.g. "https://your-api.com"
    endpoints: {
      login: "/auth/login",
      register: "/auth/register",
      forgot: "/auth/forgot",
      reset: "/auth/reset",
      verify: "/auth/verify",
      me: "/auth/me",
    },
  };

  // ---------- utils ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  function uid() {
    if (crypto?.randomUUID) return crypto.randomUUID();
    return "id_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
  }

  function now() { return Date.now(); }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getParam(name) {
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }

  function setText(id, txt) {
    const el = typeof id === "string" ? $(id) : id;
    if (el) el.textContent = txt;
  }

  function toast(message, type = "info") {
    const host = $("#toastHost");
    if (!host) return alert(message);

    const colors = {
      info: "border-white/10 bg-white/10",
      success: "border-white/10 bg-white/10",
      error: "border-white/10 bg-white/10",
      warn: "border-white/10 bg-white/10",
    };

    const el = document.createElement("div");
    el.className = `neo-card px-4 py-3 text-sm ${colors[type] || colors.info}`;
    el.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="text-white/85">${escapeHtml(message)}</div>
        <button class="text-white/60 hover:text-white transition" aria-label="Tutup">✕</button>
      </div>
    `;

    host.appendChild(el);
    const btn = el.querySelector("button");
    btn.addEventListener("click", () => el.remove());
    setTimeout(() => el.remove(), 4200);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setLoading(form, isLoading) {
    const btn = form?.querySelector('button[type="submit"]');
    if (!btn) return;
    btn.disabled = isLoading;
    btn.dataset._label ??= btn.textContent;
    btn.textContent = isLoading ? "Memproses..." : btn.dataset._label;
    btn.classList.toggle("opacity-70", isLoading);
    btn.classList.toggle("cursor-not-allowed", isLoading);
  }

  // ---------- theme ----------
  const THEME_LABEL = { cyber: "Cyber", pink: "Pink", acid: "Acid" };

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(KEYS.theme, theme);
    const label = $("#themeLabel");
    if (label) label.textContent = THEME_LABEL[theme] || "Cyber";
  }

  function initTheme() {
    const saved = localStorage.getItem(KEYS.theme) || "cyber";
    applyTheme(saved);

    const btn = $("#themeBtn");
    const menu = $("#themeMenu");

    if (btn && menu) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = !menu.classList.contains("hidden");
        menu.classList.toggle("hidden", open);
        btn.setAttribute("aria-expanded", String(!open));
      });

      document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
          menu.classList.add("hidden");
          btn.setAttribute("aria-expanded", "false");
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          menu.classList.add("hidden");
          btn.setAttribute("aria-expanded", "false");
        }
      });
    }

    $$("button[data-theme]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        applyTheme(b.dataset.theme);
        if (menu) menu.classList.add("hidden");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---------- demo data store ----------
  function readUsers() {
    return readJSON(KEYS.users, []);
  }

  function writeUsers(users) {
    writeJSON(KEYS.users, users);
  }

  function findUserByEmail(email) {
    const users = readUsers();
    return users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  }

  function upsertUser(user) {
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) users[idx] = user;
    else users.push(user);
    writeUsers(users);
  }

  function setSession(user) {
    const session = {
      token: uid(),
      user: { id: user.id, name: user.name, email: user.email },
      createdAt: now(),
    };
    writeJSON(KEYS.session, session);
    return session;
  }

  function getSession() {
    return readJSON(KEYS.session, null);
  }

  function clearSession() {
    localStorage.removeItem(KEYS.session);
  }

  // ---------- verify/reset tokens ----------
  function createVerifyCode(email) {
    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
    const store = readJSON(KEYS.verify, {});
    store[email.toLowerCase()] = { code, createdAt: now(), expiresAt: now() + 15 * 60 * 1000 };
    writeJSON(KEYS.verify, store);
    return code;
  }

  function readVerify(email) {
    const store = readJSON(KEYS.verify, {});
    return store[email.toLowerCase()] || null;
  }

  function clearVerify(email) {
    const store = readJSON(KEYS.verify, {});
    delete store[email.toLowerCase()];
    writeJSON(KEYS.verify, store);
  }

  function createResetToken(email) {
    const token = uid();
    const store = readJSON(KEYS.reset, {});
    store[token] = { email: email.toLowerCase(), createdAt: now(), expiresAt: now() + 30 * 60 * 1000 };
    writeJSON(KEYS.reset, store);
    return token;
  }

  function readResetToken(token) {
    const store = readJSON(KEYS.reset, {});
    return store[token] || null;
  }

  function clearResetToken(token) {
    const store = readJSON(KEYS.reset, {});
    delete store[token];
    writeJSON(KEYS.reset, store);
  }

  // ---------- API hooks (optional) ----------
  async function apiCall(path, payload) {
    const url = CONFIG.apiBase.replace(/\/$/, "") + path;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Request failed");
    return data;
  }

  // ---------- public actions ----------
  async function register({ name, email, password }) {
    if (CONFIG.mode === "api") {
      return apiCall(CONFIG.endpoints.register, { name, email, password });
    }

    // DEMO
    const exists = findUserByEmail(email);
    if (exists) throw new Error("Email sudah terdaftar. Silakan login.");

    const user = {
      id: uid(),
      name: String(name || "").trim(),
      email: String(email || "").trim().toLowerCase(),
      password,         // DEMO ONLY (untuk production, jangan simpan plaintext)
      verified: false,
      createdAt: now(),
    };
    upsertUser(user);

    const code = createVerifyCode(user.email);
    return { user, verifyCode: code };
  }

  async function verify({ email, code }) {
    if (CONFIG.mode === "api") {
      return apiCall(CONFIG.endpoints.verify, { email, code });
    }

    const v = readVerify(email);
    if (!v) throw new Error("Kode verifikasi tidak ditemukan. Minta ulang dari halaman Register.");
    if (now() > v.expiresAt) throw new Error("Kode verifikasi kadaluarsa. Silakan minta ulang.");
    if (String(code).trim() !== String(v.code)) throw new Error("Kode verifikasi salah.");

    const user = findUserByEmail(email);
    if (!user) throw new Error("User tidak ditemukan.");
    user.verified = true;
    upsertUser(user);
    clearVerify(email);

    return { ok: true };
  }

  async function login({ email, password }) {
    if (CONFIG.mode === "api") {
      return apiCall(CONFIG.endpoints.login, { email, password });
    }

    const user = findUserByEmail(email);
    if (!user) throw new Error("Email tidak ditemukan. Silakan register.");
    if (!user.verified) throw new Error("Email belum diverifikasi. Silakan verifikasi dulu.");
    if (user.password !== password) throw new Error("Password salah.");

    const session = setSession(user);
    return { session };
  }

  async function forgot({ email }) {
    if (CONFIG.mode === "api") {
      return apiCall(CONFIG.endpoints.forgot, { email });
    }

    const user = findUserByEmail(email);
    if (!user) throw new Error("Email tidak terdaftar.");

    const token = createResetToken(email);
    return { resetToken: token };
  }

  async function reset({ token, newPassword }) {
    if (CONFIG.mode === "api") {
      return apiCall(CONFIG.endpoints.reset, { token, newPassword });
    }

    const data = readResetToken(token);
    if (!data) throw new Error("Token reset tidak valid.");
    if (now() > data.expiresAt) throw new Error("Token reset kadaluarsa.");

    const user = findUserByEmail(data.email);
    if (!user) throw new Error("User tidak ditemukan.");

    user.password = newPassword; // DEMO ONLY
    upsertUser(user);
    clearResetToken(token);

    return { ok: true };
  }

  function requireAuth({ redirect = "auth/login.html" } = {}) {
    const s = getSession();
    if (!s?.token) {
      window.location.href = redirect;
      return null;
    }
    return s;
  }

  // ---------- page init helpers ----------
  function initReveal() {
    const els = $$(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
  }

  function bindPasswordToggles() {
    $$("[data-toggle-password]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-toggle-password");
        const input = document.getElementById(targetId);
        if (!input) return;
        const isPw = input.type === "password";
        input.type = isPw ? "text" : "password";
        btn.textContent = isPw ? "Sembunyikan" : "Lihat";
      });
    });
  }

  function initCommon() {
    initTheme();
    initReveal();
    bindPasswordToggles();
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  return {
    CONFIG,
    KEYS,
    initCommon,
    toast,
    setLoading,
    getParam,
    register,
    verify,
    login,
    forgot,
    reset,
    setSession,
    getSession,
    clearSession,
    requireAuth,
    createVerifyCode,   // useful to re-send in demo
  };
})();