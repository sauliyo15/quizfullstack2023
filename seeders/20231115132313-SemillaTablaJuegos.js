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
        imagen: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Plaza_Mayor_de_Madrid_06.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pregunta: 'Capital de Francia',
        respuesta: 'París',
        imagen: 'https://viajes.nationalgeographic.com.es/medio/2022/07/13/paris_37bc088a_1280x720.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pregunta: 'Capital de Italia',
        respuesta: 'Roma',
        imagen: '/images/imagen_no_disponible.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pregunta: 'Capital de Portugal',
        respuesta: 'Lisboa',
        imagen: '/images/imagen_no_disponible.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pregunta: 'Capital de Alemania',
        respuesta: 'Berlín',
        imagen: '/images/imagen_no_disponible.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pregunta: 'Capital de Ucrania',
        respuesta: 'Kiev',
        imagen: '/images/imagen_no_disponible.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pregunta: 'Capital de Rumanía',
        respuesta: 'Bucarest',
        imagen: '/images/imagen_no_disponible.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pregunta: 'Capital de Hungría',
        respuesta: 'Budapest',
        imagen: '/images/imagen_no_disponible.png',
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

