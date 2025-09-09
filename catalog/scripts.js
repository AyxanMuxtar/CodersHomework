const ITEMS_PER_PAGE = 9;
let items = [];
let filtered = [];
let currentPage = 1;

async function loadData() {
  try {
    const res = await fetch("data.json");
    items = await res.json();
    filtered = items.slice();
    renderPage(1);
    buildPagination();
  } catch (err) {
    console.error("Error loading data.json:", err);
  }
}

function renderPage(page) {
  currentPage = page;
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = filtered.slice(start, end);

  pageItems.forEach((it, index) => {
    const card = document.createElement("article");
    card.className = "card";

    // LINK to internal info.html
    const link = document.createElement("a");
    link.href = `info.html?id=${index}`;
    link.className = "img-wrapper";

    // IMAGE
    const img = document.createElement("img");
    img.src = it.url;
    img.alt = it.title || "";
    img.onerror = () => { img.style.display = "none"; };

    // HOVER OVERLAY
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.textContent = it.title || "";

    link.appendChild(img);
    link.appendChild(overlay);

    // META
    const meta = document.createElement("div");
    meta.className = "meta";

    const title = document.createElement("h4");
    title.className = "title";
    title.textContent = it.title || "";

    const specs = document.createElement("div");
    specs.className = "specs";
    const added = new Date(it.added_date).toLocaleDateString();
    specs.innerHTML = `Added: ${added} • Views: ${it.views ?? 0}`;

    meta.appendChild(title);
    meta.appendChild(specs);

    card.appendChild(link);
    card.appendChild(meta);
    gallery.appendChild(card);
  });
}

function buildPagination() {
  const pages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const container = document.getElementById("pagination");
  container.innerHTML = "";
  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement("button");
    btn.className = "page-btn" + (i === currentPage ? " active" : "");
    btn.textContent = i;
    btn.onclick = () => {
      renderPage(i);
      updateActivePage(i);
    };
    container.appendChild(btn);
  }
}

function updateActivePage(i) {
  document.querySelectorAll(".page-btn").forEach((b) =>
    b.classList.remove("active")
  );
  const btns = document.querySelectorAll(".page-btn");
  btns[i - 1]?.classList.add("active");
}

function doSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) filtered = items.slice();
  else {
    filtered = items.filter((it) => {
      const t = (it.title || "") + " " + (it.description || "") + " " + (it.tags || "");
      return t.toLowerCase().includes(q);
    });
  }
  renderPage(1);
  buildPagination();
}

window.addEventListener("DOMContentLoaded", () => {
  loadData();
  document.getElementById("searchBtn").addEventListener("click", () => {
    doSearch(document.getElementById("searchInput").value);
  });
  document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch(e.target.value);
  });
});
