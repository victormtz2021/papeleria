// app.js
const express = require("express");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");




const path = require("path");
require("dotenv").config();

const app = express();
app.use(expressLayouts);
app.set("layout", "layout"); // nombre del archivo sin .ejs
app.use(express.json()); // 👈 Importante para recibir JSON
// Crear servidor HTTP manual para integrarlo con Socket.IO
const http = require("http");
const server = http.createServer(app);

// Integrar socket.io
const { Server } = require("socket.io");
const io = new Server(server);



// Usar layout solo para vistas autenticadas
app.use((req, res, next) => {
  // No usar layout para login
  if (req.path === '/login') {
    app.set('layout', false);
  } else {
    app.set('layout', 'layout'); // aquí se usa solo para dashboard/catálogos
  }
  next();
});




// Middleware y configuración
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// 🔽 Aquí este middleware
app.use((req, res, next) => {
  res.locals.usuario = req.session?.usuario || null;
  next();
});
// Rutas
const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);

// Ruta protegida de ejemplo
app.get('/dashboard', (req, res) => {
  if (!req.session.usuario) return res.redirect('/login');
  res.render('dashboard', {
    title: 'Panel Principal'
  });
});


app.get('/', (req, res) => {
  res.redirect('/login');
});


const usuariosRoutes = require('./routes/usuariosRoutes');
app.use('/usuarios', usuariosRoutes);

const productosRoutes = require("./routes/productosRoutes");
app.use("/productos", productosRoutes);


// Ruta catch-all para páginas no encontradas
app.use((req, res) => {
  res.status(404).render('404', { url: req.originalUrl });
});


/*
const apiRoutes = require('./routes/apiRoutes');
app.use('/api', apiRoutes);
*/

// Socket.IO: conexión básica
io.on("connection", (socket) => {
  console.log("🟢 Nuevo cliente conectado");

  // Aquí podrás usar eventos más adelante
  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado");
  });
});

io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado");

  socket.on("usuario_conectado", (usuario) => {
    console.log(`👤 Usuario conectado: ${usuario}`);

    // Puedes emitirle un mensaje individual de bienvenida
    socket.emit(
      "mensaje_bienvenida",
      `¡Bienvenido ${usuario}! Estás conectado en tiempo real.`
    );
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado");
  });
});

// Iniciar servidor en IP accesible por red
const PORT = process.env.PORT || 3070;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
