const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

require("../models/ContaAcesso")
const ContaAcesso = mongoose.model("contasacesso")

module.exports = function(passport) {
    passport.use(new localStrategy({usernameField: 'login', passwordField: 'senha'}, (login, senha, done) => {
        ContaAcesso.findOne({login: login}).then((contaacesso) => {
            if(!contaacesso) {
                return done(null, false, {message: "Esta conta não existe"})
            }

            bcrypt.compare(senha, contaacesso.senha, (erro, batem) => {
                if(batem) {
                    return done(null, contaacesso)
                }else {
                    return done(null, false, {message: "Senha incorreta."})
                }
            })

        })
    }))

    passport.serializeUser((contaacesso, done) => {
        done(null, contaacesso.id)
    })

    passport.deserializeUser((id, done) => {
        ContaAcesso.findById(id, (err, contaacesso) => {
            done(err, contaacesso)
        })
    })
}