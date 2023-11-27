//Se importia el modulo sequelize
const { Sequelize } = require("sequelize");

//Se importa del directorio models el archivo index (nombre principal por defecto)
const { models } = require("../models");

//Se importa la funcion del modulo paginacion del directorio helpers que ayudara crear la botonera
const paginacion = require("../helpers/paginacion").paginate;

//Se define Op de Sequelize que es una abreviatura para hacer mas compactas las expresiones de busqueda
const Op = Sequelize.Op;


/*Autoload el quiz asociado a :juegoId que precarga el juego indentificado en la tabla por el 
:juegoId de la ruta y lo guarda en req.load.juego de esta forma los controladores que 
tambien utilizan :juegoId pueden utilizarlo sin necesidad de cargarlo nuevamente*/
exports.load = async (req, res, next, juegoId) => {
  try {
    //Se busca el juego a traves de su id en la base de datos
    const juego = await models.Juego.findByPk(juegoId);
    if (juego) {
      //Si se encuentra el juego, se agrega al objeto 'load' en el objeto 'req' y se pasa al siguiente middleware o controlador
      req.load = { ...req.load, juego }; //Spread (clonacion)
      next();
    } else {
      //Si no se encuentra el juego, se lanza un error
      throw new Error("No existe ningún juego con id: " + juegoId);
    }
    //Si hay un error durante la busqueda del juego, se pasa al siguiente middleware con el error
  } catch (error) {
    next(error);
  }
};


//GET /juegos
exports.index = async (req, res, next) => {

  //Opciones de busqueda se construyen añadiendo incrementalmente propiedades con opciones (inicialmente objeto vacio)
  let opciones_busqueda = {};

  //Extraer (si existe el texto de busqueda) de la peticion
  const busqueda = req.query.busqueda || '';

  //Si campo busqueda contiene algo (hemos introducido algo a buscar en el cajetin)
  if (busqueda) {
    //Normalizamos el patron de busqueda con ayuda de expresiones regulares
    const patron_busqueda = "%" + busqueda.replace(/ +/g,"%") + "%";

    //Se crea la expresion de busqueda
    opciones_busqueda.where = {pregunta: { [Op.like]: patron_busqueda}};
  }

  try {
    //Para incorporar la paginacion lo primero que se debe saber es el numero total de juegos de la bbdd
    //Añadiendo las opciones de busqueda, se cuenta el numero de juegos que casan con el patron de busqueda
    const numero = await models.Juego.count(opciones_busqueda);

    //Definir el numero maximo de juegos por pagina
    const elementos_por_pagina = 5;

    //Se extrae el numero de pagina en el que se encuentra (o 1ª), parametro pageno de la solicitud HTTP
    const pageno = parseInt(req.query.pageno) || 1;

    /*Se llama a la funcion del modulo paginacion para que elabore la botonera guardando su codigo HTML en la 
    variable res.locals.control_paginacion disponible para usar en las vistas*/
    res.locals.control_paginacion = paginacion(numero, elementos_por_pagina, pageno, req.url);

    /*Se incorporan al objeto opciones_busqueda las condiciones de busqueda para extraer cada vez 10 elementos (limit) 
    de la base de datos dependiendo en que pagina estemos (offset)*/
    opciones_busqueda.offset = elementos_por_pagina * (pageno - 1);
    opciones_busqueda.limit =  elementos_por_pagina;
    
    //Se buscan 'todos' los juegos en la base de datos con las opciones de busqueda de la paginacion
    const juegos = await models.Juego.findAll(opciones_busqueda);

    //Se llama a la renderizacion de la vista, incluyendo como parametro los juegos obtenidos y el texto de busqueda
    res.render("juegos/index.ejs", { juegos, busqueda });

  } catch (error) {
    next(error);
  }
};


//GET /juegos/:juegoId
exports.show = (req, res, next) => {
  
  //Obtenemos el objeto precargado en el metodo load que estara guardado en la request de la peticion
  const {juego} = req.load;

  //Se llama a la renderizacion de la vista, incluyendo como parametro el juego
  res.render("juegos/show.ejs", { juego });
};


//GET /juegos/new
exports.new = (req, res, next) => {
  
  //Creamos un objeto con strings vacios para que se represente así en el formulario de la vista
  const juego = {pregunta: "", respuesta: ""};

  //Se llama a la renderizacion de la vista, incluyendo como parametro el juego
  res.render("juegos/new.ejs", { juego });
};


//POST /juegos
exports.create = async (req, res, next) => {

  //Obtnemos los parametros del formulario POST que estan accesibles en req.body (se asignan automaticamente al llevar el mismo nombre)
  const {pregunta, respuesta} = req.body;

  //Crea un objeto compatible con la tabla juegos
  let juego = models.Juego.build({pregunta, respuesta});

  try {
    //Crea una nueva entrada en la tabla de la base de datos con pregunta y respuesta
    juego = await juego.save({fields: ["pregunta", "respuesta"]});

    //Una vez almacenado en la base de datos el juego, se redirige a la visualizacion del mismo
    res.redirect('/juegos/' + juego.id);    

  } catch (error) {
    //Si algun cajetin esta vacio se generara un error de validacion
    if (error instanceof Sequelize.ValidationError) {
      console.log('Hay errores en el formulario');
      error.errors.forEach(({ message }) => console.log(message));
      res.render("juegos/new.ejs", { juego });
    }
    else {
      //Si hay errores en el acceso a la bbdd se pasa al siguiente MW de error
      next(error);
    }
  }
};


//GET /juegos/:juegoId/edit
exports.edit = (req, res, next) => {
  
  //Obtenemos el objeto precargado en el metodo load que estara guardado en la request de la peticion
  const {juego} = req.load;

  //Se llama a la renderizacion de la vista, incluyendo como parametro el juego
  res.render("juegos/edit.ejs", { juego });
};


//PUT /juegos/:juegoId
exports.update = async (req, res, next) => {

  //Obtnemos los parametros del formulario POST que estan accesibles en req.body (se asignan automaticamente al llevar el mismo nombre)
  const {pregunta, respuesta} = req.body;
  
  //Obtenemos el objeto precargado en el metodo load que estara guardado en la request de la peticion
  const {juego} = req.load;

  //Se actualizan los valores de juego con los strings recibidos del formulario
  juego.pregunta = pregunta;
  juego.respuesta = respuesta;

  try {
    //Guarda los campos pregunta y respuesta 
    await juego.save({fields: ["pregunta", "respuesta"]});

    //Una vez actualizado en la base de datos el juego, se redirige a la visualizacion del mismo
    res.redirect('/juegos/' + juego.id);  
    
  } catch (error) {
    //Si algun cajetin esta vacio se generara un error de validacion
    if (error instanceof Sequelize.ValidationError) {
      console.log('Hay errores en el formulario');
      error.errors.forEach(({ message }) => console.log(message));
      res.render("juegos/edit.ejs", { juego });
    }
    else {
      //Si hay errores en el acceso a la bbdd se pasa al siguiente MW de error
      next(error);
    }
  }
};


//DELETE /juegos/:juegoId
exports.destroy = async (req, res, next) => {

  try {
    //A través del juego precargado en el metodo load llamamos al metodo destroy para eliminarlo de la base de datos
    await req.load.juego.destroy();

    //Una vez borrado en la base de datos el juego, se redirige al indice de juegos
    res.redirect('/juegos');    
    
  } catch (error) {
    //Si hay errores en el acceso a la bbdd se pasa al siguiente MW de error
    next(error)
  }
};


//GET /juegos/:juegoId/play
exports.play = (req, res, next) => {

  //Obtenemos el objeto precargado en el metodo load que estara guardado en la request de la peticion
  const {juego} = req.load;

  //Se saca la query de la peticion
  const {query} = req;

  //Si existe query.respuesta sera que la peticion viene de un intento anterior, sino la peticion sera nueva y se envia la respuesta vacia
  const respuesta = query.respuesta || "";

  //Se renderiza la vista de play con el juego para mostrar su pregunta, y una posible respuesta anterior
  res.render('juegos/play.ejs', {juego, respuesta});
}


//GET /juegos/:juegoId/check
exports.check = (req, res, next) => {

  //Obtenemos el objeto precargado en el metodo load que estara guardado en la request de la peticion
  const {juego} = req.load;

  //Se saca la query de la peticion
  const {query} = req;

  //Si existe query.respuesta sera que la peticion viene de un intento anterior, sino la peticion sera nueva y se envia la respuesta vacia
  const respuesta = query.respuesta || "";

  //Se comprueba si la respuesta es correcta
  const resultado = respuesta.toLowerCase().trim() === juego.respuesta.toLowerCase().trim();

  //Se renderiza la vista de result, para mostrar el resultado
  res.render('juegos/result.ejs', {juego, respuesta, resultado});
}
