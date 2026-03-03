/* =========================================================
   NeonLaunch Multi-page + 3 Themes + 3 Home Layouts (FINAL)
   - Inject header/footer
   - Theme switcher (cyber/pink/acid) + localStorage
   - Layout switcher (v1/v2/v3) + localStorage
   - AUTO Home link: kembali ke layout home terakhir yang dipilih
   - Home components: render Features/Pricing/Testimonials/FAQ + slider/accordion/reveal/form demo
   ========================================================= */

const PAGE = document.body.dataset.page || "home";

const DATA = {
  brand: "NeonLaunch",
  features: [
    { title: "Komponen modular", desc: "Section rapi & gampang dipindah jadi komponen framework.", icon: "◆" },
    { title: "3 tema neon", desc: "Cyber, Pink, Acid — ganti tema tanpa ubah layout.", icon: "◈" },
    { title: "No-build setup", desc: "Tailwind CDN + CSS vars. Cepat untuk dijual dan demo.", icon: "⚡" },
    { title: "SEO ready", desc: "Heading semantik + meta description + struktur section jelas.", icon: "⌁" },
    { title: "FAQ accordion", desc: "Interaktif, ringan, dan enak di-maintain.", icon: "▤" },
    { title: "Mudah rebrand", desc: "Ubah copy & data di satu file (app.js).", icon: "✦" },
  ],
  pricing: [
    {
      name: "Starter",
      price: "149K",
      period: "/sekali",
      highlight: false,
      desc: "Untuk personal project dan validasi cepat.",
      perks: ["1 landing page", "Dokumentasi singkat", "Gratis update minor 1x"],
      cta: "Pilih Starter",
    },
    {
      name: "Pro",
      price: "299K",
      period: "/sekali",
      highlight: true,
      desc: "Paling populer untuk jual template & agency delivery.",
      perks: ["Semua di Starter", "3 variasi hero", "Komponen ekstra", "Prioritas support 7 hari"],
      cta: "Pilih Pro",
    },
    {
      name: "Business",
      price: "499K",
      period: "/sekali",
      highlight: false,
      desc: "Untuk tim + rebrand multi produk.",
      perks: ["Semua di Pro", "Versi multi-product", "Contoh integrasi form API", "License komersial internal"],
      cta: "Pilih Business",
    },
  ],
  testimonials: [
    { quote: "Tinggal ganti copy, langsung jadi landing page untuk klien.", name: "Raka", role: "Founder", score: 5 },
    { quote: "Strukturnya bersih, enak buat dikembangkan.", name: "Nadya", role: "Frontend Dev", score: 5 },
    { quote: "Neon-nya nendang tapi tetap readable.", name: "Bima", role: "Designer", score: 5 },
  ],
  faq: [
    { q: "Bisa dipakai untuk berbagai niche?", a: "Bisa. Tinggal ganti data/copy, warna, dan gambar/ikon." },
    { q: "Ganti tema bagaimana?", a: "Klik Theme di navbar (Cyber/Pink/Acid). Tersimpan otomatis." },
    { q: "Form kontak kirim kemana?", a: "Default demo. Sambungkan ke API kamu via fetch() (lihat setupFormDemo)." },
    { q: "Mau versi build Tailwind?", a: "Bisa. Template ini sengaja no-build agar cepat dijual/dipakai." },
  ],
};

// ---------- helpers ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---------- HOME + LAYOUT (key feature) ----------
const HOME_STORAGE_KEY = "neo_home_file";
const THEME_STORAGE_KEY = "neo_theme";
const HOME_REGEX = /^index(?:-v[1-3])?\.html$/i;

const LAYOUT_FILES = {
  v1: "index-v1.html",
  v2: "index-v2.html",
  v3: "index-v3.html",
};

function getCurrentFileName() {
  const p = window.location.pathname;
  const f = (p.split("/").pop() || "").trim();
  return f || "index.html";
}

function getHomeFile() {
  const current = getCurrentFileName();

  // Kalau sedang buka home file (index-v1/v2/v3 atau index.html) -> simpan
  if (HOME_REGEX.test(current)) {
    localStorage.setItem(HOME_STORAGE_KEY, current);
    return current;
  }

  // Kalau bukan -> ambil last used
  const saved = localStorage.getItem(HOME_STORAGE_KEY);
  if (saved && HOME_REGEX.test(saved)) return saved;

  // fallback
  return LAYOUT_FILES.v1;
}

function getLayoutFromFile(file) {
  if (/index-v2\.html/i.test(file)) return "v2";
  if (/index-v3\.html/i.test(file)) return "v3";
  return "v1";
}

function setHomeFile(file) {
  if (!file || !HOME_REGEX.test(file)) return;
  localStorage.setItem(HOME_STORAGE_KEY, file);
}

function goToHomeLayout(layoutKey) {
  const file = LAYOUT_FILES[layoutKey] || LAYOUT_FILES.v1;
  setHomeFile(file);
  window.location.href = file;
}

function linkTo(key) {
  const onHome = PAGE === "home";
  const homeFile = getHomeFile();

  const map = {
    // anchors
    top: onHome ? "#top" : `${homeFile}#top`,
    features: onHome ? "#features" : `${homeFile}#features`,
    testimonials: onHome ? "#testimonials" : `${homeFile}#testimonials`,
    faq: onHome ? "#faq" : `${homeFile}#faq`,
    contact: onHome ? "#contact" : `${homeFile}#contact`,

    // pages
    home: homeFile,
    about: "about.html",
    pricing: "pricing.html",
    terms: "terms.html",
    privacy: "privacy.html",
  };

  return map[key] || "#";
}

// ---------- header/footer injection ----------
function injectLayout() {
  const header = $("#siteHeader");
  const footer = $("#siteFooter");
  if (!header || !footer) return;

  const currentHome = getHomeFile();
  const currentLayout = getLayoutFromFile(currentHome);

  header.innerHTML = `
  <header class="fixed inset-x-0 top-0 z-50">
    <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="neo-nav mt-3 flex items-center justify-between rounded-2xl px-4 py-3">
        <a href="${linkTo("home")}" class="flex items-center gap-2">
          <span class="neo-logo">◆</span>
          <span class="font-display text-lg tracking-wide">${escapeHtml(DATA.brand)}</span>
        </a>

        <div class="hidden items-center gap-7 md:flex">
          <a class="neo-link" href="${linkTo("home")}" data-nav="home">Home</a>
          <a class="neo-link" href="${linkTo("features")}" data-nav="features">Fitur</a>
          <a class="neo-link" href="${linkTo("pricing")}" data-nav="pricing">Harga</a>
          <a class="neo-link" href="${linkTo("about")}" data-nav="about">About</a>
          <a class="neo-link" href="${linkTo("faq")}" data-nav="faq">FAQ</a>
          <a class="neo-link" href="${linkTo("contact")}" data-nav="contact">Kontak</a>
        </div>

        <div class="hidden items-center gap-3 md:flex">
          <!-- Layout switcher -->
          <div class="relative">
            <button id="layoutBtn" class="neo-btn neo-btn--ghost" type="button" aria-expanded="false">
              Layout: <span id="layoutLabel">${currentLayout.toUpperCase()}</span>
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div id="layoutMenu" class="hidden absolute right-0 mt-2 w-44 rounded-2xl border border-white/10 bg-black/50 backdrop-blur p-2">
              <button class="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 transition" data-layout="v1">Home V1</button>
              <button class="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 transition" data-layout="v2">Home V2</button>
              <button class="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 transition" data-layout="v3">Home V3</button>
            </div>
          </div>

          <!-- Theme switcher -->
          <div class="relative">
            <button id="themeBtn" class="neo-btn neo-btn--ghost" type="button" aria-expanded="false">
              Theme: <span id="themeLabel">Cyber</span>
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div id="themeMenu" class="hidden absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-black/50 backdrop-blur p-2">
              <button class="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 transition" data-theme="cyber">Cyber Blue</button>
              <button class="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 transition" data-theme="pink">Neon Pink</button>
              <button class="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 transition" data-theme="acid">Acid Lime</button>
            </div>
          </div>

          <a href="${linkTo("contact")}" class="neo-btn">Minta Demo</a>
        </div>

        <button
          id="btnMobile"
          class="md:hidden inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition"
          aria-label="Buka menu"
          aria-expanded="false"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div id="mobileMenu" class="hidden">
        <div class="neo-nav mt-3 rounded-2xl px-4 py-4">
          <div class="flex flex-col gap-3">
            <a class="neo-link" href="${linkTo("home")}">Home</a>
            <a class="neo-link" href="${linkTo("features")}">Fitur</a>
            <a class="neo-link" href="${linkTo("pricing")}">Harga</a>
            <a class="neo-link" href="${linkTo("about")}">About</a>
            <a class="neo-link" href="${linkTo("faq")}">FAQ</a>
            <a class="neo-link" href="${linkTo("contact")}">Kontak</a>

            <div class="mt-3 text-xs text-white/60">Layout</div>
            <div class="grid grid-cols-3 gap-3">
              <button class="neo-btn neo-btn--ghost w-full" data-layout="v1">V1</button>
              <button class="neo-btn neo-btn--ghost w-full" data-layout="v2">V2</button>
              <button class="neo-btn neo-btn--ghost w-full" data-layout="v3">V3</button>
            </div>

            <div class="mt-3 text-xs text-white/60">Theme</div>
            <div class="grid grid-cols-3 gap-3">
              <button class="neo-btn neo-btn--ghost w-full" data-theme="cyber">Cyber</button>
              <button class="neo-btn neo-btn--ghost w-full" data-theme="pink">Pink</button>
              <button class="neo-btn neo-btn--ghost w-full" data-theme="acid">Acid</button>
            </div>

            <a href="${linkTo("contact")}" class="neo-btn w-full text-center mt-3">Minta Demo</a>
          </div>
        </div>
      </div>
    </nav>
  </header>`;

  footer.innerHTML = `
  <footer class="mt-16 pb-10 text-center text-sm text-white/55">
    <div class="flex flex-wrap items-center justify-center gap-4">
      <a class="neo-link" href="${linkTo("home")}">Home</a>
      <span class="text-white/25">•</span>
      <a class="neo-link" href="${linkTo("pricing")}">Pricing</a>
      <span class="text-white/25">•</span>
      <a class="neo-link" href="${linkTo("about")}" data-nav="about">About</a>
      <span class="text-white/25">•</span>
      <a class="neo-link" href="${linkTo("terms")}" data-nav="terms">Terms</a>
      <span class="text-white/25">•</span>
      <a class="neo-link" href="${linkTo("privacy")}" data-nav="privacy">Privacy</a>
    </div>
    <div class="mt-4">© <span id="year"></span> ${escapeHtml(DATA.brand)}. All rights reserved.</div>
  </footer>`;
}

function setActiveNav() {
  const current = PAGE; // home/about/pricing/terms/privacy
  $$("[data-nav]").forEach((a) => {
    if (a.dataset.nav === current) a.setAttribute("aria-current", "page");
  });
}

// ---------- theme switcher (FIXED) ----------
const THEME_LABEL = { cyber: "Cyber", pink: "Pink", acid: "Acid" };

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch (_) {}
  const label = $("#themeLabel");
  if (label) label.textContent = THEME_LABEL[theme] || "Cyber";
}

function setupTheme() {
  const saved = (() => {
    try { return localStorage.getItem(THEME_STORAGE_KEY); } catch (_) { return null; }
  })() || "cyber";

  applyTheme(saved);

  const btn = $("#themeBtn");
  const menu = $("#themeMenu");

  // toggle dropdown
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

  // IMPORTANT FIX: hanya bind ke BUTTON data-theme, bukan html[data-theme]
  $$("button[data-theme]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.preventDefault();
      applyTheme(b.dataset.theme);

      // close dropdown if open
      if (menu) menu.classList.add("hidden");
      if (btn) btn.setAttribute("aria-expanded", "false");

      // close mobile menu if open
      const mobileMenu = $("#mobileMenu");
      const mobileBtn = $("#btnMobile");
      if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.add("hidden");
        if (mobileBtn) mobileBtn.setAttribute("aria-expanded", "false");
      }
    });
  });
}

// ---------- layout switcher ----------
function setupLayout() {
  const btn = $("#layoutBtn");
  const menu = $("#layoutMenu");

  const currentLayout = getLayoutFromFile(getHomeFile());
  const label = $("#layoutLabel");
  if (label) label.textContent = currentLayout.toUpperCase();

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

  $$("button[data-layout]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.preventDefault();
      const layout = b.dataset.layout || "v1";
      // simpan + pindah
      goToHomeLayout(layout);

      // close dropdowns (kalau sempat)
      if (menu) menu.classList.add("hidden");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  });
}

// ---------- mobile menu ----------
function setupMobileMenu() {
  const btn = $("#btnMobile");
  const menu = $("#mobileMenu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const isOpen = !menu.classList.contains("hidden");
    menu.classList.toggle("hidden", isOpen);
    btn.setAttribute("aria-expanded", String(!isOpen));
  });

  $$("a[href]", menu).forEach((a) => {
    a.addEventListener("click", () => {
      menu.classList.add("hidden");
      btn.setAttribute("aria-expanded", "false");
    });
  });
}

// ---------- reveal ----------
function setupReveal() {
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

// ---------- renderers ----------
function renderFeatures() {
  const grid = $("#featuresGrid");
  if (!grid) return;

  grid.innerHTML = DATA.features
    .map(
      (f) => `
    <article class="neo-card p-6 reveal">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-white/90">
            <span class="text-lg">${escapeHtml(f.icon)}</span>
          </div>
          <h3 class="font-display text-xl">${escapeHtml(f.title)}</h3>
        </div>
        <span class="h-2.5 w-2.5 rounded-full bg-white/10 ring-2 ring-white/5"></span>
      </div>
      <p class="mt-3 text-white/70">${escapeHtml(f.desc)}</p>
    </article>
  `
    )
    .join("");
}

function renderPricing() {
  const grid = $("#pricingGrid");
  if (!grid) return;

  grid.innerHTML = DATA.pricing
    .map((p) => {
      const hot = p.highlight;
      return `
      <article class="neo-card p-6 reveal">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-display text-2xl">${escapeHtml(p.name)}</h3>
            <p class="mt-1 text-white/65">${escapeHtml(p.desc)}</p>
          </div>
          ${
            hot
              ? `<span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">Rekomendasi</span>`
              : ""
          }
        </div>

        <div class="mt-6 flex items-end gap-2">
          <div class="font-display text-4xl">${escapeHtml(p.price)}</div>
          <div class="pb-1 text-white/60">${escapeHtml(p.period)}</div>
        </div>

        <ul class="mt-6 space-y-3 text-white/75">
          ${p.perks
            .map(
              (perk) => `
            <li class="flex gap-2">
              <span class="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-white/20"
                style="box-shadow:0 0 18px rgb(var(--neon-cyan)/.25)"></span>
              <span>${escapeHtml(perk)}</span>
            </li>`
            )
            .join("")}
        </ul>

        <a href="${linkTo("contact")}" class="neo-btn w-full mt-7 ${hot ? "" : "neo-btn--ghost"}">
          ${escapeHtml(p.cta)}
        </a>
      </article>`;
    })
    .join("");
}

function renderTestimonials() {
  const card = $("#testiCard");
  const dots = $("#testiDots");
  const prev = $("#testiPrev");
  const next = $("#testiNext");
  if (!card || !dots || !prev || !next) return;

  let idx = 0;
  const stars = (n) =>
    Array.from({ length: 5 })
      .map((_, i) => `<span class="${i < n ? "text-white" : "text-white/20"}">★</span>`)
      .join("");

  const paint = () => {
    const t = DATA.testimonials[idx];
    card.innerHTML = `
      <div class="flex items-start justify-between gap-4">
        <div class="text-lg sm:text-xl text-white/90 leading-relaxed">“${escapeHtml(t.quote)}”</div>
        <div class="hidden sm:flex flex-col items-end">
          <div class="text-sm" style="text-shadow:0 0 14px rgb(var(--neon-cyan)/.15)">${stars(t.score)}</div>
          <div class="mt-1 text-xs text-white/50">verified</div>
        </div>
      </div>
      <div class="mt-6 flex items-center justify-between gap-3">
        <div>
          <div class="font-semibold">${escapeHtml(t.name)}</div>
          <div class="text-sm text-white/60">${escapeHtml(t.role)}</div>
        </div>
        <div class="sm:hidden text-sm">${stars(t.score)}</div>
      </div>`;

    dots.innerHTML = DATA.testimonials
      .map((_, i) => {
        const active = i === idx;
        return `<button class="h-2.5 w-2.5 rounded-full ${active ? "bg-white" : "bg-white/15"}"
          style="${active ? "box-shadow:0 0 18px rgb(var(--neon-cyan)/.25)" : ""}"
          aria-label="Testimoni ${i + 1}" data-dot="${i}"></button>`;
      })
      .join("");

    $$("button[data-dot]", dots).forEach((b) =>
      b.addEventListener("click", () => {
        idx = Number(b.dataset.dot);
        paint();
      })
    );
  };

  prev.addEventListener("click", () => {
    idx = (idx - 1 + DATA.testimonials.length) % DATA.testimonials.length;
    paint();
  });
  next.addEventListener("click", () => {
    idx = (idx + 1) % DATA.testimonials.length;
    paint();
  });

  paint();
}

function renderFAQ() {
  const wrap = $("#faqList");
  if (!wrap) return;

  wrap.innerHTML = DATA.faq
    .map((item, i) => {
      const id = `faq_${i}`;
      return `
      <div class="neo-card p-5 reveal">
        <button class="w-full text-left flex items-center justify-between gap-4" aria-expanded="false" aria-controls="${id}">
          <span class="font-semibold">${escapeHtml(item.q)}</span>
          <span class="neo-iconbtn grid place-items-center" style="width:40px;height:40px;">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>
        <div id="${id}" class="mt-3 hidden text-white/70">${escapeHtml(item.a)}</div>
      </div>`;
    })
    .join("");

  $$("#faqList > div").forEach((card) => {
    const btn = $("button", card);
    const panel = card.querySelector("div[id^='faq_']");
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      panel.classList.toggle("hidden", expanded);
    });
  });
}

function setupFormDemo() {
  const form = $("#leadForm");
  const hint = $("#formHint");
  if (!form || !hint) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hint.textContent = "Terkirim (demo). Sambungkan fetch() di app.js untuk pengiriman beneran.";
    hint.classList.remove("text-white/50");
    hint.classList.add("text-white/75");
    form.reset();
  });
}

// ---------- init ----------
function init() {
  // ensure home file stored if currently on a home page
  getHomeFile();

  injectLayout();
  setActiveNav();

  setupTheme();
  setupLayout();
  setupMobileMenu();

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  if (PAGE === "home") {
    renderFeatures();
    renderPricing();
    renderTestimonials();
    renderFAQ();
    setupFormDemo();
  }

  if (PAGE === "pricing") {
    renderPricing();
  }

  setupReveal();
}

document.addEventListener("DOMContentLoaded", init);