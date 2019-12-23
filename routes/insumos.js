const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const fs = require('fs')
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
    Insumo.find().populate("origem").sort({descricao: "asc"}).then((insumos) =>{
        res.render("insumos/index", {insumos})
    })

})


// Rotas insumos
    router.get('/lista/', (req, res) => {        
        Insumo.find().populate("origem").sort({descricao: "asc"}).then((insumos) =>{
            res.render("insumos/index", {insumos})
        })

    })

    router.get('/add', (req, res) => {
        Base.find().then((bases) => {
            res.render("insumos/add", {bases})
        })
               
    })

    router.post("/add", multer.single('arquivo'), (req, res) => {
        var novoInsumo = {
            descricao: req.body.descricao,
            unidade_medida: req.body.unidade,
            observacao: req.body.observacao,
            base_origem: req.body.origem,
            imagem: "/img/insumos/semimagem.png"
        }
        //console.log(novoInsumo)

        var erros = []

        if(erros.length >0){
            res.render("insumos/add", {erros})
        }else{

            if(req.file){
                fileHelper.compressImage(req.file, 100).then((newPatch) => {
                    // tratar o Caminho da foto
                    console.log(newPatch)
                    novoInsumo.imagem = newPatch
                    
                    console.log("Com imagem: ")
                    console.log(novoInsumo)

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
                console.log(novoInsumo)
                
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
        Insumo.findOne({_id: req.params.id}).populate("origem").then((insumo) => {
            Base.find().then((base) => {
                res.render("insumos/editinsumo", {insumo, base})   
            })
                
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
        
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            var f = files[Object.keys(files)[0]]
            var workbook = XLSX.readFile(f.path)
            var sheet_name = workbook.SheetNames[0]
            var sheet = workbook.Sheets[sheet_name]
            var result = XLSX.utils.sheet_to_json(sheet)            

            var linha = fields.linha //pega o campo linha do formulario
            var fonte_base = fields.base

            console.log("Linha do cabeçalho: " + linha)
            var cabecalho_planilha = result[linha]
            
            for(var i = 0; i < result.length; i++){
                var descricao = result[i]['DESCRICAO DO INSUMO']
                var observacao = descricao.split('!')
                var obs = ""

                console.log(observacao[1])
                if(observacao[1]){
                    obs = observacao[1]
                    descricao = observacao[2]
                }

                
                var novoInsumo = {
                    origem: fonte_base,            
                    descricao: descricao,
                    preco_mediano: result[i]['PRECO MEDIANO R$'],
                    observacao: obs,
                    codigo_origem: result[i]['CODIGO'],
                    unidade_medida: result[i]['UNIDADE']                       
                }

                new Insumo(novoInsumo).save().then(() => {
                }).catch((err) => {
                    console.log("Erro: " + err)
                })


            } 
        })

        
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