module.exports = {
    verifica_clinico: function(req, res, next){
        if(req.isAuthenticated() && req.user.nivel_usuario >= 1) {
            return next();
        }
        req.flash("error_msg", "Você deve ser ao menos um terapêuta para acessar esta página.")
        res.redirect("/dashboard")
    }
}