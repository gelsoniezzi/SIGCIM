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
    var erros = []
    const novoUsuario = {
        nome: req.body.nome,
        matricula: req.body.matricula,
        email: req.body.email,
        perfil_usuario: req.body.perfil,
        senha: req.body.senha,
        status: req.body.status
    }
    Usuario.findOne({matricula: req.body.matricula}).then((usuario) => {
        if(usuario){
            erros.push({texto: "Já existe um usuário com a matrícula digitada."})
            res.render("admin/addusuario", {erros, novoUsuario})
        }else{            
            const novoUsuario = new Usuario({
                nome: req.body.nome,
                matricula: req.body.matricula,
                email: req.body.email,
                perfil_usuario: req.body.perfil,
                senha: req.body.senha,
                status: req.body.status
            })

            if(!req.body.nome || req.body.nome == undefined || req.body.nome == null){
                erros.push({texto: "Nome inválido."})
            }
            if(req.body.senha != req.body.senha2){
                erros.push({texto: "As senhas não conferem."})
            }
            if(req.body.perfil_usuario == 8){
                erros.push({texto: "Selecione um perfil."})
            }

            if(erros.length > 0){
                res.render("/admin/addusuario", {erros, novoUsuario})
            }else{

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg", "Houve um erro ao salvar o usuário.")
                            res.redirect("/admin/usuarios")
                        }
                        novoUsuario.senha = hash
                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuario cadastrado com sucesso.")
                            res.redirect("/admin/usuarios", )
                        }).catch(() => {
                            req.flash("error_msg", "Houve um erro ao cadastrar o usuário.")
                            res.redirect("/admin/usuarios/add")
                        })
                    })
                })                      
            }
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno na criação do usuário.")
        res.redirect("/admin/usuarios")
    })    
})

router.post("/usuarios/delete", (req, res) => {
    Usuario.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Usuario removido com sucesso.")
        res.redirect("/admin/usuarios/")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao remover o usuário.")
        res.redirect("/admin/usuarios")
    })
})

router.get("/usuarios/edit/:id", (req, res) => {
    Usuario.findOne({_id: req.params.id}).then((usuario) => {
        res.render("admin/editusuario", {usuario})
    }).catch((err) => {
        req.flash("error_msg", "IUsuário não encontrado.")
        res.redirect("/admin/usuarios")
    })
})
router.post("/usuarios/edit", (req, res) => {
    Usuario.findOne({_id: req.body.id}).then((usuario) => {
        usuario.nome = req.body.nome
        usuario.matricula = req.body.matricula
        usuario.email = req.body.email
        usuario.perfil_usuario = req.body.perfil
        usuario.status = req.body.status        

        usuario.save().then(() => {
            req.flash("success_msg", "Usuário editado com sucesso.")
            res.redirect("/admin/usuarios")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar o usuário.")
            res.redirect("/admin/usuarios")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar o usuário.")
        res.redirect("/admin/usuarios")
    })

})

router.get('/teste', (req, res) => {
    res.render("admin/teste")
})

module.exports = router
