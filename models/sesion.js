//Se importa la clase Model del modulo sequelize que permitira representar una tabla de la base de datos
const {Model} = require("sequelize");

//Se exporta un literal de funcion que devuelve el modelo ya inicializado de la tabla Sesion a la funcion que lo importa
module.exports = (sequelize, DataTypes) => {

  //Constructor de la clase que extiende de Model
  class Session extends Model {}

  //Inicializacion y definicion del modelo para la tabla Session (respetar esta convencion de nombres)
  Session.init(
    //Ojo, el nombre de la tabla y los atributos tienen que respetar los siguientes nombres
    {
      //Identificador de la sesion, es la clave primaria
      sid: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      //Contiene la fecha de expiracion
      expires: {
        type: DataTypes.DATE,
      },
      data: {
        type: DataTypes.STRING(50000),
      },
    },
    { sequelize }
  );

  //Se devuelve para que pueda ser utilizado en otras partes de la aplicación que lo importen.
  return Session;
};
