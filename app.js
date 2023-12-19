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

//Se importa el modulo para poder gestionar sesiones Web de cliente basadas en cookies
var session = require('express-session');

//Se importa el modulo para permitir el envio de mensajes flash entre transacciones
var flash = require('express-flash');

//Se importa el modulo para configurar la gestion de sesiones de la tabla Sesiones
var SequelizeStore = require('connect-session-sequelize')(session.Store);

//Se importa el modulo para la gestion de autenticacion de usarios.
var passport = require('passport');

//Se importa el modulo para que muestre las variables definidas en el fichero .env en process.env
require('dotenv').config();


//Importar de los modulos con los routers generados en el directorio routes
var indexRouter = require('./routes/index');

//Importar el acceso a la base de datos
var sequelize = require('./models');


//Crea la aplicacion express
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

//Definimos como sera el almacen de las sesiones
var sessionStore = new SequelizeStore({
  db: sequelize, //Base de datos a utilizar la que utilizar sequelize al importar models
  table: "Session", //Tabla a utilizar
  checkExpirationInterval: 15 * 60 * 1000, //Chequear cada 15 minutos (en milisegundos)
  expiration: 4 * 60 * 60 * 1000 //La sesion expira cada 4 horas (en milisegundos)
});

//Instalacion de MW para manejar las sesiones y los mensajes flash. Indicamos que se va a almacenar con sessionStore
app.use(session({secret: "juegosfull2023", store: sessionStore, resave: false, saveUninitialized: true})); //secret: semilla de cifrado de la cookie, resave, saveUnitialized: fuerzan guardar siempre sesiones aunque no esten inicializadas

//Instalacion del MW para el uso de mensajes flash entre transacciones
app.use(flash());

//Inicializa passport y define 'usuarioLogueado' como la propiedad de req que contiene al usuario autenticado si existe
app.use(passport.initialize({userProperty: 'usuarioLogueado'}));

//Conecta la sesion de login con la de cliente
app.use(passport.session());

//Instalacion del MW para gestionar la informacion del usuario logueado y hacerla visible en todas las vistas
app.use(function(req, res, next) {
  //Se copia la informacion desde la peticion a la respuesta
  res.locals.usuarioLogueado = req.usuarioLogueado && {
    id: req.usuarioLogueado.id,
    displayNombre: req.usuarioLogueado.displayNombre,
    esAdministrador: req.usuarioLogueado.esAdministrador
  };
  next();
});


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
