//Importacion de modulos del sistems o instalados como paquetes npm
var express = require('express');

//Creacion del router
var router = express.Router();

//Importar el controlador del recurso Juegos para acceder a sus métodos (MWs)
const juegoController = require('../controllers/juego');

//Importar el controlador del recurso Usuarios para acceder a sus métodos (MWs)
const usuarioController = require('../controllers/usuario');

//Importar el controlador del recurso Sesion para acceder a sus métodos (MWs)
const sesionController = require('../controllers/sesion');

//Importar el controlador del recurso Grupos para acceder a sus métodos (MWs)
const grupoController = require('../controllers/grupo');


//Actualiza la expiracion de la sesion al ocurrir una primitiva o la destruye si ha expirado
router.all('*', sesionController.checkLoginExpires);

//Instalacion de MWs router que atienden a las rutas relacionadas con la autenticacion (login) de los usuarios
router.get('/loguear', sesionController.new);
router.post('/loguear', sesionController.create, sesionController.createLoginExpires);
router.delete('/loguear', sesionController.destroy);


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
router.get(['/', '/autor', '/juegos', '/usuarios', '/usuarios/:id(\\d+)/juegos', '/grupos'], guardarUrl);


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

//Instalacion de MWs router que atienden a las rutas relacionadas con el interfaz CRUD de los Juegos. Añadidos la autorizacion y roles con MWs en serie
router.get('/juegos', juegoController.index);
router.get('/juegos/:juegoId(\\d+)', 
  sesionController.autenticacionRequerida, 
  juegoController.administradorOautorRequerido, 
  juegoController.show);
router.get('/juegos/new', 
  sesionController.autenticacionRequerida, 
  juegoController.new);
router.post('/juegos', 
  sesionController.autenticacionRequerida, 
  juegoController.create);
router.get('/juegos/:juegoId(\\d+)/edit', 
  sesionController.autenticacionRequerida, 
  juegoController.administradorOautorRequerido, 
  juegoController.edit);
router.put('/juegos/:juegoId(\\d+)', 
  sesionController.autenticacionRequerida, 
  juegoController.administradorOautorRequerido, 
  juegoController.update);
router.delete('/juegos/:juegoId(\\d+)', 
  sesionController.autenticacionRequerida, 
  juegoController.administradorOautorRequerido, 
  juegoController.destroy);

//Instalacion de los MWs para atender a las rutas que permiten jugar con los juegos
router.get('/juegos/:juegoId(\\d+)/play', juegoController.play);
router.get('/juegos/:juegoId(\\d+)/check', juegoController.check);
router.get('/juegos/randomplay', juegoController.randomPlay);
router.get('/juegos/randomcheck/:juegoId(\\d+)', juegoController.randomCheck);

//Instalacion de la funcion usuarioController.load de autoload de usuarios
router.param('usuarioId', usuarioController.load);

//Instalacion de MWs router que atienden a las rutas relacionadas con el interfaz CRUD de los Usuarios. Añadidos la autorizacion y roles con MWs en serie
router.get('/usuarios', 
  sesionController.autenticacionRequerida, 
  usuarioController.index);
router.get('/usuarios/:usuarioId(\\d+)', 
  sesionController.autenticacionRequerida, 
  usuarioController.show);

//Registro libre de usuarios o no
if (process.env.REGISTRO_ABIERTO === true) {
  router.get('/usuarios/new', usuarioController.new);
  router.post('/usuarios', usuarioController.create);
}
else {
  router.get('/usuarios/new', 
    sesionController.autenticacionRequerida, 
    sesionController.administradorRequerido, 
    usuarioController.new);
  router.post('/usuarios', 
    sesionController.autenticacionRequerida, 
    sesionController.administradorRequerido, 
    usuarioController.create);
}

router.get('/usuarios/:usuarioId(\\d+)/edit', 
  sesionController.autenticacionRequerida, 
  usuarioController.usuarioLocalRequerido, 
  sesionController.administradorOyoRequerido, 
  usuarioController.edit);
router.put('/usuarios/:usuarioId(\\d+)', 
  sesionController.autenticacionRequerida, 
  usuarioController.usuarioLocalRequerido, 
  sesionController.administradorOyoRequerido, 
  usuarioController.update);
router.delete('/usuarios/:usuarioId(\\d+)', 
  sesionController.autenticacionRequerida, 
  sesionController.administradorOyoRequerido, 
  usuarioController.destroy);
router.get('/usuarios/:usuarioId(\\d+)/juegos', 
  sesionController.autenticacionRequerida, 
  juegoController.index);

//Instalacion de los MW y rutas para la autenticacion con GitHub si sus variables de entorno estan definidas
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  router.get('/auth/github',sesionController.authGitHub);
  router.get('/auth/github/callback', 
    sesionController.authGitHubCB, 
    sesionController.createLoginExpires);
}

//Instalacion de los MW y rutas para la autenticacion con Google si sus variables de entorno estan definidas
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/auth/google',sesionController.authGoogle);
  router.get('/auth/google/callback', 
    sesionController.authGoogleCB, 
    sesionController.createLoginExpires);
}

//Instalacion de la funcion grupoController.load de autoload de grupos
router.param('grupoId', grupoController.load);

//Instalacion de MWs router que atienden a las rutas relacionadas con el interfaz CRUD de los Grupos. Añadidos la autorizacion y roles con MWs en serie
router.get('/grupos', grupoController.index);
router.get('/grupos/new', grupoController.new);
router.post('/grupos', grupoController.create);
router.get('/grupos/:grupoId(\\d+)/edit', grupoController.edit);
router.put('/grupos/:grupoId(\\d+)', grupoController.update);
router.delete('/grupos/:grupoId(\\d+)', grupoController.destroy);

//Instalacion de los MWs para atender a las rutas que permiten jugar con los grupos
router.get('/grupos/:grupoId(\\d+)/randomplay',  grupoController.randomPlay);
router.get('/grupos/:grupoId(\\d+)/randomcheck/:juegoId(\\d+)', grupoController.randomCheck);


//Se define el modulo como exportable ya que se importará en el fichero de app.js entre otros
module.exports = router;
