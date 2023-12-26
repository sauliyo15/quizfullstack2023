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


//DELETE /grupos/:grupoId
exports.destroy = async (req, res, next) => {

  try {
    //A través del grupo precargado en el metodo load llamamos al metodo destroy para eliminarlo de la base de datos
    await req.load.grupo.destroy();

    //Enviar mensaje flash de grupo borrado con exito
    req.flash('exito', 'Grupo borrado satisfactoriamente');

    //Una vez borrado en la base de datos el grupo, se redirige la direccion almacenada en /atras
    res.redirect('/atras');    
    
  } catch (error) {
    //Enviar mensaje flash de error durante el borrado de un grupo
    req.flash('error', 'Error borrando un grupo');

    //Si hay errores en el acceso a la bbdd se pasa al siguiente MW de error
    next(error)
  }
};


//GET /grupos/:grupoId/randomplay
exports.randomPlay = async (req, res, next) => {

  //Obtenemos el grupo (del modelo) precargado con el metodo load
  const grupo = req.load.grupo;

  try {
    /*Obtenemos el parametro de la sesion de grupos (si es la primera vez no existira y sera un objeto vacio, 
    en el que cada propiedad que se creee correspondera a cada grupo accedido)*/
    req.session.randomGroupPlay = req.session.randomGroupPlay || {};

    /*Dentro del parametro de la session obtenemos la propiedad que corresponde al grupo accedido (sino existe, se 
    creara con un array vacio (de resueltos) y el ultimo quiz jugado a 0)*/
    req.session.randomGroupPlay[grupo.id] = req.session.randomGroupPlay[grupo.id] || {lastQuizId: 0, resolved: []};

    //Obtenemos el numero de juegos que tenemos de ese grupo
    const total = await grupo.countJuegos();
    
    //Podemos continuar solo si el grupo tiene juegos
    if (total > 0) {

      //Con el total y la longitud del array obtenido, sabremos cuantos juegos hay pendientes de ese grupo
      const quedan = total - req.session.randomGroupPlay[grupo.id].resolved.length;

      //Puntuacion sera la longitud del array de resueltos de ese grupo
      puntuacion = req.session.randomGroupPlay[grupo.id].resolved.length;

      //Si todavía quedan quizzes por resolver...
      if (!quedan == 0) {

        let juego = null;

        //Comprobamos si existe la propiedad (ultimoquiz) para ese grupo
        if (req.session.randomGroupPlay[grupo.id].lastQuizId) {
          //Si existe cargamos ese juego
          juego = await models.Juego.findOne({
            where: {'id': req.session.randomGroupPlay[grupo.id].lastQuizId}
          });
        }
        //Sino...cargamos un juego totalmente aleatorio de ese grupo de los que queden pendientes
        else {
          juego = await models.Juego.findOne({
            where: {'id': {[Sequelize.Op.notIn]: req.session.randomGroupPlay[grupo.id].resolved}},
            include: [
              {
                model: models.Grupo,
                as: "grupos",
                where: {id: grupo.id}
              }
            ],
            offset: Math.floor(Math.random() * quedan) 
          });
        }

        //Asignamos a la propiedad last quiz, el id del juego cargado del grupo
        req.session.randomGroupPlay[grupo.id].lastQuizId = juego.id;
      
        //Renderizamos la vista con el grupo, juego y puntuacion
        res.render("grupos/random_play.ejs", {grupo, juego, puntuacion});
      }
      //Sino quedan Juegos por resolver...
      else {
        //Se borra la propiedad-grupo del objeto de la sesion
        delete req.session.randomGroupPlay[grupo.id];

        //Se renderiza la vista correspondiente
        res.render("grupos/random_nomore.ejs", {grupo, puntuacion});
      }
    }
    else {
      res.redirect('/grupos/');   
    }
  } catch (error) {
    //Configuramos un mensaje flash para mostrarlo en la vista con el resultado fracasado de la operacion
    req.flash('error', 'Accediendo a Randomplay Grupos: ' + error.message);
    next(error);
  }
};


//GET /grupos/:grupoId/randomcheck/:juegoId
exports.randomCheck = async (req, res, next) => {

  //Obtenemos el grupo (del modelo) precargado con el metodo load
  const grupo = req.load.grupo;

  //Borramos la propiedad lastquizId de ese grupo, ya que cuando el usuario comprueba un quiz, deja de tener sentido
  delete req.session.randomGroupPlay[grupo.id].lastQuizId;

  //Obtenemos la información del query
  const { query } = req;

  //Si hay algun contenido obtenemos el parametro oculto respuesta que genera el boton Comprobar
  const respuesta = query.respuesta || "";

  //Cargamos el juego ya que esta primitiva contiene el juegoId y se habra cargado con el metodo load
  const { juego } = req.load;

  //Se comprueba si la respuesta es correcta
  const resultado = respuesta.toLowerCase().trim() === juego.respuesta.toLowerCase().trim();

  //Obtenemos la puntuacion a partir de la longitud del array de resueltos de ese grupo
  let puntuacion = req.session.randomGroupPlay[grupo.id].resolved.length;

  //Si la respuesta es correcta...
  if (resultado) {

    //Se añade el id del juego al array de resueltos de ese grupo
    req.session.randomGroupPlay[grupo.id].resolved.push(juego.id);

    //Incrementamos la puntuacion
    puntuacion++;
  }
  //Si la respuesta es incorrecta...
  else {
  
    //Se borra la propiedad del objeto que pertenece al grupo, para que a proxima vez que se entre en el se cree de nuevo
    delete req.session.randomGroupPlay[grupo.id];
  }

  //Renderizamos a la vista correspondiente con los parametros requeridos
  res.render("grupos/random_results.ejs", { grupo, puntuacion, resultado, respuesta });
};



