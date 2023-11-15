//Se importa la clase Model del modulo sequelize que permitira representar una tabla de la base de datos
const {Model} = require('sequelize');

//Se exporta un literal de funcion que devuelve el modelo ya inicializado de la tabla Juego a la funcion que lo importa
module.exports = (sequelize, DataTypes) => {

    //Constructor de la clase que extiende de Model
    class Juego extends Model {}
  
    //Inicializacion y definicion del modelo para la tabla Juegos
    Juego.init(
      {
        //DataTypes permite definir los diferentes tipos de campos de una tabla
        //Se incluyen funciones de validación para rechazar entradas no validas, lanzando excepciones con el mensaje indicado
        pregunta: {
          type: DataTypes.STRING,
          validate: { notEmpty: { msg: "La pregunta no puede estar vacía." } },
        },
        respuesta: {
          type: DataTypes.STRING,
          validate: { notEmpty: { msg: "La respuesta no puede estar vacía." } },
        },
      },
      { sequelize }
    );
    
    //Se devuelve para que pueda ser utilizado en otras partes de la aplicación que lo importen.
    return Juego;
  };