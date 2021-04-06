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
        if (req.session.usuario && canciones[0].autor == req.session.usuario) {
            next();
        } else {
            res.redirect("/tienda");
        }
    })
});

//Aplicar routerAudios
app.use("/audios/", routerAudios);

//routerUsuarioAutor
let routerUsuarioAutor = express.Router();
routerUsuarioAutor.use(function(req, res, next) {
    console.log("routerUsuarioAutor");
    let path = require('path');
    let id = path.basename(req.originalUrl);
    gestorBD.obtenerCanciones(
        {_id: mongo.ObjectID(id) }, function (canciones) {
            console.log(canciones[0]);
            if(canciones[0].autor == req.session.usuario ){
                next();
            } else {
                res.redirect("/tienda");
            }
        })
});

//Aplicar routerUsuarioAutor
app.use("/cancion/modificar",routerUsuarioAutor);
app.use("/cancion/eliminar",routerUsuarioAutor);

app.use(express.static('public'));

//Variables
app.set('port', 8081);

//Rutas (controladores)
require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rcanciones.js")(app, swig, gestorBD);
require("./routes/rcomentarios.js")(app, swig, gestorBD);
require("./routes/rautores.js")(app, swig);

app.get('/', function (req, res) {
    res.redirect('/tienda');
})

//Lanzamiento del servidor
app.listen(app.get('port'), function () {
    console.log('Servidor activo');
});