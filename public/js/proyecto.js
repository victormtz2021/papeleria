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
  const texto = tipo === "conjunto"
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
        <input type="text" class="form-control mb-1" placeholder="Escribe o selecciona área" list="listaAreas">
        <button type="button" class="btn btn-sm btn-secondary mt-1" onclick="agregarArea(this)">Agregar</button>
        <ul class="mt-1 small text-muted" style="list-style-type: disc; padding-left: 1rem;"></ul>
        <input type="hidden" name="area" value="">
      </div>
    </td>
    <td>
      <div>
        <input type="text" class="form-control mb-1" placeholder="Escribe y selecciona" list="listaIntegrantes">
        <button type="button" class="btn btn-sm btn-secondary mt-1" onclick="agregarIntegrante(this)">Agregar</button>
        <ul class="mt-1 small" style="list-style-type: disc; padding-left: 1rem;"></ul>
        <input type="hidden" name="integrantes" value="">
      </div>
    </td>
    <td><input type="date" class="form-control" name="fecha_inicio"></td>
    <td><input type="date" class="form-control" name="fecha_fin"></td>
    <td><input type="text" class="form-control" name="status"></td>
    <td><button class="btn btn-success btn-sm" onclick="guardarProyecto(this)">Guardar</button></td>
  `;

  tbody.appendChild(fila);
}

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

  const yaExiste = Array.from(lista.children).some(li => li.textContent === nombre);
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

  const yaExiste = Array.from(lista.children).some(li => li.textContent === nombre);
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
  const valores = Array.from(lista.children).map(li => li.textContent);
  hidden.value = valores.join(";");
}

// ====================
// Envío de proyecto al backend
// ====================
async function guardarProyecto(boton) {
  const fila = boton.closest("tr");
  const inputs = fila.querySelectorAll("input, select");

  const data = {};
  inputs.forEach((input) => {
    data[input.name] = input.value;
  });

  try {
    const resp = await fetch("/planeaciones/proyectos/agregar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (resp.ok) {
      location.reload();
    } else {
      alert("Error al guardar el proyecto.");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Error al enviar el proyecto.");
  }
}
