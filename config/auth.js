const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//model usuario
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
require("../models/Terapeuta")
const Terapeuta = mongoose.model("terapeutas")

module.exports = function(passport) {
    passport.use(new localStrategy({usernameField: 'cpf', passwordField: 'senha'}, (cpf, senha, done) => {

        Usuario.findOne({cpf: cpf}).then((usuario) => {
            if(!usuario){
                Terapeuta.findOne({cpf: cpf}).then((terapeuta) => {
                    if(!terapeuta) {
                        return done(null, false, {message: "Esta conta não existe"})
                    }

                    bcrypt.compare(senha, terapeuta.senha, (erro, batem) => {
                        if(batem) {
                            return done(null, terapeuta)
                        }else {
                            return done(null, false, {message: "Senha incorreta"})
                        }
                    })
                })
                
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if(batem) {
                    return done(null, usuario)
                }else {
                    return done(null, false, {message: "Senha incorreta"})
                }
            })
        })
        
    }))

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario)
        })
    })
}