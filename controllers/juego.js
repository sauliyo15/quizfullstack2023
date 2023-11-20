//Se importia el modulo sequelize
const { Sequelize } = require("sequelize");

//Se importa del directorio models el archivo index (nombre principal por defecto)
const { models } = require("../models");


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
  try {
    //Se buscan todos los juegos en la base de datos
    const juegos = await models.Juego.findAll();

    //Se llama a la renderizacion de la vista, incluyendo como parametro los juegos obtenidos
    res.render("juegos/index.ejs", { juegos });

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
