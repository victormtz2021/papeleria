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
            <input type="text" class="form-control mb-1" placeholder="Escribe un departamento">
            <button type="button" class="btn btn-sm btn-secondary mt-1" onclick="agregarDepartamento(this)">Agregar</button>
            <ul class="mt-1 small text-muted" style="list-style-type: disc; padding-left: 1rem;"></ul>
            <input type="hidden" name="departamento" value="">
          </div>
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
    <td>
  <div class="d-flex align-items-center gap-2">
    <span class="porcentaje-texto">0%</span>
    <input type="range" class="form-range porcentaje-slider" name="porcentaje" min="0" max="100" step="1" value="0">
  </div>
</td>
<td>
  <span class="indicador-badge badge rounded-pill bg-secondary">Sin estado</span>
</td>
    <td><button class="btn btn-success btn-sm" onclick="guardarProyecto(this)">Guardar</button></td>
  `;

  tbody.appendChild(fila);

  const slider = fila.querySelector(".porcentaje-slider");
  const texto = fila.querySelector(".porcentaje-texto");
  const badge = fila.querySelector(".indicador-badge");

  slider.addEventListener("input", () => {
    const val = parseInt(slider.value);
    texto.textContent = val + "%";

    // Cambia color del badge según el porcentaje
    if (val === 100) {
      badge.textContent = "COMPLETO";
      badge.className = "indicador-badge badge rounded-pill bg-success";
    } else if (val >= 50) {
      badge.textContent = "ATENDIÉNDOSE";
      badge.className =
        "indicador-badge badge rounded-pill bg-warning text-dark";
    } else if (val === 0) {
      badge.textContent = "POR ATENDER";
      badge.className = "indicador-badge badge rounded-pill bg-secondary";
    } else {
      badge.textContent = "PLANEACIÓN";
      badge.className = "indicador-badge badge rounded-pill bg-primary";
    }
  });
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
// Envío de proyecto al backend
// ====================
async function guardarProyecto(boton) {
  const fila = boton.closest("tr");
  const inputs = fila.querySelectorAll("input, select");

  const data = {};
  inputs.forEach((input) => {
    data[input.name] = input.value;
  });

  // ✅ Aquí colocas la validación del porcentaje
  if (
    "porcentaje" in data &&
    (isNaN(data.porcentaje) || data.porcentaje < 0 || data.porcentaje > 100)
  ) {
    alert("⚠️ El porcentaje debe ser un número entre 0 y 100.");
    return;
  }

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
