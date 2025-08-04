document.addEventListener("DOMContentLoaded", () => {
  const btnAgregar = document.getElementById("btnAgregarUsuario");
  const cuerpoTabla = document.getElementById("cuerpoTablaUsuarios");
if (!btnAgregar) return; // ⛔ Detiene si no existe
  // === ➕ AGREGAR NUEVA FILA
  btnAgregar.addEventListener("click", () => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td><input type="text" class="form-control" name="nombre_completo" required></td>
      <td><input type="text" class="form-control" name="usuario" required></td>
      <td><input type="email" class="form-control" name="correo" required></td>
      <td><input type="password" class="form-control" name="contrasena" required></td>
      <td>
        <select class="form-select" name="rol" required>
          <option value="">Seleccione</option>
          <option value="admin">Admin</option>
          <option value="empleado">Empleado</option>
          <option value="visualizador">Visualizador</option>
        </select>
      </td>
      <td>
        <button class="btn btn-success btn-sm me-1 btnGuardar"><i class="bi bi-check-circle"></i></button>
        <button class="btn btn-secondary btn-sm btnCancelarNuevo"><i class="bi bi-x-circle"></i></button>
      </td>
    `;

    cuerpoTabla.prepend(fila);

    // Evento guardar
    fila.querySelector(".btnGuardar").addEventListener("click", async () => {
      const nombre_completo = fila.querySelector('input[name="nombre_completo"]').value.trim();
      const usuario = fila.querySelector('input[name="usuario"]').value.trim();
      const correo = fila.querySelector('input[name="correo"]').value.trim();
      const contrasena = fila.querySelector('input[name="contrasena"]').value.trim();
      const rol = fila.querySelector('select[name="rol"]').value;

      if (!nombre_completo || !usuario || !correo || !contrasena || !rol) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos incompletos',
          text: 'Por favor, llena todos los campos antes de guardar.'
        });
        return;
      }

      try {
        const res = await fetch("/usuarios/agregar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre_completo, usuario, correo, contrasena, rol })
        });

        const data = await res.json();

        if (res.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Usuario guardado',
            timer: 1200,
            showConfirmButton: false
          }).then(() => location.reload());
        } else {
          Swal.fire({ icon: 'error', title: 'Error', text: data.error });
        }
      } catch {
        Swal.fire({ icon: 'error', title: 'Error de red', text: 'No se pudo contactar con el servidor.' });
      }
    });

    // Evento cancelar fila nueva
    fila.querySelector(".btnCancelarNuevo").addEventListener("click", () => {
      Swal.fire({
        title: "¿Cancelar nuevo usuario?",
        text: "Se perderán los datos ingresados.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "Volver"
      }).then((result) => {
        if (result.isConfirmed) fila.remove();
      });
    });
  });

  // === ✏️ EVENTOS DE EDICIÓN / GUARDAR / CANCELAR en filas existentes
  cuerpoTabla.addEventListener("click", async (e) => {
    const fila = e.target.closest("tr");
    const btnEditar = e.target.closest(".btnEditar");
    const btnGuardar = e.target.closest(".btnGuardarCambios");
    const btnCancelar = e.target.closest(".btnCancelarEdicion");

    if (btnEditar && fila) {
      const celdas = fila.querySelectorAll("td");
      const nombre = celdas[0].innerText.trim();
      const usuario = celdas[1].innerText.trim();
      const correo = celdas[2].innerText.trim();
      const rol = celdas[4].innerText.trim();
      const id = fila.querySelector('input[name="id"]').value;

      celdas[0].innerHTML = `<input type="text" name="nombre_completo" class="form-control" value="${nombre}" required>`;
      celdas[4].innerHTML = `
        <select name="rol" class="form-select">
          <option value="admin" ${rol === "admin" ? "selected" : ""}>Admin</option>
          <option value="empleado" ${rol === "empleado" ? "selected" : ""}>Empleado</option>
          <option value="visualizador" ${rol === "visualizador" ? "selected" : ""}>Visualizador</option>
        </select>
      `;

      celdas[5].innerHTML = `
        <input type="hidden" name="id" value="${id}">
        <button type="button" class="btn btn-success btn-sm btnGuardarCambios"><i class="bi bi-check-circle"></i></button>
        <button type="button" class="btn btn-secondary btn-sm btnCancelarEdicion"><i class="bi bi-x-circle"></i></button>
      `;
    }

    if (btnGuardar && fila) {
      const id = fila.querySelector('input[name="id"]').value;
      const nombre_completo = fila.querySelector('input[name="nombre_completo"]').value.trim();
      const rol = fila.querySelector('select[name="rol"]').value;

      if (!nombre_completo || !rol) {
        return Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Completa todos los campos para guardar.' });
      }

      try {
        const res = await fetch("/usuarios/editar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, nombre_completo, rol })
        });

        const data = await res.json();

        if (res.ok) {
          Swal.fire({ icon: 'success', title: 'Usuario actualizado', timer: 1200, showConfirmButton: false }).then(() => location.reload());
        } else {
          Swal.fire({ icon: 'error', title: 'Error', text: data.error });
        }
      } catch {
        Swal.fire({ icon: 'error', title: 'Error de red', text: 'No se pudo contactar con el servidor.' });
      }
    }

    if (btnCancelar && fila) {
      location.reload(); // o si prefieres restaurar manualmente la fila original con valores previos
    }
  });
});



///////////////CODIGO PARA MOSTRAR INACTIVOS USUARIOS EN UN MODAL ////////////////////
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalUsuariosEliminados");
  if (!modal) return; // 🔒 Previene error si no existe

  modal.addEventListener("show.bs.modal", async () => {
    const tbody = document.querySelector("#tablaEliminados tbody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;

    try {
      const res = await fetch("/usuarios/eliminados");
      const data = await res.json();

      if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No hay usuarios eliminados.</td></tr>`;
        return;
      }

      tbody.innerHTML = data.map(u => `
        <tr>
          <td>${u.nombre_completo}</td>
          <td>${u.usuario}</td>
          <td>${u.correo}</td>
          <td>${u.rol}</td>
          <td>${new Date(u.fecha_baja).toLocaleString()}</td>
        </tr>
      `).join("");
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5">Error al cargar usuarios eliminados.</td></tr>`;
    }
  });
});
