//Se importa la clase Model del modulo sequelize que permitira representar una tabla de la base de datos
const {Model} = require('sequelize');

//Se importa el modulo de cifrado del directorio helpers para ayudar en el cifrado de la contraseña
const cifrado = require('../helpers/cifrado');


//Se exporta un literal de funcion que devuelve el modelo ya inicializado de la tabla Usuarios a la funcion que lo importa
module.exports = (sequelize, DataTypes) => {

    //Array con los proveedores de identidad de la cuenta
    let tiposDeCuentas = ["local", "github", "twitter", "google", "facebook", "linkedin"];

    //Constructor de la clase que extiende de Model
    class Usuario extends Model {

        //Método estático para obtener el ID del tipo de cuenta basado en el nombre
        static tipoDeCuentaId(nombre) {
            return tiposDeCuentas.indexOf(nombre);
        }

        //Método de instancia para mostrar un nombre formateado
        get displayNombre() {
            // Verifica si el tipo de cuenta está presente y formatea el nombre en consecuencia
            if (!this.tipoDeCuentaId) {
                // Si no hay un tipo de cuenta, devuelve el nombre y el primer tipo de cuenta en el array
                return `${this.nombre} (${tiposDeCuentas[0]})`;
            } 
            else {
                // Si hay un tipo de cuenta, devuelve el nombre de perfil y el tipo de cuenta correspondiente en el array
                return `${this.nombrePerfil} (${tiposDeCuentas[this.tipoDeCuentaId]})`;
            }
        }

        //Metodo para utenticar con las credenciales guardadas en la tabla Usuarios
        verificarClave(clave) {
            return cifrado.cifrarClave(clave, this.salt) === this.clave;
        }
    }
  
    //Inicializacion y definicion del modelo para la tabla Usuarios
    Usuario.init(
      {
        //DataTypes permite definir los diferentes tipos de campos de una tabla
        //Se incluyen funciones de validación para rechazar entradas no validas, lanzando excepciones con el mensaje indicado
        nombre: {
          type: DataTypes.STRING,
          unique: true,
          validate: { notEmpty: { msg: "El nombre no puede estar vacío." } },
        },
        clave: {
          type: DataTypes.STRING,
          validate: { notEmpty: { msg: "La contraseña no puede estar vacía." } },
          set(clave) {
            this.salt = Math.round((new Date().valueOf() * Math.random())) + '';
            this.setDataValue('clave', cifrado.cifrarClave(clave, this.salt));
          }
          /*set es un setter de sequelieze, es una funcion que se ejecuta al asignar un valor a la propiedad 'clave'
          Al ejecutarse asigna un valor inicial a salt y luego guarda la contraseña cifrada en la propiedad 'clave'
          setDataValue, asigna valor a propiedad (el mismo)*/
        },
        salt: {
            type: DataTypes.STRING
        },
        esAdministrador: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        tipoDeCuentaId: { //Contiene el indice del array con el tipo de cuenta
            type: DataTypes.INTEGER,
            unique: "profileUniqueValue",
            default: 0,
            validate: {
                min: {args: [0], msg: "El id del tipo de cuenta debe ser positivo."}
            }
        },
        perfilId: { //Identifiador unico de la cuenta en el proveedor externo de identidad
            type: DataTypes.INTEGER,
            unique: "profileUniqueValue",
            validate: {notEmpty: {msg: "El id del tipo de cuenta no puede estar vacío"}}
        },
        nombrePerfil: { //Nombre de la cuenta en el proveedor externo de identidad
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: "El nombre de perfil no puede estar vacío."}}
        }
      },
      { sequelize }
    );
    
    //Se devuelve para que pueda ser utilizado en otras partes de la aplicación que lo importen.
    return Usuario;
  };