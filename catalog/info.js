async function loadInfo() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));

  if (isNaN(id)) {
    document.getElementById("info").textContent = "No photo selected.";
    return;
  }

  try {
    const res = await fetch("data.json");
    const items = await res.json();
    const photo = items[id];

    if (!photo) {
      document.getElementById("info").textContent = "Photo not found.";
      return;
    }

    const container = document.getElementById("info");

    // Build the info card
    const card = document.createElement("article");
    card.className = "card";
    card.style.maxWidth = "600px";
    card.style.margin = "0 auto";

    // Image with hover overlay (optional)
    const imgWrapper = document.createElement("div");
    imgWrapper.className = "img-wrapper";

    const img = document.createElement("img");
    img.src = photo.url;
    img.alt = photo.title || "";

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.textContent = photo.title || "";

    imgWrapper.appendChild(img);
    imgWrapper.appendChild(overlay);

    // Meta information
    const meta = document.createElement("div");
    meta.className = "meta";

    const title = document.createElement("h2");
    title.textContent = photo.title || "";

    const specs = document.createElement("p");
    const added = new Date(photo.added_date).toLocaleDateString();
    specs.textContent = `Added: ${added} • Views: ${photo.views ?? 0}`;

    const download = document.createElement("a");
    download.href = photo.url;
    download.download = "";
    download.textContent = "Download Photo";
    download.style.display = "inline-block";
    download.style.marginTop = "10px";
    download.style.color = "#111";
    download.style.fontWeight = "600";
    download.style.textDecoration = "none";

    meta.appendChild(title);
    meta.appendChild(specs);
    meta.appendChild(download);

    card.appendChild(imgWrapper);
    card.appendChild(meta);
    container.appendChild(card);
  } catch (err) {
    console.error(err);
    document.getElementById("info").textContent = "Error loading photo info.";
  }
}

window.addEventListener("DOMContentLoaded", loadInfo);
