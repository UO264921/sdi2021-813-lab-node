module.exports = function(app, swig) {

    app.get('/autores/agregar', function(req, res){
        let respuesta = swig.renderFile('views/bagregarAutores.html', {});
        res.send(respuesta);
    });

    app.post('/agregar', function(req, res){
        let nombre = req.body.nombre!=""? req.body.nombre:"-- No se ha enviado nombre --";
        let grupo = req.body.grupo!=""? req.body.grupo:"-- No se ha enviado grupo --";
        let rol = req.body.rol!=""? req.body.rol:"-- No se ha enviado rol --";
        res.send("Nombre: " + nombre + "<br>" +
                 "Grupo: " + grupo + "<br>" +
                 "Rol: " + rol + "<br>");
    });

    app.get('/autores', function(req,res){
        let autores = [
            {
                "nombre": "Rodrigo Marqués",
                "grupo" : "Los mentos",
                "rol" : "Cantante"
            },
            {
                "nombre": "Sandro Gonzalez",
                "grupo" : "Moby Dick",
                "rol" : "Batería"
            },
            {
                "nombre": "Sunny Hunter",
                "grupo": "Shover",
                "rol": "Guitarrista"
            }
        ];

        let respuesta = swig.renderFile('views/autores.html', {
            autores : autores
        });

        res.send(respuesta);
    });

    app.get('/autores*', function (req, res) {
        res.redirect("/autores");
    });
}