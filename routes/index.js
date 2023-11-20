//Importacion de modulos del sistems o instalados como paquetes npm
var express = require('express');

//Creacion del router
var router = express.Router();

//Importar el controlador del recurso Juegos para acceder a sus métodos (MWs)
const juegoController = require('../controllers/juego');


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


//Se define el modulo como exportable ya que se importará en el fichero de app.js entre otros
module.exports = router;
