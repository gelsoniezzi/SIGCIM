const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//model de usuario
require('../models/Usuario')
const Usuario = mongoose.model("usuarios")


module.exports = (passport) => {

    passport.use(new localStrategy({usernameField: 'matricula', passwordField: 'senha'}, (matricula, senha, done) => {

        Usuario.findOne({matricula: matricula}).then((usuario) => {
            if(!usuario){
                return done(null, false, {message: "Nenhum usuário cadastrado com esse numero de matrícula."})
            }
            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if(batem){
                    return done(null, usuario)
                }else{
                    return done(null, false, {message: "Senha incorreta."})
                }
            })
        }).catch()
    }))

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    passport.deserializeUser(() => {
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario)
        })
    })
}