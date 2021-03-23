//Modulos
let express = require('express');
let app = express();
let swig = require('swig');
let bodyParser = require('body-parser');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Variables
app.set('port', 8081);

//Rutas (controladores)
require("./routes/rusuarios.js")(app, swig);
require("./routes/rcanciones.js")(app, swig);
require("./routes/rautores.js")(app, swig);

//Lanzamiento del servidor
app.listen(app.get('port'), function(){
    console.log('Servidor activo');
});