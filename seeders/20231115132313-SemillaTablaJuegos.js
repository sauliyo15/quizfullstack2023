'use strict';

//Este fichero se crea tras ejecutar el comando npx sequelize seed:create --name SemillaTablaJuegos

//Y seran llamados bajo su orden de creacion con el comando definido en el package.json
//  -npm run seed o npm run seed_win (para Windows)

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  //La función async up() define las acciones que se realizarán al aplicar los seeders
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Juegos', [
      {
        pregunta: 'Capital de España',
        respuesta: 'Madrid',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pregunta: 'Capital de Francia',
        respuesta: 'París',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pregunta: 'Capital de Italia',
        respuesta: 'Roma',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pregunta: 'Capital de Portugal',
        respuesta: 'Lisboa',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pregunta: 'Capital de Alemania',
        respuesta: 'Berlín',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  //La función async down() define las acciones que se realizarán al deshacer los seeders
  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Juegos', null, {});
  }
};

