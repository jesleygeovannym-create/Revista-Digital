(function () {
  window.RevistaDigital = window.RevistaDigital || {};
  const media360 = window.RevistaDigital.media360 || {};

  function render360() {
    return `
      <div class="spread media-spread">
        <div class="media-header">
          <div>
            <small>RECORRIDO VIRTUAL</small>
            <h1>Exploración 360°</h1>
          </div>

          <button class="media-add-button" id="media360AddButton" type="button">
            + Agregar imagen 360°
          </button>
        </div>

        <div class="media-content">
          <div class="media-form" id="media360Form">
            <input type="hidden" id="media360EditId" />

            <label>
              Hotel
              <select id="media360Hotel">
                ${(window.getHotelNames ? window.getHotelNames() : [])
                  .map((hotel) => `<option value="${hotel}">${hotel}</option>`)
                  .join("")}
              </select>
            </label>

            <label>
              Título
              <input type="text" id="media360Title" placeholder="Nombre del recorrido" />
            </label>

            <label>
              Imagen 360°
              <input type="file" id="media360Image" accept="image/*" />
            </label>

            <div class="media-form-actions">
              <button type="button" id="media360SaveButton">PUBLICAR</button>
              <button type="button" class="media-cancel" id="media360CancelButton">CANCELAR</button>
            </div>
          </div>

          <div class="media-selector">
            <label for="media360Filter">Hotel:</label>
            <select id="media360Filter">
              <option value="all">Todos</option>
              ${(window.getHotelNames ? window.getHotelNames() : [])
                .map((hotel) => `<option value="${hotel}">${hotel}</option>`)
                .join("")}
            </select>
          </div>

          <div class="media-grid" id="media360Grid"></div>
        </div>
      </div>
    `;
  }

  async function render360Cards() {
    const container = document.getElementById("media360Grid");
    if (!container) return;

    const filter = document.getElementById("media360Filter")?.value || "all";
    const items = await window.databaseGetAll("media360");
    const filtered = filter === "all" ? items : items.filter((item) => item.hotel === filter);

    if (!filtered.length) {
      container.innerHTML = `<div class="media-empty">No hay imágenes 360° para este hotel.</div>`;
      return;
    }

    container.innerHTML = "";

    filtered.forEach((item) => {
      const url = window.createMediaUrl ? window.createMediaUrl(item.image) : item.image;
      const card = document.createElement("article");
      card.className = "media-card";
      card.innerHTML = `
        <img class="media-card-image" src="${url}" alt="${item.title}" />
        <div class="media-card-content">
          <h3>${item.title}</h3>
          <p>${item.hotel}</p>
          <div class="media-card-actions">
            <button type="button" data-360-edit="${item.id}">EDITAR</button>
            <button type="button" class="media-delete" data-360-delete="${item.id}">ELIMINAR</button>
          </div>
        </div>
      `;

      container.appendChild(card);

      card.querySelector("[data-360-edit]")?.addEventListener("click", () => edit360(item.id));
      card.querySelector("[data-360-delete]")?.addEventListener("click", () => delete360(item.id));
    });
  }

  async function edit360(id) {
    const items = await window.databaseGetAll("media360");
    const item = items.find((entry) => String(entry.id) === String(id));

    if (!item) return;

    document.getElementById("media360EditId").value = item.id;
    document.getElementById("media360Hotel").value = item.hotel;
    document.getElementById("media360Title").value = item.title;
    document.getElementById("media360Form").classList.add("visible");
    document.getElementById("media360SaveButton").textContent = "GUARDAR CAMBIOS";
  }

  async function delete360(id) {
    await window.databaseDelete("media360", id);
    await render360Cards();
  }

  function reset360Form() {
    document.getElementById("media360EditId").value = "";
    document.getElementById("media360Title").value = "";
    document.getElementById("media360Image").value = "";
    document.getElementById("media360SaveButton").textContent = "PUBLICAR";
  }

  function wire360() {
    const addButton = document.getElementById("media360AddButton");
    const form = document.getElementById("media360Form");
    const saveButton = document.getElementById("media360SaveButton");
    const cancelButton = document.getElementById("media360CancelButton");
    const filter = document.getElementById("media360Filter");

    if (!addButton || !form) return;

    addButton.addEventListener("click", () => {
      form.classList.toggle("visible");
    });

    cancelButton.addEventListener("click", () => {
      reset360Form();
      form.classList.remove("visible");
    });

    filter?.addEventListener("change", render360Cards);

    saveButton.addEventListener("click", async () => {
      const editId = document.getElementById("media360EditId").value;
      const hotel = document.getElementById("media360Hotel").value;
      const title = document.getElementById("media360Title").value.trim();
      const file = document.getElementById("media360Image").files[0];

      if (!title) {
        alert("Escribe un título.");
        return;
      }

      if (!editId && !file) {
        alert("Selecciona una imagen 360°.");
        return;
      }

      if (editId) {
        const items = await window.databaseGetAll("media360");
        const current = items.find((item) => String(item.id) === String(editId));

        let image = current.image;
        if (file) {
          image = await window.fileToDataURL(file);
        }

        await window.databasePut("media360", {
          ...current,
          hotel,
          title,
          image
        });
      } else {
        const image = await window.fileToDataURL(file);
        await window.databaseAdd("media360", {
          hotel,
          title,
          image,
          createdAt: Date.now()
        });
      }

      reset360Form();
      form.classList.remove("visible");
      await render360Cards();
    });
  }

  media360.render = render360;
  media360.renderCards = render360Cards;
  media360.edit = edit360;
  media360.delete = delete360;
  media360.resetForm = reset360Form;
  media360.wire = wire360;

  window.render360 = window.render360 || render360;
  window.render360Cards = window.render360Cards || render360Cards;
  window.edit360 = window.edit360 || edit360;
  window.delete360 = window.delete360 || delete360;
  window.reset360Form = window.reset360Form || reset360Form;
  window.wire360 = window.wire360 || wire360;

  window.RevistaDigital.media360 = media360;
})();
