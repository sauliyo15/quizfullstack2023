'use strict';

//Este fichero se crea tras ejecutar el comando npx sequelize migration:create --name MigracionAgregarAutorEnJuegos

//Y seran llamados bajo su orden de creacion con el comando definido en el package.json
//  -npm run migrate o npm run migrate_win (para Windows)

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  //La función async up() define las acciones que se realizarán al aplicar la migración (añadir una columna en este caso)
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      "Juegos",
      "autorId",
      {
        type: Sequelize.INTEGER,
        references: {
          model: "Usuarios",
          key: "id"
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    );
  },

  //La función async down() define las acciones que se realizarán al deshacer la migración (eliminar la columna en este caso)
  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('Juegos', 'autorId');
  },
};

