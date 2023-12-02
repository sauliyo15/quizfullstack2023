//Se importa el modulo crypto que incorpora funciones de cifrado
const crypto = require('crypto');


//Se exporta la funcion que cifra la contraseña con salt y sha1
module.exports.cifrarClave = function (clave, salt) {
    return crypto
            .createHmac('sha256', salt)
            .update(clave)
            .digest('hex');
}