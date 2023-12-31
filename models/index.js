//Se importa el módulo 'path' para manejar rutas de archivos y directorios
const path = require('path');

//Se importa la biblioteca Sequelize para la gestión de bases de datos con Node.js
const Sequelize = require('sequelize');


//Se establece la URL de la base de datos, utilizando una URL proporcionada por el entorno o una base de datos SQLite local si no está definida
const url = process.env.DATABASE_URL || "sqlite:juegos_bbdd.sqlite";

//Se crea una nueva instancia de Sequelize utilizando la URL de la base de datos
const sequelize = new Sequelize(url);

//OJO! IMPORTANTE el metodo import no funciona a partir de la version 6 de sequelize/sequelize-cli

//Se importa el modelo Juego desde el archivo 'juego' en el mismo directorio que este script
const Juego = sequelize.import(path.join(__dirname, 'juego'));

//Se importa el modelo sesion desde el archivo 'sesion' en el mismo directorio que este script
sequelize.import(path.join(__dirname, 'sesion'));

//Se importa el modelo Usuario desde el archivo 'usuario' en el mismo directorio que este script
const Usuario = sequelize.import(path.join(__dirname, 'usuario'));

//Se importa el modelo Grupo desde el archivo 'grupo' en el mismo directorio que este script
const Grupo = sequelize.import(path.join(__dirname, 'grupo'));


//Definicion de relaciones Usuario-Juego 1-N
Usuario.hasMany(Juego, {as: 'juegos', foreignKey: 'autorId'});
Juego.belongsTo(Usuario, {as: 'autor', foreignKey: 'autorId'});

//Definicion de relaciones Juego-Grupos N-M
Juego.belongsToMany(Grupo, {
    as: 'grupos',
    through: 'GrupoJuegos',
    foreignKey: 'juegoId',
    otherKey: 'grupoId'
});

Grupo.belongsToMany(Juego, {
    as: 'juegos',
    through: 'GrupoJuegos',
    foreignKey: 'grupoId',
    otherKey: 'juegoId'
});


//Se exporta la instancia de Sequelize configurada para ser utilizada en otras partes de la aplicación
module.exports = sequelize;
