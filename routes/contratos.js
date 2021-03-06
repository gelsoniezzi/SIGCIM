const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Empresa")
require("../models/Contrato")
const Empresa = mongoose.model("empresas")
const Contrato = mongoose.model("contratos")
const {eAssistente} = require('../helpers/estaLogado')
const {eTecnico} = require('../helpers/estaLogado')

// Rotas Contratos
    router.get('/', eTecnico, (req, res) => {
        Contrato.find().populate("empresa").sort({numero: 'asc'}).then((contratos) => {
            res.render("contratos/index", {contratos: contratos})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar os contratos.")
            res.redirect("/contratos")
        })
        
    })

    router.get("/add", eAssistente, (req, res) => {
        Empresa.find().then((empresas) => {
            res.render("contratos/add", {empresas})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar as empresas.")
            res.redirect("/contratos")
        })
        
    })

    router.post("/add", eAssistente, (req, res) => {

        var erros = []

        if(req.body.empresa == "0"){
            erros.push({texto: "Selecione uma empresa."})
        }

        if(erros.length > 0){
            res.render("contratos/add", {erros: erros})
        }else{
            console.log(req.body.empresa)
            const novoContrato = {
                numero: req.body.numero,
                empresa: req.body.empresa,
                email: req.body.email,
                fator_reducao: req.body.fator_reducao,
                fiscal: req.body.fiscal,
                status: req.body.status
            }
        
            new Contrato(novoContrato).save().then(() => {
                req.flash("success_msg", "Contrato criado com sucesso.")
                res.redirect("/contratos")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao salvar o contrato, tente novamente.")
                res.redirect("/contratos")
            })
        }
    })


    router.get("/edit/:id", eAssistente, (req,res) => {
        Contrato.findOne({_id: req.params.id}).populate("empresa").then((contrato) => {
                    Empresa.find().then((empresas) => {
                    res.render("contratos/edit", {empresas, contrato})
                    }).catch((err) => {
                        req.flash("error_msg", "Houve um erro ao carregar as empresas.")
            res.redirect("/adminContratos")
                    })
                        
        }).catch((err) => {
            req.flash("error_msg","Houve um erro ao carregar o contrato.")
            res.redirect("/adminContratos")
        })
    })

    router.post("/edit", eAssistente, (req, res) => {
        Contrato.findOne({_id: req.body.id}).then((contrato) => {
            contrato.numero = req.body.numero
            contrato.empresa = req.body.empresa
            contrato.fator_reducao = req.body.fator_reducao
            contrato.email = req.body.email
            contrato.fiscal = req.body.fiscal
            contrato.status = req.body.status

            contrato.save().then(() => {
                req.flash("success_msg", "Contrato editado com sucesso.")
                res.redirect("/contratos/contratos")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao editar o contrato.")
                res.redirect("/contratos/contratos")
            })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar o contrato.")
            res.redirect("/contratos/contratos")
        })
    })

    router.post("/delete/", eAssistente, (req, res) => {
        Contrato.remove({_id: req.body.id}).then(() => {
            req.flash("success_msg", "Contrato removido com sucesso.")
            res.redirect("/contratos/")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao remover o contrato.")
            res.redirect("/contratos")
        })
    })


    // Rotas Empresas
    router.get('/empresas', eTecnico, (req,res) => {
        Empresa.find().sort({date: 'desc'}).then((empresas) => {
            res.render("admin/empresas", {empresas: empresas})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as empresas.")
            res.redirect("/contratos/empresas")
        })
    })

    router.get("/empresas/add", eAssistente, (req, res) => {
        res.render("admin/addempresa")

    })

    router.post("/empresas/add", eAssistente, (req, res) => {

        var erros = []
        
        if(!req.body.nome || req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: "Nome inválido."})
        }
        if(!req.body.cnpj || req.body.cnpj == undefined || req.body.cnpj == null){
            erros.push({texto: "Preencha o CNPJ."})
        }
        if(!req.body.email || req.body.email == undefined || req.body.email == null){
            erros.push({texto: "Preencha o e-mail."})
        }
        
        if(req.body.nome.length < 2){
            erros.push({texto: "Nome da empresa muito curto."})
        }
        
        if(erros.length > 0){
            res.render("admin/addempresa", {erros: erros})
        }else{
            const novaEmpresa = {
                razao_social: req.body.nome,
                cnpj: req.body.cnpj,
                email: req.body.email
            }
        
            new Empresa(novaEmpresa).save().then(() => {
                req.flash("success_msg", "Empresa criada com sucesso.")
                res.redirect("/contratos/empresas")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao salvar a empresa, tente novamente.")
                res.redirect("/contratos")
            })
        }
    })

    router.get("/empresas/edit/:id", eAssistente, (req, res) => {
        Empresa.findOne({_id: req.params.id}).then((empresa) => {
            res.render("admin/editempresa", {empresa})
        }).catch((err) => {
            req.flash("error_msg", "Empresa não encontrada.")
            res.redirect("/contratos/empresas")
        })
        
    })

    router.post("/empresas/edit", eAssistente, (req, res) => {
        Empresa.findOne({_id: req.body.id}).then((empresa) => {
            empresa.razao_social = req.body.nome
            empresa.cnpj = req.body.cnpj
            empresa.email = req.body.email

            empresa.save().then(() => {
                req.flash("success_msg", "Empresa editada com sucesso.")
                res.redirect("/contratos/empresas")
            }).catch((err) =>{
                req.flash("error_msg", "Houve um erro ao editar a empresa.")
                res.redirect("/contratos/empresas")
            })

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar a empresa.")
            res.redirect("/contratos/empresas")
        })
    })

    router.post("/empresas/delete/", eAssistente, (req, res) => {
        var idempresa = req.body.id

        Contrato.findOne({empresa: idempresa}).then((contrato) => {
            if(contrato.empresa._id == idempresa){
                req.flash("error_msg", "Não é possível deletar empresa vinculada a contrato.")
                res.redirect("/contratos/empresas")
            }            
        }).catch((err) =>{
            Empresa.remove({_id: idempresa}).then(() => {
                req.flash("success_msg", "Empresa deletada com sucesso.")
                res.redirect("/contratos/empresas")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao deletar a empresa.")
                res.redirect("/contratos/empresas")
            })
        })
    })    
module.exports = router

