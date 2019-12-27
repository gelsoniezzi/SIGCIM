const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2')
const fs = require('fs')
const XLSX = require('xlsx')
require("../models/Insumo")
require("../models/Base")
const Insumo = mongoose.model("insumos")
const Base = mongoose.model("bases")
const multer  = require('../multer')
const fileHelper = require('../helpers/file')
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

        Insumo.find().populate("base_origem").sort({descricao: "asc"}).then((insumos) =>{
            res.render("insumos/index", {insumos})
        })

    })

    router.get('/json/lista', (req, res) => {
        Insumo.find().populate("base_origem").sort({descricao: "asc"}).then((insumos) => {
            var resposta = {}
            resposta.data = insumos
            res.send(resposta)
        }).catch()

    })

    router.post('/json/listapaginate', (req, res) => {
        console.log('--------------')
        //console.log(req.body)
        //calcular pagina
        var pagina = (req.body.start/req.body.length) + 1

        // configura ordenação
        var numeroColuna = parseInt(req.body.order[0].column)              
        var colunaOrdenacao = ''
        if(req.body.order[0].dir == 'asc'){
            colunaOrdenacao = req.body.columns[numeroColuna].data
        }else{
            colunaOrdenacao = '-' + req.body.columns[numeroColuna].data
        }        
        
        var options = {
            page: pagina,
            totalPages: 5,
            limit: req.body.length,
            sort: colunaOrdenacao,
            populate: 'base_origem',            
        }

        var query = {}

        if (req.body.search.value != '')
            query = {$text : {$search: req.body.search.value} }            
        

        Insumo.paginate(query, options, ).then((insumos) => {
            var resposta = {}
            resposta.draw = req.body.draw            
            resposta.data = insumos.docs
            resposta.recordsTotal = insumos.totalDocs
            resposta.recordsFiltered = insumos.totalDocs

            if(query != {}){                
                resposta.recordsFiltered = insumos.docs.length
            }
            
            if(insumos.nextPage){
                resposta.hasNextPage = true
            }else{
                resposta.hasNextPage = false
            }
                console.log(resposta)
            res.send(resposta)
        }).catch((err) => {
            console.log("Nao deu certo o paginate.", + err)
        })
        
    })

    router.get('/listajson/', (req, res) => {
        res.render('insumos/json2')
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
            req.flash("error_msg", "Insumo não encontrada." + err)
            res.redirect("/insumos/")
        })
        
    })

    router.post("/edit/", (req, res) => {
        Insumo.findOne({_id: req.body.id}).then((insumo) => {
            
            insumo.descricao = req.body.descricao
            insumo.unidade_medida = req.body.unidade
            insumo.observacao = req.body.observacao

            insumo.save().then(() => {
                req.flash("success_msg", "Alterado com sucesso.")
                res.redirect("/insumos/")
            }).catch((err) => {
                req.flash("error_msg", "Não foi possível salvar o ítem. " + err)
                res.redirect("/insumos/")
            })
            
        }).catch((err) => {
            req.flash("error_msg", "Não foi possível localizar o ítem. " + err)
            res.redirect("/insumos/")
        })
    })

    router.post('/delete', (req, res) => { 
        Insumo.deleteOne({_id: req.body.id}).then(() => {
            req.flash("success_msg", "Insumo removido com sucesso.")
            res.redirect("/insumos/")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao remover o insumo.")
            res.redirect("/insumos/")
        })
        
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
            console.log(fields)

            console.log("Linha do cabeçalho: " + linha)
            var cabecalho_planilha = result[linha]
            var insumos = []
            for(var i = 0; i < result.length; i++){
                var descricao = result[i]['DESCRICAO DO INSUMO']
                var observacao = descricao.split('!')
                var obs = ""

                //console.log(observacao[1])
                if(observacao[1]){
                    obs = observacao[1]
                    descricao = observacao[2]
                }

                
                var novoInsumo = {
                    base_origem: fonte_base,            
                    descricao: descricao,
                    preco_mediano: result[i]['PRECO MEDIANO R$'],
                    observacao: obs,
                    codigo_origem: result[i]['CODIGO'],
                    unidade_medida: result[i]['UNIDADE']                       
                }
                insumos.push(novoInsumo)                
            }

            var promisse = Insumo.create(insumos, (err, insumos) => {
                if (err) {
                    console.log(err)
                }
                for( var i = 0; i < insumos.length; i ++){
                    insumos[i].save()
                }

            })
            

           /* 
            promisse.then(() => {
                res.send("Subiu tudo.")
            })
            */
            /*
            new Insumo(insumos).save().then(() => {
                req.flash("sucess_msg", "Insumos importados com sucesso.")
                res.redirect("/insumos/")
            }).catch((err) => {
                req.flash("error_msg", "Não foi possível importar os insumos. " + err)
                res.redirect("/insumos/")
            })
            */
        })       
    })

    // Rotas das BASES

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
            abreviacao: req.body.abreviacao,
            endereco: req.body.endereco
        }

        new Base(novaBase).save().then(() => {
            req.flash("sucess_msg", "Base cadastrada com sucesso.")
            res.redirect("/insumos/bases")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao cadastrar a base, tente novamente.")
            res.redirect("/insumos/bases")
        })

    })

    router.get('/bases/edit/:id', (req, res) => {
        Base.findOne({_id: req.params.id}).then((base) => {
            res.render('insumos/editbase', {base})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar a base de dados.")
            res.redirect('/insumos/bases')
        })
    })

    router.post('/bases/edit', (req, res) => {
        Base.findOne({_id: req.body.id}).then((base) => {
            base.nome = req.body.nome
            base.abreviacao = req.body.abreviacao
            base.endereco = req.body.endereco

            base.save().then(() => {
                req.flash("success_msg", "Base de dados editada com sucesso.")
                res.redirect("/insumos/bases")
            }).catch(() => {
                req.flash("error_msg", "Houve um erro ao editar a base de dados, tente novamente.")
                res.redirect("/insumos/bases")
            })
        }).catch(() => {
            req.flash("error_msg", "Houve um erro ao pesquisar a base de dados, tente novamente.")
            res.redirect("/insumos/bases")
        })
    })

    router.post('/bases/delete', (req, res) => {
        Base.remove({_id: req.body.id}).then(() => {
            req.flash("success_msg", "Base removida com sucesso.")
            res.redirect("/insumos/bases")
        }).catch((err) => {
            req.flash("error_msg", "Não foi possível remover a base de dados, tente novamente.")
            res.redirect("/insumos/bases")
        })
    })


module.exports = router