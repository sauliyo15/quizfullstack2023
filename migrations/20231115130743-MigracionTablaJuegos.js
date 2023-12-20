'use strict';

//Este fichero se crea tras ejecutar el comando npx sequelize migration:create --name MigracionTablaJuegos

//Y seran llamados bajo su orden de creacion con el comando definido en el package.json
//  -npm run migrate o npm run migrate_win (para Windows)

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  //La función async up() define las acciones que se realizarán al aplicar la migración (crear la tabla en este caso)
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      "Juegos",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          unique: true,
        },
        pregunta: {
          type: Sequelize.STRING,
          validate: { notEmpty: { msg: "La pregunta no puede estar vacía." } },
        },
        respuesta: {
          type: Sequelize.STRING,
          validate: { notEmpty: { msg: "La respuesta no puede estar vacía." } },
        },
        imagen: {
          type: Sequelize.STRING,
          defaultValue: '/images/imagen_no_disponible.png', // Ruta por defecto
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        sync: { force: true },
      }
    );
  },

  //La función async down() define las acciones que se realizarán al deshacer la migración (eliminar la tabla en este caso)
  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('Juegos');
  },
};
