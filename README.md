# NeonLaunch — Neon Landing Page (Multi-page)

## Isi Paket
- 3 Home Layout: `index-v1.html`, `index-v2.html`, `index-v3.html`
- Router root: `index.html` (auto redirect ke layout terakhir)
- Pages: `about.html`, `pricing.html`, `terms.html`, `privacy.html`
- Assets: `assets/app.js`, `assets/styles.css`, `assets/themes.css`

## Cara Pakai
1. Upload seluruh folder ke hosting, atau buka `index.html` di browser.
2. Pilih `Layout` & `Theme` dari navbar.
3. Edit konten di `assets/app.js` (DATA.features, DATA.pricing, DATA.faq, dll).

## Ganti Theme
- Theme tersimpan otomatis (localStorage).
- Tema: `cyber`, `pink`, `acid`
- Warna tema ada di `assets/themes.css`

## Ganti Layout Home (V1/V2/V3)
- Ada dropdown Layout di navbar.
- Layout tersimpan otomatis dan dipakai oleh semua link “Home” di halaman lain.

## Edit Konten
Buka `assets/app.js` lalu edit:
- `DATA.brand`
- `DATA.features`
- `DATA.pricing`
- `DATA.testimonials`
- `DATA.faq`

## Form Kontak
Default = demo (tidak mengirim). Untuk produksi, sambungkan ke API:
- Cari fungsi `setupFormDemo()` di `assets/app.js`
- Ganti dengan `fetch()` ke endpoint kamu.

## Tailwind CDN
Template memakai Tailwind CDN agar no-build.
Catatan: Tailwind CDN butuh internet. Untuk offline/production advanced, kamu bisa build Tailwind sendiri (opsional).

## SEO Basic
- `robots.txt`
- `sitemap.xml`
Sesuaikan domain/URL jika sudah live.

## Support
- Jika ada bug/typo link, cek path file dan pastikan `assets/app.js` ter-load.