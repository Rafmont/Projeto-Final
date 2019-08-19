module.exports = {
    verifica_atendente: function(req, res, next){
        if(req.isAuthenticated() && (req.user.nivel_usuario == 0 || req.user.nivel_usuario >= 2) ) {
            return next();
        }
        req.flash("error_msg", "Você deve ser ao menos um atendente para acessar esta página.")
        res.redirect("/dashboard")
    }
}