// ========================
// Utilidades básicas
// ========================

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

// ========================
// Pegado de imágenes en recuadros
// ========================

function initPhotoPasteHandlers(root = document) {
  const boxes = root.querySelectorAll(".photo-box");

  boxes.forEach((box) => {
    // Evitar que Enter genere saltos raros
    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
      }
    });

    box.addEventListener("paste", (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") === 0) {
          e.preventDefault();
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = function (evt) {
            const dataUrl = evt.target.result;
            box.style.backgroundImage = `url(${dataUrl})`;
            box.style.backgroundSize = "cover";
            box.style.backgroundPosition = "center";
            box.classList.add("has-image");
            box.setAttribute("data-image", dataUrl);
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    });
  });
}

// ========================
// Módulo de familiares
// ========================

function collectTemporalFamiliarData() {
  return {
    relacion: getValue("relacionNuevo"),
    edad: getValue("edadNuevo"),
    run: getValue("runNuevo"),
    fechaNac: getValue("fechaNacNuevo"),
    estadoCivil: getValue("estadoCivilNuevo"),
    domicilio: getValue("domicilioNuevo"),
    penales: getValue("penalesNuevo"),
    causasPendientes: getValue("causasPendientesNuevo"),
    reincidencia: getValue("reincidenciaNuevo"),
    vehiculos: getValue("vehiculosNuevo"),
    foto: (document.querySelector(".familiar-photo[data-image]") || {}).dataset
      ?.image,
  };
}

function clearTemporalFamiliarForm() {
  const ids = [
    "relacionNuevo",
    "edadNuevo",
    "runNuevo",
    "fechaNacNuevo",
    "estadoCivilNuevo",
    "domicilioNuevo",
    "penalesNuevo",
    "causasPendientesNuevo",
    "reincidenciaNuevo",
    "vehiculosNuevo",
  ];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el.tagName.toLowerCase() === "select") {
      el.value = "";
    } else {
      el.value = "";
    }
  });

  const familiarPhotoBox = document.querySelector(".familiar-photo");
  if (familiarPhotoBox) {
    familiarPhotoBox.style.backgroundImage = "";
    familiarPhotoBox.classList.remove("has-image");
    familiarPhotoBox.removeAttribute("data-image");
    const hint = familiarPhotoBox.querySelector(".photo-hint");
    if (hint) hint.style.display = "";
  }
}

function addFamiliarCard(data) {
  const container = document.getElementById("familiaresContainer");
  const card = createElement("div", "familiar-card");

  const header = createElement("div", "familiar-card-header");
  const title = createElement(
    "span",
    "",
    data.relacion || "(SIN RELACIÓN DEFINIDA)"
  );
  const btnDelete = createElement("button", "btn btn-small secondary", "Eliminar");
  btnDelete.addEventListener("click", () => {
    container.removeChild(card);
  });
  header.appendChild(title);
  header.appendChild(btnDelete);

  const fields = createElement("div", "familiar-fields");

  // Helper para crear filas editables dentro de la tarjeta
  function addField(labelText, value, keyName) {
    const fg = createElement("div", "form-group");
    const lab = createElement("label", "", labelText);
    const input = createElement("input");
    input.type = "text";
    input.value = value || "";
    input.dataset.field = keyName;
    fg.appendChild(lab);
    fg.appendChild(input);
    fields.appendChild(fg);
  }

  addField("Edad", data.edad, "edad");
  addField("RUN", data.run, "run");
  addField("Fecha de nacimiento", data.fechaNac, "fechaNac");
  addField("Estado civil", data.estadoCivil, "estadoCivil");
  addField("Domicilio", data.domicilio, "domicilio");
  addField("Penales", data.penales, "penales");
  addField("Causas pendientes", data.causasPendientes, "causasPendientes");
  addField("Reincidencia", data.reincidencia, "reincidencia");
  addField("Vehículos", data.vehiculos, "vehiculos");

  const bottomRow = createElement("div", "familiar-bottom-row");
  const dummy = createElement("div"); // espacio
  const photoGroup = createElement("div", "familiar-photo-group");
  const labPhoto = createElement("span", "label-inline", "Fotografía familiar");
  const photoBox = createElement("div", "photo-box familiar-photo");
  photoBox.contentEditable = "true";
  photoBox.setAttribute("data-role", "familiar-photo");

  const hint = createElement(
    "span",
    "photo-hint small",
    "Pegar recorte aquí (Ctrl+V)"
  );
  photoBox.appendChild(hint);

  if (data.foto) {
    photoBox.style.backgroundImage = `url(${data.foto})`;
    photoBox.style.backgroundSize = "cover";
    photoBox.style.backgroundPosition = "center";
    photoBox.classList.add("has-image");
    photoBox.setAttribute("data-image", data.foto);
  }

  photoGroup.appendChild(labPhoto);
  photoGroup.appendChild(photoBox);

  bottomRow.appendChild(dummy);
  bottomRow.appendChild(photoGroup);

  card.appendChild(header);
  card.appendChild(fields);
  card.appendChild(bottomRow);

  container.appendChild(card);

  // Activar pegado de foto para esta tarjeta
  initPhotoPasteHandlers(card);
}

// Recoger todos los familiares desde las tarjetas
function collectFamiliaresFromDOM() {
  const container = document.getElementById("familiaresContainer");
  const cards = Array.from(container.querySelectorAll(".familiar-card"));
  return cards.map((card) => {
    const relacion = card.querySelector(".familiar-card-header span").textContent.trim();
    const obj = { relacion };

    const inputs = card.querySelectorAll(".familiar-fields input");
    inputs.forEach((inp) => {
      const key = inp.dataset.field;
      obj[key] = inp.value.trim();
    });

    const photoBox = card.querySelector(".familiar-photo");
    if (photoBox && photoBox.dataset.image) {
      obj.foto = photoBox.dataset.image;
    } else {
      obj.foto = "";
    }

    return obj;
  });
}

// ========================
// Construcción de ficha para exportar
// ========================

function buildExportDOM() {
  const exportArea = document.getElementById("exportArea");
  exportArea.innerHTML = "";

  // Cabecera
  const title = createElement("div", "export-page-title", "FICHA DE ANTECEDENTES");
  const sub = createElement(
    "div",
    "export-subtitle",
    "Departamento Investigación de Organizaciones Criminales O.S.9"
  );
  exportArea.appendChild(title);
  exportArea.appendChild(sub);

  // ---------- Identificación del caso ----------
  const identificacionTitle = createElement(
    "div",
    "export-section-title",
    "Identificación del caso"
  );
  exportArea.appendChild(identificacionTitle);

  const tablaId = createElement("table", "export-table");
  const tbodyId = document.createElement("tbody");

  // Fila 1: Fecha - Caso/Causa - Folio/RUC
  const tr1 = document.createElement("tr");
  const fecha = getValue("fecha");
  const caso = getValue("caso");
  const ruc = getValue("ruc");

  if (fecha || caso || ruc) {
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");

    if (fecha) {
      td1.innerHTML = `<span class="export-label">Fecha:</span> ${fecha}`;
    }
    if (caso) {
      td2.innerHTML = `<span class="export-label">Caso / Causa:</span> ${caso}`;
    }
    if (ruc) {
      td3.innerHTML = `<span class="export-label">Folio o RUC:</span> ${ruc}`;
    }

    tr1.appendChild(td1);
    tr1.appendChild(td2);
    tr1.appendChild(td3);
    tbodyId.appendChild(tr1);
  }

  // Fila 2: Personal que requiere - Confecciona
  const personal = getValue("personalRequiere");
  const confecciona = getValue("confecciona");

  if (personal || confecciona) {
    const tr2 = document.createElement("tr");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");

    if (personal) {
      td1.colSpan = 2;
      td1.innerHTML = `<span class="export-label">Personal que requiere:</span> ${personal}`;
    }
    if (confecciona) {
      td2.colSpan = personal ? 1 : 3;
      td2.innerHTML = `<span class="export-label">Confecciona:</span> ${confecciona}`;
    }

    tr2.appendChild(td1);
    tr2.appendChild(td2);
    tr2.appendChild(td3);
    tbodyId.appendChild(tr2);
  }

  tablaId.appendChild(tbodyId);
  exportArea.appendChild(tablaId);

  // ---------- Identidad ----------
  const identidadTitle = createElement("div", "export-section-title", "Identidad");
  exportArea.appendChild(identidadTitle);

  const tablaIdentidad = createElement("table", "export-table");
  const tbodyIdent = document.createElement("tbody");

  // Foto principal
  const mainPhotoBox = document.querySelector(".main-photo");
  const mainPhotoData = mainPhotoBox && mainPhotoBox.dataset.image;

  // Primera fila: Alias, Nacionalidad, Edad + Foto
  const trId1 = document.createElement("tr");
  const tdId1 = document.createElement("td");
  const tdId2 = document.createElement("td");
  const tdId3 = document.createElement("td");
  const tdIdPhoto = document.createElement("td");
  tdIdPhoto.rowSpan = 4; // ocupa varias filas

  const alias = getValue("alias");
  const nacionalidad = getValue("nacionalidad");
  const edad = getValue("edad");

  if (alias) {
    tdId1.innerHTML = `<span class="export-label">Alias:</span> ${alias}`;
  }
  if (nacionalidad) {
    tdId2.innerHTML = `<span class="export-label">Nacionalidad:</span> ${nacionalidad}`;
  }
  if (edad) {
    tdId3.innerHTML = `<span class="export-label">Edad:</span> ${edad}`;
  }

  if (mainPhotoData) {
    const img = document.createElement("img");
    img.src = mainPhotoData;
    img.className = "export-photo";
    img.style.width = "6cm";
    img.style.height = "8cm";
    tdIdPhoto.appendChild(img);
  }

  // Solo añadimos fila si hay algún dato o foto
  if (alias || nacionalidad || edad || mainPhotoData) {
    trId1.appendChild(tdId1);
    trId1.appendChild(tdId2);
    trId1.appendChild(tdId3);
    if (mainPhotoData) {
      trId1.appendChild(tdIdPhoto);
    }
    tbodyIdent.appendChild(trId1);
  }

  // Resto de campos de identidad
  function addRowIfAny(bloque) {
    const anyValue = bloque.some((item) => !!item.value);
    if (!anyValue) return;
    const tr = document.createElement("tr");
    bloque.forEach((item) => {
      const td = document.createElement("td");
      if (item.value) {
        td.innerHTML = `<span class="export-label">${item.label}:</span> ${item.value}`;
      }
      tr.appendChild(td);
    });
    // Si hay foto en primera fila, no añadimos más celdas de foto
    tbodyIdent.appendChild(tr);
  }

  addRowIfAny([
    { label: "RUN", value: getValue("run") },
    { label: "Fecha de nacimiento", value: getValue("fechaNac") },
    { label: "Estado civil", value: getValue("estadoCivil") },
  ]);

  addRowIfAny([
    { label: "Domicilio", value: getValue("domicilio") },
    { label: "Domicilio BUD", value: getValue("domicilioBud") },
    { label: "Profesión", value: getValue("profesion") },
  ]);

  addRowIfAny([
    { label: "Teléfono", value: getValue("telefono") },
    { label: "Licencia", value: getValue("licencia") },
    { label: "Penales", value: getValue("penales") },
  ]);

  addRowIfAny([
    { label: "Causas pendientes", value: getValue("causasPendientes") },
    { label: "Reincidencia", value: getValue("reincidencia") },
    { label: "Compañeros de delito", value: getValue("companerosDelito") },
  ]);

  addRowIfAny([
    { label: "Vehículos", value: getValue("vehiculos") },
  ]);

  if (tbodyIdent.children.length > 0) {
    tablaIdentidad.appendChild(tbodyIdent);
    exportArea.appendChild(tablaIdentidad);
  }

  // ---------- Grupo familiar ----------
  const familiares = collectFamiliaresFromDOM();
  const familiaresConDatos = familiares.filter((f) => {
    // Si todos los campos están vacíos, no se incluye
    const keys = [
      "edad",
      "run",
      "fechaNac",
      "estadoCivil",
      "domicilio",
      "penales",
      "causasPendientes",
      "reincidencia",
      "vehiculos",
      "foto",
    ];
    return keys.some((k) => (f[k] || "").trim() !== "");
  });

  if (familiaresConDatos.length > 0) {
    const famTitle = createElement("div", "export-section-title", "Grupo familiar");
    exportArea.appendChild(famTitle);

    familiaresConDatos.forEach((f) => {
      // Título del bloque: relación
      const rel = f.relacion || "(SIN RELACIÓN)";
      const relDiv = createElement("div", "", rel);
      relDiv.style.fontWeight = "bold";
      relDiv.style.marginTop = "4px";
      exportArea.appendChild(relDiv);

      const tablaFam = createElement("table", "export-table");
      const tbodyFam = document.createElement("tbody");

      // Foto familiar
      const tieneFoto = f.foto && f.foto.trim() !== "";

      // Helper por filas
      function addFamRow(bloque) {
        const anyVal = bloque.some((item) => !!item.value);
        if (!anyVal) return;
        const tr = document.createElement("tr");
        bloque.forEach((item) => {
          const td = document.createElement("td");
          if (item.value) {
            td.innerHTML = `<span class="export-label">${item.label}:</span> ${item.value}`;
          }
          tr.appendChild(td);
        });
        // Si hay foto y aún no se ha agregado, la ponemos en la primera fila que tenga datos
        if (tieneFoto && !tbodyFam.hasPhoto) {
          const tdPhoto = document.createElement("td");
          tdPhoto.rowSpan = 4;
          const img = document.createElement("img");
          img.src = f.foto;
          img.className = "export-photo";
          img.style.width = "3cm";
          img.style.height = "4cm";
          tdPhoto.appendChild(img);
          tr.appendChild(tdPhoto);
          tbodyFam.hasPhoto = true;
        }
        tbodyFam.appendChild(tr);
      }

      addFamRow([
        { label: "Edad", value: f.edad },
        { label: "RUN", value: f.run },
        { label: "Fecha de nacimiento", value: f.fechaNac },
      ]);

      addFamRow([
        { label: "Estado civil", value: f.estadoCivil },
        { label: "Domicilio", value: f.domicilio },
        { label: "Penales", value: f.penales },
      ]);

      addFamRow([
        { label: "Causas pendientes", value: f.causasPendientes },
        { label: "Reincidencia", value: f.reincidencia },
        { label: "Vehículos", value: f.vehiculos },
      ]);

      if (tbodyFam.children.length > 0) {
        tablaFam.appendChild(tbodyFam);
        exportArea.appendChild(tablaFam);
      }
    });
  }

  // Pie de página estilo OS9
  const footer = createElement("div", "export-footer");
  const left = createElement("span", "", "Departamento Investigación de Organizaciones Criminales O.S.9");
  const right = createElement("span", "", "Página 1 de 1");
  footer.appendChild(left);
  footer.appendChild(right);
  exportArea.appendChild(footer);
}

// ========================
// Exportar a PDF (oficio)
// ========================

async function exportToPDF() {
  buildExportDOM();
  const exportArea = document.getElementById("exportArea");

  const canvas = await html2canvas(exportArea, {
    scale: 2,
    useCORS: true
  });

  const imgData = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "legal");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const y = 0;
  pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);

  const fecha = getValue("fecha") || "";
  const alias = getValue("alias") || "sin_alias";
  const filename = `Ficha_Policial_OS9_${alias}_${fecha}.pdf`.replace(/\s+/g, "_");
  pdf.save(filename);
}

// ========================
// Exportar a Word (.doc)
// ========================

function exportToWord() {
  buildExportDOM();
  const exportArea = document.getElementById("exportArea");

  // HTML básico para Word
  const htmlContent = `
  <html>
    <head>
      <meta charset="utf-8">
      <title>Ficha Policial OS9</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; }
        .export-page-title { text-align: center; font-size: 14px; font-weight: bold; text-transform: uppercase; }
        .export-subtitle { text-align: center; font-size: 10px; margin-bottom: 8px; }
        .export-section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; margin-top: 8px; margin-bottom: 4px; border-bottom: 1px solid #000; }
        .export-table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
        .export-table td { vertical-align: top; padding: 2px 3px; }
        .export-label { font-weight: bold; }
        .export-photo { border: 1px solid #000; object-fit: cover; }
        .export-footer { margin-top: 8px; font-size: 9px; display: flex; justify-content: space-between; }
      </style>
    </head>
    <body>
      ${exportArea.innerHTML}
    </body>
  </html>`;

  const blob = new Blob(["\ufeff", htmlContent], {
    type: "application/msword;charset=utf-8"
  });

  const fecha = getValue("fecha") || "";
  const alias = getValue("alias") || "sin_alias";
  const filename = `Ficha_Policial_OS9_${alias}_${fecha}.doc`.replace(/\s+/g, "_");

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ========================
// Inicialización
// ========================

document.addEventListener("DOMContentLoaded", () => {
  // Habilitar pegar fotos en los recuadros iniciales
  initPhotoPasteHandlers();

  // Botón agregar familiar
  const btnAgregar = document.getElementById("btnAgregarFamiliar");
  btnAgregar.addEventListener("click", () => {
    const relacion = getValue("relacionNuevo");
    // Si ni relación ni ningún dato, no hacemos nada
    const datosTemporales = collectTemporalFamiliarData();
    const algunDato =
      relacion ||
      datosTemporales.edad ||
      datosTemporales.run ||
      datosTemporales.fechaNac ||
      datosTemporales.estadoCivil ||
      datosTemporales.domicilio ||
      datosTemporales.penales ||
      datosTemporales.causasPendientes ||
      datosTemporales.reincidencia ||
      datosTemporales.vehiculos ||
      datosTemporales.foto;

    if (!algunDato) {
      alert("Ingresa al menos la relación o algún dato del familiar antes de agregar.");
      return;
    }

    datosTemporales.relacion = relacion;
    addFamiliarCard(datosTemporales);
    clearTemporalFamiliarForm();
  });

  // Botón exportar PDF
  document.getElementById("btnExportPdf").addEventListener("click", exportToPDF);

  // Botón exportar Word
  document.getElementById("btnExportWord").addEventListener("click", exportToWord);
});
