// ... existing code ...
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logoutBtn').onclick = async () => {
        await fetch('/admin-api/logout', { method: 'POST', credentials: 'include' });
        window.location.href = 'dashboard.html';
    };

    async function loadArtworks() {
        const res = await fetch('/admin-api/artworks', { credentials: 'include' });
        const artworks = await res.json();
        const tbody = document.querySelector('#artworks-table tbody');
        tbody.innerHTML = '';
        artworks.forEach(art => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${art.id}</td>
                <td>${art.title}</td>
                <td>${art.artist}</td>
                <td>${art.category}</td>
                <td>${art.price}</td>
                <td>${art.sold ? 'Yes' : 'No'}</td>
                <td>
                    <button onclick="editArtwork(${art.id})">Edit</button>
                    <button onclick="deleteArtwork(${art.id})">Delete</button>
                    <button onclick="toggleSold(${art.id}, ${art.sold})">${art.sold ? 'Mark Unsold' : 'Mark Sold'}</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    async function loadOrders() {
        const res = await fetch('/admin-api/orders', { credentials: 'include' });
        const orders = await res.json();
        const tbody = document.querySelector('#orders-table tbody');
        tbody.innerHTML = '';
        orders.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${order.id}</td>
                <td>${order.artwork_id}</td>
                <td>${order.buyer}</td>
                <td>${order.price}</td>
                <td>${order.date}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.editArtwork = function(id) {
        alert('Edit functionality coming soon.');
    };
    window.deleteArtwork = async function(id) {
        if (confirm('Delete this artwork?')) {
            await fetch(`/admin-api/artworks/${id}`, { method: 'DELETE', credentials: 'include' });
            loadArtworks();
        }
    };
    window.toggleSold = async function(id, sold) {
        await fetch(`/admin-api/artworks/${id}/${sold ? 'unsold' : 'sold'}`, { method: 'POST', credentials: 'include' });
        loadArtworks();
    };

    loadArtworks();
    loadOrders();

    document.getElementById('addArtworkBtn').onclick = function() {
        alert('Add Artwork functionality coming soon.');
    };
});
// ... existing code ...