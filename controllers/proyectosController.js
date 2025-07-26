const { getPersonal } = require('../db/royalDb');

const mostrarProyectos = async (req, res) => {
  try {
    // Supongamos que también cargas los proyectos desde la BD principal
    const integrantes = await getPersonal();

    res.render('proyectos', {
      title: 'Catálogo Proyectos',
      integrantes, // lista de nombres
      // otros datos necesarios
    });
  } catch (error) {
    console.error('Error cargando proyectos:', error);
    res.status(500).send('Error interno');
  }
};

module.exports = {
  mostrarProyectos
};
