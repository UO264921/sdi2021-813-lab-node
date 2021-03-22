//Modulos
let express = require('express');
let app = express();

//Variables
app.set('port', 8081);

//Rutas (controladores)
require("./routes/rusuarios.js")(app);
require("./routes/rcanciones.js")(app);

//Lanzamiento del servidor
app.listen(app.get('port'), function(){
    console.log('Servidor activo');
});