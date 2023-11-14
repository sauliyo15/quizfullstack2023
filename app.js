//Importacion de modulos del sistems o instalados como paquetes npm
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//Se importa el modulo para poder instalar el MW para servir el icono
var favicon = require('serve-favicon');

//Se importa el modulo para poder servir un marco comun (cabecera, navegacion y pie) a todas las vistas
var partials = require('express-partials');

//Se importa el modulo para poder simular PUT y DELET en peticiones GET y POST (estas son las unicas que permite HTML)
var methodOverride = require('method-override');


//Importar de los modulos con los routers generados en el directorio routes
var indexRouter = require('./routes/index');


//Crea al aplicacion express
var app = express();


//Define views como directorio que contiene vistas
app.set('views', path.join(__dirname, 'views'));

//Instala el renderizador de vistas EJS
app.set('view engine', 'ejs');


//Instlacion de MWs genericos instalados como paquetes npm
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Cookieparser para el manejo de cookies
app.use(cookieParser());

//Servidor estatico para servir paginas estaticas, javascript, estilos, etc..que esten en el directorio public
app.use(express.static(path.join(__dirname, 'public')));

//Instalacion del MW para gestionar el favicon y visualizar el icono ubicado en la carpeta public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//Instalacion del MW para sevir el marco comun a todas las vistas por defecto es, layout.ejs
app.use(partials());

//Instalacion del MW para poder realizar las solicitudes PUT o DELETE en HTML
app.use(methodOverride('_method', {methods: ["POST", "GET"]}));


//Instalacion de MWs router que atienden a las rutas indicadas
app.use('/', indexRouter);


/*Instalacion de MW que atiende cualquier transaccion HTTP con cualquier ruta que no se haya atendido por los 
MWs AuthenticatorAssertionResponse. Este MW envia la respuesta 404 Not Found invocando el siguiente MW de error*/
app.use(function(req, res, next) {
  next(createError(404));
});


//Instalacion de MWs de error que envia la respuesta HTTP con res.render('error')
app.use(function(err, req, res, next) {
  
  //Se incluyen en res.local mensajes que podran ser accedidos en la vista 'error'
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  //Si no se ha definido el codigo de respuesta se envia 500
  res.status(err.status || 500);

  //Renderiza y envia la vista de respuesta a errores
  res.render('error');
});


//Se define el modulo como exportable ya que se importará en el fichero de arranque wwww
module.exports = app;
