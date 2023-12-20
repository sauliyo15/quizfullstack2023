//Se importa el modulo passport parala gestion de login y autenticacion de los usuarios
const passport = require('passport');

//Se importa la estrategia de passport-local para la gestión de usuarios locales
const LocalStrategy = require('passport-local').Strategy;

//Se importa del directorio models el archivo index (nombre principal por defecto)
const {models} = require("../models");

//5 minutos en milisegundos
const tiempoExpiracion = 5*60*1000;

//Definicion de las credenciales de entorno a partir de las variables de entorno que haya definidas
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

//Definicion de la direccion de la aplicacion
const CALLBACK_BASE_URL = process.env.CALLBACK_BASE_URL || "http://localhost:3000";

//Definicion de las estrategias especificas de cada uno de los portales
const GitHubStrategy = GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET && require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;


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
    //Se renderiza a la nueva vista con el formulario de login, indicando tambien si hay autenticacion con alguno de los portales externos
    res.render('sesion/new.ejs', {
        loginWithGitHub: !!GitHubStrategy,
        loginWithGoogle: !!GoogleStrategy
    });
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


// Use the GitHubStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and GitHub
//   profile), and invoke a callback with a user object.
GitHubStrategy && passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: `${CALLBACK_BASE_URL}/auth/github/callback`
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // The returned GitHub profile represent the logged-in user.
        // I must associate the GitHub account with a user record in the database,
        // and return that user.
        const [user, created] = await models.Usuario.findOrCreate({
            where: {
                tipoDeCuentaId: models.Usuario.tipoDeCuentaId("github"),
                perfilId: profile.id
            },
            defaults: {
                nombrePerfil: profile.username
            }
        });
        done(null, user);
    } catch(error) {
        done(error, null);
    }
}));

// GET /auth/github
exports.authGitHub = GitHubStrategy && passport.authenticate('github', {scope: ['user']});

// GET /auth/github/callback
exports.authGitHubCB = GitHubStrategy && passport.authenticate(
    'github',
    {
        //Redireccion en caso de fallo
        failureRedirect: '/auth/github',

        //Mensaje de exito, login correcto
        successFlash: 'Bienvenido, inicio de sesión con GitHub correcto.',
        
        //Mensaje de fallo, login incorrecto
        failureFlash: 'El inicio de sesión con GitHub ha fallado, prueba otra vez.' 
    }
);


GoogleStrategy && passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${CALLBACK_BASE_URL}/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Aquí puedes asociar la cuenta de Google con un registro de usuario en tu base de datos
      // Puedes utilizar models.Usuario para buscar o crear un usuario según la información de Google.
      const [user, created] = await models.Usuario.findOrCreate({
        where: {
          tipoDeCuentaId: models.Usuario.tipoDeCuentaId("google"),
          perfilId: profile.id
        },
        defaults: {
          nombrePerfil: profile.displayName
        }
      });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

// GET /auth/google
exports.authGoogle = GoogleStrategy && passport.authenticate('google', { scope: ['profile', 'email'] });

// GET /auth/google/callback
exports.authGoogleCB = GoogleStrategy && passport.authenticate(
    'google',
    {
        //Redireccion en caso de fallo
        failureRedirect: '/auth/google',

        //Mensaje de exito, login correcto
        successFlash: 'Bienvenido, inicio de sesión con Google correcto.',
        
        //Mensaje de fallo, login incorrecto
        failureFlash: 'El inicio de sesión con Google ha fallado, prueba otra vez.' 
    }
);


//MW que controla si un usuario esta autenticado o no (a traves de la existencia de usuarioLogueado)
exports.autenticacionRequerida = function (req, res, next) {
    
    //Si existe la variable el usuario se ha autenticado en el sistema
    if (req.usuarioLogueado) {
        //Se pasa al siguiente MW
        next();
    }
    //Sino
    else {
        //Se muestra mensaje flash y se redirecciona a la pagina de inicio de sesion
        req.flash("info", "Inicio de sesión requerido");
        res.redirect('/loguear');
    }
};


//MW que controla comprueba el usuario sobre el que se actua es el mismo usuario logueado o es un administrador
exports.administradorOyoRequerido = function (req, res, next) {
    
    //Obtenemos si el usuario logueado es administrador
    const esAdministrador = !!req.usuarioLogueado.esAdministrador;

    //Obtenemos si el usuario precargado es el mismo que el precargado
    const yoMismo = req.load.usuario.id === req.usuarioLogueado.id;

    //Si se cumple alguna de la dos condiciones
    if (esAdministrador || yoMismo) {
        //Se pasa al siguiente MW
        next();
    }
    //Sino
    else {
        //Es una acción no permitida y se redirecciona a una pantalla de error
        console.log('Acción prohibida');
        res.send(403);
    }
};


//MW que controla comprueba el usuario que intenta realizar una accion es administrador
exports.administradorRequerido = function (req, res, next) {
    
    //Obtenemos si el usuario logueado es administrador
    const esAdministrador = !!req.usuarioLogueado.esAdministrador;

    //Si lo es
    if (esAdministrador) {
        //Se pasa al siguiente MW
        next();
    }
    //Sino
    else {
        //Es una acción no permitida y se redirecciona a una pantalla de error
        console.log('Acción prohibida');
        res.send(403);
    }
};











