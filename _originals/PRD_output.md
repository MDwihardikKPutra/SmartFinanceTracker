

Product Requirements Document

SmartFinanceTracker
Offline-First Personal Finance App
IndexedDB + Dexie.js · Gemini AI · Next.js 15


Versi: 1.0.0     |     Tanggal: April 2025     |     Status: Final


1. Gambaran Umum Produk
1.1 Ringkasan Produk
SmartFinanceTracker adalah aplikasi pencatat keuangan pribadi berbasis web yang dirancang dengan filosofi offline-first. Pengguna dapat mencatat pemasukan dan pengeluaran menggunakan input teks bebas dalam Bahasa Indonesia — AI (Gemini 1.5 Flash) secara otomatis mengekstrak nominal, kategori, dan jenis transaksi tanpa pengguna perlu mengisi form manual.
Seluruh data tersimpan langsung di browser pengguna menggunakan IndexedDB melalui Dexie.js, sehingga aplikasi berjalan 100% offline kecuali pada saat input AI diproses. Tidak ada server database, tidak ada biaya infrastruktur, dan tidak ada risiko kebocoran data ke server pihak ketiga.

1.2 Target Pengguna
Aplikasi ini dirancang sebagai proyek portofolio sekaligus alat produktivitas personal. Target pengguna utama adalah:
Pengguna pribadi yang ingin mencatat keuangan harian dengan cepat tanpa repot mengisi form panjang.
Recruiter dan reviewer teknis yang mengevaluasi kemampuan developer — demo mode memungkinkan siapapun langsung mencoba tanpa registrasi.

1.3 Nilai Utama Produk
Nilai
Penjelasan
Zero Backend Cost
Tidak ada server, tidak ada database cloud, tidak ada tagihan bulanan. Aplikasi berjalan sepenuhnya di sisi browser.
Offline-First
Semua fitur inti (tambah, lihat, filter, hapus transaksi) berjalan tanpa koneksi internet. Hanya parsing AI yang membutuhkan koneksi.
Input Natural
Pengguna cukup mengetik 'bayar kos 800rb' — AI yang mengurai menjadi data terstruktur. Tidak ada dropdown wajib isi.
Privacy by Default
Data tidak pernah dikirim ke server manapun kecuali teks input ke Gemini API. Tidak ada akun, tidak ada sinkronisasi cloud.
Portfolio Differentiator
Penggunaan IndexedDB + Dexie.js jarang dijumpai di portofolio junior developer, menjadikan proyek ini menonjol secara teknis.
Demo-Ready
Login page dilengkapi autofill demo — recruiter dapat langsung menjelajahi dashboard berisi data sampel tanpa proses registrasi.

2. Arsitektur & Keputusan Teknis
2.1 Prinsip Arsitektur
Aplikasi ini dirancang sejak awal sebagai client-only application. Artinya, tidak ada backend server yang dikelola secara mandiri. Seluruh logika bisnis, penyimpanan data, dan rendering UI berjalan di browser pengguna. Satu-satunya komunikasi keluar adalah panggilan ke Gemini API — itupun diproksikan melalui Next.js API Route agar API key tidak terekspos ke sisi client.
Keputusan ini diambil berdasarkan tiga pertimbangan utama: efisiensi biaya (nol rupiah untuk infrastruktur), kesederhanaan deployment (cukup push ke Vercel, tanpa setup database), dan relevansi teknis sebagai portofolio (IndexedDB adalah teknologi browser yang jarang diekspos secara mendalam di project junior).

2.2 Mengapa IndexedDB + Dexie.js?
Browser modern menyediakan beberapa mekanisme penyimpanan data lokal. Berikut perbandingan dan alasan IndexedDB dipilih:

Opsi
Kapasitas
Tipe Data
Bisa Query?
Keputusan
localStorage
~5 MB
String saja
Tidak
✗ Terlalu kecil & terbatas
sessionStorage
~5 MB
String saja
Tidak
✗ Data hilang saat tab ditutup
IndexedDB
> 1 GB
Object / JSON
Ya (index)
✓ Dipilih — cocok untuk data transaksi
Cookies
~4 KB
String saja
Tidak
✗ Bukan untuk data aplikasi
Cache API
Bergantung disk
HTTP Response
Tidak
✗ Khusus untuk aset PWA

IndexedDB dipilih karena mendukung penyimpanan data terstruktur dalam jumlah besar, memiliki kemampuan query dan indexing, serta berjalan asinkron sehingga tidak memblokir UI. Dexie.js digunakan sebagai wrapper karena API native IndexedDB sangat verbose dan callback-based — Dexie menyederhanakannya menjadi sintaks async/await yang jauh lebih readable dan maintainable.

2.3 Alur Arsitektur Keseluruhan
Berikut adalah gambaran lengkap bagaimana komponen-komponen sistem berinteraksi:

1.  Pengguna Membuka Aplikasi
Browser memuat Next.js app dari Vercel (static export). Tidak ada request ke database server karena semua data ada di IndexedDB browser pengguna sendiri. Dexie.js langsung membaca IndexedDB lokal dan mengisi komponen dashboard secara reaktif.
2.  Pengguna Mengetik Input Transaksi
Floating input bar menerima teks bebas dari pengguna. Input ditampung sementara di React state lokal (useState). Tidak ada network call pada tahap ini — semua terjadi di memori browser.
3.  Frontend Mengirim ke API Route
Setelah pengguna menekan Submit, frontend melakukan HTTP POST ke Next.js API Route /api/parse-txn yang berjalan di server Vercel. API Route ini berperan sebagai proxy yang menyembunyikan GEMINI_API_KEY dari sisi client.
4.  API Route Memanggil Gemini AI
API Route meneruskan teks input ke Gemini 1.5 Flash bersama system prompt yang sudah dikonfigurasi. Gemini memproses teks dan mengembalikan JSON terstruktur berisi: nominal, tipe (income/expense), kategori, dan deskripsi singkat. Ini adalah satu-satunya titik yang memerlukan koneksi internet.
5.  Confirmation Card Ditampilkan
Hasil parsing dari Gemini ditampilkan dalam sebuah Confirmation Card sebelum benar-benar disimpan. Pengguna dapat melihat, mengedit, atau membatalkan hasil interpretasi AI. Ini mencegah tersimpannya data yang salah akibat ambiguitas input.
6.  Data Disimpan ke IndexedDB
Setelah pengguna mengkonfirmasi, Dexie.js menyimpan transaksi ke IndexedDB browser. Proses ini terjadi secara lokal dan selesai dalam hitungan milidetik. Tidak ada network call pada tahap ini.
7.  Dashboard Diperbarui Secara Reaktif
Dexie menyediakan hook useLiveQuery() yang bekerja seperti useState — setiap perubahan data di IndexedDB otomatis memicu re-render komponen yang relevan. Transaksi baru muncul di tabel dengan animasi fade-in tanpa perlu reload halaman atau refetch manual.

2.4 Tech Stack
Layer
Teknologi
Versi
Peran & Alasan Pemilihan
Framework
Next.js
15 (App Router)
Foundation aplikasi. App Router digunakan untuk struktur routing yang lebih modern dan mendukung Server Components untuk API Route.
Styling
Tailwind CSS
v3
Utility-first CSS untuk styling cepat dan konsisten. Digunakan bersama design token warna yang sudah didefinisikan (#007AFF sebagai primary color).
Database Lokal
Dexie.js + IndexedDB
Dexie v4
Penyimpanan data utama di browser. Dexie sebagai wrapper modern yang menyederhanakan API IndexedDB yang verbose.
Reaktivitas Data
useLiveQuery (Dexie)
Dexie v4
Hook reaktif pengganti React Query/TanStack Query. Data di UI otomatis sync dengan IndexedDB tanpa boilerplate tambahan.
AI Engine
Gemini 1.5 Flash
API v1
Model AI Google untuk parsing teks bebas menjadi data transaksi terstruktur. Flash dipilih karena latensi rendah dan biaya minimal.
Visualisasi
Recharts
Latest
Library chart berbasis React dan SVG untuk menampilkan Cashflow Area Chart dan statistik di dashboard.
Deployment
Vercel (Static Export)
—
Hosting gratis untuk Next.js. Static export dipilih karena tidak ada server-side rendering yang diperlukan — API Route Vercel sudah cukup.

2.5 Keputusan Teknis yang Disepakati
Keputusan
Pilihan Akhir
Alasan
Storage Layer
IndexedDB via Dexie.js
Kapasitas besar, mendukung query kompleks, berjalan offline sepenuhnya, dan merupakan diferensiator teknis yang kuat untuk portofolio.
Backend & Auth
Tidak ada (client-only)
Menghilangkan kompleksitas setup, biaya infra, dan konfigurasi environment. Tidak relevan untuk use case portofolio personal.
State Management Data
useLiveQuery (Dexie)
Reaktivitas bawaan Dexie menggantikan kebutuhan TanStack Query. Lebih sederhana karena sudah terintegrasi dengan storage layer.
AI Proxy
Next.js API Route
Menyembunyikan API key dari browser. Tidak perlu server tersendiri — Vercel Serverless Function sudah cukup.
Deployment Strategy
Vercel Static Export
Zero config, gratis, dan tidak memerlukan environment variable Supabase atau database URL.
Data Backup
Export/Import JSON manual
Solusi pragmatis untuk keterbatasan IndexedDB (data lokal per-browser). User bisa backup dan restore sendiri.

3. Fitur-Fitur Produk
3.1 AI Input Bar
Deskripsi
AI Input Bar adalah elemen UI utama yang selalu tersedia di bagian bawah layar (floating). Pengguna dapat mengetik kalimat bebas dalam Bahasa Indonesia untuk mencatat transaksi. AI yang akan menginterpretasikan teks menjadi data terstruktur — tidak ada dropdown kategori wajib, tidak ada form amount yang harus diisi manual.

Flow Penggunaan Step-by-Step
1.  Pengguna Menyentuh Input Bar
Floating bar di bagian bawah layar selalu terlihat di semua halaman. Saat disentuh, keyboard muncul dan placeholder teks mulai berputar menampilkan contoh-contoh input seperti: 'Bayar kos bulan April 800rb', 'Terima gaji 5 juta', 'Makan siang di warteg 25rb', 'Beli bensin Pertamax 60 ribu'.
2.  Pengguna Mengetik Input Bebas
Pengguna mengetikkan kalimat dalam Bahasa Indonesia sesuai transaksi yang terjadi. Input bisa sangat singkat ('kos 800') atau lebih deskriptif ('bayar kos bulanan April 2025 Rp 800.000'). Tidak ada format wajib — AI dirancang untuk menangani variasi bahasa sehari-hari.
3.  Pengguna Menekan Tombol Submit
Ikon kirim (arrow icon) aktif setelah minimal ada 3 karakter. Saat ditekan, input bar menampilkan loading state berupa animasi spinner kecil dan teks 'AI sedang menganalisis...'. Input tidak bisa diedit selama proses berlangsung.
4.  Gemini AI Memproses Input
Teks dikirim ke /api/parse-txn. Gemini 1.5 Flash menganalisis kalimat dan mengekstrak: nominal dalam angka bulat (rupiah), tipe transaksi (income atau expense), kategori yang sesuai dari daftar preset, dan deskripsi singkat yang lebih formal. Gemini juga mengembalikan skor kepercayaan (0.0–1.0) untuk mengindikasikan seberapa yakin AI dengan interpretasinya.
5.  Confirmation Card Muncul
Hasil parsing ditampilkan dalam sebuah card yang muncul dari bawah layar (slide-up animation). Card menampilkan semua field hasil interpretasi AI: nominal, tipe, kategori, dan deskripsi. Jika skor kepercayaan di bawah 0.75, ditampilkan badge 'Mohon cek kembali' berwarna kuning. Pengguna dapat mengedit field manapun langsung di card ini sebelum menyimpan.
6.  Pengguna Mengkonfirmasi atau Membatalkan
Terdapat dua tombol di bawah card: 'Simpan Transaksi' (biru) dan 'Batal' (abu-abu). Jika Simpan ditekan, data langsung ditulis ke IndexedDB via Dexie. Jika Batal ditekan, card tertutup dan tidak ada data yang tersimpan. Input bar kembali kosong siap menerima input berikutnya.
7.  Dashboard Diperbarui Otomatis
Begitu data tersimpan, semua komponen yang mendengarkan perubahan IndexedDB melalui useLiveQuery() otomatis re-render. Transaksi baru muncul di tabel dengan animasi fade-in. Stats card (Balance, Total Income, Total Expense) juga diperbarui secara real-time.

Penanganan Error
Kondisi Error
Respons Sistem
Input terlalu singkat (< 3 karakter)
Tombol Submit tetap disable. Tidak ada request yang dikirim.
Koneksi internet terputus
Error toast muncul: 'Tidak dapat terhubung ke AI. Periksa koneksi internet.' Input tetap tersimpan di field — pengguna tidak perlu mengetik ulang.
Gemini API timeout (> 10 detik)
Loading dibatalkan, error toast: 'AI membutuhkan waktu terlalu lama. Coba lagi.' Input tetap di field.
Input terlalu ambigu (confidence < 0.4)
Confirmation card tetap muncul namun seluruh field ditandai merah dengan pesan: 'AI tidak yakin dengan interpretasi ini. Harap periksa semua field sebelum menyimpan.'
Gemini rate limit terlampaui
Error toast: 'Batas penggunaan AI hari ini tercapai. Coba lagi besok.' Input tetap di field.

3.2 Dashboard Utama
Deskripsi
Dashboard adalah halaman utama yang ditampilkan setelah login. Halaman ini menyajikan ringkasan keuangan secara visual dan interaktif — semua data diambil langsung dari IndexedDB secara reaktif menggunakan useLiveQuery. Tidak ada loading spinner saat refresh karena data sudah ada di browser.

Komponen Dashboard

A. Stats Cards (Bagian Atas)
Tiga kartu statistik ditampilkan berderet horizontal di bagian atas dashboard:
Total Balance: Akumulasi semua income dikurangi semua expense dengan status 'paid'. Diperbarui real-time setiap kali ada transaksi baru.
Total Pemasukan (Bulan Ini): Jumlah semua transaksi bertipe 'income' dalam bulan kalender berjalan.
Total Pengeluaran (Bulan Ini): Jumlah semua transaksi bertipe 'expense' dalam bulan kalender berjalan.
Setiap kartu juga menampilkan persentase perubahan dibandingkan bulan sebelumnya (naik = hijau, turun = merah untuk balance dan income; turun = hijau untuk expense).

B. Cashflow Area Chart
Grafik area interaktif menampilkan tren pemasukan dan pengeluaran dari waktu ke waktu. Spesifikasi detail:
Range waktu: Pengguna dapat memilih antara 7 Hari, 30 Hari, atau 90 Hari terakhir menggunakan toggle di pojok kanan atas chart.
Sumbu X: Tanggal, ditampilkan dalam format singkat (mis. '5 Apr', '6 Apr').
Sumbu Y: Nominal rupiah, diformat otomatis (mis. '1,5 Jt', '800 Rb').
Dua garis: Garis hijau untuk income, garis merah untuk expense. Kedua garis ditampilkan dengan area fill semi-transparan.
Tooltip interaktif: Saat kursor diarahkan ke titik data, tooltip menampilkan tanggal, nominal income, dan nominal expense pada hari tersebut.
Data dari IndexedDB: Chart di-query langsung dari Dexie — group by date, sum by type. Semua kalkulasi terjadi di browser.

C. Tabel Transaksi
Tabel interaktif menampilkan daftar semua transaksi dengan kemampuan filter dan sort:
Kolom: Tanggal, Deskripsi, Kategori, Tipe (badge income/expense), Nominal, Status, Aksi.
Filter: Dropdown untuk filter berdasarkan Tipe (Semua/Income/Expense), Kategori (dinamis dari data yang ada), dan Status (Semua/Paid/Pending/Canceled).
Sort: Klik header kolom untuk sort ascending/descending. Default: terbaru di atas.
Aksi per baris: Tombol edit (ikon pensil) untuk mengubah status atau deskripsi, dan tombol hapus (ikon trash) dengan konfirmasi dialog sebelum penghapusan.
Paginasi: Menampilkan 20 transaksi per halaman. Navigasi halaman di bawah tabel.

D. Target Tracker & Saving Coach
Widget di sidebar atau bagian bawah dashboard yang menampilkan progress tabungan menuju target:
Target default: Rp 10.000.000 untuk Lebaran 2026. Target dapat diubah di halaman Settings.
Progress bar: Visual persentase tabungan saat ini terhadap target. Warna berubah dari merah (< 30%) ke kuning (30–70%) ke hijau (> 70%).
Estimasi tercapai: Berdasarkan rata-rata tabungan bulanan 3 bulan terakhir, sistem menghitung estimasi kapan target akan tercapai.
Saving Coach: Pesan motivasi dinamis yang berubah berdasarkan status progress. Jika pengeluaran bulan ini melebihi income, coach menampilkan peringatan dengan saran konkret.

3.3 Login Page & Demo Autofill
Deskripsi & Tujuan
Meskipun aplikasi ini tidak memerlukan autentikasi backend (semua data tersimpan lokal di browser), login page tetap dihadirkan dengan tiga tujuan utama:
Memberikan kesan profesional dan production-ready bagi siapapun yang melihat demo aplikasi ini.
Menghadirkan Demo Mode yang meng-seed dashboard dengan data sampel realistis — memungkinkan recruiter atau reviewer langsung menjelajahi fitur tanpa registrasi atau setup apapun.
Sebagai showcase kemampuan UI/UX: form handling, validasi real-time, animasi transisi, dan responsive design.

Anatomi Login Page
Elemen
Spesifikasi Visual
Perilaku
Container
Centered card, max-width 420px, padding 40px, shadow-xl, rounded-2xl, background putih
Responsif — full width di mobile dengan padding horizontal 16px
Logo & Nama App
Icon dompet/chart di atas, diikuti teks 'SmartFinanceTracker' bold ukuran besar, subtitle 'Catat keuangan dengan AI'
Statis, tidak interaktif
Field Email
Input full-width, label floating, border abu-abu saat idle, border biru saat focus, ikon email di kiri
Validasi format email saat blur. Pesan error muncul di bawah field jika format salah.
Field Password
Input full-width, label floating, toggle ikon mata di kanan untuk show/hide password
Validasi minimal 6 karakter saat blur.
Tombol Masuk
Full width, background #007AFF, teks putih bold, rounded-xl, height 48px
Disable jika email/password kosong. Menampilkan spinner saat loading.
Divider
Garis horizontal tipis dengan teks 'atau' di tengah, teks abu-abu
Statis, sebagai pemisah visual
Tombol Coba Demo
Full width, background #EFF6FF, border 1px #007AFF, teks #007AFF bold, ikon ✨ di kiri, rounded-xl, height 48px
Trigger autofill + seeding demo data. Selalu aktif tanpa perlu isi form.
Hint Demo
Teks kecil abu-abu di bawah tombol demo: 'Langsung lihat dashboard dengan data sampel — tanpa registrasi'
Statis, sebagai panduan untuk recruiter/reviewer

Flow Autofill Demo — Step-by-Step
Fitur Kunci: Tombol 'Coba Demo' memungkinkan siapapun langsung masuk ke dashboard berisi data realistis tanpa perlu mendaftar, mengisi form, atau memiliki akun.

1.  Pengguna Melihat Tombol 'Coba Demo'
Tombol ditampilkan dengan desain yang menonjol namun tidak agresif — lebih kecil dari tombol Masuk utama namun tetap jelas terbaca. Hint text di bawahnya menjelaskan bahwa tidak perlu registrasi.
2.  Pengguna Mengklik Tombol
Animasi dimulai: field Email secara bertahap terisi karakter per karakter (seperti efek typing) dengan nilai 'demo@smartfinance.app'. Setelah email selesai, field Password diisi dengan 'demo1234' dengan efek yang sama. Efek typing ini memberikan kesan bahwa sistem sedang 'memasukkan' kredensial, menciptakan pengalaman yang lebih engaging dibanding autofill biasa.
3.  Loading State Aktif
Setelah autofill selesai (sekitar 600ms), tombol berubah menjadi loading state: ikon spinner berputar dan teks berganti menjadi 'Memuat data demo...'. Seluruh form menjadi disable selama proses berlangsung.
4.  Pengecekan Data Demo di IndexedDB
Sistem mengecek apakah data demo sudah pernah di-seed sebelumnya dengan menghitung jumlah transaksi di IndexedDB. Jika sudah ada data (count > 0), langkah seeding dilewati. Jika belum ada data, proses seeding dimulai.
5.  Seeding Data Demo (Jika Diperlukan)
30 transaksi sampel yang sudah dikurasi ditulis ke IndexedDB menggunakan Dexie bulkAdd(). Data mencakup berbagai kategori (Gaji, Kos, Makanan, Transport, dll), tersebar dalam 3 bulan terakhir, dengan campuran income dan expense yang realistis. Proses ini selesai dalam milidetik karena berjalan lokal.
6.  Flag Demo Mode Disimpan
Sistem menyimpan flag 'demo_mode: true' ke localStorage. Flag ini digunakan untuk menampilkan banner Demo Mode di dashboard dan untuk memungkinkan fitur 'Reset Data Demo' di menu settings.
7.  Redirect ke Dashboard
Setelah seeding selesai, pengguna otomatis diarahkan ke halaman dashboard dengan transisi fade. Total waktu dari klik hingga dashboard tampil adalah sekitar 1-1.5 detik.
8.  Banner Demo Mode di Dashboard
Di bagian atas dashboard terdapat banner kuning/amber: 'Mode Demo Aktif — Data yang ditampilkan adalah contoh. Mulai catat transaksi nyata atau reset data demo di Settings.' Banner memiliki tombol ✕ untuk di-dismiss (state dismiss disimpan di localStorage sehingga banner tidak muncul lagi setelah ditutup).

Data Demo yang Di-seed
30 transaksi sampel dirancang untuk mencerminkan pola keuangan realistis seorang fresh graduate atau junior developer:
Kategori
Contoh Transaksi
Jumlah Data
Gaji / Pemasukan
Gaji bulanan, freelance, transfer masuk
4 transaksi (income)
Tempat Tinggal
Bayar kos, listrik, air, internet
5 transaksi (expense)
Makanan & Minuman
Makan siang, kopi, grocery
8 transaksi (expense)
Transportasi
Bensin, ojek online, KRL
5 transaksi (expense)
Belanja
Beli baju, peralatan, kebutuhan pribadi
4 transaksi (expense)
Kesehatan
Obat, vitamin, BPJS
2 transaksi (expense)
Hiburan
Netflix, game, nonton bioskop
2 transaksi (expense)

3.4 Fitur Export & Import Data
Deskripsi & Tujuan
Karena data tersimpan lokal di browser, terdapat risiko data hilang jika cache browser dibersihkan atau pengguna berganti perangkat. Fitur Export dan Import JSON hadir sebagai solusi backup manual yang sederhana namun efektif.

Flow Export Data — Step-by-Step
1.  Pengguna Membuka Menu Pengaturan
Ikon gear di navbar mengarahkan ke halaman Settings. Di halaman ini terdapat section 'Kelola Data' dengan dua tombol: 'Export Data' dan 'Import Data'.
2.  Pengguna Mengklik 'Export Data'
Konfirmasi dialog tidak diperlukan untuk export. Sistem langsung memproses.
3.  Sistem Membaca Semua Data dari IndexedDB
Dexie mengambil seluruh transaksi dan data profil dari IndexedDB. Data distrukturkan dalam format JSON dengan metadata: tanggal export, versi app, dan jumlah transaksi.
4.  File JSON Diunduh
Browser memicu unduhan file secara otomatis dengan nama format: smartfinance-backup-YYYYMMDD.json. File ini berisi semua transaksi dalam format yang dapat dibaca dan diedit manual jika diperlukan.

Flow Import Data — Step-by-Step
1.  Pengguna Mengklik 'Import Data'
File picker terbuka, dibatasi hanya untuk file .json. Pengguna memilih file backup yang sebelumnya di-export.
2.  Sistem Memvalidasi File
File dibaca dan divalidasi: format JSON valid, memiliki field yang diharapkan, dan versi kompatibel. Jika validasi gagal, pesan error spesifik ditampilkan (mis. 'File bukan format backup SmartFinanceTracker yang valid').
3.  Konfirmasi Penggabungan atau Penggantian
Dialog konfirmasi muncul dengan dua pilihan: 'Gabungkan dengan data yang ada' (merge — transaksi baru ditambahkan, duplikat berdasarkan ID dihindari) atau 'Ganti semua data' (replace — seluruh data lama dihapus dan diganti dengan data dari file). Pengguna memilih dan mengkonfirmasi.
4.  Data Ditulis ke IndexedDB
Dexie memproses import menggunakan bulkAdd() untuk mode merge atau clear() + bulkAdd() untuk mode replace. Progress bar ditampilkan untuk file yang besar.
5.  Sukses dan Redirect
Toast sukses muncul: 'X transaksi berhasil diimport.' Dashboard otomatis diperbarui karena useLiveQuery mendeteksi perubahan di IndexedDB.

4. Skema Data
Berikut adalah struktur data yang tersimpan di IndexedDB melalui Dexie.js. Skema didefinisikan langsung dalam kode TypeScript — tidak ada SQL, tidak ada migration file terpisah.

4.1 Tabel Transaksi
Field
Tipe Data
Default
Deskripsi & Aturan
id
number (auto-increment)
Otomatis
Primary key yang dikelola otomatis oleh Dexie. Tidak perlu diisi saat membuat transaksi baru.
amount
number (integer)
Wajib isi
Nominal transaksi dalam rupiah penuh. Tidak menggunakan desimal. Contoh: 800000 untuk Rp 800.000.
type
'income' | 'expense'
Wajib isi
Jenis transaksi. Hanya dua nilai yang valid: 'income' untuk pemasukan, 'expense' untuk pengeluaran.
category
string
Wajib isi
Kategori transaksi yang diisi oleh AI. Contoh nilai: 'Makanan', 'Transportasi', 'Gaji', 'Tagihan', 'Hiburan', 'Kesehatan'.
description
string
Wajib isi
Deskripsi singkat yang dihasilkan AI berdasarkan input teks pengguna. Sudah diformat lebih formal dari raw input.
status
'paid' | 'pending' | 'canceled'
'paid'
Status transaksi. Default 'paid' karena sebagian besar transaksi dicatat setelah terjadi. Bisa diubah manual oleh pengguna.
rawInput
string
Wajib isi
Teks mentah yang diketik pengguna sebelum diproses AI. Disimpan untuk keperluan audit dan debug.
aiConfidence
number (0.0–1.0)
Wajib isi
Skor kepercayaan Gemini terhadap hasil interpretasinya. Di bawah 0.75 ditandai sebagai 'perlu review'.
createdAt
Date
new Date()
Timestamp saat transaksi dicatat. Digunakan sebagai index utama untuk sorting dan filtering berdasarkan tanggal.

4.2 Tabel Profil
Field
Tipe Data
Default
Deskripsi
id
number
1 (tunggal)
Hanya ada satu baris profil per browser. ID selalu 1.
targetSavings
number
10000000
Target tabungan dalam rupiah. Default Rp 10.000.000 untuk Lebaran 2026. Bisa diubah di Settings.
targetDate
Date
Lebaran 2026
Tanggal target tercapainya tabungan. Digunakan untuk menghitung estimasi di Saving Coach.
currency
string
'IDR'
Mata uang yang digunakan. Untuk v1.0 hanya IDR. Disiapkan untuk ekspansi mata uang di versi mendatang.

4.3 Kategori Preset
AI diarahkan untuk memilih kategori dari daftar preset berikut. Jika tidak ada yang cocok, AI boleh membuat kategori baru (free-form). Daftar ini dapat diperluas di versi mendatang.
Kategori
Tipe Umumnya
Contoh Transaksi
Gaji
Income
Gaji bulanan, tunjangan, bonus
Freelance
Income
Pembayaran project, honorarium, jasa konsultasi
Transfer Masuk
Income
Transfer dari keluarga, pengembalian hutang
Makanan & Minuman
Expense
Makan siang, kopi, grocery, snack
Transportasi
Expense
Bensin, ojek online, KRL, parkir
Tempat Tinggal
Expense
Kos, listrik, air, internet, gas
Belanja
Expense
Pakaian, elektronik, kebutuhan rumah
Kesehatan
Expense
Obat, dokter, vitamin, BPJS
Hiburan
Expense
Streaming, bioskop, game, hobi
Pendidikan
Expense
Kursus online, buku, seminar
Tagihan
Expense
Langganan, cicilan, iuran
Lainnya
Keduanya
Transaksi yang tidak masuk kategori di atas

5. Roadmap Pengembangan
5.1 Prinsip Prioritas
Roadmap disusun dengan prinsip: fitur yang paling terlihat dan berdampak langsung ke portfolio value dikerjakan lebih awal. Infrastruktur dan polish dikerjakan setelah flow utama berfungsi.

5.2 Timeline 4 Minggu

Week 1 — Foundation & Login (Phase 1)
Target akhir minggu: Aplikasi bisa dibuka, login page tampil dengan baik, dan data dummy sudah bisa masuk ke IndexedDB via Dexie.

Task
Detail & Acceptance Criteria
1.1 Setup Repository
Init Next.js 15 dengan App Router. Install Tailwind CSS v3, Dexie.js v4, dan Dexie-react-hooks. Konfigurasi ESLint dan TypeScript strict mode. Struktur folder: /app, /components, /lib (db.ts), /hooks. Done: project bisa dijalankan lokal dengan npm run dev.
1.2 Definisi Skema Dexie
Buat file lib/db.ts dengan definisi tabel transactions dan profile beserta seluruh field dan index-nya. Tulis fungsi-fungsi CRUD helper (addTransaction, getTransactions, deleteTransaction, updateTransaction). Done: bisa add dan read transaksi dari IndexedDB via konsol browser.
1.3 Login Page + Autofill Demo
Build halaman /login dengan form email+password dan tombol 'Coba Demo'. Implementasi efek typing saat autofill. Implementasi seedDemoData() dengan 30 transaksi sampel. Implementasi flag demo_mode di localStorage. Done: klik 'Coba Demo' → autofill → seeding → redirect ke /dashboard.
1.4 Layout & Navbar
Build komponen layout utama: Navbar dengan logo dan menu, Footer minimal. Halaman dashboard skeleton (tanpa data nyata, placeholder saja). Floating Input Bar di bagian bawah (tampilan saja, belum terhubung ke AI). Done: navigasi antar halaman berfungsi, responsive di mobile.
1.5 Deploy ke Vercel
Setup Vercel project, tambahkan environment variable GEMINI_API_KEY. Pastikan static export bekerja. Done: URL Vercel live dan login page tampil dengan benar di browser mobile dan desktop.

Week 2 — AI Integration & Input Flow (Phase 2)
Target akhir minggu: Flow lengkap input → AI parsing → confirmation card → simpan ke IndexedDB berjalan end-to-end.

Task
Detail & Acceptance Criteria
2.1 Next.js API Route
Buat /api/parse-txn yang menerima POST request dengan body {input: string}. Validasi input di server (minimal 3 karakter, maksimal 500 karakter). Done: bisa di-test via Postman/curl, mengembalikan JSON placeholder sebelum Gemini diintegrasikan.
2.2 Gemini Integration & Prompt Engineering
Integrasi Google Generative AI SDK ke API Route. Tulis dan iterasi system prompt yang menghasilkan JSON konsisten: {amount, type, category, description, confidence}. Test dengan 20+ variasi input berbeda termasuk edge case (input ambigu, angka tidak standar, singkatan). Done: response JSON konsisten dan akurat untuk 85%+ test case.
2.3 Floating Input Bar — Fungsional
Hubungkan UI Floating Input Bar ke API Route. Implementasi loading state (spinner + disable form). Implementasi error handling untuk semua skenario error yang didefinisikan di Section 3.1. Done: input bar terhubung ke Gemini, menampilkan loading, dan menangani error dengan benar.
2.4 Confirmation Card
Build komponen ConfirmationCard yang muncul setelah AI parsing. Semua field editable. Badge 'Perlu review' jika confidence < 0.75. Tombol Simpan dan Batal. Animasi slide-up saat card muncul, slide-down saat dismiss. Done: card muncul dengan data yang benar, edit berfungsi, simpan menulis ke IndexedDB.

Week 3 — Dashboard & Visualisasi (Phase 3)
Target akhir minggu: Dashboard menampilkan data nyata dari IndexedDB dengan chart interaktif dan tabel yang bisa difilter.

Task
Detail & Acceptance Criteria
3.1 Stats Cards
Implementasi tiga stats card menggunakan useLiveQuery: Total Balance, Income Bulan Ini, Expense Bulan Ini. Tambahkan persentase perubahan vs bulan lalu. Format angka rupiah (mis. 'Rp 1,5 Jt'). Done: card diperbarui real-time saat transaksi baru ditambahkan.
3.2 Cashflow Area Chart
Implementasi chart menggunakan Recharts AreaChart. Query data dari IndexedDB, group by date, sum by type. Toggle 7/30/90 hari. Tooltip interaktif. Responsive — chart mengecil dengan benar di mobile. Done: chart menampilkan data nyata dari IndexedDB dengan toggle range waktu yang berfungsi.
3.3 Transaction Table
Build tabel dengan semua kolom yang didefinisikan di Section 3.2. Implementasi filter (type, category, status) dan sort (klik header). Paginasi 20 item. Aksi edit dan delete per baris. Done: filter, sort, dan delete semuanya berfungsi dan data di tabel reaktif terhadap perubahan IndexedDB.
3.4 Animasi & Polish UI
Animasi fade-in untuk transaksi baru di tabel. Loading skeleton untuk stats card saat data pertama kali dimuat. Micro-interaction pada hover dan klik tombol. Pastikan seluruh UI konsisten menggunakan design token yang sudah ditentukan (#007AFF, Inter/Arial, spacing). Done: tidak ada visual glitch, semua animasi smooth.

Week 4 — Fitur Tambahan & Production (Phase 4)
Target akhir minggu: Aplikasi siap diposting di portfolio — production build bersih, semua fitur berfungsi, demo bisa dinikmati siapapun.

Task
Detail & Acceptance Criteria
4.1 Target Tracker & Saving Coach
Implementasi widget Target Tracker dengan progress bar dan estimasi pencapaian. Logika Saving Coach yang menghasilkan pesan dinamis berdasarkan tren keuangan. Halaman Settings untuk mengubah target savings dan target date. Done: progress bar akurat, estimasi masuk akal berdasarkan data historis.
4.2 Export & Import JSON
Implementasi fungsi export yang mengunduh semua data sebagai file JSON berformat. Implementasi fungsi import dengan validasi file dan pilihan merge/replace. Done: export menghasilkan file yang valid, import bisa me-restore data dari file export tersebut.
4.3 Performance Audit
Jalankan Lighthouse audit. Target: Performance > 85, Accessibility > 90. Optimalkan bundle size jika perlu (code splitting, lazy loading komponen chart). Done: Lighthouse score memenuhi target pada mobile dan desktop.
4.4 Cross-Browser & Responsive Testing
Test di Chrome, Firefox, dan Safari (IndexedDB behavior bisa berbeda). Test layout di breakpoint mobile (375px), tablet (768px), dan desktop (1440px). Done: tidak ada UI breaking di browser dan resolusi target.
4.5 Final Deploy & Portfolio Prep
Final production deploy ke Vercel. Update README dengan deskripsi, tech stack, dan link demo. Tambahkan screenshot dan GIF demo di README. Done: link demo aktif, README informatif, dan tombol 'Coba Demo' berfungsi dengan mulus bagi siapapun yang mengakses.

5.3 Estimasi Waktu per Task
Phase
Total Estimasi
Catatan
Week 1 — Foundation & Login
12–15 jam
Termasuk setup lingkungan dev dan implementasi autofill demo yang butuh iterasi UX.
Week 2 — AI Integration
15–18 jam
Prompt engineering adalah bagian paling iteratif — butuh banyak uji coba dengan variasi input.
Week 3 — Dashboard & Visualisasi
18–22 jam
Chart dan tabel dengan filter/sort adalah komponen paling kompleks secara teknis.
Week 4 — Fitur Tambahan & Polish
10–14 jam
Performance audit dan testing bisa lebih singkat jika tidak ada bug besar yang ditemukan.
Total
55–69 jam
Setara dengan 2–2.5 minggu kerja penuh (40 jam/minggu) jika dikerjakan full-time.

6. Tradeoffs & Keterbatasan
6.1 Tabel Perbandingan
✓ Keunggulan
⚠ Keterbatasan
Gratis selamanya — tidak ada biaya backend, hosting, atau database.
Data tidak tersinkron antar perangkat atau browser berbeda. Buka di HP lain = data kosong.
Aplikasi 100% berfungsi offline kecuali saat parsing AI.
Jika cache browser dibersihkan secara agresif (atau mode incognito), data bisa hilang.
Setup sangat cepat — langsung coding fitur, tidak ada config database.
Tidak mendukung multi-user. Tidak ada sharing atau kolaborasi data antar pengguna.
Privasi tinggi — data transaksi tidak dikirim ke server manapun.
Tidak cocok untuk dikembangkan menjadi produk SaaS komersial tanpa perombakan arsitektur.
Query lokal tanpa latency jaringan — performa sangat cepat.
Butuh browser modern (semua browser rilis 2020 ke atas sudah mendukung IndexedDB).
Diferensiator portofolio — IndexedDB + Dexie.js jarang diekspos di portfolio junior.
Tidak ada fitur admin atau dashboard untuk melihat agregat data semua pengguna.

6.2 Mitigasi Keterbatasan Utama

Masalah: Data hilang jika cache browser dibersihkan.
Fitur Export JSON memberikan cara mudah untuk backup data sebelum membersihkan browser.
Banner di dashboard mengingatkan pengguna untuk rutin melakukan export.
Roadmap v2: opsional sync ke Google Drive via Google Drive API — tanpa backend sendiri.

Masalah: Data tidak bisa diakses dari perangkat lain.
Fitur Import JSON memungkinkan pengguna memindahkan data antar perangkat secara manual.
Untuk konteks portofolio, ini adalah trade-off yang diterima dan bisa dikomunikasikan sebagai keputusan desain sadar (privacy by design).

7. Ringkasan Keputusan Teknis
Keputusan
Pilihan
Status
Storage Layer
IndexedDB via Dexie.js
✓ Final
Backend & Auth
Tidak ada (client-only)
✓ Final
AI Engine
Gemini 1.5 Flash via API Route
✓ Final
State Management
useLiveQuery (Dexie)
✓ Final
Framework
Next.js 15 (App Router)
✓ Final
Deployment
Vercel Static Export
✓ Final
Login Page + Autofill Demo
Implemented dengan seed data 30 transaksi
✓ Final
Export/Import JSON
Manual backup solution
✓ Final
Multi-user & Cloud Sync
Out of scope untuk v1.0
✗ Ditunda


— End of PRD v1.0 | SmartFinanceTracker —