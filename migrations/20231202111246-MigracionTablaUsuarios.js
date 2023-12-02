'use strict';

//Este fichero se crea tras ejecutar el comando npx sequelize migration:create --name MigracionTablaUsuarios

//Y seran llamados bajo su orden de creacion con el comando definido en el package.json
//  -npm run migrate o npm run migrate_win (para Windows)

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  //La función async up() define las acciones que se realizarán al aplicar la migración (crear la tabla en este caso)
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      "Usuarios",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          unique: true,
        },
        nombre: {
          type: Sequelize.STRING,
          unique: true,
          validate: { notEmpty: { msg: "El nombre no puede estar vacío." } },
        },
        clave: {
          type: Sequelize.STRING,
          validate: { notEmpty: { msg: "La contraseña no puede estar vacía." } }
        },
        salt: {
          type: Sequelize.STRING
        },
        esAdministrador: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        tipoDeCuentaId: {
          type: Sequelize.INTEGER,
          unique: "profileUniqueValue",
          default: 0,
          validate: {
              min: {args: [0], msg: "El id del tipo de cuenta debe ser positivo."}
          }
        },
        perfilId: {
          type: Sequelize.INTEGER,
          unique: "profileUniqueValue",
          validate: {notEmpty: {msg: "El id del tipo de cuenta no puede estar vacío"}}
        },
        nombrePerfil: { //Nombre de la cuenta en el proveedor externo de identidad
          type: Sequelize.STRING,
          validate: {notEmpty: {msg: "El nombre de perfil no puede estar vacío."}}
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
    return queryInterface.dropTable('Usuarios');
  },
};
