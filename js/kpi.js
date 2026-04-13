// =============================================
// KPI LEADERBOARD - HUIT Internal Dashboard
// Features: Auto-refresh, Best Highlight,
//           Count-up Animation, Export PNG
// =============================================

const API_URL = "https://script.google.com/macros/s/AKfycby-wrXVe7f7eOW4NSnXpYe1zAFWaIw0jfBrzTuffbB5lbAbGgF89Lbh5ZvtZ1TtQ3V5kw/exec";
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 menit
const APP_VERSION = "1.0.1-auth"; // Untuk verifikasi di console

console.log(`HUIT Leaderboard v${APP_VERSION} loading...`);

let kpiDataAll = null;
let currentDivisi = "DBS";
let bestOverallEmployee = null;
let lastUpdatedTime = null;
let refreshTimer = null;

// =============================================
// AUTHENTICATION LOGIC
// =============================================
const CORRECT_PASSWORD = "HuitAkses888";

document.addEventListener('DOMContentLoaded', () => {
    const authSession = localStorage.getItem('huit_auth');
    if (authSession === CORRECT_PASSWORD) {
        showDashboard();
    } else {
        initLoginListeners();
    }
});

function initLoginListeners() {
    const loginBtn = document.getElementById('loginBtn');
    const passwordInput = document.getElementById('passwordInput');

    loginBtn.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
}

function handleLogin() {
    const passwordInput = document.getElementById('passwordInput');
    const errorEl = document.getElementById('loginError');

    if (passwordInput.value === CORRECT_PASSWORD) {
        localStorage.setItem('huit_auth', CORRECT_PASSWORD);
        showDashboard();
    } else {
        errorEl.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function showDashboard() {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('kpiMainContainer').style.display = 'block';

    document.querySelector('.kpi-header').classList.add('appear');
    document.querySelector('.kpi-tabs').classList.add('appear');

    // Tab Listeners
    document.querySelectorAll('.kpi-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.kpi-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentDivisi = e.target.getAttribute('data-target');
            if (kpiDataAll) renderKPI(kpiDataAll);
        });
    });

    // Export Button Listener (Feature #8)
    document.getElementById('exportBtn').addEventListener('click', handleExport);

    // Initial fetch + start auto-refresh (Feature #3)
    fetchAndRender();
    refreshTimer = setInterval(fetchAndRender, REFRESH_INTERVAL_MS);
    startLastUpdatedClock();
}

// =============================================
// FEATURE #3 - AUTO-REFRESH & SYNC STATUS
// =============================================
async function fetchAndRender() {
    setSyncStatus('syncing');
    try {
        document.getElementById('kpiMonthLabel').textContent = "Menyinkronkan data live dari Google Sheets...";
        const response = await fetch(API_URL + '?t=' + Date.now()); // cache-bust
        if (!response.ok) throw new Error('Gagal menghubungi Server Google');
        kpiDataAll = await response.json();
    } catch (error) {
        console.warn('Gagal terhubung ke API. Menggunakan data dummy fallback.', error);
        kpiDataAll = {
            "periode": "April 2026 (Demo)",
            "karyawan": [
                { "id": 101, "nama": "Ahmad Rizky", "divisi": "DBS", "posisi": "Illustrator", "skor": 98.5, "total_plot": 15 },
                { "id": 102, "nama": "Bunga Lestari", "divisi": "DBS", "posisi": "Illustrator", "skor": 95.2, "total_plot": 12 },
                { "id": 103, "nama": "Candra Wijaya", "divisi": "DBS", "posisi": "Illustrator", "skor": 90.0, "total_plot": 10 },
                { "id": 201, "nama": "Fahri Hamzah", "divisi": "BCS", "posisi": "Illustrator", "skor": 97.0, "total_plot": 14 },
                { "id": 202, "nama": "Gita Savitri", "divisi": "BCS", "posisi": "Illustrator", "skor": 94.5, "total_plot": 11 },
                { "id": 203, "nama": "Hadi Pranoto", "divisi": "BCS", "posisi": "Illustrator", "skor": 91.2, "total_plot": 9 }
            ]
        };
    }

    // Tentukan karyawan terbaik lintas semua divisi (Feature #6)
    bestOverallEmployee = kpiDataAll.karyawan.reduce((best, emp) =>
        (!best || emp.skor > best.skor) ? emp : best, null);

    renderHeader(kpiDataAll.periode);
    renderKPI(kpiDataAll);

    lastUpdatedTime = new Date();
    setSyncStatus('ok');
}

function setSyncStatus(state) {
    const dot = document.querySelector('.sync-dot');
    const label = document.getElementById('kpiLastUpdated');
    if (state === 'syncing') {
        dot.classList.add('syncing');
        label.textContent = 'Menyinkronkan...';
    } else {
        dot.classList.remove('syncing');
        updateLastUpdatedLabel();
    }
}

function startLastUpdatedClock() {
    setInterval(() => {
        if (lastUpdatedTime) updateLastUpdatedLabel();
    }, 30000); // Update label setiap 30 detik
}

function updateLastUpdatedLabel() {
    const label = document.getElementById('kpiLastUpdated');
    if (!lastUpdatedTime) return;
    const diffMs = Date.now() - lastUpdatedTime.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) {
        label.textContent = 'Baru saja diperbarui';
    } else {
        label.textContent = `Diperbarui ${diffMin} menit lalu · Refresh otomatis tiap 5 menit`;
    }
}

// =============================================
// RENDER FUNCTIONS
// =============================================
function renderHeader(periode) {
    document.getElementById('kpiMonthLabel').textContent = `Bulan: ${formatPeriodeLabel(periode)}`;
}

function formatPeriodeLabel(periode) {
    const BULAN_ID = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    if (!periode) return periode;
    // Coba parse format "2026-04" dari API
    const matchISO = periode.match(/^(\d{4})-(\d{2})$/);
    if (matchISO) {
        const year = matchISO[1];
        const monthIndex = parseInt(matchISO[2], 10) - 1;
        const monthName = BULAN_ID[monthIndex] || matchISO[2];
        return `${monthName} ${year}`;
    }
    return periode; // Jika format lain, tampilkan apa adanya
}

function renderKPI(data) {
    const podiumContainer = document.getElementById('podiumContainer');
    const leaderboardSection = document.querySelector('.leaderboard-list-section');

    podiumContainer.style.opacity = 0;
    leaderboardSection.style.opacity = 0;

    let employees = data.karyawan
        .filter(emp => emp.divisi === currentDivisi)
        .sort((a, b) => b.skor - a.skor);

    setTimeout(() => {
        let top3 = employees.slice(0, 3);
        renderPodium(top3);
        renderLeaderboard(employees, 1);

        podiumContainer.style.transition = 'opacity 0.4s';
        leaderboardSection.style.transition = 'opacity 0.4s';
        podiumContainer.style.opacity = 1;
        leaderboardSection.style.opacity = 1;
        podiumContainer.classList.add('appear');
        leaderboardSection.classList.add('appear');
    }, 200);
}

function renderPodium(top3) {
    const podiumContainer = document.getElementById('podiumContainer');
    podiumContainer.innerHTML = '';

    const rank2 = top3[1] || null;
    const rank1 = top3[0] || null;
    const rank3 = top3[2] || null;

    if (rank2) podiumContainer.appendChild(createPodiumElement(rank2, 2));
    if (rank1) podiumContainer.appendChild(createPodiumElement(rank1, 1));
    if (rank3) podiumContainer.appendChild(createPodiumElement(rank3, 3));
}

function createPodiumElement(emp, rank) {
    const div = document.createElement('div');
    div.className = `podium-item rank-${rank}`;
    const initials = getInitials(emp.nama);

    div.innerHTML = `
        <div class="podium-avatar">${initials}</div>
        <div class="podium-name">${emp.nama}</div>
        <div class="podium-dept">${emp.posisi}</div>
        <div class="podium-score" data-target="${emp.skor}">0</div>
    `;

    // Feature #7 - Trigger count-up after element inserted
    requestAnimationFrame(() => {
        const scoreEl = div.querySelector('.podium-score');
        animateCount(scoreEl, 0, emp.skor, 1400);
    });

    return div;
}

function renderLeaderboard(employees, startRank) {
    const tbody = document.getElementById('leaderboardTbody');
    tbody.innerHTML = '';

    employees.forEach((emp, index) => {
        const tr = document.createElement('tr');
        const currentRank = startRank + index;

        // Feature #6 - Best Overall check (across all divisions)
        const isBest = bestOverallEmployee && emp.id === bestOverallEmployee.id;
        if (isBest) tr.classList.add('best-overall');

        const scoreClass = isBest ? 'score-badge best-glow' : 'score-badge';

        tr.innerHTML = `
            <td><span class="rank-badge">${currentRank}</span></td>
            <td><strong>${emp.nama}</strong></td>
            <td>${emp.posisi}</td>
            <td><span class="plot-badge">📦 ${emp.total_plot || 0} Plot</span></td>
            <td><span class="${scoreClass}" id="score-${emp.id}">0</span></td>
        `;
        tbody.appendChild(tr);

        // Feature #7 - Count-up for table scores
        requestAnimationFrame(() => {
            const scoreEl = document.getElementById(`score-${emp.id}`);
            if (scoreEl) animateCount(scoreEl, 0, emp.skor, 1200);
        });
    });
}

// =============================================
// FEATURE #7 - COUNT-UP ANIMATION
// =============================================
function animateCount(element, from, to, duration) {
    const startTime = performance.now();
    const isDecimal = String(to).includes('.');

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = from + (to - from) * ease;
        element.textContent = isDecimal ? current.toFixed(1) : Math.round(current);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// =============================================
// FEATURE #8 - EXPORT AS PNG
// =============================================
function parsePeriodeToFilename(periode) {
    const BULAN_ID = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    if (!periode) return 'Leaderboard';

    // Coba parse format "2026-04" dari API
    const matchISO = periode.match(/^(\d{4})-(\d{2})$/);
    if (matchISO) {
        const year = matchISO[1];
        const monthIndex = parseInt(matchISO[2], 10) - 1;
        const monthName = BULAN_ID[monthIndex] || `Bulan${matchISO[2]}`;
        return `Leaderboard_${monthName}_${year}`;
    }

    // Fallback: bersihkan karakter aneh jika format berbeda
    return `Leaderboard_${periode.replace(/[^a-z0-9]/gi, '_')}`;
}

async function handleExport() {
    const btn = document.getElementById('exportBtn');
    btn.classList.add('loading');
    btn.innerHTML = '<span>⏳</span> Membuat gambar...';

    try {
        const target = document.getElementById('kpiMainContainer');
        const canvas = await html2canvas(target, {
            backgroundColor: '#0F172A',
            scale: 2, // Resolusi 2x untuk kualitas tinggi
            useCORS: true,
            logging: false
        });

        const link = document.createElement('a');
        const filename = parsePeriodeToFilename(kpiDataAll?.periode);
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error('Gagal membuat gambar:', err);
        alert('Gagal membuat gambar. Pastikan koneksi internet aktif.');
    } finally {
        btn.classList.remove('loading');
        btn.innerHTML = '<span>📸</span> Export sebagai Gambar';
    }
}

// =============================================
// HELPER
// =============================================
function getInitials(name) {
    let parts = name.split(' ');
    let init = parts[0][0];
    if (parts.length > 1) init += parts[1][0];
    return init.toUpperCase();
}
