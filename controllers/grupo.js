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
    const grupo = await models.Grupo.findByPk(grupoId);
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
    let opciones_busqueda = { };
      
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


//POST /grupos
exports.create = async (req, res, next) => {

  //Obtnemos los parametros del formulario POST que estan accesibles en req.body (se asignan automaticamente al llevar el mismo nombre)
  const {nombre, imagen} = req.body;

  //Crea un objeto compatible con la tabla grupos
  let grupo = models.Grupo.build({nombre, imagen});

  try {
    //Crea una nueva entrada en la tabla de la base de datos con nombre y la imagen del grupo
    grupo = await grupo.save({fields: ["nombre", "imagen"]});

    //Enviar mensaje flash de grupo creado con exito
    req.flash('exito', 'Grupo creado satisfactoriamente');

    //Una vez almacenado en la base de datos el grupo, se redirige al index de grupos
    res.redirect('/grupos/');    

  } catch (error) {
    //Si algun cajetin esta vacio se generara un error de validacion
    if (error instanceof Sequelize.ValidationError) {

      //Enviar mensaje flash de error durante la creacion del grupo
      req.flash('error', 'Hay errores en el formulario');
      console.log('Hay errores en el formulario');

      error.errors.forEach(({ message }) => {
        req.flash('error', message);
        console.log(message)});

      res.render("grupos/new.ejs", { grupo });
    }
    else {
      //Enviar mensaje flash de error durante la creacion del grupo
      req.flash('error', 'Error creando un nuevo grupo');

      //Si hay errores en el acceso a la bbdd se pasa al siguiente MW de error
      next(error);
    }
  }
};


//GET /grupos/:grupoId/edit
exports.edit = async (req, res, next) => {
  
  //Obtenemos el objeto precargado en el metodo load que estara guardado en la request de la peticion
  const {grupo} = req.load;

  //Obtenemos todos los juegos de la base de datos
  const todosJuegos = await models.Juego.findAll();

  //Obtenemos todos los juegos que pertenecen a ese grupo (mediante la funcion map reducimos a un array de ids)
  const grupoJuegosIds = await grupo.getJuegos().map(juego => juego.id);

  //Se llama a la renderizacion de la vista, incluyendo como parametro el grupo, todos los juegos y los juegos del grupo
  res.render("grupos/edit.ejs", { grupo, todosJuegos, grupoJuegosIds });
};


//PUT /grupos/:grupoId
exports.update = async (req, res, next) => {

  //Obtnemos los parametros del formulario POST que estan accesibles en req.body (se asignan automaticamente al llevar el mismo nombre)
  const {nombre, imagen, juegosIds = []} = req.body;
  
  //Obtenemos el objeto precargado en el metodo load que estara guardado en la request de la peticion
  const {grupo} = req.load;

  //Se actualizan los valores de grupo con los strings recibidos del formulario
  grupo.nombre = nombre;
  grupo.imagen = imagen;

  try {
    //Guarda los campos nombre e imagen
    await grupo.save({fields: ["nombre", "imagen"]});

    //Guardamos los juegos que se han chequeado en el formulario y contenidos en la variable juegosIds
    await grupo.setJuegos(juegosIds);

    //Enviar mensaje flash de grupo actualizado con exito
    req.flash('exito', 'Grupo actualizado satisfactoriamente');

    //Una vez actualizado en la base de datos el grupo, se redirige al index de grupos
    res.redirect('/grupos/');   
    
  } catch (error) {
    //Si algun cajetin esta vacio se generara un error de validacion
    if (error instanceof Sequelize.ValidationError) {

      //Enviar mensaje flash de error durante la actualizacion del grupo
      req.flash('error', 'Hay errores en el formulario');
      console.log('Hay errores en el formulario');
      
      error.errors.forEach(({ message }) => {
        req.flash('error', message);
        console.log(message)});
        const todosJuegos = await models.Juego.findAll();

      res.render("grupos/edit.ejs", { juego, todosJuegos, grupoJuegosIds: juegosIds });
    }
    else {
      //Enviar mensaje flash de error durante la actualizacion del grupo
      req.flash('error', 'Error actualizando un grupo');

      //Si hay errores en el acceso a la bbdd se pasa al siguiente MW de error
      next(error);
    }
  }
};