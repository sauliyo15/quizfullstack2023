//Importacion de modulos del sistems o instalados como paquetes npm
var express = require('express');

//Creacion del router
var router = express.Router();


//Instalacion de MWs router que atienden a las rutas indicadas: /
router.get('/', function(req, res, next) {

  //Se elabora la respuesta con la renderizacion de la vista index.ejs pasando como parametro la variable title
  res.render('index', { title: 'Juego' });
});

//Instalacion de MWs router que atienden a las rutas indicadas: /autor
router.get('/autor', function(req, res, next) {

  //Se elabora la respuesta con la renderizacion de la vista autor.ejs
  res.render('autor');
});


//Se define el modulo como exportable ya que se importará en el fichero de app.js entre otros
module.exports = router;
