const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2');
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
    const page = req.params.page;
    const options = {
        page: page,
        limit: 10,
        collation: {
            locale: 'en'
        }
    };

    Insumo.paginate({}, options, function(err, result) {
        // result.docs
        // result.totalDocs = 100
        // result.limit = 10
        // result.page = 1
        // result.totalPages = 10    
        // result.hasNextPage = true
        // result.nextPage = 2
        // result.hasPrevPage = false
        // result.prevPage = null
        // result.pagingCounter = 1
        res.render("insumos/index", {result: result.docs})
    })

})


// Rotas insumos
    router.get('/lista/:page', (req, res) => {
        const page = req.params.page
        const options = {
            page: page,
            limit: 20,
            collation: {
                locale: 'en'
            },
            populate: { path: 'origem',
                        select: 'nome'}
        }

        Insumo.paginate({}, options, function(err, result) {
            // result.docs
            // result.totalDocs = 100
            // result.limit = 10
            // result.page = 1
            // result.totalPages = 10    
            // result.hasNextPage = true
            // result.nextPage = 2
            // result.hasPrevPage = false
            // result.prevPage = null
            // result.pagingCounter = 1
            console.log(result.docs.origem)
            res.render("insumos/index", {result})
        })

    })

    router.get('/lista2/', (req, res) => {        
        Insumo.find().populate("origem").sort({descricao: "asc"}).then((insumos) =>{
            res.render("insumos/index2", {insumos})
        })

    })

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
            console.log(result)
            
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
                    //insumosEnviados++
                    console.log("Item" + novoInsumo.origem 
                                       + novoInsumo.codigo_origem 
                                       + novoInsumo.descricao
                                       + "cadastrado.")
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