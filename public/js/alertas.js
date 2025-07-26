// alertas.js

/**
 * Muestra una alerta visual con Bootstrap
 * @param {string} tipo - 'success' | 'danger' | 'warning' | 'info'
 * @param {string} mensaje - Texto a mostrar
 * @param {number} duracion - Tiempo en ms antes de que se oculte (opcional)
 */
function mostrarAlerta(tipo = "info", mensaje = "", duracion = 5000) {
  const tiposPermitidos = ["success", "danger", "warning", "info"];
  const tipoClase = tiposPermitidos.includes(tipo) ? tipo : "info";

  const alerta = document.createElement("div");
  alerta.className = `alert alert-${tipoClase} alert-dismissible fade show`;
  alerta.role = "alert";
  alerta.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
  `;

  const contenedor = document.getElementById("alert-container");
  if (contenedor) {
    contenedor.appendChild(alerta);

    setTimeout(() => {
      alerta.classList.remove("show");
      alerta.classList.add("hide");
      setTimeout(() => alerta.remove(), 500);
    }, duracion);
  } else {
    console.warn("No se encontró el contenedor de alertas (#alert-container)");
  }
}
