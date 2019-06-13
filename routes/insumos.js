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

    router.post("/add", multer.single('arquivo'), (req,res) => {
        var erros = []

        if(req.file){
            fileHelper.compressImage(req.file, 100).then((newPatch) => {
                res.send("Upload e compressao realizados com sucesso. "+ newPatch)
            }).catch((err) => {
                console.log("erro: "+ err)
            })
            
        }else{
            res.send("houve um erro no upload.")
        }

        if(erros.length >0){
            res.render("insumos/add", {erros})
        }else{
            const novoInsumo = {
                descricao: req.body.descricao,
                unidade_medida: req.body.unidade_medida,
                observacao: req.body.observacao,
                coleta: Date.now()
            }

            new Insumo(novoInsumo).save().then(() => {
                req.flash("success_msg", "Insumo cadastrado com sucesso.")
                res.redirect("/insumos")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao salvar o insumo, tente novamente.")
                res.redirect("/insumos")
            })            
        }
    })

module.exports = router
