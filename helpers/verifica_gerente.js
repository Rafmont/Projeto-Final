module.exports = {
    verifica_gerente: function(req, res, next){
        if(req.isAuthenticated() && req.user.nivel_usuario >= 2) {
            return next();
        }
        req.flash("error_msg", "Você deve ser ao menos um gerente para acessar esta página.")
        res.redirect("/dashboard")
    }
}