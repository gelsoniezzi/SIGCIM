const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

// Rota index
router.get('/', (req, res) => {
    res.render("admin/index")
})

router.get('/usuarios', (req, res) => {
    res.render("admin/usuarios")

})

router.get("/usuarios/add", (req, res) => {
    res.render("admin/addusuario")
})

router.post("/usuarios/add", (req, res) => {
    var erros = []

    if(!req.body.nome || req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido."})
    }

    if(erros.lenght > 0){
        res.render("admin/addysyario", {erros: erros})
    }else{
        const novoUsuario = {
            nome: req.body.nome,
            email: req.body.email,
            perfil_usuario: req.body.perfil,
            senha: req.body.senha
        }
    
        new Usuario(novoUsuario).save().then(() => {
            req.flash("success_msg", "Usuario cadastrado com sucesso.")
            res.redirect("/admin/usuarios")
        }).catch(() => {
            req.flash("error_msg", "Houve um erro ao cadastrar o usuário.")
            res.redirect("/admin/usuarios/add")
        })
        
    }
    

})


module.exports = router
