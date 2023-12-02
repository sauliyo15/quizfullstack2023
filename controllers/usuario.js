//Se importia el modulo sequelize
const { Sequelize } = require("sequelize");

//Se importa del directorio models el archivo index (nombre principal por defecto)
const { models } = require("../models");


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
        req.flash('error', 'No existe ningun usuario con id: ' + usuarioId);
        //Si no se encuentra el juego, se lanza un error
        throw new Error("No existe ningún usuario con id: " + usuarioId);
      }
      //Si hay un error durante la busqueda del juego, se pasa al siguiente middleware con el error
    } catch (error) {
      next(error);
    }
  };