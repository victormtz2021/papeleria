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
    <td><input type="text" class="form-control" name="departamento" placeholder="Departamento(s)"></td>
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
    <td>
      <button class="btn btn-success btn-sm" onclick="guardarProyecto(this)">Guardar</button>
    </td>
  `;

  tbody.appendChild(fila);
}

// ====================
// Funciones para manejar integrantes múltiples
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

function actualizarCampoOculto(lista, hidden) {
  const nombres = Array.from(lista.children).map((li) => li.textContent);
  hidden.value = nombres.join(";");
}

// ====================
// Guardar proyecto (envío al backend)
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
      location.reload(); // Refresca para mostrarlo en la tabla
    } else {
      alert("Error al guardar el proyecto.");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Error al enviar el proyecto.");
  }
}

// ====================
// Búsqueda opcional con datalist (no requerido si usas precarga)
// ====================
async function buscarPersonal(input) {
  const termino = input.value.trim();
  if (termino.length < 2) return;

  const datalist = document.getElementById("listaPersonal");
  datalist.innerHTML = ""; // limpiar

  try {
    const resp = await fetch(`/api/personal?q=${encodeURIComponent(termino)}`);
    const data = await resp.json();

    data.forEach((persona) => {
      const option = document.createElement("option");
      option.value = persona.nombre_completo;
      datalist.appendChild(option);
    });
  } catch (err) {
    console.error("Error al buscar personal:", err);
  }
}
