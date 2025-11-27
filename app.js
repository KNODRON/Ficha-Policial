// =====================
// Utilidades
// =====================
function getValue(id) {
  const el = document.getElementById(id);
  if (!el) return "";
  return (el.value || "").trim();
}

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

// =====================
// Pegado de imágenes en recuadros
// =====================
function initPhotoPasteHandlers(root = document) {
  const boxes = root.querySelectorAll(".photo-box");

  boxes.forEach((box) => {
    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter") e.preventDefault();
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

// =====================
// Familiares
// =====================
function collectTemporalFamiliarData() {
  const familiarPhotoBox = document.querySelector(".familiar-photo");
  const foto =
    familiarPhotoBox && familiarPhotoBox.dataset.image
      ? familiarPhotoBox.dataset.image
      : "";

  return {
    relacion: getValue("relacionNuevo"),
    nombre: getValue("nombreFamNuevo"),
    edad: getValue("edadNuevo"),
    run: getValue("runNuevo"),
    fechaNac: getValue("fechaNacNuevo"),
    estadoCivil: getValue("estadoCivilNuevo"),
    domicilio: getValue("domicilioNuevo"),
    penales: getValue("penalesNuevo"),
    causasPendientes: getValue("causasPendientesNuevo"),
    reincidencia: getValue("reincidenciaNuevo"),
    vehiculos: getValue("vehiculosNuevo"),
    foto
  };
}

function clearTemporalFamiliarForm() {
  [
    "relacionNuevo",
    "nombreFamNuevo",
    "edadNuevo",
    "runNuevo",
    "fechaNacNuevo",
    "estadoCivilNuevo",
    "domicilioNuevo",
    "penalesNuevo",
    "causasPendientesNuevo",
    "reincidenciaNuevo",
    "vehiculosNuevo"
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
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
  const card = createEl("div", "familiar-card");

  const header = createEl("div", "familiar-card-header");
  const title = createEl("span", "", data.relacion || "(SIN RELACIÓN)");
  const btnDel = createEl("button", "btn btn-small secondary", "Eliminar");
  btnDel.addEventListener("click", () => {
    container.removeChild(card);
  });
  header.appendChild(title);
  header.appendChild(btnDel);

  const body = createEl("div");

  function fieldLine(label, key, value) {
    const fg = createEl("div", "form-group");
    const lab = createEl("label", "", label);
    const inp = createEl("textarea");
    if (["edad"].includes(key)) {
      // puede ser simple texto como "49 AÑOS"
    }
    inp.rows = 1;
    inp.value = value || "";
    inp.dataset.field = key;
    fg.appendChild(lab);
    fg.appendChild(inp);
    body.appendChild(fg);
  }

  fieldLine("Nombre completo", "nombre", data.nombre);
  fieldLine("Edad", "edad", data.edad);
  fieldLine("RUN", "run", data.run);
  fieldLine("Fecha de nacimiento", "fechaNac", data.fechaNac);
  fieldLine("Estado civil", "estadoCivil", data.estadoCivil);
  fieldLine("Domicilio", "domicilio", data.domicilio);
  fieldLine("Penales", "penales", data.penales);
  fieldLine("Causas pendientes", "causasPendientes", data.causasPendientes);
  fieldLine("Reincidencia", "reincidencia", data.reincidencia);
  fieldLine("Vehículos", "vehiculos", data.vehiculos);

  const photoFg = createEl("div", "form-group");
  const labPhoto = createEl("label", "", "Fotografía familiar");
  const photoBox = createEl("div", "photo-box familiar-photo");
  photoBox.contentEditable = "true";
  photoBox.setAttribute("data-role", "familiar-photo");
  const hint = createEl(
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

  photoFg.appendChild(labPhoto);
  photoFg.appendChild(photoBox);

  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(photoFg);

  container.appendChild(card);

  // Activar pegado de imagen en esta tarjeta
  initPhotoPasteHandlers(card);
}

function collectFamiliaresFromDOM() {
  const container = document.getElementById("familiaresContainer");
  const cards = Array.from(container.querySelectorAll(".familiar-card"));
  return cards.map((card) => {
    const relacion = card.querySelector(".familiar-card-header span").textContent.trim();
    const data = { relacion };

    const textareas = card.querySelectorAll("textarea");
    textareas.forEach((ta) => {
      const key = ta.dataset.field;
      data[key] = (ta.value || "").trim();
    });

    const photoBox = card.querySelector(".familiar-photo");
    if (photoBox && photoBox.dataset.image) {
      data.foto = photoBox.dataset.image;
    } else {
      data.foto = "";
    }

    return data;
  });
}

// =====================
// Construcción de la ficha estilo &quot;MARÍA MACARENA&quot;
// =====================
function addLabelValue(exportParent, label, value) {
  if (!value) return;
  const lab = createEl("div", "export-label-line", label.toUpperCase());
  const val = createEl("div", "export-value-line", value);
  exportParent.appendChild(lab);
  exportParent.appendChild(val);
}

function buildExportDOM() {
  const area = document.getElementById("exportArea");
  area.innerHTML = "";

  // TÍTULO
  area.appendChild(createEl("div", "export-title", "FICHA DE ANTECEDENTES"));
  area.appendChild(
    createEl(
      "div",
      "export-subtitle",
      "Departamento Investigación de Organizaciones Criminales O.S.9"
    )
  );

  // IDENTIFICACIÓN DEL CASO
  const secId = createEl("div", "export-section");
  const secIdTitle = createEl("div", "export-section-title", "IDENTIFICACIÓN DEL CASO");
  secId.appendChild(secIdTitle);

  addLabelValue(secId, "Fecha", getValue("fecha"));
  addLabelValue(secId, "Caso / Causa", getValue("caso"));
  addLabelValue(secId, "Personal que requiere", getValue("personalRequiere"));
  addLabelValue(secId, "Confecciona", getValue("confecciona"));
  addLabelValue(secId, "Folio o RUC", getValue("ruc"));

  area.appendChild(secId);

  // IDENTIDAD
  const secIdent = createEl("div", "export-section");
  const secIdentTitle = createEl("div", "export-section-title", "IDENTIDAD");
  secIdent.appendChild(secIdentTitle);

  const nombreCompleto = getValue("nombreCompleto");
  if (nombreCompleto) {
    secIdent.appendChild(
      createEl("div", "export-name-main", nombreCompleto.toUpperCase())
    );
  }

  // Foto principal centrada
  const mainPhotoBox = document.querySelector(".main-photo");
  const mainPhotoData =
    mainPhotoBox && mainPhotoBox.dataset.image ? mainPhotoBox.dataset.image : "";
  if (mainPhotoData) {
    const img = createEl("img", "export-photo-main");
    img.src = mainPhotoData;
    img.style.width = "6cm";
    img.style.height = "8cm";
    secIdent.appendChild(img);
  }

  addLabelValue(secIdent, "Alias", getValue("alias"));
  addLabelValue(secIdent, "Nacionalidad", getValue("nacionalidad"));
  addLabelValue(secIdent, "Edad", getValue("edad"));
  addLabelValue(secIdent, "RUN", getValue("run"));
  addLabelValue(
    secIdent,
    "Fecha de nacimiento",
    getValue("fechaNac")
  );
  addLabelValue(secIdent, "Estado civil", getValue("estadoCivil"));
  addLabelValue(secIdent, "Domicilio", getValue("domicilio"));
  addLabelValue(secIdent, "Domicilio BUD", getValue("domicilioBud"));
  addLabelValue(secIdent, "Otros domicilios", getValue("otrosDomicilios"));
  addLabelValue(secIdent, "Profesión", getValue("profesion"));
  addLabelValue(secIdent, "Teléfono", getValue("telefono"));
  addLabelValue(secIdent, "Penales", getValue("penales"));
  addLabelValue(secIdent, "Causas pendientes", getValue("causasPendientes"));
  addLabelValue(secIdent, "Reincidencia", getValue("reincidencia"));
  addLabelValue(secIdent, "Vehículos", getValue("vehiculos"));
  addLabelValue(secIdent, "Licencia", getValue("licencia"));

  area.appendChild(secIdent);

  // GRUPO FAMILIAR
  const familiares = collectFamiliaresFromDOM();
  const famConDatos = familiares.filter((f) => {
    return (
      (f.nombre || "").trim() ||
      (f.edad || "").trim() ||
      (f.run || "").trim() ||
      (f.fechaNac || "").trim() ||
      (f.estadoCivil || "").trim() ||
      (f.domicilio || "").trim() ||
      (f.penales || "").trim() ||
      (f.causasPendientes || "").trim() ||
      (f.reincidencia || "").trim() ||
      (f.vehiculos || "").trim() ||
      (f.foto || "").trim()
    );
  });

  if (famConDatos.length > 0) {
    const secFam = createEl("div", "export-section");
    const secFamTitle = createEl("div", "export-section-title", "GRUPO FAMILIAR");
    secFam.appendChild(secFamTitle);

    famConDatos.forEach((f) => {
      const block = createEl("div", "export-fam-block");

      const text = createEl("div", "export-fam-text");
      const rel = (f.relacion || "").toUpperCase();
      if (rel) {
        text.appendChild(createEl("div", "export-label-line", rel));
      }
      if (f.nombre) {
        text.appendChild(
          createEl("div", "export-value-line", f.nombre.toUpperCase())
        );
      }

      addLabelValue(text, "Edad", f.edad);
      addLabelValue(text, "RUN", f.run);
      addLabelValue(text, "Fecha de nacimiento", f.fechaNac);
      addLabelValue(text, "Estado civil", f.estadoCivil);
      addLabelValue(text, "Domicilio", f.domicilio);
      addLabelValue(text, "Penales", f.penales);
      addLabelValue(text, "Causas pendientes", f.causasPendientes);
      addLabelValue(text, "Reincidencia", f.reincidencia);
      addLabelValue(text, "Vehículos", f.vehiculos);

      block.appendChild(text);

      if ((f.foto || "").trim()) {
        const img = createEl("img", "export-fam-photo");
        img.src = f.foto;
        img.style.width = "3cm";
        img.style.height = "4cm";
        block.appendChild(img);
      }

      secFam.appendChild(block);
    });

    area.appendChild(secFam);
  }

  // Footer
  const footer = createEl("div", "export-footer");
  footer.appendChild(
    createEl(
      "span",
      "",
      "Departamento Investigación de Organizaciones Criminales O.S.9"
    )
  );
  footer.appendChild(createEl("span", "", "Página 1 de 1"));
  area.appendChild(footer);
}

// =====================
// Exportar a PDF (legal = oficio)
// =====================
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
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

  const fecha = getValue("fecha") || "";
  const nombre = getValue("nombreCompleto") || "sin_nombre";
  const filename = `Ficha_Policial_OS9_${nombre}_${fecha}.pdf`.replace(
    /\s+/g,
    "_"
  );
  pdf.save(filename);
}

// =====================
// Exportar a Word (.doc)
// =====================
function exportToWord() {
  buildExportDOM();
  const exportArea = document.getElementById("exportArea");

  const htmlContent = `
  <html>
    <head>
      <meta charset="utf-8">
      <title>Ficha Policial OS9</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; }
        .export-title { text-align: center; font-weight: bold; font-size: 14px; text-transform: uppercase; }
        .export-subtitle { text-align: center; font-size: 10px; margin-bottom: 8px; }
        .export-section { margin-top: 8px; }
        .export-section-title { font-weight: bold; text-transform: uppercase; margin-bottom: 2px; border-bottom: 1px solid #000; }
        .export-label-line { font-weight: bold; margin-top: 4px; }
        .export-value-line { margin-left: 10px; }
        .export-name-main { margin-top: 4px; margin-bottom: 4px; font-weight: bold; }
        .export-photo-main { display: block; margin: 6px auto 4px; border: 1px solid #000; object-fit: cover; }
        .export-fam-block { margin-top: 6px; display: flex; align-items: flex-start; gap: 10px; }
        .export-fam-text { flex: 1; }
        .export-fam-photo { width: 3cm; height: 4cm; border: 1px solid #000; object-fit: cover; }
        .export-footer { margin-top: 10px; font-size: 9px; display: flex; justify-content: space-between; }
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
  const nombre = getValue("nombreCompleto") || "sin_nombre";
  const filename = `Ficha_Policial_OS9_${nombre}_${fecha}.doc`.replace(
    /\s+/g,
    "_"
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// =====================
// Init
// =====================
document.addEventListener("DOMContentLoaded", () => {
  initPhotoPasteHandlers();

  document
    .getElementById("btnAgregarFamiliar")
    .addEventListener("click", () => {
      const temporal = collectTemporalFamiliarData();
      const hayDato =
        temporal.relacion ||
        temporal.nombre ||
        temporal.edad ||
        temporal.run ||
        temporal.fechaNac ||
        temporal.estadoCivil ||
        temporal.domicilio ||
        temporal.penales ||
        temporal.causasPendientes ||
        temporal.reincidencia ||
        temporal.vehiculos ||
        temporal.foto;

      if (!hayDato) {
        alert("Ingresa al menos la relación, nombre u otro dato del familiar.");
        return;
      }

      addFamiliarCard(temporal);
      clearTemporalFamiliarForm();
    });

  document
    .getElementById("btnExportPdf")
    .addEventListener("click", exportToPDF);

  document
    .getElementById("btnExportWord")
    .addEventListener("click", exportToWord);
});
