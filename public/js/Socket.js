const socket = io();

socket.on("connect", () => {
  console.log("✅ Conectado al servidor con ID:", socket.id);
});

socket.on("connect", () => {
  socket.emit("usuario_conectado", "<%= req.session.usuario %>");
});

socket.on("mensaje_bienvenida", (msg) => {
  mostrarAlerta("success", msg);
});
