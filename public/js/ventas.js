// public/js/ventas.js

let carrito = [];

// 👉 Buscar y agregar producto al carrito (prototipo simple con nombre y precio manual)
document.getElementById("btnAgregarProducto").addEventListener("click", () => {
  const nombre = document.getElementById("buscarProducto").value.trim();
  const cantidad = parseInt(document.getElementById("cantidadProducto").value);

  // Aquí deberías hacer una búsqueda real por AJAX desde la BD
  const productoFalso = {
    id: Date.now(), // temporal, reemplazar por id real del producto
    nombre: nombre,
    precio: 100.00 // ← reemplaza por precio real del producto
  };

  if (!nombre || cantidad < 1) {
    return Swal.fire("Error", "Ingrese un producto válido y cantidad mayor a 0", "error");
  }

  // Verifica si ya está en el carrito
  const existente = carrito.find(p => p.nombre === nombre);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({
      id: productoFalso.id,
      nombre: productoFalso.nombre,
      precio: productoFalso.precio,
      cantidad: cantidad
    });
  }

  actualizarTabla();
  limpiarInputs();
});

// 👉 Eliminar producto del carrito
function eliminarDelCarrito(id) {
  carrito = carrito.filter(p => p.id !== id);
  actualizarTabla();
}

// 👉 Mostrar productos en tabla HTML
function actualizarTabla() {
  const tbody = document.querySelector("#tablaCarrito tbody");
  tbody.innerHTML = "";

  let total = 0;

  carrito.forEach((item) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${item.nombre}</td>
      <td>$${item.precio.toFixed(2)}</td>
      <td>${item.cantidad}</td>
      <td>$${subtotal.toFixed(2)}</td>
      <td><button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito(${item.id})">Eliminar</button></td>
    `;
    tbody.appendChild(fila);
  });

  document.getElementById("totalVenta").textContent = total.toFixed(2);
}

// 👉 Limpiar campos después de agregar
function limpiarInputs() {
  document.getElementById("buscarProducto").value = "";
  document.getElementById("cantidadProducto").value = "1";
}

// 👉 Mostrar campos fiscales si requiere factura
document.getElementById("chkFactura").addEventListener("change", (e) => {
  const mostrar = e.target.checked;
  document.getElementById("datosFiscales").style.display = mostrar ? "block" : "none";
});

// 👉 Finalizar venta
document.getElementById("btnFinalizarVenta").addEventListener("click", async () => {
  if (carrito.length === 0) {
    return Swal.fire("Error", "Agregue al menos un producto", "warning");
  }

  const requiereFactura = document.getElementById("chkFactura").checked;

  let cliente = null;

  if (requiereFactura) {
    const rfc = document.getElementById("rfc").value.trim();
    const razon = document.getElementById("razonSocial").value.trim();
    const uso = document.getElementById("usoCfdi").value.trim();
    const correo = document.getElementById("correoCliente").value.trim();

    if (!rfc || !razon || !uso || !correo) {
      return Swal.fire("Error", "Complete todos los datos fiscales", "error");
    }

    cliente = { rfc, razon_social: razon, uso_cfdi: uso, correo };
  }

  const datosVenta = {
    productos: carrito,
    requiere_factura: requiereFactura,
    cliente: cliente
  };

  try {
    const res = await fetch("/ventas/agregar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosVenta)
    });

    const result = await res.json();

    if (result.ok) {
      Swal.fire("Venta realizada", "La venta se registró exitosamente", "success");
      carrito = [];
      actualizarTabla();
      document.getElementById("chkFactura").checked = false;
      document.getElementById("datosFiscales").style.display = "none";
    } else {
      throw new Error(result.error || "No se pudo registrar la venta");
    }
  } catch (error) {
    console.error("Error al registrar venta:", error);
    Swal.fire("Error", "Hubo un problema al guardar la venta", "error");
  }
});
