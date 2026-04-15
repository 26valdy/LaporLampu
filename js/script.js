// LaporLampu — Modern, Edge-to-Edge, Tanpa Tabel
document.addEventListener('DOMContentLoaded', () => {
    // ========== 1. ARRAY & OBJECT ==========
    let reports = [
        { id: 101, nama: "Muhammad Rafi", lokasi: "Jl. Mawar No. 12", deskripsi: "Lampu mati total, gelap sekali", kategori: "Lampu mati", status: "Diproses", tanggal: "13/03/2026", timestamp: new Date(2026, 2, 13) },
        { id: 102, nama: "Alvin Dinar", lokasi: "Jl. Melati Raya", deskripsi: "Lampu redup, berkedip", kategori: "Lampu redup", status: "Selesai", tanggal: "14/03/2026", timestamp: new Date(2026, 2, 14) },
        { id: 103, nama: "Fauzan", lokasi: "Jl. Raya No. 45", deskripsi: "Lampu mati 3 hari", kategori: "Lampu mati", status: "Diproses", tanggal: "15/03/2026", timestamp: new Date(2026, 2, 15) },
        { id: 104, nama: "Yazid Diansyah", lokasi: "Jl. Kenanga", deskripsi: "Tiang miring, lampu putus", kategori: "Rusak fisik", status: "Menunggu", tanggal: "16/03/2026", timestamp: new Date(2026, 2, 16) },
        { id: 105, nama: "Pandu", lokasi: "Jl. Flamboyan 8", deskripsi: "Lampu mati total seminggu", kategori: "Lampu mati", status: "Diproses", tanggal: "17/03/2026", timestamp: new Date(2026, 2, 17) }
    ];

    // Helper format tanggal (Object Date)
    function formatDate(date) {
        let d = date.getDate();
        let m = date.getMonth() + 1;
        let y = date.getFullYear();
        return `${d.toString().padStart(2,'0')}/${m.toString().padStart(2,'0')}/${y}`;
    }

    // ========== RENDER CARD ==========
    function renderHome() {
        const container = document.getElementById('home-feed');
        if (!container) return;
        const latest = [...reports].sort((a,b) => b.timestamp - a.timestamp).slice(0,3);
        container.innerHTML = latest.map(r => renderCard(r, 'home')).join('');
        attachCardEvents();
    }

    function renderAllReports() {
        const container = document.getElementById('all-feed');
        if (!container) return;
        container.innerHTML = reports.map(r => renderCard(r, 'list')).join('');
        attachCardEvents();
        updateStats();
    }

    function renderAdmin() {
        const container = document.getElementById('admin-feed');
        if (!container) return;
        container.innerHTML = reports.map(r => renderCard(r, 'admin')).join('');
        attachCardEvents();
        updateAdminStats();
    }

    function renderCard(r, role) {
        const statusClass = `status-${r.status.replace(/ /g, '')}`;
        let actions = '';
        if (role === 'admin') {
            actions = `
                <div class="card-actions">
                    <select data-id="${r.id}" class="admin-status-select">
                        <option ${r.status === 'Diproses' ? 'selected' : ''}>Diproses</option>
                        <option ${r.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
                        <option ${r.status === 'Ditolak' ? 'selected' : ''}>Ditolak</option>
                        <option ${r.status === 'Menunggu' ? 'selected' : ''}>Menunggu</option>
                    </select>
                    <button class="btn-simpan-card" data-id="${r.id}">Simpan</button>
                    <button class="btn-detail-card" data-id="${r.id}">Detail</button>
                    <button class="btn-hapus-card" data-id="${r.id}">Hapus</button>
                </div>
            `;
        } else {
            actions = `<div class="card-actions"><button class="btn-detail-card" data-id="${r.id}">Detail</button></div>`;
        }
        return `
            <div class="laporan-card" data-id="${r.id}">
                <div class="card-header">
                    <span class="card-nama">${r.nama}</span>
                    <span class="card-status ${statusClass}">${r.status}</span>
                </div>
                <div class="card-lokasi"> ${r.lokasi}</div>
                <div class="card-deskripsi"> ${r.deskripsi}</div>
                <div class="card-tanggal"> ${r.tanggal}</div>
                ${actions}
            </div>
        `;
    }

    // ========== EVENT HANDLER dengan CONFIRM ==========
    function attachCardEvents() {
        document.querySelectorAll('.btn-detail-card').forEach(btn => {
            btn.removeEventListener('click', handleDetail);
            btn.addEventListener('click', handleDetail);
        });
        document.querySelectorAll('.btn-hapus-card').forEach(btn => {
            btn.removeEventListener('click', handleDelete);
            btn.addEventListener('click', handleDelete);
        });
        document.querySelectorAll('.btn-simpan-card').forEach(btn => {
            btn.removeEventListener('click', handleSaveStatus);
            btn.addEventListener('click', handleSaveStatus);
        });
    }

    function handleDetail(e) {
        const id = parseInt(e.currentTarget.dataset.id);
        const r = reports.find(r => r.id === id);
        if (r) alert(` Detail\nNama: ${r.nama}\nLokasi: ${r.lokasi}\nDeskripsi: ${r.deskripsi}\nKategori: ${r.kategori}\nStatus: ${r.status}\nTanggal: ${r.tanggal}`);
    }

    function handleDelete(e) {
        const id = parseInt(e.currentTarget.dataset.id);
        const r = reports.find(r => r.id === id);
        if (!r) return;
        // KOTAK DIALOG confirm() sebelum menghapus
        const yakin = confirm(`⚠️ Hapus laporan dari ${r.nama} (${r.lokasi})?`);
        if (yakin) {
            reports = reports.filter(r => r.id !== id);
            refreshAll();
            alert('Laporan dihapus.');
        }
    }

    function handleSaveStatus(e) {
        const id = parseInt(e.currentTarget.dataset.id);
        const card = e.currentTarget.closest('.laporan-card');
        const select = card.querySelector('.admin-status-select');
        const newStatus = select.value;
        const r = reports.find(r => r.id === id);
        if (r && r.status !== newStatus) {
            const konfirm = confirm(`Ubah status "${r.deskripsi.substring(0,30)}" dari ${r.status} menjadi ${newStatus}?`);
            if (konfirm) {
                r.status = newStatus;
                refreshAll();
                alert('Status diperbarui.');
            }
        }
    }

    // ========== STATISTIK ==========
    function updateStats() {
        document.getElementById('statTotal').innerText = reports.length;
        document.getElementById('statRusak').innerText = reports.filter(r => r.kategori === 'Lampu mati' || r.deskripsi.toLowerCase().includes('mati')).length;
        document.getElementById('statDiproses').innerText = reports.filter(r => r.status === 'Diproses').length;
        document.getElementById('statSelesai').innerText = reports.filter(r => r.status === 'Selesai').length;
    }

    function updateAdminStats() {
        const todayStr = formatDate(new Date());
        const todayCount = reports.filter(r => r.tanggal === todayStr).length;
        const pending = reports.filter(r => r.status !== 'Selesai').length;
        document.getElementById('todayCount').innerText = todayCount;
        document.getElementById('pendingCount').innerText = pending;
    }

    function refreshAll() {
        renderHome();
        renderAllReports();
        renderAdmin();
    }

    // ========== TAMBAH LAPORAN (Object Math, Date, String) ==========
    function addReport(nama, lokasi, deskripsi, kategori) {
        const namaUpper = nama; // Object String
        const uniqueId = Math.floor(Math.random() * 1000000) + Date.now(); // Math + Date
        const now = new Date(); // Object Date
        const newReport = {
            id: uniqueId,
            nama: namaUpper,
            lokasi: lokasi,
            deskripsi: deskripsi,
            kategori: kategori,
            status: "Diproses",
            tanggal: formatDate(now),
            timestamp: now
        };
        reports.push(newReport);
        refreshAll();
        alert('Laporan terkirim.');
    }
    
    document.getElementById('submitBtn')?.addEventListener('click', () => {
        const nama = document.getElementById('reportName').value.trim();
        const lokasi = document.getElementById('reportLocation').value.trim();
        const deskripsi = document.getElementById('reportDesc').value.trim();
        const kategori = document.getElementById('reportCategory').value;
        if (!nama || !lokasi || !deskripsi) return alert('Lengkapi semua field.');
        if (confirm(`Kirim laporan dari "${nama}"?\nLokasi: ${lokasi}\nDeskripsi: ${deskripsi}`)) {
            addReport(nama, lokasi, deskripsi, kategori);
            document.getElementById('reportName').value = '';
            document.getElementById('reportLocation').value = '';
            document.getElementById('reportDesc').value = '';
        }
    });

    document.getElementById('resetBtn')?.addEventListener('click', () => {
        document.getElementById('reportName').value = '';
        document.getElementById('reportLocation').value = '';
        document.getElementById('reportDesc').value = '';
        document.getElementById('reportCategory').selectedIndex = 0;
    });

    document.getElementById('exportBtn')?.addEventListener('click', () => alert('Fitur export data (demo)'));
    
    let filterActive = false;
    document.getElementById('filterPendingBtn')?.addEventListener('click', () => {
        const container = document.getElementById('admin-feed');
        if (!filterActive) {
            const pending = reports.filter(r => r.status !== 'Selesai');
            container.innerHTML = pending.map(r => renderCard(r, 'admin')).join('');
            attachCardEvents();
            filterActive = true;
            document.getElementById('filterPendingBtn').innerText = 'Tampilkan semua';
        } else {
            renderAdmin();
            filterActive = false;
            document.getElementById('filterPendingBtn').innerText = 'Filter pending';
        }
    });

    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    refreshAll();
});
