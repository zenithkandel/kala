const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const grid = $("#grid");
const emptyState = $("#emptyState");
const themeToggle = $("#themeToggle");
const searchInput = $("#searchInput");
const categorySelect = $("#categorySelect");
const priceSelect = $("#priceSelect");
const yearSpan = $("#year");
const buyDialog = $("#buyDialog");
const buyForm = $("#buyForm");
const buyArtworkId = $("#buyArtworkId");
const toast = $("#toast");
yearSpan.textContent = new Date().getFullYear();

// Theme handling
const savedTheme = localStorage.getItem("kalaa-theme");
if(savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
themeToggle.addEventListener("click", () => {
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("kalaa-theme", next);
});

// Fetch & render artworks
async function fetchArtworks(){
  const params = new URLSearchParams();
  if(searchInput.value.trim()) params.set('search', searchInput.value.trim());
  if(categorySelect.value) params.set('category', categorySelect.value);
  if(priceSelect.value) params.set('maxPrice', priceSelect.value);
  params.set('includeSold', 'false');

  const res = await fetch(`/api/artworks?${params.toString()}`);
  const items = await res.json();
  render(items);
}

function render(items){
  grid.innerHTML = '';
  if(!items.length){
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;
  for(const item of items){
    grid.appendChild(card(item));
  }
}

function card(item){
  const el = document.createElement('article');
  el.className = 'card';
  const imgSrc = item.image_url || 'https://picsum.photos/seed/' + (item.id || item.title) + '/800/600';
  el.innerHTML = `
    <img class="art-img" src="${imgSrc}" alt="${escapeHtml(item.title)} by ${escapeHtml(item.artist_name)}" loading="lazy">
    <div class="content">
      <div class="title">
        <h4 title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h4>
        <span class="price">NPR ${item.price}</span>
      </div>
      <div class="artist" title="${escapeHtml(item.artist_name)}">by ${escapeHtml(item.artist_name)}</div>
      <div class="badges">
        <span class="badge">${escapeHtml(item.category || 'Art')}</span>
        ${item.is_sold ? '<span class="badge">Sold</span>' : ''}
      </div>
      <div class="actions">
        <button class="primary" ${item.is_sold ? 'disabled' : ''} data-id="${item.id}">${item.is_sold ? 'Sold Out' : 'Buy'}</button>
        <button class="ghost" data-view="${item.id}">Details</button>
      </div>
    </div>
  `;
  el.querySelector('.primary')?.addEventListener('click', () => openBuy(item));
  el.querySelector('[data-view]')?.addEventListener('click', () => {
    notify(item.description ? item.description : 'No description provided.');
  });
  return el;
}

function openBuy(item){
  buyArtworkId.value = item.id;
  buyDialog.showModal();
  $("#confirmBuy").onclick = async (e) => {
    e.preventDefault();
    const buyer_name = $("#buyerName").value.trim();
    const buyer_email = $("#buyerEmail").value.trim();
    if(!buyer_name || !buyer_email) return;
    const payload = { artwork_id: item.id, buyer_name, buyer_email, amount: item.price };
    const res = await fetch('/api/artworks/order', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(data && data.success){
      notify('Thank you! Order placed.');
      buyDialog.close();
      fetchArtworks();
    } else {
      notify(data.error || 'Failed to place order.');
    }
  };
}

function notify(msg){
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(notify._t);
  notify._t = setTimeout(()=> toast.classList.remove('show'), 1800);
}

function escapeHtml(str){
  return String(str).replace(/[&<>'"]/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  })[s]);
}

// Filters listeners (debounced)
let t;
const refresh = () => { clearTimeout(t); t = setTimeout(fetchArtworks, 200); };
[searchInput, categorySelect, priceSelect].forEach(el => el.addEventListener('input', refresh));

// Submit form (demo add)
$("#submitForm").addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.price = Number(payload.price);
  const res = await fetch('/api/artworks', { method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  const data = await res.json();
  if(data.id){
    notify('Artwork added 👏');
    form.reset();
    fetchArtworks();
  } else {
    notify(data.error || 'Failed to add artwork');
  }
});

// initial load
fetchArtworks();
