// Esperar que el documento esté listo
document.addEventListener("DOMContentLoaded", function () {
  // Inicializa DataTable si existe la tabla
  if ($("#tablaProyectos").length) {
    $("#tablaProyectos").DataTable({
      language: {
        url: "/datatables/es-ES.json",
      },
      pageLength: 5,
      scrollX: true,
      responsive: true,
    });
  }
});

// ====================
// Modal selección tipo de proyecto
// ====================
function abrirModalProyecto() {
  sessionStorage.removeItem("tipoProyecto");
  new bootstrap.Modal(document.getElementById("modalProyecto")).show();
}

function guardarSeleccion(tipo) {
  sessionStorage.setItem("tipoProyecto", tipo);
  window.location.href = "/planeaciones/proyectos"; // Redirige al catálogo
}

function mostrarSeleccion() {
  const tipo = sessionStorage.getItem("tipoProyecto");
  const texto =
    tipo === "conjunto"
      ? "Selección: Proyectos en conjunto"
      : "Selección: Proyecto de directivos";
  document.getElementById("seleccionProyecto").textContent = texto;
}

document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("tipoProyecto")) mostrarSeleccion();
});

// ====================
// Agregar fila dinámica a la tabla de proyectos
// ====================
function agregarFila() {
  const tbody = document.getElementById("cuerpoTablaProyectos");
  const fila = document.createElement("tr");

  fila.innerHTML = `
    <td>—</td>
    <td><input type="text" class="form-control" name="nombre" placeholder="Proyecto" required></td>
    <td><input type="text" class="form-control" name="descripcion" placeholder="Descripción"></td>
    <td>
      <select class="form-select" name="tipo_proyecto" required>
        <option value="">Seleccione</option>
        <option value="conjunto">Conjunto</option>
        <option value="directivos">Directivos</option>
      </select>
    </td>
     <td>
          <div>
            <input type="text" class="form-control mb-1" placeholder="Escribe un departamento" required >
            <button type="button" class="btn btn-sm btn-secondary mt-1" onclick="agregarDepartamento(this)">Agregar</button>
            <ul class="mt-1 small text-muted" style="list-style-type: disc; padding-left: 1rem;"></ul>
            <input type="hidden" name="departamento" value="">
          </div>
      </td>
    <td>
      <div>
        <input type="text" class="form-control mb-1" placeholder="Escribe o selecciona área" list="listaAreas" required >
        <button type="button" class="btn btn-sm btn-secondary mt-1" onclick="agregarArea(this)">Agregar</button>
        <ul class="mt-1 small text-muted" style="list-style-type: disc; padding-left: 1rem;"></ul>
        <input type="hidden" name="area" value="">
      </div>
    </td>
    <td>
      <div>
        <input type="text" class="form-control mb-1" placeholder="Escribe y selecciona" list="listaIntegrantes" required >
        <button type="button" class="btn btn-sm btn-secondary mt-1" onclick="agregarIntegrante(this)">Agregar</button>
        <ul class="mt-1 small" style="list-style-type: disc; padding-left: 1rem;"></ul>
        <input type="hidden" name="integrantes" value="">
      </div>
    </td>
    <td><input type="date" class="form-control" name="fecha_inicio"></td>
    <td><input type="date" class="form-control" name="fecha_fin"></td>
    <td>
  <div class="d-flex align-items-center gap-2">
    <span class="porcentaje-texto">0%</span>
    <input type="range" class="form-range porcentaje-slider" name="porcentaje" min="0" max="100" step="1" value="0">
  </div>
</td>
<td>
  <span class="indicador-badge badge rounded-pill bg-secondary">Sin estado</span>
</td>
   <td>
 <input type="hidden" name="estatus" value="POR ATENDER">
  <button class="btn btn-success btn-sm" onclick="guardarProyecto(this)">Guardar</button>
   <button class="btn btn-danger btn-sm cancelar-proyecto">Cancelar</button>
</td>
  `;

  tbody.insertBefore(fila, tbody.firstChild); // 🔝 Esto la agrega al principio

  const slider = fila.querySelector(".porcentaje-slider");
  const texto = fila.querySelector(".porcentaje-texto");
  const badge = fila.querySelector(".indicador-badge");

  slider.addEventListener("input", () => {
    const val = parseInt(slider.value);
    texto.textContent = val + "%";

    // Cambia color del badge según el porcentaje
    const hiddenStatus = fila.querySelector('input[name="estatus"]');

    if (val === 100) {
      badge.textContent = "COMPLETO";
      badge.className = "indicador-badge badge rounded-pill bg-success";
      hiddenStatus.value = "COMPLETO";
    } else if (val >= 50) {
      badge.textContent = "ATENDIÉNDOSE";
      badge.className =
        "indicador-badge badge rounded-pill bg-warning text-dark";
      hiddenStatus.value = "ATENDIÉNDOSE";
    } else if (val === 0) {
      badge.textContent = "POR ATENDER";
      badge.className = "indicador-badge badge rounded-pill bg-secondary";
      hiddenStatus.value = "POR ATENDER";
    } else {
      badge.textContent = "PLANEACIÓN";
      badge.className = "indicador-badge badge rounded-pill bg-primary";
      hiddenStatus.value = "PLANEACIÓN";
    }
  });
}
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("cancelar-proyecto")) {
    const fila = e.target.closest("tr");
    fila.remove();
  }
});

// ====================
// Manejador de integrantes múltiples
// ====================
function agregarIntegrante(boton) {
  const contenedor = boton.closest("td");
  const input = contenedor.querySelector("input[list='listaIntegrantes']");
  const lista = contenedor.querySelector("ul");
  const hidden = contenedor.querySelector("input[type='hidden']");

  const nombre = input.value.trim();
  if (!nombre) {
    alert("⚠️ Debes escribir y seleccionar un nombre válido del personal.");
    return;
  }

  const yaExiste = Array.from(lista.children).some(
    (li) => li.textContent === nombre
  );
  if (yaExiste) {
    alert("⚠️ Este integrante ya fue agregado.");
    return;
  }

  const li = document.createElement("li");
  li.textContent = nombre;
  li.classList.add("text-primary", "fw-semibold");
  li.style.cursor = "pointer";
  li.title = "Haz clic para quitar este integrante";
  li.onclick = () => {
    li.remove();
    actualizarCampoOculto(lista, hidden);
  };

  lista.appendChild(li);
  actualizarCampoOculto(lista, hidden);
  input.value = "";
}

/////////////////////////////////////
function agregarDepartamento(boton) {
  const contenedor = boton.closest("td");
  const input = contenedor.querySelector("input[type='text']");
  const lista = contenedor.querySelector("ul");
  const hidden = contenedor.querySelector("input[type='hidden']");

  const nombre = input.value.trim();
  if (!nombre) {
    alert("⚠️ Escribe un nombre de departamento válido.");
    return;
  }

  const yaExiste = Array.from(lista.children).some(
    (li) => li.textContent === nombre
  );
  if (yaExiste) {
    alert("⚠️ Este departamento ya fue agregado.");
    return;
  }

  const li = document.createElement("li");
  li.textContent = nombre;
  li.classList.add("text-info", "fw-semibold");
  li.style.cursor = "pointer";
  li.title = "Haz clic para quitar este departamento";
  li.onclick = () => {
    li.remove();
    actualizarCampoOculto(lista, hidden);
  };

  lista.appendChild(li);
  actualizarCampoOculto(lista, hidden);
  input.value = "";
}

// ====================
// Manejador de áreas múltiples
// ====================
function agregarArea(boton) {
  const contenedor = boton.closest("td");
  const input = contenedor.querySelector("input[list='listaAreas']");
  const lista = contenedor.querySelector("ul");
  const hidden = contenedor.querySelector("input[type='hidden']");

  const nombre = input.value.trim();
  if (!nombre) {
    alert("⚠️ Debes escribir o seleccionar un nombre de área válido.");
    return;
  }

  const yaExiste = Array.from(lista.children).some(
    (li) => li.textContent === nombre
  );
  if (yaExiste) {
    alert("⚠️ Esta área ya fue agregada.");
    return;
  }

  const li = document.createElement("li");
  li.textContent = nombre;
  li.classList.add("text-success", "fw-semibold");
  li.style.cursor = "pointer";
  li.title = "Haz clic para quitar esta área";
  li.onclick = () => {
    li.remove();
    actualizarCampoOculto(lista, hidden);
  };

  lista.appendChild(li);
  actualizarCampoOculto(lista, hidden);
  input.value = "";
}

// ====================
// Función compartida para actualizar campos ocultos
// ====================
function actualizarCampoOculto(lista, hidden) {
  const valores = Array.from(lista.children).map((li) => li.textContent);
  hidden.value = valores.join(";");
}

// ====================

function validarFormularioProyecto() {
  const nombre = document.querySelector('input[name="nombre"]').value.trim();
  const tipo = document.querySelector('select[name="tipo_proyecto"]').value;
  const inicio = document.querySelector('input[name="fecha_inicio"]').value;
  const fin = document.querySelector('input[name="fecha_fin"]').value;
  const porcentaje = document.querySelector('input[name="porcentaje"]').value;

  if (!nombre || !tipo || !inicio || !fin || !porcentaje) {
    Swal.fire(
      "Error",
      "Todos los campos obligatorios deben estar llenos",
      "warning"
    );
    return false;
  }

  if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
    Swal.fire(
      "Error",
      "El porcentaje debe ser un número entre 0 y 100",
      "warning"
    );
    return false;
  }

  const inicioDate = new Date(inicio);
  const finDate = new Date(fin);

  if (inicioDate > finDate) {
    Swal.fire(
      "Error",
      "La fecha de inicio no puede ser mayor que la fecha de fin",
      "warning"
    );
    return false;
  }

  return true;
}
///////////////////////////////////////

// Envío de proyecto al backend
// ====================
async function guardarProyecto(boton) {
  const fila = boton.closest("tr");
  const inputs = fila.querySelectorAll("input, select");

  const data = {};
  inputs.forEach((input) => {
    data[input.name] = input.value;
  });

  // ✅ Asegurarse de que porcentaje sea número entero
  data.porcentaje = parseInt(data.porcentaje) || 0;

  // ✅ Validación personalizada por campo
  const errores = [];

  if (!data.nombre?.trim()) errores.push("nombre del proyecto");
  if (!data.descripcion?.trim()) errores.push("descripción");
  if (!data.tipo_proyecto) errores.push("tipo de proyecto");
  if (!data.departamento?.trim()) errores.push("departamento(s)");
  if (!data.area?.trim()) errores.push("área(s)");
  if (!data.integrantes?.trim()) errores.push("integrante(s)");
  if (!data.fecha_inicio) errores.push("fecha de inicio");
  if (!data.fecha_fin) errores.push("fecha de fin");

  if (
    data.fecha_inicio &&
    data.fecha_fin &&
    new Date(data.fecha_inicio) > new Date(data.fecha_fin)
  ) {
    errores.push("la fecha de inicio no puede ser mayor que la fecha de fin");
  }

  if (isNaN(data.porcentaje) || data.porcentaje < 0 || data.porcentaje > 100) {
    errores.push("porcentaje válido entre 0 y 100");
  }

  if (errores.length > 0) {
    Swal.fire({
      icon: "warning",
      title: "Faltan datos",
      html:
        "<ul style='text-align: left;'>" +
        errores.map((e) => `<li>${e}</li>`).join("") +
        "</ul>",
    });
    return;
  }

  // ✅ Envío si todo es válido
  try {
    const resp = await fetch("/planeaciones/proyectos/agregar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (resp.ok) {
      const resultado = await resp.json();
      Swal.fire({
        icon: "success",
        title: "¡Proyecto registrado!",
        text: resultado.nombre
          ? `El proyecto "${resultado.nombre}" fue guardado correctamente.`
          : "Proyecto guardado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => location.reload());
    } else {
      const error = await resp
        .json()
        .catch(() => ({ error: "Error desconocido" }));
      Swal.fire(
        "Error",
        error.error || "Error al guardar el proyecto",
        "error"
      );
    }
  } catch (err) {
    console.error("Error:", err);
    Swal.fire("Error", "Error de red al enviar el proyecto.", "error");
  }
}

//////////////PROCESO PARA EDITAR DATOS DE LA TABLA PROYECTO /////////////////////
// Dentro de proyecto.js

function editarProyecto(boton) {
  const fila = boton.closest("tr");
  const celdas = fila.children;

fila.dataset.original = JSON.stringify({
  id: celdas[0].textContent.trim(),
  nombre: celdas[1].textContent.trim(),
  descripcion: celdas[2].textContent.trim(),
  tipo_proyecto: celdas[3].textContent.trim(),
  departamento: celdas[4].textContent.trim(),
  area: celdas[5].textContent.trim(),
  integrantes: celdas[6].textContent.trim(),
  fecha_inicio: celdas[7].textContent.trim(),
  fechaFin: celdas[8].textContent.trim(),
  porcentaje: parseInt(celdas[9].textContent),
  estatus: celdas[10].textContent.trim(),
});

  celdas[1].innerHTML = `<input class="form-control" name="nombre" value="${celdas[1].textContent.trim()}">`;
  celdas[2].innerHTML = `<input class="form-control" name="descripcion" value="${celdas[2].textContent.trim()}">`;
  celdas[3].innerHTML = `
    <select class="form-select" name="tipo_proyecto">
      <option value="conjunto" ${celdas[3].textContent.trim() === "conjunto" ? "selected" : ""}>Conjunto</option>
      <option value="directivos" ${celdas[3].textContent.trim() === "directivos" ? "selected" : ""}>Directivos</option>
    </select>`;

  // Departamento
  celdas[4].innerHTML = `
    <div>
      <ul class="mb-1 small text-info" style="list-style-type: disc; padding-left: 1rem;"></ul>
      <input type="text" class="form-control mb-1" placeholder="Escribe un departamento">
      <button type="button" class="btn btn-sm btn-primary mt-1" onclick="editarAgregarLista(this, 'departamento')">Modificar</button>
    </div>`;

  // Área
  celdas[5].innerHTML = `
    <div>
      <ul class="mb-1 small text-success" style="list-style-type: disc; padding-left: 1rem;"></ul>
      <input type="text" class="form-control mb-1" placeholder="Escribe o selecciona área" list="listaAreas">
      <button type="button" class="btn btn-sm btn-primary mt-1" onclick="editarAgregarLista(this, 'area')">Modificar</button>
    </div>`;

  // Integrantes
  celdas[6].innerHTML = `
    <div>
      <ul class="mb-1 small text-primary" style="list-style-type: disc; padding-left: 1rem;"></ul>
      <input type="text" class="form-control mb-1" placeholder="Escribe o selecciona integrante" list="listaIntegrantes">
      <button type="button" class="btn btn-sm btn-primary mt-1" onclick="editarAgregarLista(this, 'integrantes')">Modificar</button>
    </div>`;

  // Inicializar listas
  ["departamento", "area", "integrantes"].forEach((campo, idx) => {
    const celda = celdas[4 + idx];
    const ul = celda.querySelector("ul");
    const originales = JSON.parse(fila.dataset.original)[campo].split(";").map(x => x.trim()).filter(x => x);
    originales.forEach(val => {
      const li = document.createElement("li");
      li.textContent = val;
      li.style.cursor = "pointer";
      li.title = "Haz clic para quitar este valor";
      li.onclick = () => li.remove();
      ul.appendChild(li);
    });
  });

  celdas[8].innerHTML = `<input type="date" class="form-control" name="fecha_fin" value="${celdas[8].textContent.trim()}">`;

  const porcentajeValor = parseInt(celdas[9].textContent);
  celdas[9].innerHTML = `
    <div class="d-flex align-items-center gap-2">
      <span class="porcentaje-texto">${porcentajeValor}%</span>
      <input type="range" class="form-range porcentaje-slider" name="porcentaje" min="0" max="100" value="${porcentajeValor}">
    </div>`;

  // Mostrar estatus editable
  const badge = document.createElement("span");
  badge.className = "indicador-badge badge rounded-pill bg-secondary";
  badge.textContent = JSON.parse(fila.dataset.original).estatus;
  celdas[10].innerHTML = "";
  celdas[10].appendChild(badge);

  const slider = celdas[9].querySelector(".porcentaje-slider");
  const texto = celdas[9].querySelector(".porcentaje-texto");

  slider.addEventListener("input", () => {
    const val = parseInt(slider.value);
    texto.textContent = val + "%";

    if (val === 100) {
      badge.textContent = "COMPLETO";
      badge.className = "indicador-badge badge rounded-pill bg-success";
    } else if (val >= 50) {
      badge.textContent = "ATENDIÉNDOSE";
      badge.className = "indicador-badge badge rounded-pill bg-warning text-dark";
    } else if (val === 0) {
      badge.textContent = "POR ATENDER";
      badge.className = "indicador-badge badge rounded-pill bg-secondary";
    } else {
      badge.textContent = "PLANEACIÓN";
      badge.className = "indicador-badge badge rounded-pill bg-primary";
    }
  });

  celdas[11].innerHTML = `
    <button class="btn btn-success btn-sm me-1" onclick="guardarEdicion(this)"><i class="bi bi-check-circle"></i></button>
    <button class="btn btn-secondary btn-sm" onclick="cancelarEdicion(this)"><i class="bi bi-x-circle"></i></button>`;
}

function editarAgregarLista(boton, campo) {
  const contenedor = boton.closest("td");
  const input = contenedor.querySelector("input");
  const ul = contenedor.querySelector("ul");
  const valor = input.value.trim();

  if (!valor) {
    alert("⚠️ Debes escribir o seleccionar un valor válido para " + campo);
    return;
  }

  const yaExiste = Array.from(ul.children).some(li => li.textContent === valor);
  if (yaExiste) {
    alert("⚠️ El valor ya existe en la lista.");
    return;
  }

  const li = document.createElement("li");
  li.textContent = valor;
  li.style.cursor = "pointer";
  li.title = "Haz clic para quitar este valor";
  li.onclick = () => li.remove();
  ul.appendChild(li);
  input.value = "";
}


function guardarEdicion(boton) {
  const fila = boton.closest("tr");
  const celdas = fila.children;

  const serializarLista = (celda) =>
    Array.from(celda.querySelectorAll("ul li")).map(li => li.textContent.trim()).join(";");

  const data = {
    id: parseInt(celdas[0].textContent.trim()),
    nombre: celdas[1].querySelector("input").value.trim(),
    descripcion: celdas[2].querySelector("input").value.trim(),
    tipo_proyecto: celdas[3].querySelector("select").value.trim(),
    departamento: serializarLista(celdas[4]),
    area: serializarLista(celdas[5]),
    integrantes: serializarLista(celdas[6]),
    fecha_fin: celdas[8].querySelector("input").value,
    porcentaje: parseInt(celdas[9].querySelector("input").value),
  };

  if (data.porcentaje === 100) data.estatus = "COMPLETO";
  else if (data.porcentaje >= 50) data.estatus = "ATENDIÉNDOSE";
  else if (data.porcentaje === 0) data.estatus = "POR ATENDER";
  else data.estatus = "PLANEACIÓN";

  if (!data.nombre || !data.tipo_proyecto || !data.fecha_fin) {
    Swal.fire("Error", "Faltan campos obligatorios", "warning");
    return;
  }

  fetch("/planeaciones/proyectos/editar", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((resp) => {
      if (resp.error) throw new Error(resp.error);
      Swal.fire("Actualizado", "El proyecto fue editado con éxito", "success").then(() => location.reload());
    })
    .catch((err) => {
      console.error(err);
      Swal.fire("Error", err.message || "No se pudo actualizar", "error");
    });
}

/////////////////////////////////PROCESO BOTON PARA CANCELAR EDITAR////////////////
function cancelarEdicion(boton) {
  const fila = boton.closest("tr");
  const data = JSON.parse(fila.dataset.original);

  fila.innerHTML = `
    <td>${data.id}</td>
    <td>${data.nombre}</td>
    <td>${data.descripcion}</td>
    <td>${data.tipo_proyecto}</td>
    <td>${data.departamento}</td>
    <td>${data.area}</td>
    <td>${data.integrantes}</td>
    <td>${data.fecha_inicio}</td>
    <td>${data.fechaFin}</td>
    <td>${data.porcentaje} %</td>
    <td>${data.estatus}</td>
    <td>
      <button class="btn btn-sm btn-outline-warning" onclick="editarProyecto(this)" title="Editar">
        <i class="bi bi-pencil-square"></i>
      </button>
    </td>
  `;

  Swal.fire({
    icon: "info",
    title: "Edición cancelada",
    text: `No se aplicaron cambios al proyecto "${data.nombre}".`,
    timer: 1500,
    showConfirmButton: false
  });
}

//////////////////////////////////////////////////////////////////////////////////////
