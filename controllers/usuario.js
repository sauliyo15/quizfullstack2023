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


//GET /usuarios/:usuarioId
exports.show = (req, res, next) => {
  
  //Obtenemos el objeto precargado en el metodo load que estara guardado en la request de la peticion
  const {usuario} = req.load;

  //Se llama a la renderizacion de la vista, incluyendo como parametro el usuario
  res.render("usuarios/show.ejs", { usuario });
};


//GET /usuarios/new
exports.new = (req, res, next) => {
  
  //Creamos un objeto con strings vacios para que se represente así en el formulario de la vista
  const usuario = {nombre: "", clave: ""};

  //Se llama a la renderizacion de la vista, incluyendo como parametro el usuario
  res.render("usuarios/new.ejs", { usuario });
};


//POST /usuarios
exports.create = async (req, res, next) => {

  //Obtnemos los parametros del formulario POST que estan accesibles en req.body (se asignan automaticamente al llevar el mismo nombre)
  const {nombre, clave} = req.body;

  //Crea un objeto compatible con la tabla usuarios
  let usuario = models.Usuario.build({nombre, clave});

  //Aunque la validacion de contraseña vacia la hemos hecho también en la vista conviene verificarlo tambien en el controlador
  if (!clave) {
    //Enviar mensaje flash de error de contraseña vacia
    req.flash('error', 'La contraseña no puede estar vacía');

    //Se llama a la renderizacion de la vista, incluyendo como parametro el usuario
    return res.render("usuarios/new.ejs", { usuario });
  }

  try {
    //Crea una nueva entrada en la tabla de la base de datos con nombre, clave y salt
    usuario = await usuario.save({fields: ["nombre", "clave", "salt"]});

    //Enviar mensaje flash de usuario creado con exito
    req.flash('exito', 'Usuario creado satisfactoriamente');

    //Una vez almacenado en la base de datos el usuario, se redirige a la visualizacion del mismo
    res.redirect('/usuarios/' + usuario.id);    

  } catch (error) {
    //Validacion de campos unicos (en este caso el unico es el nombre)
    if (error instanceof Sequelize.UniqueConstraintError) {

      //Enviar mensaje flash de error de usuario que ya existe
      req.flash('error', `El usuario con nombre "${nombre}" ya existe.`);

      //Se renderiza de nuevo a la vista new
      res.render("usuarios/new.ejs", { usuario });
    }
    else {
      //Si algun cajetin esta vacio se generara un error de validacion
      if (error instanceof Sequelize.ValidationError) {

        //Enviar mensaje flash de error durante la creacion del usuario
        req.flash('error', 'Hay errores en el formulario');
        console.log('Hay errores en el formulario');

        error.errors.forEach(({ message }) => {
          req.flash('error', message);
          console.log(message)});
  
        res.render("usuarios/new.ejs", { usuario });
      }
      else {
        //Enviar mensaje flash de error durante la creacion del usuario
        req.flash('error', 'Error creando un nuevo usuario');
        
        //Si hay errores en el acceso a la bbdd se pasa al siguiente MW de error
        next(error);
      }
    }
  }
};


//GET /usuarios/:usuariosId/edit
exports.edit = (req, res, next) => {
  
  //Obtenemos el objeto precargado en el metodo load que estara guardado en la request de la peticion
  const {usuario} = req.load;

  //Se llama a la renderizacion de la vista, incluyendo como parametro el usuario
  res.render("usuarios/edit.ejs", { usuario });
};
