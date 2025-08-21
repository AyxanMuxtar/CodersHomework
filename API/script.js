let paintings = [];

document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("paintingContainer");
  const authorFilter = document.getElementById("authorFilter");
  const genreFilter = document.getElementById("genreFilter");
  const museumFilter = document.getElementById("museumFilter");

  const showFormBtn = document.getElementById("showFormBtn");
  const newPaintingForm = document.getElementById("newPaintingForm");
  const addPaintingBtn = document.getElementById("addPaintingBtn");
  const cancelPaintingBtn = document.getElementById("cancelPaintingBtn");

  // Load paintings.json
  fetch("paintings.json")
    .then(res => res.json())
    .then(data => {
      paintings = data;
      renderPaintings(paintings);
      populateFilters();
    })
    .catch(err => console.error("Error loading paintings.json:", err));

  // ------------------ Filters ------------------
  function populateFilters() {
    const authors = [...new Set(paintings.map(p => p.author))];
    const genres = [...new Set(paintings.map(p => p.genre))];
    const museums = [...new Set(paintings.map(p => p.museum))];

    authors.forEach(a => addOption(authorFilter, a));
    genres.forEach(g => addOption(genreFilter, g));
    museums.forEach(m => addOption(museumFilter, m));
  }

  function addOption(select, value) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    select.appendChild(opt);
  }

  authorFilter.addEventListener("change", applyFilters);
  genreFilter.addEventListener("change", applyFilters);
  museumFilter.addEventListener("change", applyFilters);

  function applyFilters() {
    const a = authorFilter.value;
    const g = genreFilter.value;
    const m = museumFilter.value;

    const filtered = paintings.filter(p =>
      (!a || p.author === a) &&
      (!g || p.genre === g) &&
      (!m || p.museum === m)
    );
    renderPaintings(filtered);
  }

  // ------------------ Render Paintings ------------------
  function renderPaintings(data) {
    container.innerHTML = "";
    data.forEach(p => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.image}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p><strong>Author:</strong> ${p.author}</p>
        <p><strong>Genre:</strong> ${p.genre}</p>
        <p><strong>Museum:</strong> ${p.museum}</p>
        <button onclick="viewDetails(${p.id})">Read More</button>
        <div class="add-section">
          <textarea placeholder="Add your note..."></textarea>
          <button onclick="addNote(${p.id}, this)">Add</button>
        </div>
        <div class="notes" id="notes-${p.id}">
          <h4>Notes:</h4>
        </div>
      `;
      container.appendChild(card);

      // Load saved notes from localStorage
      const savedNotes = JSON.parse(localStorage.getItem(`notes-${p.id}`)) || [];
      const notesDiv = document.getElementById(`notes-${p.id}`);
      savedNotes.forEach(note => {
        const pNote = document.createElement("p");
        pNote.textContent = note;
        notesDiv.appendChild(pNote);
      });
    });
  }

  // ------------------ Notes ------------------
  window.addNote = (id, btn) => {
    const textarea = btn.previousElementSibling;
    const text = textarea.value.trim();
    if (!text) return;

    let notes = JSON.parse(localStorage.getItem(`notes-${id}`)) || [];
    notes.push(text);
    localStorage.setItem(`notes-${id}`, JSON.stringify(notes));

    const notesDiv = document.getElementById(`notes-${id}`);
    const p = document.createElement("p");
    p.textContent = text;
    notesDiv.appendChild(p);

    textarea.value = "";
  }

  // ------------------ Details ------------------
  window.viewDetails = (id) => {
    localStorage.setItem("selectedPainting", id);
    window.location.href = "details.html";
  }

  // ------------------ Add New Painting ------------------
  showFormBtn.addEventListener("click", () => {
    newPaintingForm.style.display = "block";
  });

  cancelPaintingBtn.addEventListener("click", () => {
    newPaintingForm.style.display = "none";
  });

  addPaintingBtn.addEventListener("click", () => {
    const title = document.getElementById("newTitle").value.trim();
    const author = document.getElementById("newAuthor").value.trim();
    const genre = document.getElementById("newGenre").value.trim();
    const museum = document.getElementById("newMuseum").value.trim();
    const image = document.getElementById("newImage").value.trim();
    const description = document.getElementById("newDescription").value.trim();

    if (!title || !author || !genre || !museum || !image || !description) {
      alert("Please fill in all fields!");
      return;
    }

    const newPainting = {
      id: Date.now(),
      title,
      author,
      genre,
      museum,
      image,
      description
    };

    paintings.push(newPainting);
    renderPaintings(paintings);
    populateFilters();

    newPaintingForm.style.display = "none";
    document.getElementById("newTitle").value = "";
    document.getElementById("newAuthor").value = "";
    document.getElementById("newGenre").value = "";
    document.getElementById("newMuseum").value = "";
    document.getElementById("newImage").value = "";
    document.getElementById("newDescription").value = "";

    alert("New painting added successfully!");
  });

});
