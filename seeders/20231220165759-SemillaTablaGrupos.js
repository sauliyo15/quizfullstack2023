"use strict";

//Este fichero se crea tras ejecutar el comando npx sequelize seed:create --name SemillaTablaGrupos

//Y seran llamados bajo su orden de creacion con el comando definido en el package.json
//  -npm run seed o npm run seed_win (para Windows)

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  //La función async up() define las acciones que se realizarán al aplicar los seeders
  up: async (queryInterface, Sequelize) => {

    // Añadimos dos grupos, y varias preguntas nuevas.
    // Las preguntas existentes van a la categoría Geography.
    // Las nuevas a Math

    // Add geography group
    let now = new Date();
    await queryInterface.bulkInsert("Grupos", [
      {
        nombre: "Geografía",
        imagen: '/images/imagen_no_disponible.png',
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: "Matemáticas",
        imagen: '/images/imagen_no_disponible.png',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert("Juegos", [
      {
        pregunta: "1 + 1 =",
        respuesta: "2",
        imagen: '/images/imagen_no_disponible.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        pregunta: "5 x 5 =",
        respuesta: "25",
        imagen: '/images/imagen_no_disponible.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const assignments = {
      "Capital de%": "Geografía",
      "%=": "Matemáticas",
    };

    for (var query in assignments) {
      const juegos = (
        await queryInterface.sequelize.query(
          `SELECT id from Juegos where pregunta LIKE "${query}";`
        )
      )[0];

      const course_id = (
        await queryInterface.sequelize.query(
          `SELECT id from Grupos where nombre='${assignments[query]}';`
        )
      )[0][0].id;

      for (var q in juegos) {
        let q_id = juegos[q].id;

        let query = `INSERT or REPLACE into GrupoJuegos (juegoId, grupoId, createdAt, updatedAt) values (${q_id}, ${course_id}, "${now.toISOString()}", "${now.toISOString()}");`;

        await queryInterface.sequelize.query(query);
      }
    }
  },

  //La función async down() define las acciones que se realizarán al deshacer los seeders
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      "Juegos",
      { pregunta: { [Sequelize.Op.like]: "=" } },
      {}
    );

    await queryInterface.bulkDelete("Grupos", null, {});
    return queryInterface.bulkDelete("GrupoJuegos", null, {});
  },
};
