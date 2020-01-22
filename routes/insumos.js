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
const {eTecnico} = require('../helpers/estaLogado')
const {eAdmin} = require('../helpers/estaLogado')

// Rotas insumos
    router.get('/', (req, res) => {        
        Insumo.find().populate("base_origem").sort({descricao: "asc"}).then((insumos) =>{
            res.render("insumos/index", {insumos})
        })

    })

    router.post('/json/lista', (req, res) => {

        Insumo.count().then((quantidade) => {
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
            console.log('----- OPTIONS --------')
            console.log(req.body.search.value)
    
            var query = {}
    
            if (req.body.search.value != '')
                query = {$text : {$search: req.body.search.value} }
            
    
            Insumo.paginate(query, options, ).then((insumos) => {
                
                var resposta = {}
                resposta.draw = req.body.draw
                resposta.recordsTotal = quantidade
                resposta.recordsFiltered = insumos.totalDocs
                resposta.data = insumos.docs

    
    
                res.send(resposta)
            }).catch((err) => {
                console.log("Nao deu certo o paginate.", + err)
            })

        })
        console.log('--------------')
        console.log(req.body)
        //calcular pagina

        
    })

    router.get('/json/lista', (req, res) => {
        Insumo.find().populate("origem").sort({descricao: "asc"}).then((insumos) =>{
            var texto = JSON.stringify(insumos);
            res.send(insumos)
        })
    })

    router.get('/listajson/', (req, res) => {
        res.render('insumos/indexjson')
    })

    router.get('/add', eTecnico, (req, res) => {
        Base.find().then((bases) => {
            res.render("insumos/add", {bases})
        })
               
    })

    router.post("/add", eTecnico, multer.single('arquivo'), (req, res) => {
        //tratar o valor mediano
        var preco = parseFloat(req.body.valor_mediano.replace(',','.'))
        var novoInsumo = {
            descricao: req.body.descricao,
            unidade_medida: req.body.unidade,
            observacao: req.body.observacao,
            base_origem: req.body.origem,
            codigo_origem: req.body.codigo_origem,
            preco_mediano: preco
            //imagem: "/img/insumos/semimagem.png"
            
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

    router.get("/edit/:id", eTecnico, (req,res) => {     
        Insumo.findOne({_id: req.params.id}).populate("origem").then((insumo) => {
            Base.find().then((base) => {
                res.render("insumos/editinsumo", {insumo, base})   
            })
                
        }).catch((err) => {
            req.flash("error_msg", "Insumo não encontrada." + err)
            res.redirect("/insumos/")
        })
        
    })

    router.post("/edit/", eTecnico, (req, res) => {
        Insumo.findOne({_id: req.body.id}).then((insumo) => {
            console.log(req.body.valor_mediano)
            var preco = parseFloat(req.body.valor_mediano.replace(',','.'))

            insumo.descricao = req.body.descricao
            insumo.unidade_medida = req.body.unidade
            insumo.observacao = req.body.observacao
            insumo.preco_mediano = preco
            insumo.codigo_origem = req.body.codigo_origem

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

    router.post('/delete', eTecnico, (req, res) => { 
        Insumo.deleteOne({_id: req.body.id}).then(() => {
            req.flash("success_msg", "Insumo removido com sucesso.")
            res.redirect("/insumos/")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao remover o insumo.")
            res.redirect("/insumos/")
        })
        
    })

    router.get("/importar", eAdmin, (req, res) => {
        Base.find().then((bases) => {
            res.render("insumos/importar", {bases})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as bases de dados.")
            res.redirect("/insumos/bases")
        })
        
    })

    router.post("/importar", eAdmin, async (req, res) => {
        
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            var f = files[Object.keys(files)[0]]
            var workbook = XLSX.readFile(f.path)
            var sheet_name = workbook.SheetNames[0]
            var sheet = workbook.Sheets[sheet_name]
            var result = XLSX.utils.sheet_to_json(sheet)            

            var linha = fields.linha //pega o campo linha do formulario
            var fonte_base = fields.base

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

            try {
                Insumo.create(insumos, (err, insumos) => {
                    if (err) {
                        console.log(err)
                    }
                    for( var i = 0; i < insumos.length; i ++){
                        insumos[i].save()
                    }
    
                })
                req.flash('success_msg', 'Insumos importados com sucesso.')
            } catch (err) {
                req.flash('error_msg', 'Não foi possível importar os insumos.')
            }
            res.redirect('/insumos')
            

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

    router.get("/bases", eTecnico, (req, res) => {
        Base.find().then((bases) => {
            res.render("insumos/bases", {bases: bases})
        }).catch(() => {
            req.flash("error_msg", "Houve um erro ao listar as bases de dados.")
            res.redirect("/insumos")
        })        
    })

    router.get("/bases/add", eTecnico, (req, res) => {
        res.render("insumos/addbase")
    })

    router.post("/bases/add", eTecnico, (req, res) => {

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

    router.get('/bases/edit/:id', eTecnico, (req, res) => {
        Base.findOne({_id: req.params.id}).then((base) => {
            res.render('insumos/editbase', {base})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar a base de dados.")
            res.redirect('/insumos/bases')
        })
    })

    router.post('/bases/edit', eTecnico, (req, res) => {
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

    router.post('/bases/delete', eTecnico, (req, res) => {
        Base.remove({_id: req.body.id}).then(() => {
            req.flash("success_msg", "Base removida com sucesso.")
            res.redirect("/insumos/bases")
        }).catch((err) => {
            req.flash("error_msg", "Não foi possível remover a base de dados, tente novamente.")
            res.redirect("/insumos/bases")
        })
    })

    //Rota teste bstable
    router.get('/bstabletest', (req, res)=> {
        res.render('insumos/bstabletest')
    })



    //Rotas ajax

    router.get('/ajax/load', (req, res) => {
        Insumo.find().populate("base_origem").sort({descricao: "asc"}).then((insumos) =>{
            res.send(insumos)
        })
    })


module.exports = router