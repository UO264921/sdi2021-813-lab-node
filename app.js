//Modulos
let express = require('express');
let app = express();
app.use(express.static('public'));
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Variables
app.set('port', 8081);

//Rutas (controladores)
require("./routes/rusuarios.js")(app);
require("./routes/rcanciones.js")(app);

//Lanzamiento del servidor
app.listen(app.get('port'), function(){
    console.log('Servidor activo');
});