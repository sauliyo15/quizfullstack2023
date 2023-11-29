"use strict";

//Este fichero se crea tras ejecutar el comando npx sequelize migration:create --name MigracionTablaJuegos

//Y seran llamados bajo su orden de creacion con el comando definido en el package.json
//  -npm run migrate o npm run migrate_win (para Windows)

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  //La función async up() define las acciones que se realizarán al aplicar la migración (crear la tabla en este caso)
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      //Ojo, el nombre de la tabla y los atributos tienen que respetar los siguientes nombres
      "Sessions",
      {
        sid: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true,
          unique: true
        },
        expires: { type: Sequelize.DATE },
        data: { type: Sequelize.STRING(50000) },
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
    return queryInterface.dropTable("Sessions");
  },
};
