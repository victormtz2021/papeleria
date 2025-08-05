let listaClavesSAT = [];
let listaUnidadesSAT = [];

// === 🟡 Asignar color de badge según porcentaje de stock
function obtenerColorStock(porcentaje) {
  if (porcentaje < 20) return 'danger';
  if (porcentaje < 80) return 'warning';
  return 'success';
}

// === 🟢 Renderizar badge de stock en HTML
function renderizarBadgeStock(cantidad, stock_maximo = 100) {
  if (!stock_maximo || stock_maximo === 0) return '<span class="badge bg-secondary">N/A</span>';
  const porcentaje = Math.round((cantidad / stock_maximo) * 100);
  const color = obtenerColorStock(porcentaje);
  return `<span class="badge bg-${color}">${porcentaje}%</span>`;
}

// === Cargar autocompletado desde archivos JSON locales
fetch("/data/claves_sat.json")
  .then((res) => res.json())
  .then((lista) => {
    listaClavesSAT = lista;
    new Awesomplete(document.getElementById("claveSAT"), {
      list: lista,
      minChars: 2,
      maxItems: 10,
      autoFirst: true,
    });
  });

fetch("/data/unidades_sat.json")
  .then((res) => res.json())
  .then((lista) => {
    listaUnidadesSAT = lista;
    new Awesomplete(document.getElementById("unidadSAT"), {
      list: lista,
      minChars: 1,
      maxItems: 10,
      autoFirst: true,
    });
  });

document.addEventListener("DOMContentLoaded", () => {

  // === 🧾 Inicializar DataTable
  $('#tablaProductos').DataTable({
    dom: 'Bfrtip',
    buttons: [
      {
        extend: 'excelHtml5',
        text: '<i class="bi bi-file-earmark-excel"></i> Excel',
        className: 'btn btn-outline-success btn-sm',
        exportOptions: { columns: ':not(:last-child)' }
      },
      {
        extend: 'pdfHtml5',
        text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
        className: 'btn btn-outline-danger btn-sm',
        exportOptions: { columns: ':not(:last-child)' }
      },
      {
        extend: 'print',
        text: '<i class="bi bi-printer"></i> Imprimir',
        className: 'btn btn-outline-secondary btn-sm',
        exportOptions: { columns: ':not(:last-child)' }
      }
    ],
    responsive: true,
    pageLength: 5,
    lengthMenu: [5, 10, 25, 50],
    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
    }
  });

  // === Renderizar badge de stock por fila al cargar
  document.querySelectorAll("#tablaProductos tbody tr").forEach((fila) => {
    const cantidad = parseInt(fila.children[0].textContent);
    const stockMax = parseInt(fila.dataset.stockMax || "100");
    const celdaStock = fila.querySelector("td[data-stock]");
    if (celdaStock) {
      celdaStock.innerHTML = renderizarBadgeStock(cantidad, stockMax);
    }
  });

  // === 🎯 Registro de nuevo producto
  const form = document.getElementById("formProducto");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      cantidad: parseInt(form.cantidad.value),
      nombre_articulo: form.nombre_articulo.value.trim(),
      clave_sat: form.clave_sat.value.trim(),
      descripcion: form.descripcion.value.trim(),
      unidad_sat: form.unidad_sat.value.trim(),
      precio_unitario: parseFloat(form.precio_unitario.value),
      fecha_producto: form.fecha_producto.value,
    };

    const faltantes = [];
    if (!data.cantidad || data.cantidad < 0) faltantes.push("Cantidad");
    if (!data.nombre_articulo) faltantes.push("Artículo");
    if (!data.clave_sat) faltantes.push("Clave SAT");
    if (!data.descripcion) faltantes.push("Descripción");
    if (!data.unidad_sat) faltantes.push("Unidad SAT");
    if (!data.precio_unitario || isNaN(data.precio_unitario)) faltantes.push("Precio");
    if (!data.fecha_producto) faltantes.push("Fecha del producto");

    if (faltantes.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        html: "Faltan los siguientes campos:<br><b>" + faltantes.join(", ") + "</b>",
      });
      return;
    }

    const regexArticulo = /^[A-Za-zÀ-ÿ\s]+$/;
    if (!regexArticulo.test(data.nombre_articulo)) {
      Swal.fire({
        icon: "warning",
        title: "Nombre inválido",
        text: "El artículo solo debe contener letras y espacios.",
      });
      return;
    }

    const articulosExistentes = Array.from(
      document.querySelectorAll("#tablaProductos tbody tr td:nth-child(2)")
    ).map((td) => td.textContent.trim().toLowerCase());

    if (articulosExistentes.includes(data.nombre_articulo.toLowerCase())) {
      Swal.fire({
        icon: "warning",
        title: "Artículo duplicado",
        text: `El artículo "${data.nombre_articulo}" ya existe.`,
      });
      return;
    }

    try {
      const res = await fetch("/productos/agregar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        Swal.fire({ icon: "success", title: "Guardado", timer: 1000, showConfirmButton: false });

        const tbody = document.querySelector("#tablaProductos tbody");
        const fila = document.createElement("tr");
        fila.dataset.id = result.id; // 👈 Se asegura el ID para futuras ediciones/eliminaciones

        fila.innerHTML = `
          <td>${data.cantidad}</td>
          <td>${data.nombre_articulo}</td>
          <td>${data.clave_sat}</td>
          <td>${data.descripcion}</td>
          <td>${data.unidad_sat}</td>
          <td>$${data.precio_unitario.toFixed(2)}</td>
          <td>${data.fecha_producto}</td>
          <td data-stock>${renderizarBadgeStock(data.cantidad)}</td>
          <td>
            <button class="btn btn-sm btn-outline-warning btnEditar"><i class="bi bi-pencil-square"></i></button>
            <button class="btn btn-sm btn-outline-danger btnEliminar" data-id="${result.id}"><i class="bi bi-trash3"></i></button>
          </td>
        `;
        tbody.prepend(fila);
        form.reset();
        form.cantidad.focus();
      } else {
        Swal.fire({ icon: "error", title: "Error", text: result.error });
      }
    } catch (err) {
      console.error("Error al guardar producto:", err);
      Swal.fire({ icon: "error", title: "Error de red", text: "No se pudo contactar con el servidor." });
    }
  });

  // === ✏️ Iniciar edición de fila
  document.querySelector("#tablaProductos tbody").addEventListener("click", (e) => {
    const btn = e.target.closest(".btnEditar");
    if (!btn) return;

    const fila = btn.closest("tr");
    const celdas = fila.querySelectorAll("td");

    fila.dataset.original = JSON.stringify({
      cantidad: celdas[0].textContent.trim(),
      articulo: celdas[1].textContent.trim(),
      clave: celdas[2].textContent.trim(),
      descripcion: celdas[3].textContent.trim(),
      unidad: celdas[4].textContent.trim(),
      precio: parseFloat(celdas[5].textContent.replace("$", "")),
      fecha: celdas[6].textContent.trim(),
    });

    celdas[0].innerHTML = `<input type="number" class="form-control" value="${celdas[0].textContent.trim()}" />`;
    celdas[1].innerHTML = `<input type="text" class="form-control" value="${celdas[1].textContent.trim()}" />`;
    celdas[2].innerHTML = `<input type="text" class="form-control claveSATinput" value="${celdas[2].textContent.trim()}" />`;
    celdas[3].innerHTML = `<input type="text" class="form-control" value="${celdas[3].textContent.trim()}" />`;
    celdas[4].innerHTML = `<input type="text" class="form-control unidadSATinput" value="${celdas[4].textContent.trim()}" />`;
    celdas[5].innerHTML = `<input type="number" step="0.01" class="form-control" value="${parseFloat(celdas[5].textContent.replace("$", ""))}" />`;
    celdas[6].innerHTML = `<input type="date" class="form-control" value="${celdas[6].textContent.trim()}" />`;
    celdas[7].innerHTML = ""; // Quitar badge

    celdas[8].innerHTML = `
      <button class="btn btn-sm btn-success btnGuardarEdicion"><i class="bi bi-check-circle"></i></button>
      <button class="btn btn-sm btn-secondary btnCancelarEdicion"><i class="bi bi-x-circle"></i></button>
    `;

    // Reaplicar autocompletado en inputs de edición
    new Awesomplete(celdas[2].querySelector(".claveSATinput"), {
      list: listaClavesSAT, minChars: 2, maxItems: 10, autoFirst: true
    });
    new Awesomplete(celdas[4].querySelector(".unidadSATinput"), {
      list: listaUnidadesSAT, minChars: 1, maxItems: 10, autoFirst: true
    });
  });

  // === 💾 Guardar edición
  document.querySelector("#tablaProductos tbody").addEventListener("click", async (e) => {
    const btnGuardar = e.target.closest(".btnGuardarEdicion");
    if (!btnGuardar) return;

    const fila = btnGuardar.closest("tr");
    const id = fila.dataset.id;
    const celdas = fila.querySelectorAll("td");

    const data = {
      id,
      cantidad: parseInt(celdas[0].querySelector("input").value),
      nombre_articulo: celdas[1].querySelector("input").value.trim(),
      clave_sat: celdas[2].querySelector("input").value.trim(),
      descripcion: celdas[3].querySelector("input").value.trim(),
      unidad_sat: celdas[4].querySelector("input").value.trim(),
      precio_unitario: parseFloat(celdas[5].querySelector("input").value),
      fecha_producto: celdas[6].querySelector("input").value
    };

    try {
      const res = await fetch("/productos/editar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok) {
        Swal.fire("Editado", "Cambios guardados correctamente", "success");
        fila.innerHTML = `
          <td>${data.cantidad}</td>
          <td>${data.nombre_articulo}</td>
          <td>${data.clave_sat}</td>
          <td>${data.descripcion}</td>
          <td>${data.unidad_sat}</td>
          <td>$${data.precio_unitario.toFixed(2)}</td>
          <td>${data.fecha_producto}</td>
          <td data-stock>${renderizarBadgeStock(data.cantidad)}</td>
          <td>
            <button class="btn btn-sm btn-outline-warning btnEditar"><i class="bi bi-pencil-square"></i></button>
            <button class="btn btn-sm btn-outline-danger btnEliminar" data-id="${id}"><i class="bi bi-trash3"></i></button>
          </td>`;
        fila.dataset.id = id;
      } else {
        Swal.fire("Error", result.error, "error");
      }
    } catch (err) {
      console.error("Error al editar:", err);
      Swal.fire("Error", "Fallo en la conexión", "error");
    }
  });

  // === ❌ Cancelar edición
  document.querySelector("#tablaProductos tbody").addEventListener("click", (e) => {
    const btnCancelar = e.target.closest(".btnCancelarEdicion");
    if (!btnCancelar) return;

    const fila = btnCancelar.closest("tr");
    const original = JSON.parse(fila.dataset.original);
    fila.innerHTML = `
      <td>${original.cantidad}</td>
      <td>${original.articulo}</td>
      <td>${original.clave}</td>
      <td>${original.descripcion}</td>
      <td>${original.unidad}</td>
      <td>$${original.precio.toFixed(2)}</td>
      <td>${original.fecha}</td>
      <td data-stock>${renderizarBadgeStock(original.cantidad)}</td>
      <td>
        <button class="btn btn-sm btn-outline-warning btnEditar"><i class="bi bi-pencil-square"></i></button>
        <button class="btn btn-sm btn-outline-danger btnEliminar" data-id="${fila.dataset.id}"><i class="bi bi-trash3"></i></button>
      </td>`;
  });

  // === 🗑️ Eliminar producto (cambio de estatus)
  document.querySelector("#tablaProductos tbody").addEventListener("click", async (e) => {
    const btnEliminar = e.target.closest(".btnEliminar");
    if (!btnEliminar) return;

    const fila = btnEliminar.closest("tr");
    const id = fila.dataset.id;

    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "El producto será marcado como eliminado",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`/productos/eliminar/${id}`, { method: "POST" });
      const result = await res.json();

      if (res.ok) {
        Swal.fire("Eliminado", result.mensaje, "success");
        fila.remove();
      } else {
        Swal.fire("Error", result.error, "error");
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
      Swal.fire("Error", "No se pudo eliminar el producto", "error");
    }
  });

  // === 🔄 Ver productos eliminados
  const btnVerEliminados = document.getElementById("btnVerEliminados");
  if (btnVerEliminados) {
    btnVerEliminados.addEventListener("click", async () => {
      try {
        const res = await fetch("/productos/eliminados");
        const data = await res.json();
        const tbody = document.querySelector("#tablaEliminados tbody");
        tbody.innerHTML = "";

        data.forEach((p) => {
          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td>${p.cantidad}</td>
            <td>${p.nombre_articulo}</td>
            <td>${p.clave_sat}</td>
            <td>${p.descripcion}</td>
            <td>${p.unidad_sat}</td>
            <td>$${p.precio_unitario.toFixed(2)}</td>
            <td>${p.fecha_producto.split("T")[0]}</td>
            <td><button class="btn btn-sm btn-success btnReactivar" data-id="${p.id}"><i class="bi bi-arrow-counterclockwise"></i></button></td>`;
          tbody.appendChild(fila);
        });
      } catch (error) {
        console.error("Error cargando productos eliminados:", error);
      }
    });
  }

  // === 🔁 Reactivar producto eliminado
  if (document.querySelector("#tablaEliminados")) {
    document.querySelector("#tablaEliminados").addEventListener("click", async (e) => {
      const btn = e.target.closest(".btnReactivar");
      if (!btn) return;

      const id = btn.dataset.id;
      try {
        const res = await fetch(`/productos/reactivar/${id}`, { method: "POST" });
        const result = await res.json();

        if (res.ok) {
          Swal.fire("Producto reactivado", "Se ha restaurado exitosamente", "success")
            .then(() => btn.closest("tr").remove());
        } else {
          Swal.fire("Error", result.error || "No se pudo reactivar", "error");
        }
      } catch (err) {
        console.error("Error al reactivar:", err);
      }
    });
  }
});
