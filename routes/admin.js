const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")

// Rota index
router.get('/', (req, res) => {
    res.render("admin/index")
})

router.get('/usuarios', (req, res) => {
    Usuario.find().sort({nome: "asc"}).then((usuarios) => {
        res.render("admin/usuarios", {usuarios})
    }).catch(() => {
        req.flash("error_msg", "Houve um erro ao listar os usuários.")
        res.redirect("/usuarios")
    })
    

})

router.get("/usuarios/add", (req, res) => {
    res.render("admin/addusuario")
})

router.post("/usuarios/add", (req, res) => {

    const novoUsuario = {
        nome: req.body.nome,
        matricula: req.body.matricula,
        email: req.body.email,
        perfil_usuario: req.body.perfil,
        senha: req.body.senha
    }

    var erros = []



    if(!req.body.nome || req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido."})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas não conferem."})
    }


    if(erros.length > 0){
        res.render("admin/addusuario", {erros, novoUsuario})
        }else{
        
    
        new Usuario(novoUsuario).save().then(() => {
            req.flash("success_msg", "Usuario cadastrado com sucesso.")
            res.redirect("/admin/usuarios", )
        }).catch(() => {
            req.flash("error_msg", "Houve um erro ao cadastrar o usuário.")
            res.redirect("/admin/usuarios/add")
        })
        
    }
    

})


module.exports = router
