const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const XLSX = require('xlsx')
require("../models/Insumo")
require("../models/Base")
const Insumo = mongoose.model("insumos")
const Base = mongoose.model("bases")
const multer  = require('../multer')
const fileHelper = require('../file-helper')
const http = require('http');
const formidable = require('formidable')



// Rota index
    router.get('/', (req, res) => {
        res.render("insumos/index")
    })

// Rotas insumos
    router.get('/add', (req, res) => {
        res.render("insumos/add")        
    })

    router.post("/add", multer.single('arquivo'), (req, res) => {

        const novoInsumo = {
            descricao: req.body.descricao,
            unidade_medida: req.body.unidade_medida,
            observacao: req.body.observacao,
        }

        var erros = []

        if(erros.length >0){
            res.render("insumos/add", {erros})
        }else{

            if(req.file){
                fileHelper.compressImage(req.file, 100).then((newPatch) => {
                    const novoInsumo = {
                        descricao: req.body.descricao,
                        unidade_medida: req.body.unidade_medida,
                        observacao: req.body.observacao,
                        imagem: newPatch
                    }
                    console.log("Console.log da insumos" + newPatch)

                    new Insumo(novoInsumo).save().then(() => {
                        req.flash("success_msg", "Insumo cadastrado com sucesso.")
                        res.redirect("/insumos")
                    }).catch((err) => {
                        req.flash("error_msg", "Houve um erro ao salvar o insumo, tente novamente.")
                        res.redirect("/insumos")
                    })       


                }).catch((err) => {
                    console.log("Houve um erro: "+ err)
                })            
            }else{
                const novoInsumo = {
                    descricao: req.body.descricao,
                    unidade_medida: req.body.unidade_medida,
                    observacao: req.body.observacao,
                    imagem: "/img/insumos/semimagem.png"
                }

                new Insumo(novoInsumo).save().then(() => {
                    req.flash("success_msg", "Insumo cadastrado com sucesso.")
                    res.redirect("/insumos")
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao salvar o insumo, tente novamente.")
                    res.redirect("/insumos")
                })

            }                 
        }
    })

    
    router.get("/edit/:id", (req,res) => {     
        Insumo.findOne({_id: req.params.id}).then((insumo) => {
            res.render("insumos/editinsumo", {insumo})
        }).catch((err) => {
            req.flash("error_msg", "Insumo não encontrada.")
            res.redirect("/insumos/")
        })
        
    })

    router.post("/edit/", (req, res) => {

    })

    router.get("/importar", (req, res) => {
        Base.find().then((bases) => {
            res.render("insumos/importar", {bases})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as bases de dados.")
            res.redirect("/insumos/bases")
        })
        
    })

    router.post("/importar", (req, res) => {
        const importado = req.body.plan_json
        console.log(importado)
        res.redirect("/insumos/")
        
    })

    router.get("/bases", (req, res) => {
        Base.find().then((bases) => {
            res.render("insumos/bases", {bases: bases})
        }).catch(() => {
            req.flash("error_msg", "Houve um erro ao listar as bases de dados.")
            res.redirect("/insumos")
        })
        
    })

    router.get("/bases/add", (req, res) => {
        res.render("insumos/addbase")
    })

    router.post("/bases/add", (req, res) => {

        const novaBase = {
            nome: req.body.nome,
            endereco: req.body.endereco
        }
        console.log(novaBase)

        new Base(novaBase).save().then(() => {
            req.flash("sucess_msg", "Base cadastrada com sucesso.")
            res.redirect("/insumos/bases")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao cadastrar a base, tente novamente.")
            res.redirect("/insumos/bases")
        })

    })


module.exports = router
