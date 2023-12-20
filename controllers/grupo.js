//Se importia el modulo sequelize
const { Sequelize } = require("sequelize");

//Se importa del directorio models el archivo index (nombre principal por defecto)
const { models } = require("../models");

//Se importa la funcion del modulo paginacion del directorio helpers que ayudara crear la botonera
const paginacion = require("../helpers/paginacion").paginate;


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