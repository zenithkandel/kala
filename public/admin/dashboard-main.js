// ... existing code ...
// Dashboard Main JS for Admin Panel

const artworksTableBody = document.getElementById('artworksTableBody');
const ordersTableBody = document.getElementById('ordersTableBody');
const logoutBtn = document.getElementById('logoutBtn');
const addArtworkBtn = document.getElementById('addArtworkBtn');
const artworksPagination = document.getElementById('artworksPagination');
const ordersPagination = document.getElementById('ordersPagination');

let artworksPage = 1;
let artworksLimit = 10;
let artworksTotalPages = 1;
let ordersPage = 1;
let ordersLimit = 10;
let ordersTotalPages = 1;

logoutBtn.onclick = function() {
    fetch('/admin-api/logout', { method: 'POST' })
        .then(() => window.location.href = '/admin/login.html');
};

addArtworkBtn.onclick = function() {
    window.location.href = '/admin/add-art.html';
};

function renderArtworks(artworks) {
    artworksTableBody.innerHTML = '';
    artworks.forEach(art => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${art.id}</td>
            <td>${art.title}</td>
            <td>${art.artist}</td>
            <td>${art.price}</td>
            <td>${art.category}</td>
            <td><img src="${art.image_url}" alt="Artwork" style="max-width:60px;max-height:60px;"></td>
            <td>${art.sold ? 'Yes' : 'No'}</td>
            <td>
                <button onclick="editArtwork(${art.id})">Edit</button>
                <button onclick="deleteArtwork(${art.id})">Delete</button>
                <button onclick="toggleSold(${art.id}, ${art.sold ? 'false' : 'true'})">${art.sold ? 'Mark Unsold' : 'Mark Sold'}</button>
            </td>
        `;
        artworksTableBody.appendChild(tr);
    });
}

function renderOrders(orders) {
    ordersTableBody.innerHTML = '';
    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.id}</td>
            <td>${order.artwork_id}</td>
            <td>${order.buyer_name}</td>
            <td>${order.buyer_email}</td>
            <td>${order.price}</td>
            <td>${order.status}</td>
            <td>${order.created_at}</td>
        `;
        ordersTableBody.appendChild(tr);
    });
}

function renderPagination(container, currentPage, totalPages, onPageChange) {
    container.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.disabled = i === currentPage;
        btn.onclick = () => onPageChange(i);
        container.appendChild(btn);
    }
}

function loadArtworks(page = 1) {
    fetch(`/admin-api/artworks?page=${page}&limit=${artworksLimit}`)
        .then(res => res.json())
        .then(data => {
            renderArtworks(data.artworks);
            artworksTotalPages = Math.ceil(data.total / artworksLimit);
            renderPagination(artworksPagination, page, artworksTotalPages, (p) => {
                artworksPage = p;
                loadArtworks(p);
            });
        });
}

function loadOrders(page = 1) {
    fetch(`/admin-api/orders?page=${page}&limit=${ordersLimit}`)
        .then(res => res.json())
        .then(data => {
            renderOrders(data.orders);
            ordersTotalPages = Math.ceil(data.total / ordersLimit);
            renderPagination(ordersPagination, page, ordersTotalPages, (p) => {
                ordersPage = p;
                loadOrders(p);
            });
        });
}

window.editArtwork = function(id) {
    window.location.href = `/admin/edit-art.html?id=${id}`;
};

window.deleteArtwork = function(id) {
    if (confirm('Are you sure you want to delete this artwork?')) {
        fetch(`/admin-api/artworks/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    loadArtworks(artworksPage);
                } else {
                    alert('Failed to delete artwork.');
                }
            });
    }
};

window.toggleSold = function(id, sold) {
    fetch(`/admin-api/artworks/${id}/sold`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sold: sold })
    })
    .then(res => {
        if (res.ok) {
            loadArtworks(artworksPage);
        } else {
            alert('Failed to update sold status.');
        }
    });
};

// Initial load
loadArtworks(artworksPage);
loadOrders(ordersPage);
// ... existing code ...