//Se importa la clase Model del modulo sequelize que permitira representar una tabla de la base de datos
const {Model} = require('sequelize');

//Se exporta un literal de funcion que devuelve el modelo ya inicializado de la tabla Grupo a la funcion que lo importa
module.exports = (sequelize, DataTypes) => {

    //Constructor de la clase que extiende de Model
    class Grupo extends Model {}
  
    //Inicializacion y definicion del modelo para la tabla Grupos
    Grupo.init(
      {
        //DataTypes permite definir los diferentes tipos de campos de una tabla
        //Se incluyen funciones de validación para rechazar entradas no validas, lanzando excepciones con el mensaje indicado
        nombre: {
          type: DataTypes.STRING,
          unique: true,
          validate: { notEmpty: { msg: "El nombre del grupo no puede estar vacío." } },
        },
        imagen: {
          type: DataTypes.STRING,
          defaultValue: '/images/imagen_no_disponible.png',
        },
      },
      { sequelize }
    );
    
    //Se devuelve para que pueda ser utilizado en otras partes de la aplicación que lo importen.
    return Grupo;
  };