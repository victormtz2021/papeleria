const bcrypt = require('bcryptjs');

const contraseña = 'admin123';

bcrypt.hash(contraseña, 10).then(hash => {
  console.log('Contraseña encriptada:', hash);
});
