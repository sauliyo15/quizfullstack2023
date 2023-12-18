//Se importa el modulo passport parala gestion de login y autenticacion de los usuarios
const passport = require('passport');

//Se importa la estrategia de passport-local para la gestión de usuarios locales
const LocalStrategy = require('passport-local').Strategy;

//Se importa del directorio models el archivo index (nombre principal por defecto)
const { models } = require("../models");

//Tiempo maximo para que expire la sesion sino se utiliza (en milisegundos)
const tiempoExpiracion = 5*60*1000;


// /* (Se comprueba en cualquier solicitud)
exports.checkLoginExpires = (req, res, next) => {

    //Si comprueba existe una sesion de usuario iniciada...
    if (req.session.loginExpirado) { 

        //Si comprueba si ha expirado la sesion
        if (req.session.loginExpirado < Date.now()) {

            //Se borra la propiedad
            delete req.session.loginExpirado;

            //Se indica a passport que cierre la sesion
            req.logout(); 

            //Tambien se borra la propiedad de usuarioLogueado que estaba disponible en las vistas
            delete res.locals.usuarioLogueado;

            //Se programa un mensaje flash
            req.flash('info', 'La sesión de usuario ha expirado.');
        } 
        //La sesion todavia no ha expirado, se reprograma el tiempo de expiracion
        else { 
            req.session.loginExpirado = Date.now() + tiempoExpiracion;
        }
    }
    //Se continua con la peticion para que la atienda el MW que corresponda
    next();
};


//serializeUser(..) guarda en la sesión el id del usuario logueado para recuperarlo en la próxima petición HTTP.
passport.serializeUser((usuario, done) => {
    done(null, usuario.id);
});


//deserializeUser(..) recupera el registro del usuario logueado a partir del id de la sesión.
passport.deserializeUser(async (id, done) => {
    try {
        const usuario = await models.Usuario.findByPk(id);
        done(null, usuario);
    } catch (error) {
        done(error);
    }
});


/**La configuración de la estrategia de autenticación se
instala en passport con este MW, que recibe las credenciales
del usuario (username, password) y el callback done(..)
que indica a passport el usuario autenticado.La estrategia
consiste en:
1. Obtener el registro del usuario indicado
2. Verificar si el password coincide con el guardado.
3. Notificar a passport el resultado de la autenticación */
passport.use(new LocalStrategy(
    async (nombre, clave, done) => {

        try {
            const usuario = await models.Usuario.findOne({where: {nombre}});
            //Verificacion del login
            if (usuario && usuario.verificarClave(clave)) {
                done(null, usuario);
            }
            //Login incorrecto
            else {
                done(null, false);
            }
        } catch (error) {
            done(error);
        }
    }
));
