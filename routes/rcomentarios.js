module.exports = function (app, swig, gestorBD) {
    app.post('/comentarios/:id', function (req, res) {
        if (req.session.usuario == null){
            res.send("Debes estar identificado");
        }
        else {
            let comentario = {
                autor: req.session.usuario,
                texto: req.body.texto,
                cancion_id: req.params.id
            }
            gestorBD.insertarComentario(comentario, function (id) {
                if (id == null) {
                    res.send("Error al añadir ");
                } else {
                    res.redirect("/cancion/" + req.params.id);
                }
            });
        }
    })
}