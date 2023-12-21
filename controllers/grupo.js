//Se importia el modulo sequelize
const { Sequelize } = require("sequelize");

//Se importa del directorio models el archivo index (nombre principal por defecto)
const { models } = require("../models");

//Se importa la funcion del modulo paginacion del directorio helpers que ayudara crear la botonera
const paginacion = require("../helpers/paginacion").paginate;


/*Autoload el grupo asociado a :grupoId que precarga el grupo indentificado en la tabla por el 
:grupoId de la ruta y lo guarda en req.load.grpo de esta forma los controladores que 
tambien utilizan :grupoId pueden utilizarlo sin necesidad de cargarlo nuevamente*/
exports.load = async (req, res, next, grupoId) => {
  try {
    //Se busca el grupo a traves de su id en la base de datos
    const grupo = await models.Juego.findByPk(grupoId);
    if (grupo) {
      //Si se encuentra el grupo, se agrega al objeto 'load' en el objeto 'req' y se pasa al siguiente middleware o controlador
      req.load = { ...req.load, grupo }; //Spread (clonacion)
      next();
    } else {
      //Si no se encuentra el grupo, se lanza un error
      throw new Error("No existe ningún grupo con id: " + grupoId);
    }
    //Si hay un error durante la busqueda del grupo, se pasa al siguiente middleware con el error
  } catch (error) {
    next(error);
  }
};


//GET /grupos
exports.index = async (req, res, next) => {
      
    //Opciones de busqueda se construyen añadiendo incrementalmente propiedades con opciones (inicialmente objeto vacio)
    let opciones_busqueda = { }
      
    try {
      //Para incorporar la paginacion lo primero que se debe saber es el numero total de grupos de la bbdd
      const numero = await models.Grupo.count();
  
      //Definir el numero maximo de grupos por pagina
      const elementos_por_pagina = 5;
  
      //Se extrae el numero de pagina en el que se encuentra (o 1ª), parametro pageno de la solicitud HTTP
      const pageno = parseInt(req.query.pageno) || 1;
  
      /*Se llama a la funcion del modulo paginacion para que elabore la botonera guardando su codigo HTML en la 
      variable res.locals.control_paginacion disponible para usar en las vistas*/
      res.locals.control_paginacion = paginacion(numero, elementos_por_pagina, pageno, req.url);
  
      /*Se incorporan al objeto opciones_busqueda las condiciones de busqueda para extraer cada vez 10 elementos (limit) 
      de la base de datos dependiendo en que pagina estemos (offset) y tambien extraer su autor a traves de la relacion establecida*/
      opciones_busqueda.offset = elementos_por_pagina * (pageno - 1);
      opciones_busqueda.limit =  elementos_por_pagina;
      
      //Se buscan 'todos' los grupos en la base de datos con las opciones de busqueda de la paginacion
      const grupos = await models.Grupo.findAll(opciones_busqueda);
  
      //Se llama a la renderizacion de la vista, incluyendo como parametro los grupos obtenidos
      res.render("grupos/index.ejs", { grupos });
  
    } catch (error) {
      next(error);
    }
  };


//GET /grupos/new
exports.new = (req, res, next) => {
  
  //Creamos un objeto con strings vacios para que se represente así en el formulario de la vista
  const grupo = {nombre: "", imagen: ""};

  //Se llama a la renderizacion de la vista, incluyendo como parametro el grupo
  res.render("grupos/new.ejs", { grupo });
};


//POST /juegos
exports.create = async (req, res, next) => {

  //Obtnemos los parametros del formulario POST que estan accesibles en req.body (se asignan automaticamente al llevar el mismo nombre)
  const {pregunta, respuesta, imagen} = req.body;

  //Obtnemos de la peticion el id del usuario logueado, que será el author del quiz
  const autorId = req.usuarioLogueado.id;

  //Crea un objeto compatible con la tabla juegos
  let juego = models.Juego.build({pregunta, respuesta, imagen, autorId});

  try {
    //Crea una nueva entrada en la tabla de la base de datos con pregunta, respuesta, imagen y el id del autor
    juego = await juego.save({fields: ["pregunta", "respuesta", "imagen", "autorId"]});

    //Enviar mensaje flash de juego creado con exito
    req.flash('exito', 'Juego creado satisfactoriamente');

    //Una vez almacenado en la base de datos el juego, se redirige a la visualizacion del mismo
    res.redirect('/juegos/' + juego.id);    

  } catch (error) {
    //Si algun cajetin esta vacio se generara un error de validacion
    if (error instanceof Sequelize.ValidationError) {

      //Enviar mensaje flash de error durante la creacion del juego
      req.flash('error', 'Hay errores en el formulario');
      console.log('Hay errores en el formulario');

      error.errors.forEach(({ message }) => {
        req.flash('error', message);
        console.log(message)});

      res.render("juegos/new.ejs", { juego });
    }
    else {
      //Enviar mensaje flash de error durante la creacion del juego
      req.flash('error', 'Error creando un nuevo juego');

      //Si hay errores en el acceso a la bbdd se pasa al siguiente MW de error
      next(error);
    }
  }
};