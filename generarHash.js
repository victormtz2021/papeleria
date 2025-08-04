const bcrypt = require('bcrypt');
const password = 'admin123'; // Cambia a la contraseña deseada

bcrypt.hash(password, 10, function(err, hash) {
  if (err) throw err;
  console.log('Contraseña encriptada:', hash);
});
