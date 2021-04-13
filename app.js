//Modulos
let express = require('express');
let app = express();
let swig = require('swig');
let bodyParser = require('body-parser');
let mongodb = require('mongodb');
let fileUpload = require('express-fileupload');
let gestorBD = require("./modules/gestorBD.js");
let crypto = require('crypto');
let expressSession = require('express-session');
let fs = require('fs');
let https = require('https');
let jwt = require('jsonwebtoken');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));
app.set('db', 'mongodb://admin:sdi@tiendamusica-shard-00-00.essby.mongodb.net:27017,tiendamusica-shard-00-01.essby.mongodb.net:27017,tiendamusica-shard-00-02.essby.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-u3t42f-shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('clave', 'abcdefg');
app.set('crypto', crypto);
app.set('jwt',jwt);
gestorBD.init(app, mongodb);

var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function (req, res, next) {
    console.log("routerUsuarioSession");
    if (req.session.usuario) {
        next();
    } else {
        console.log("va a : " + req.session.destino)
        res.redirect("/identificarse");
    }
});

//Aplicar routerUsuarioSession
app.use("/canciones/agregar", routerUsuarioSession);
app.use("/publicaciones", routerUsuarioSession);

//routerAudios
let routerAudios = express.Router();
routerAudios.use(function (req, res, next) {
    console.log("routerAudios");
    let path = require('path');
    let idCancion = path.basename(req.originalUrl, '.mp3');
    gestorBD.obtenerCanciones({"_id": mongodb.ObjectID(idCancion)}, function (canciones) {
        if (req.session.usuario && canciones[0].autor === req.session.usuario) {
            next();
        } else {
            let criterio = {
                usuario: req.session.usuario,
                cancionId: mongodb.ObjectID(idCancion)
            };

            gestorBD.obtenerCompras(criterio, function (compras) {
                if (compras != null && compras.length > 0) {
                    next();
                } else {
                    res.redirect("/tienda");
                }
            });
        }
    })
});

//Aplicar routerAudios
app.use("/audios/", routerAudios);

//routerUsuarioAutor
let routerUsuarioAutor = express.Router();
routerUsuarioAutor.use(function (req, res, next) {
    console.log("routerUsuarioAutor");
    let path = require('path');
    let id = path.basename(req.originalUrl);
    gestorBD.obtenerCanciones(
        {_id: mongodb.ObjectID(id)}, function (canciones) {
            if (canciones[0].autor === req.session.usuario) {
                next();
            } else {
                res.redirect("/tienda");
            }
        })
});

//Aplicar routerUsuarioAutor
app.use("/cancion/modificar", routerUsuarioAutor);
app.use("/cancion/eliminar", routerUsuarioAutor);
app.use("/cancion/comprar", routerUsuarioSession);
app.use("/compras", routerUsuarioSession);

//routerUsuarioNoAutorNoComprada
let routerUsuarioNoAutorNoComprada = express.Router();
routerUsuarioNoAutorNoComprada.use(function (req, res, next) {
    console.log("routerUsuarioNoAutorNoComprada");
    let path = require('path');
    let id = path.basename(req.originalUrl);
    gestorBD.obtenerCanciones(
        {_id: mongodb.ObjectID(id)}, function (canciones) {
            if (canciones[0].autor != req.session.usuario) {
                gestorBD.obtenerCompras(
                    {"usuario": req.session.usuario, "cancionId": canciones[0]._id}, function (compradas) {
                        if (compradas.length == 0) {
                            next();
                        } else {
                            res.redirect("/error?mensaje=La cancion ya ha sido comprada previamente&tipoMensaje=alert-danger");
                        }
                    })
            } else {
                res.redirect("/error?mensaje=La cancion ha sido publicada por el usuario, no se ha podido comprar&tipoMensaje=alert-danger");
            }
        })
});

//aplicar routerUsuarioNoAutorNoComprada
app.use("/cancion/comprar/", routerUsuarioNoAutorNoComprada);

// routerUsuarioToken
let routerUsuarioToken = express.Router();
routerUsuarioToken.use(function(req, res, next) {
    // obtener el token, vía headers (opcionalmente GET y/o POST).
    let token = req.headers['token'] || req.body.token || req.query.token;
    if (token != null) {
        // verificar el token
        jwt.verify(token, 'secreto', function(err, infoToken) {
            if (err || (Date.now()/1000 - infoToken.tiempo) > 240 ){
                res.status(403); // Forbidden
                res.json({
                    acceso : false,
                    error: 'Token invalido o caducado'
                });
                // También podríamos comprobar que intoToken.usuario existe
                return;

            } else {
                // dejamos correr la petición
                res.usuario = infoToken.usuario;
                next();
            }
        });

    } else {
        res.status(403); // Forbidden
        res.json({
            acceso : false,
            mensaje: 'No hay Token'
        });
    }
});
// Aplicar routerUsuarioToken
app.use('/api/cancion', routerUsuarioToken);

app.use(express.static('public'));

//Variables
app.set('port', 8081);

//Rutas (controladores)
require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rcanciones.js")(app, swig, gestorBD);
require("./routes/rcomentarios.js")(app, swig, gestorBD);
require("./routes/rautores.js")(app, swig);
require("./routes/rerror.js")(app, swig);
require("./routes/rapicanciones.js")(app, gestorBD);


app.get('/', function (req, res) {
    res.redirect('/tienda');
})


app.use(function(err,req,res,next){
    console.log("Error producido " + err)
    if (!res.headersSent){
        res.status(400);
        res.send("Recurso no disponible");
    }
})


//Lanzamiento del servidor
https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function() {
    console.log("Servidor activo");
});
