(function () {
  window.RevistaDigital = window.RevistaDigital || {};
  const videos = window.RevistaDigital.videos || {};

  function renderVideos() {
    return `
      <div class="spread media-spread">

        <div class="media-header">

          <div>
            <small>EXPERIENCIAS EN VIDEO</small>
            <h1>Videos</h1>
          </div>

          <button
            class="media-add-button"
            id="videosAddButton"
            type="button"
          >
            + Agregar video
          </button>

        </div>

        <div class="media-content">

          <div
            class="media-form"
            id="videosForm"
          >

            <input
              type="hidden"
              id="videosEditId"
            />

            <label>
              Hotel

              <select id="videosHotel">
                ${window.getHotelNames()
                  .map(
                    (hotel) =>
                      `<option value="${hotel}">${hotel}</option>`
                  )
                  .join("")}
              </select>
            </label>

            <label>
              Título

              <input
                type="text"
                id="videosTitle"
                placeholder="Nombre del video"
              />
            </label>

            <label>
              Video

              <input
                type="file"
                id="videosFile"
                accept="video/*"
              />
            </label>

            <video
              class="video-preview"
              id="videosPreview"
              controls
            ></video>

            <div
              class="video-duration-info"
              id="videosDurationInfo"
            >
              Selecciona un video para establecer el fragmento.
            </div>

            <div class="video-time-row">

              <label>
                Inicio (segundos)

                <input
                  type="number"
                  id="videosStart"
                  min="0"
                  step="0.1"
                  value="0"
                />
              </label>

              <label>
                Final (segundos)

                <input
                  type="number"
                  id="videosEnd"
                  min="0"
                  step="0.1"
                  value="35"
                />
              </label>

            </div>

            <div class="media-note">
              El fragmento publicado no puede superar los 35 segundos.
            </div>

            <div class="media-form-actions">

              <button
                type="button"
                id="videosSaveButton"
              >
                PUBLICAR
              </button>

              <button
                type="button"
                class="media-cancel"
                id="videosCancelButton"
              >
                CANCELAR
              </button>

            </div>

          </div>

          <div
            class="media-selector"
          >

            <label for="videosFilter">
              Hotel:
            </label>

            <select id="videosFilter">

              <option value="all">
                Todos
              </option>

              ${window.getHotelNames()
                .map(
                  (hotel) =>
                    `<option value="${hotel}">${hotel}</option>`
                )
                .join("")}

            </select>

          </div>

          <div
            class="media-grid"
            id="videosGrid"
          ></div>

        </div>

      </div>
    `;
  }

  async function renderVideoCards() {
    const container = document.getElementById("videosGrid");

    if (!container) return;

    const filter = document.getElementById("videosFilter")?.value || "all";

    const { data: items, error } = await supabaseClient
      .from("videos")
      .select("*, mimeType:mime_type")
      .order("created_at", {
        ascending: false
      });

    if (error) {
      console.error("ERROR AL CARGAR VIDEOS:", error);
      return;
    }

    const filtered = filter === "all" ? items : items.filter((item) => item.hotel === filter);

    if (!filtered.length) {
      container.innerHTML = `
        <div class="media-empty">
          No hay videos publicados para este hotel.
        </div>
      `;

      return;
    }

    container.innerHTML = "";

    filtered.forEach((item) => {
      const url = window.createMediaUrl(item.video);

      const card = document.createElement("article");

      card.className = "media-card";

      card.innerHTML = `
        <video
          class="media-card-video"
          controls
          data-video-start="${item.start}"
          data-video-end="${item.end}"
        >
          <source
            src="${url}"
            type="${item.mimeType || "video/mp4"}"
          >
        </video>

        <div class="media-card-content">

          <h3>
            ${item.title}
          </h3>

          <p>
            ${item.hotel}
          </p>

          <p>
            Fragmento:
            ${Number(item.start).toFixed(1)}s - 
                      ${Number(item.end).toFixed(1)}s
          </p>

          <div class="media-card-actions">

            <button
              type="button"
              data-video-edit="${item.id}"
            >
              EDITAR
            </button>

            <button
              type="button"
              class="media-delete"
              data-video-delete="${item.id}"
            >
              ELIMINAR
            </button>

          </div>

        </div>
      `;

      container.appendChild(card);

      const video = card.querySelector("video");

      video.addEventListener("loadedmetadata", () => {
        video.currentTime = Number(item.start);

        video.addEventListener("timeupdate", () => {
          if (video.currentTime >= Number(item.end)) {
            video.pause();
            video.currentTime = Number(item.start);
          }
        });
      });

      card
        .querySelector("[data-video-edit]")
        .addEventListener("click", () => editVideo(item.id));

      card
        .querySelector("[data-video-delete]")
        .addEventListener("click", () => deleteVideo(item.id));
    });
  }

  async function editVideo(id) {
    const { data: item, error } = await supabaseClient
      .from("videos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("ERROR AL CARGAR VIDEO PARA EDITAR:", error);
      return;
    }

    if (!item) return;

    document.getElementById("videosEditId").value = item.id;
    document.getElementById("videosHotel").value = item.hotel;
    document.getElementById("videosTitle").value = item.title;
    document.getElementById("videosStart").value = item.start;
    document.getElementById("videosEnd").value = item.end;

    const preview = document.getElementById("videosPreview");
    const url = window.createMediaUrl(item.video);

    preview.src = url;
    preview.classList.add("visible");

    document.getElementById("videosForm").classList.add("visible");
    document.getElementById("videosSaveButton").textContent = "GUARDAR CAMBIOS";
  }

  async function deleteVideo(id) {
    const { error } = await supabaseClient
      .from("videos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("ERROR AL ELIMINAR VIDEO:", error);
      return;
    }

    await renderVideoCards();
  }

  function resetVideoForm() {
    document.getElementById("videosEditId").value = "";
    document.getElementById("videosTitle").value = "";
    document.getElementById("videosFile").value = "";
    document.getElementById("videosStart").value = "0";
    document.getElementById("videosEnd").value = "35";

    const preview = document.getElementById("videosPreview");

    preview.pause();
    preview.removeAttribute("src");
    preview.load();
    preview.classList.remove("visible");

    document.getElementById("videosDurationInfo").textContent =
      "Selecciona un video para establecer el fragmento.";

    document.getElementById("videosSaveButton").textContent = "PUBLICAR";
  }

  function wireVideos() {
    const addButton = document.getElementById("videosAddButton");
    const form = document.getElementById("videosForm");
    const saveButton = document.getElementById("videosSaveButton");
    const cancelButton = document.getElementById("videosCancelButton");
    const filter = document.getElementById("videosFilter");
    const fileInput = document.getElementById("videosFile");
    const preview = document.getElementById("videosPreview");
    const startInput = document.getElementById("videosStart");
    const endInput = document.getElementById("videosEnd");
    const durationInfo = document.getElementById("videosDurationInfo");

    if (!addButton || !form) return;

    addButton.addEventListener("click", () => {
      form.classList.toggle("visible");
    });

    cancelButton.addEventListener("click", () => {
      resetVideoForm();
      form.classList.remove("visible");
    });

    filter.addEventListener("change", renderVideoCards);

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];

      if (!file) return;

      const url = URL.createObjectURL(file);

      preview.src = url;
      preview.classList.add("visible");

      preview.onloadedmetadata = () => {
        const duration = preview.duration;

        durationInfo.textContent =
          `Duración del video: ${duration.toFixed(1)} segundos. El fragmento publicado puede tener máximo 35 segundos.`;

        startInput.value = "0";
        endInput.value = Math.min(35, duration).toFixed(1);
        preview.currentTime = 0;
      };
    });

    startInput.addEventListener("input", () => {
      const start = Number(startInput.value);
      const end = Number(endInput.value);

      if (preview.duration && start >= 0 && start < preview.duration) {
        preview.currentTime = start;
      }

      if (end - start > 35) {
        endInput.value = Math.min(preview.duration || 35, start + 35).toFixed(1);
      }
    });

    endInput.addEventListener("input", () => {
      const start = Number(startInput.value);

      let end = Number(endInput.value);

      if (end - start > 35) {
        end = start + 35;
        endInput.value = end.toFixed(1);
      }

      if (preview.duration && end <= preview.duration) {
        preview.currentTime = Math.max(start, end - 0.1);
      }
    });

    saveButton.addEventListener("click", async () => {
      const editId = document.getElementById("videosEditId").value;
      const hotel = document.getElementById("videosHotel").value;
      const title = document.getElementById("videosTitle").value.trim();
      const file = fileInput.files[0];
      const start = Number(startInput.value);
      const end = Number(endInput.value);

      if (!title) {
        alert("Escribe un título.");
        return;
      }

      if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || end <= start) {
        alert("Revisa el inicio y el final del fragmento.");
        return;
      }

      if (end - start > 35) {
        alert("El fragmento no puede superar los 35 segundos.");
        return;
      }

      if (!editId && !file) {
        alert("Selecciona un video.");
        return;
      }

      if (preview.duration && end > preview.duration) {
        alert("El tiempo final supera la duración del video.");
        return;
      }

      if (editId) {
        const { data: current, error: currentError } = await supabaseClient
          .from("videos")
          .select("*")
          .eq("id", editId)
          .single();

        if (currentError || !current) {
          console.error("ERROR AL CARGAR VIDEO ACTUAL:", currentError);
          alert("No se pudo cargar el video.");
          return;
        }

        let videoUrl = current.video;
        let mimeType = current.mime_type;

        if (file) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabaseClient.storage
            .from("videos")
            .upload(fileName, file, {
              contentType: file.type || "video/mp4",
              upsert: false
            });

          if (uploadError) {
            console.error("ERROR AL SUBIR VIDEO:", uploadError);
            alert("No se pudo subir el nuevo video.");
            return;
          }

          const { data: publicUrlData } = supabaseClient.storage
            .from("videos")
            .getPublicUrl(fileName);

          videoUrl = publicUrlData.publicUrl;
          mimeType = file.type || "video/mp4";
        }

        const { error: updateError } = await supabaseClient
          .from("videos")
          .update({
            hotel,
            title,
            video: videoUrl,
            mime_type: mimeType,
            start,
            end
          })
          .eq("id", editId);

        if (updateError) {
          console.error("ERROR AL ACTUALIZAR VIDEO:", updateError);
          alert("No se pudo actualizar el video.");
          return;
        }
      } else {
        const fileExt = file.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabaseClient.storage
          .from("videos")
          .upload(fileName, file, {
            contentType: file.type || "video/mp4",
            upsert: false
          });

        if (uploadError) {
          console.error("ERROR AL SUBIR VIDEO:", uploadError);
          alert("No se pudo subir el video.");
          return;
        }

        const { data: publicUrlData } = supabaseClient.storage
          .from("videos")
          .getPublicUrl(fileName);

        const videoUrl = publicUrlData.publicUrl;

        const { error: insertError } = await supabaseClient
          .from("videos")
          .insert([
            {
              hotel,
              title,
              video: videoUrl,
              mime_type: file.type || "video/mp4",
              start,
              end
            }
          ]);

        if (insertError) {
          console.error("ERROR AL GUARDAR VIDEO:", insertError);
          alert("El video se subió, pero no se pudo guardar en la base de datos.");
          return;
        }
      }

      resetVideoForm();
      form.classList.remove("visible");
      await renderVideoCards();
    });
  }

  videos.render = renderVideos;
  videos.renderCards = renderVideoCards;
  videos.renderVideosCards = renderVideoCards;
  videos.edit = editVideo;
  videos.delete = deleteVideo;
  videos.resetForm = resetVideoForm;
  videos.wire = wireVideos;

  window.renderVideos = window.renderVideos || renderVideos;
  window.renderVideoCards = window.renderVideoCards || renderVideoCards;
  window.renderVideosCards = window.renderVideosCards || renderVideoCards;
  window.editVideo = window.editVideo || editVideo;
  window.deleteVideo = window.deleteVideo || deleteVideo;
  window.resetVideoForm = window.resetVideoForm || resetVideoForm;
  window.wireVideos = window.wireVideos || wireVideos;

  window.RevistaDigital.videos = videos;
})();
