//Modulos
let express = require('express');
let app = express();
let swig = require('swig');
let bodyParser = require('body-parser');
let mongodb = require('mongodb');
let fileUpload = require('express-fileupload');
let gestorBD = require("./modules/gestorBD.js");

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.set('db','mongodb://admin:sdi@tiendamusica-shard-00-00.essby.mongodb.net:27017,tiendamusica-shard-00-01.essby.mongodb.net:27017,tiendamusica-shard-00-02.essby.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-u3t42f-shard-0&authSource=admin&retryWrites=true&w=majority');
gestorBD.init(app, mongodb);

//Variables
app.set('port', 8081);

//Rutas (controladores)
require("./routes/rusuarios.js")(app);
require("./routes/rcanciones.js")(app, swig, gestorBD);
require("./routes/rautores.js")(app, swig);


//Lanzamiento del servidor
app.listen(app.get('port'), function(){
    console.log('Servidor activo');
});