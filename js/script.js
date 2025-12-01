const INITIAL_BOOKS = {
    1: { id: 1, judul: 'Laut Bercerita', penulis: 'Leila S. Chudori', kategori: 'Novel', stok: 5, cover: 'img/laut bercerita.jpg' },
    2: { id: 2, judul: 'Bumi Manusia', penulis: 'Pramoedya Ananta Toer', kategori: 'Sejarah', stok: 3, cover: 'img/bumi manusia.jpg' },
    3: { id: 3, judul: 'The Alchemist', penulis: 'Paulo Coelho', kategori: 'Novel', stok: 4, cover: 'img/The Alchemist.jpg' },
    4: { id: 4, judul: 'Ronggeng Dukuh Paruk', penulis: 'Ahmad Tohari', kategori: 'Inspirasi', stok: 6, cover: 'img/Ronggeng.jpg' },
};

const INITIAL_PEMINJAMAN = {
    101: { id: 101, user: 'Sheilla Cantika', book_id: 3, judul: 'The Alchemist', tgl_pinjam: '2025-12-01', batas_kembali: '2025-12-08', status: 0 },
    102: { id: 102, user: 'Amoaura', book_id: 1, judul: 'Laut Bercerita', tgl_pinjam: '2025-12-01', batas_kembali: '2025-12-08', status: 0 },
    103: { id: 103, user: 'Brigta Rinta', book_id: 2, judul: 'Bumi Manusia', tgl_pinjam: '2025-11-25', batas_kembali: '2025-12-02', status: 1 },
    104: { id: 104, user: 'Rasti Ayu Anjani', book_id: 4, judul: 'Ronggeng Dukuh Paruk', tgl_pinjam: '2025-11-01', tgl_kembali: '2025-11-07', status: 2, ulasan: 'Buku wajib dibaca!' },
};


const DB = {
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },
    init() {
        if (!this.get('books')) {
            this.set('books', INITIAL_BOOKS);
            this.set('peminjaman', INITIAL_PEMINJAMAN);
            this.set('nextBookId', 5);
            this.set('nextPinjamId', 105);
        }
    }
};


const renderAdminDashboard = () => {
    DB.init();
    const books = DB.get('books');
    const pinjam = DB.get('peminjaman');

    // Filter data
    const pendingPinjam = Object.values(pinjam).filter(p => p.status === 0);
    const dipinjam = Object.values(pinjam).filter(p => p.status === 1);
    const kembali = Object.values(pinjam).filter(p => p.status === 2);
    const ditolak = Object.values(pinjam).filter(p => p.status === 3);
    
    // Update Statistik
    document.getElementById('stat-total-buku').textContent = Object.keys(books).length;
    document.getElementById('stat-buku-dipinjam').textContent = dipinjam.length;
    document.getElementById('stat-menunggu-acc').textContent = pendingPinjam.length;
    document.getElementById('stat-perlu-kembali').textContent = dipinjam.length; // Semua yang dipinjam perlu dikonfirmasi kembali
    document.getElementById('count-pending-pinjam').textContent = pendingPinjam.length;
    document.getElementById('count-dipinjam').textContent = dipinjam.length;
    document.getElementById('stat-ditolak').textContent = ditolak.length;
    document.getElementById('stat-selesai').textContent = kembali.length;

    // Render Tabel Buku
    const bookTableBody = document.getElementById('table-buku-body');
    bookTableBody.innerHTML = Object.values(books).map(book => `
        <tr>
            <td><img src="${book.cover || 'img/default.jpg'}" class="table-cover" alt="Cover"></td>
            <td>${book.judul}</td>
            <td>${book.penulis}</td>
            <td><span class="badge bg-secondary">${book.kategori}</span></td>
            <td>${book.stok}</td>
            <td>
                <button class="btn btn-warning btn-sm me-2 edit-btn" 
                        data-bs-toggle="modal" data-bs-target="#editBukuModal" data-id="${book.id}">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-danger btn-sm delete-btn" 
                        data-bs-toggle="modal" data-bs-target="#hapusModal" data-id="${book.id}" data-judul="${book.judul}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    const pendingTableBody = document.getElementById('table-pending-body');
    pendingTableBody.innerHTML = pendingPinjam.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.user}</td>
            <td>${p.judul}</td>
            <td>${p.tgl_pinjam}</td>
            <td>
                <button class="btn btn-success btn-sm me-2 aksi-btn" data-aksi="acc" data-id="${p.id}" data-user="${p.user}" data-judul="${p.judul}">ACC</button>
                <button class="btn btn-danger btn-sm aksi-btn" data-aksi="tolak" data-id="${p.id}" data-user="${p.user}" data-judul="${p.judul}">Tolak</button>
            </td>
        </tr>
    `).join('');
    
    const dipinjamTableBody = document.getElementById('table-dipinjam-body');
    dipinjamTableBody.innerHTML = dipinjam.map(p => {
        const isLate = new Date(p.batas_kembali) < new Date();
        const tglClass = isLate ? 'text-danger fw-bold' : '';
        return `
            <tr>
                <td>${p.id}</td>
                <td>${p.user}</td>
                <td>${p.judul}</td>
                <td class="${tglClass}">${p.batas_kembali}</td>
                <td>
                    <button class="btn btn-info btn-sm aksi-btn" data-aksi="kembali" data-id="${p.id}" data-user="${p.user}" data-judul="${p.judul}">Konfirmasi Kembali</button>
                </td>
            </tr>
        `;
    }).join('');
};


const renderUserDashboard = (searchQuery = '') => {
    DB.init();
    const books = DB.get('books');
    const pinjam = DB.get('peminjaman');
    const currentUser = 'Sheilla Cantika '; 

    const userDipinjam = Object.values(pinjam).filter(p => p.user === currentUser && p.status === 1);
    const userPending = Object.values(pinjam).filter(p => p.user === currentUser && p.status === 0);
    const userRiwayat = Object.values(pinjam).filter(p => p.user === currentUser && p.status === 2);
    
    const totalStok = Object.values(books).reduce((sum, book) => sum + book.stok, 0);
    document.getElementById('stat-total-stok').textContent = totalStok;
    document.getElementById('stat-user-dipinjam').textContent = userDipinjam.length;
    document.getElementById('stat-user-pending').textContent = userPending.length;
    document.getElementById('stat-user-riwayat').textContent = userRiwayat.length;
    document.getElementById('count-riwayat').textContent = userRiwayat.length;
    
    const filteredBooks = Object.values(books).filter(book => 
        book.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.penulis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.kategori.toLowerCase().includes(searchQuery.toLowerCase())
    );

    document.getElementById('count-katalog').textContent = filteredBooks.length;

    // Render Katalog Buku
    const katalogContainer = document.getElementById('katalog-buku-container');
    katalogContainer.innerHTML = filteredBooks.map(book => {
        const isBorrowed = userDipinjam.some(p => p.book_id === book.id);
        const isPending = userPending.some(p => p.book_id === book.id);
        
        let buttonHtml = '';
        if (isBorrowed) {
            buttonHtml = '<button class="btn btn-warning w-100" disabled>Sedang Anda Pinjam</button>';
        } else if (isPending) {
            buttonHtml = '<button class="btn btn-warning w-100" disabled>Menunggu ACC</button>';
        } else if (book.stok > 0) {
            buttonHtml = `<button class="btn btn-success w-100 pinjam-btn" data-bs-toggle="modal" data-bs-target="#pinjamModal" data-id="${book.id}" data-judul="${book.judul}">Pinjam Buku</button>`;
        } else {
            buttonHtml = '<button class="btn btn-secondary w-100" disabled>Stok Habis</button>';
        }

        return `
            <div class="col-lg-3 col-md-4 col-sm-6">
                <div class="card book-card h-100">
                    <div class="position-relative">
                        <img src="${book.cover || 'img/default.jpg'}" class="card-img-top book-cover" alt="Cover ${book.judul}">
                        <span class="badge bg-success position-absolute top-0 end-0 m-2">${book.stok} tersedia</span>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${book.judul}</h5>
                        <p class="card-text mb-1"><small class="text-muted">${book.penulis}</small></p>
                        <span class="badge bg-secondary mb-3">${book.kategori}</span>
                        ${buttonHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    const riwayatTableBody = document.getElementById('table-riwayat-body');
    riwayatTableBody.innerHTML = userRiwayat.map(p => {
        let ulasanHtml;
        let aksiHtml;
        if (p.ulasan) {
            ulasanHtml = p.ulasan;
            aksiHtml = '<span class="text-success">Selesai</span>';
        } else {
            ulasanHtml = '<span class="text-muted">Belum ada ulasan</span>';
            aksiHtml = `<button class="btn btn-info btn-sm review-btn" data-bs-toggle="modal" data-bs-target="#ulasanModal" data-id="${p.id}" data-judul="${p.judul}">Beri Ulasan</button>`;
        }
        return `
            <tr>
                <td>${p.judul}</td>
                <td>${p.tgl_pinjam}</td>
                <td>${p.tgl_kembali || '-'}</td>
                <td>${ulasanHtml}</td>
                <td>${aksiHtml}</td>
            </tr>
        `;
    }).join('');
};


if (window.location.pathname.includes('admin.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        renderAdminDashboard();

        document.getElementById('form-tambah-buku').addEventListener('submit', (e) => {
            e.preventDefault();
            let books = DB.get('books');
            let nextId = DB.get('nextBookId');
            
            const newBook = {
                id: nextId,
                judul: document.getElementById('add-judul').value,
                penulis: document.getElementById('add-penulis').value,
                kategori: document.getElementById('add-kategori').value,
                stok: parseInt(document.getElementById('add-stok').value),
                cover: 'img/default.jpg' 
            };
            
            books[nextId] = newBook;
            DB.set('books', books);
            DB.set('nextBookId', nextId + 1);
            
            bootstrap.Modal.getInstance(document.getElementById('tambahBukuModal')).hide();
            e.target.reset();
            renderAdminDashboard();
        });

        document.getElementById('table-buku-body').addEventListener('click', (e) => {
            if (e.target.closest('.edit-btn')) {
                const bookId = parseInt(e.target.closest('.edit-btn').dataset.id);
                const book = DB.get('books')[bookId];
                
                document.getElementById('editBukuModalLabel').textContent = 'Edit Buku: ' + book.judul;
                document.getElementById('edit-book-id').value = bookId;
                document.getElementById('edit-judul').value = book.judul;
                document.getElementById('edit-penulis').value = book.penulis;
                document.getElementById('edit-kategori').value = book.kategori;
                document.getElementById('edit-stok').value = book.stok;
            }
        });

        document.getElementById('form-edit-buku').addEventListener('submit', (e) => {
            e.preventDefault();
            let books = DB.get('books');
            const bookId = parseInt(document.getElementById('edit-book-id').value);
            
            books[bookId].judul = document.getElementById('edit-judul').value;
            books[bookId].penulis = document.getElementById('edit-penulis').value;
            books[bookId].kategori = document.getElementById('edit-kategori').value;
            books[bookId].stok = parseInt(document.getElementById('edit-stok').value);
            
            DB.set('books', books);
            
            bootstrap.Modal.getInstance(document.getElementById('editBukuModal')).hide();
            renderAdminDashboard();
        });

        let deleteId;
        document.getElementById('table-buku-body').addEventListener('click', (e) => {
            if (e.target.closest('.delete-btn')) {
                const button = e.target.closest('.delete-btn');
                deleteId = parseInt(button.dataset.id);
                document.getElementById('delete-judul').textContent = button.dataset.judul;
            }
        });

        document.getElementById('btn-konfirmasi-hapus').addEventListener('click', () => {
            let books = DB.get('books');
            delete books[deleteId];
            DB.set('books', books);
            
            bootstrap.Modal.getInstance(document.getElementById('hapusModal')).hide();
            renderAdminDashboard();
        });
        
        let pinjamAksiId, pinjamAksiType;
        document.querySelectorAll('#table-pending-body, #table-dipinjam-body').forEach(table => {
            table.addEventListener('click', (e) => {
                if (e.target.closest('.aksi-btn')) {
                    const button = e.target.closest('.aksi-btn');
                    pinjamAksiId = parseInt(button.dataset.id);
                    pinjamAksiType = button.dataset.aksi;
                    const user = button.dataset.user;
                    const judul = button.dataset.judul;
                    
                    let actionText = '';
                    let titleText = '';

                    if (pinjamAksiType === 'acc') {
                        titleText = 'Setujui Peminjaman';
                        actionText = `Apakah Anda yakin ingin **ACC** permintaan pinjam dari **${user}** untuk buku **${judul}**? Aksi ini akan mengurangi stok buku.`;
                    } else if (pinjamAksiType === 'tolak') {
                        titleText = 'Tolak Peminjaman';
                        actionText = `Apakah Anda yakin ingin **menolak** permintaan pinjam dari **${user}** untuk buku **${judul}**?`;
                    } else if (pinjamAksiType === 'kembali') {
                        titleText = 'Konfirmasi Pengembalian';
                        actionText = `Apakah Anda yakin ingin mengkonfirmasi buku **${judul}** telah **kembali** dari **${user}**? Aksi ini akan menambah stok buku.`;
                    }

                    document.getElementById('aksiModalLabel').textContent = titleText;
                    document.getElementById('aksi-modal-body').innerHTML = actionText;
                    
                    new bootstrap.Modal(document.getElementById('aksiModal')).show();
                }
            });
        });
        
        document.getElementById('btn-konfirmasi-aksi').addEventListener('click', () => {
            let pinjam = DB.get('peminjaman');
            let books = DB.get('books');
            const pinjamData = pinjam[pinjamAksiId];

            if (pinjamAksiType === 'acc') {
                if (books[pinjamData.book_id].stok > 0) {
                    pinjamData.status = 1; 
                    books[pinjamData.book_id].stok--;
                } else {
                    alert('Stok buku tidak cukup!');
                    bootstrap.Modal.getInstance(document.getElementById('aksiModal')).hide();
                    return;
                }
            } else if (pinjamAksiType === 'tolak') {
                pinjamData.status = 3;
            } else if (pinjamAksiType === 'kembali') {
                pinjamData.status = 2;
                pinjamData.tgl_kembali = new Date().toISOString().slice(0, 10); // Tanggal hari ini
                books[pinjamData.book_id].stok++;
            }
            
            DB.set('peminjaman', pinjam);
            DB.set('books', books);

            bootstrap.Modal.getInstance(document.getElementById('aksiModal')).hide();
            renderAdminDashboard();
        });
    });
} 

if (window.location.pathname.includes('user.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        renderUserDashboard();
        const currentUser = 'Sheilla Cantika '; 

        document.getElementById('search-button').addEventListener('click', () => {
            const query = document.getElementById('search-input').value;
            renderUserDashboard(query);
        });

        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = document.getElementById('search-input').value;
                renderUserDashboard(query);
            }
        });

        let pinjamBookId;
        document.getElementById('katalog-buku-container').addEventListener('click', (e) => {
            if (e.target.closest('.pinjam-btn')) {
                const button = e.target.closest('.pinjam-btn');
                pinjamBookId = parseInt(button.dataset.id);
                document.getElementById('judulBukuPinjam').textContent = button.dataset.judul;
                document.getElementById('pinjam-book-id').value = pinjamBookId;
            }
        });

        document.getElementById('btn-konfirmasi-pinjam').addEventListener('click', () => {
            let pinjam = DB.get('peminjaman');
            let nextId = DB.get('nextPinjamId');
            let books = DB.get('books');

            const book = books[pinjamBookId];

            const isPending = Object.values(pinjam).some(p => 
                p.user === currentUser && p.book_id === pinjamBookId && p.status === 0
            );

            if (isPending) {
                alert('Anda sudah memiliki permintaan pinjam yang menunggu ACC untuk buku ini!');
            } else if (book.stok > 0) {
                const newPinjam = {
                    id: nextId,
                    user: currentUser,
                    book_id: pinjamBookId,
                    judul: book.judul,
                    tgl_pinjam: new Date().toISOString().slice(0, 10),
                    batas_kembali: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), 
                    status: 0 
                };
                pinjam[nextId] = newPinjam;
                DB.set('peminjaman', pinjam);
                DB.set('nextPinjamId', nextId + 1);
                
                alert(`Permintaan pinjam buku ${book.judul} berhasil diajukan! Menunggu ACC Admin.`);
            } else {
                alert('Stok buku ini habis.');
            }

            bootstrap.Modal.getInstance(document.getElementById('pinjamModal')).hide();
            renderUserDashboard();
        });

        let ulasanPinjamId;
        document.getElementById('table-riwayat-body').addEventListener('click', (e) => {
            if (e.target.closest('.review-btn')) {
                const button = e.target.closest('.review-btn');
                ulasanPinjamId = parseInt(button.dataset.id);
                document.getElementById('ulasan-judul-buku').textContent = button.dataset.judul;
                document.getElementById('ulasan-pinjam-id').value = ulasanPinjamId;
                document.getElementById('ulasan-text').value = DB.get('peminjaman')[ulasanPinjamId].ulasan || '';
            }
        });

        document.getElementById('btn-konfirmasi-ulasan').addEventListener('click', () => {
            let pinjam = DB.get('peminjaman');
            const ulasanText = document.getElementById('ulasan-text').value;

            pinjam[ulasanPinjamId].ulasan = ulasanText;
            DB.set('peminjaman', pinjam);

            bootstrap.Modal.getInstance(document.getElementById('ulasanModal')).hide();
            renderUserDashboard();
        });
    });
}