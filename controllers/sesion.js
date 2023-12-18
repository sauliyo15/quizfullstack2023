//Se importa el modulo passport parala gestion de login y autenticacion de los usuarios
const passport = require('passport');

//Se importa la estrategia de passport-local para la gestión de usuarios locales
const LocalStrategy = require('passport-local').Strategy;

//Se importa del directorio models el archivo index (nombre principal por defecto)
const {models} = require("../models");

//5 minutos en milisegundos
const tiempoExpiracion = 5*60*1000;


//Chequear el tiempo de inactividad, si excede la sesion se destruye sino se actualiza el tiempo de sesion
exports.checkLoginExpires = (req, res, next) => {

    //Si existe una sesion de usuario iniciada...
    if (req.session.loginExpirado) { 

        //Si ha expirado la sesion
        if (req.session.loginExpirado < Date.now()) {

            //Se borra la propiedad
            delete req.session.loginExpirado;

            //Se indica a passport que cierre la sesion //OJO desde la version 0.6 de passport se necesita un callback de esta manera
            req.logout(function(err) {if (err) { return next(err); }});

            //Tambien se borra la propiedad usuarioLogueado
            delete res.locals.usuarioLogueado;

            //Se programa un mensaje flash
            req.flash('info', 'La sesión de usuario ha expirado');
        } 
        //La sesion todavia no ha expirado, se reprograma el tiempo de expiracion
        else { 
            req.session.loginExpirado = Date.now() + tiempoExpiracion;
        }
    }
    //Se continua con la peticion
    next();
};


//GET /loguear
exports.new = async (req, res, next) => {
    //Se renderiza a la nueva vista con el formulario de login
    res.render('sesion/new.ejs');
}


//POST /loguear
exports.create = passport.authenticate(
    'local',
    {
        //Redireccion en caso de fallo
        failureRedirect:'/loguear',

        //Mensaje de exito, login correcto
        successFlash: 'Bienvenido, inicio de sesión correcto.',
        
        //Mensaje de fallo, login incorrecto
        failureFlash: 'El inicio de sesión ha fallado, prueba otra vez.' 
    }
);

exports.createLoginExpires = async (req, res, next) => {
    //Guarda el instante de tiempo en el que expira la sesion momento actual + 5 minutos
    req.session.loginExpirado = Date.now() + tiempoExpiracion;

    //Redirecciona a la ruta que contenga goback
    res.redirect("/atras");
}


//DELETE /loguear
exports.destroy = async (req, res, next) => {
    //Borramos la propiedad
    delete req.session.loginExpirado;

    //Se indica a passport que cierre la sesion //OJO desde la version 0.6 de passport se necesita un callback de esta manera
    req.logout(function(err) {if (err) { return next(err); }});

    //Redirecciona a la ruta que contenga goback
    res.redirect("/atras"); 
}


//serializeUser(..) guarda en la sesión el id del usuario logueado para recuperarlo en la próxima petición HTTP.
passport.serializeUser((user, done) => {
    done(null, user.id);
});


//deserializeUser(..) recupera el registro del usuario logueado a partir del id de la sesión.
passport.deserializeUser(async (id, done) => {

    try {
        const user = await models.Usuario.findByPk(id);
        done(null, user);
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
            //Obtenemos el usuario de la base de datos por su nombre
            const usuario = await models.Usuario.findOne({where: {nombre}});
            
            //Si existe y la verificacion de la clave es correcta
            if (usuario && usuario.verificarClave(clave)) {
                //Es ok
                done(null, usuario);
            }
            //Login incorrecto
            else {
                //No es ok
                done(null, false);
            }
        } catch (error) {
            done(error);
        }
    }
));











