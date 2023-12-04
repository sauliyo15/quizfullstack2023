//Se importia el modulo sequelize
const { Sequelize } = require("sequelize");

//Se importa del directorio models el archivo index (nombre principal por defecto)
const { models } = require("../models");

//Se importa la funcion del modulo paginacion del directorio helpers que ayudara crear la botonera
const paginacion = require("../helpers/paginacion").paginate;


/*Autoload el usuario asociado a :usuarioId que precarga el usuario indentificado en la tabla por el 
:usuarioId de la ruta y lo guarda en req.load.usuario de esta forma los controladores que 
tambien utilizan :usuarioId pueden utilizarlo sin necesidad de cargarlo nuevamente*/
exports.load = async (req, res, next, usuarioId) => {
  try {
    //Se busca el usuario a traves de su id en la base de datos
    const usuario = await models.Usuario.findByPk(usuarioId);
    if (usuario) {
      //Si se encuentra el usuario, se agrega al objeto 'load' en el objeto 'req' y se pasa al siguiente middleware o controlador
      req.load = { ...req.load, usuario }; //Spread (clonacion)
      next();
    } else {
      //Se muestra un mensaje flash por pantalla
      req.flash("error", "No existe ningun usuario con id: " + usuarioId);
      //Si no se encuentra el juego, se lanza un error
      throw new Error("No existe ningún usuario con id: " + usuarioId);
    }
    //Si hay un error durante la busqueda del juego, se pasa al siguiente middleware con el error
  } catch (error) {
    next(error);
  }
};


//GET /usuarios
exports.index = async (req, res, next) => {

  try {
    //Para incorporar la paginacion lo primero que se debe saber es el numero total de usuarios de la bbdd
    const numero = await models.Usuario.count();

    //Definir el numero maximo de usuarios por pagina
    const elementos_por_pagina = 5;

    //Se extrae el numero de pagina en el que se encuentra (o 1ª), parametro pageno de la solicitud HTTP
    const pageno = parseInt(req.query.pageno) || 1;

    /*Se llama a la funcion del modulo paginacion para que elabore la botonera guardando su codigo HTML en la 
    variable res.locals.control_paginacion disponible para usar en las vistas*/
    res.locals.control_paginacion = paginacion(numero, elementos_por_pagina, pageno, req.url);

    /*Se define el objeto opciones_busqueda con las condiciones de busqueda para extraer cada vez 10 elementos (limit) 
    de la base de datos dependiendo en que pagina estemos (offset) y ordenacion por campo*/
    opciones_busqueda = {
      offset: elementos_por_pagina * (pageno - 1),
      limit: elementos_por_pagina,
      order: ['nombre']
    };
    
    //Se buscan 'todos' los usuarios en la base de datos con las opciones de busqueda de la paginacion y la ordenacion
    const usuarios = await models.Usuario.findAll(opciones_busqueda);

    //Se llama a la renderizacion de la vista, incluyendo como parametro los usuarios obtenidos
    res.render("usuarios/index.ejs", { usuarios });

  } catch (error) {
    next(error);
  }
};
