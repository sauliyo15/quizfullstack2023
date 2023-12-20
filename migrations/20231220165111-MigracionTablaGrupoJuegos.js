"use strict";

//Este fichero se crea tras ejecutar el comando npx sequelize migration:create --name MigracionTablaGrupoJuegos

//Y seran llamados bajo su orden de creacion con el comando definido en el package.json
//  -npm run migrate o npm run migrate_win (para Windows)

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  //La función async up() define las acciones que se realizarán al aplicar la migración (crear la tabla en este caso)
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      "GrupoJuegos",
      {
        juegoId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          unique: "compositeKey",
          allowNull: false,
          references: {
            model: "Juegos",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        grupoId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          unique: "compositeKey",
          allowNull: false,
          references: {
            model: "Grupos",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
    return queryInterface.dropTable("GrupoJuegos");
  },
};
