//Importacion de modulos del sistems o instalados como paquetes npm
var express = require('express');

//Creacion del router
var router = express.Router();

//Importar el controlador del recurso Juegos para acceder a sus métodos (MWs)
const juegoController = require('../controllers/juego');

//Importar el controlador del recurso Usuarios para acceder a sus métodos (MWs)
const usuarioController = require('../controllers/usuario');


//Middleware para redirigir a la URL anterior o a la raíz si no hay una URL anterior guardada
function volverAtras(req, res, next) {

  //Obtiene la URL anterior de la sesión o utiliza "/" por defecto
  const url = req.session.backURL || "/";

  //Elimina la URL anterior de la sesión para evitar redirecciones múltiples
  delete req.session.backURL;

  //Redirige al usuario a la URL anterior o a la raíz
  res.redirect(url); 
}

// Ruta para activar el middleware redirectBack y redirigir a la URL anterior
router.get('/atras', volverAtras);

//Middleware para guardar la URL actual en la sesión antes de ciertas rutas
function guardarUrl(req, res, next) {
  
  //Guarda la URL actual en la sesión para futuras redirecciones
  req.session.backURL = req.url; 

  //Continua con el siguiente middleware o controlador de ruta
  next(); 
}

//Rutas que activan el middleware saveBack para guardar la URL antes de estas rutas
router.get(['/', '/autor', '/juegos', '/usuarios'], guardarUrl);


//Instalacion de MWs router que atienden a las rutas indicadas: /
router.get('/', function(req, res, next) {

  //Se elabora la respuesta con la renderizacion de la vista index.ejs
  res.render('index');
});

//Instalacion de MWs router que atienden a las rutas indicadas: /autor
router.get('/autor', function(req, res, next) {

  //Se elabora la respuesta con la renderizacion de la vista autor.ejs
  res.render('autor');
});

//Instalacion de la funcion juegoController.load de autoload de juegos
router.param('juegoId', juegoController.load);

//Instalacion de MWs router que atienden a las rutas relacionadas con el interfaz CRUD de los Juegos
router.get('/juegos', juegoController.index);
router.get('/juegos/:juegoId(\\d+)', juegoController.show);
router.get('/juegos/new', juegoController.new);
router.post('/juegos', juegoController.create);
router.get('/juegos/:juegoId(\\d+)/edit', juegoController.edit);
router.put('/juegos/:juegoId(\\d+)', juegoController.update);
router.delete('/juegos/:juegoId(\\d+)', juegoController.destroy);

//Instalacion de los MWs para atender a las rutas que permiten jugar con los juegos
router.get('/juegos/:juegoId(\\d+)/play', juegoController.play);
router.get('/juegos/:juegoId(\\d+)/check', juegoController.check);

//Instalacion de la funcion usuarioController.load de autoload de usuarios
router.param('usuarioId', usuarioController.load);

//Instalacion de MWs router que atienden a las rutas relacionadas con el interfaz CRUD de los Usuarios
router.get('/usuarios', usuarioController.index);
router.get('/usuarios/:usuarioId(\\d+)', usuarioController.show);
router.get('/usuarios/new', usuarioController.new);
/*router.post('/usuarios', usuarioController.create);
router.get('/usuarios/:usuarioId(\\d+)/edit', usuarioController.edit);
router.put('/usuarios/:usuarioId(\\d+)', usuarioController.update);
router.delete('/usuarios/:usuarioId(\\d+)', usuarioController.destroy);*/


//Se define el modulo como exportable ya que se importará en el fichero de app.js entre otros
module.exports = router;
