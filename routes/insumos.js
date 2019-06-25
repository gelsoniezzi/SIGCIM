const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Insumo")
const Insumo = mongoose.model("insumos")
const multer  = require('../multer')
const fileHelper = require('../file-helper')


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

module.exports = router
