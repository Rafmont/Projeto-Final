module.exports = {
    verifica_login: function(req, res, next){
        if(req.isAuthenticated()) {
            return next();
        }
        req.flash("error_msg", "Você deve estar autenticado para acessar esta página.")
        res.redirect("/")
    }
}