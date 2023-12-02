'use strict';

//Se importa el modulo de cifrado del directorio helpers para ayudar en el cifrado de la contraseña
const cifrado = require('../helpers/cifrado');

//Este fichero se crea tras ejecutar el comando npx sequelize seed:create --name SemillaTablaJuegos

//Y seran llamados bajo su orden de creacion con el comando definido en el package.json
//  -npm run seed o npm run seed_win (para Windows)

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  //La función async up() define las acciones que se realizarán al aplicar los seeders
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Usuarios', [
      {
        nombre: 'admin',
        clave: cifrado.cifrarClave('1234', 'aaaa'),
        salt: 'aaaa',
        esAdministrador: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'saul',
        clave: cifrado.cifrarClave('saul', 'aaaa'),
        salt: 'aaaa',
        esAdministrador: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'beatriz',
        clave: cifrado.cifrarClave('5678', 'bbbb'),
        salt: 'bbbb',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  //La función async down() define las acciones que se realizarán al deshacer los seeders
  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Usuarios', null, {});
  }
};

