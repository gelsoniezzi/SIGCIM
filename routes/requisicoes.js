const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Requisicao")
require("../models/Insumo")
require("../models/Usuario")
require("../models/Contrato")
const Requisicao = mongoose.model("requisicoes")
const Insumo = mongoose.model("insumos")
const Usuario = mongoose.model("usuarios")
const Contrato = mongoose.model("contratos")
const {eAdmin} = require('../helpers/eAdmin')

//rota index

router.get('/', /*eAdmin,*/ (req, res) => {
    
    Requisicao.find().populate({ path: 'contrato', select: 'numero' }).populate({path: 'solicitante', select: 'nome'}).sort({data_criacao: "asc"}).then((requisicoes) => {
        res.render("requisicoes/index", {requisicoes})
    }) 
})

router.get('/add', eAdmin, (req, res) => {
    Insumo.find().populate("origem").sort({descricao: "asc"}).then((insumos) =>{
        res.render("requisicoes/add", {insumos})
    })

})

router.post('/salvar', (req,res) => {
    Insumo.find({_id: {$in: req.body.insumos.map(row => (row.id))}}).then((insumos) => {
        var novaRequisicao = {                    
            data_criacao: new Date(),
            quantidade_itens: req.body.insumos.length,
            valor_total: 0,
            status: "Salva",
            solicitante: res.locals.user._id,
            observacoes: req.body.obs,
            insumos: []
        }
                
        for(var i = 0; i< req.body.insumos.length; i++){                    
            var novoInsumo = {
                descricao: insumos[i].descricao,
                origem: insumos[i].base_origem,
                codigo_origem: insumos[i].codigo_origem,
                unidade: insumos[i].unidade_medida,
                preco: insumos[i].preco_mediano,
                quantidade: req.body.insumos[i].quantidade,
                preco_total: 0,
                status_requisicao: '',
                observacao: ''
            }
            novoInsumo.preco_total = novoInsumo.preco * novoInsumo.quantidade
            novaRequisicao.valor_total += novoInsumo.preco_total
            novaRequisicao.insumos.push(novoInsumo)
        }

        new Requisicao(novaRequisicao).save().then(() => {
            req.flash("success_msg", "Requisição salva com sucesso.")
            res.send({error: false, message: 'Requisição salva com sucesso.'})
        }).catch((err) => {
            console.log("Houve um erro ao salvar a requisicao. " + err)
        })

    }).catch((err) => {
        console.log("Houve erro ao incluir insumos na requisição: " + err)
    })
})

router.post('/enviar', eAdmin, (req, res) => {
    //verificar contrato atual
    Contrato.findOne({status: true}).then((contrato) => {
        
        Insumo.find({_id: {$in: req.body.insumos.map(row => (row.id))}}).then((insumos) => {
            var novaRequisicao = {                    
                data_envio: new Date(),
                quantidade_itens: req.body.insumos.length,
                valor_total: 0,
                status: "Enviada",
                solicitante: res.locals.user._id,
                contrato: contrato._id,
                observacoes: req.body.obs,
                insumos: []
            }

            var prazo = new Date()
            prazo.setDate(novaRequisicao.data_envio.getDate()+3)
            novaRequisicao.prazo_entrega = prazo
            
            for(var i = 0; i< req.body.insumos.length; i++){                    
                var novoInsumo = {
                    descricao: insumos[i].descricao,
                    origem: insumos[i].base_origem,
                    codigo_origem: insumos[i].codigo_origem,
                    unidade: insumos[i].unidade_medida,
                    preco: insumos[i].preco_mediano,
                    quantidade: req.body.insumos[i].quantidade,
                    preco_total: 0,
                    status_requisicao: '',
                    observacao: ''
                }
                novoInsumo.preco_total = novoInsumo.preco * novoInsumo.quantidade
                novaRequisicao.valor_total += novoInsumo.preco_total
                novaRequisicao.insumos.push(novoInsumo)
            }
    
            new Requisicao(novaRequisicao).save().then(() => {
                req.flash("success_msg", "Requisição enviada com sucesso.")
                res.send({error: false, message: 'Requisição enviada com sucesso.'})
            }).catch((err) => {
                console.log("Houve um erro ao enviar a requisicao. " + err)
            })
    
        }).catch((err) => {
            console.log("Houve erro ao incluir insumos na requisição: " + err)
        })       
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível localizar um contrato vigente.")
        req.redirect('/adminContratos/contratos')        
    })    
})

router.get('/editar', (req, res) => {

})

router.get('/view/:id', (req, res) => {
    Requisicao.findOne({_id: req.params.id}).populate([{ path: 'solicitante', select: 'nome' }, {path: 'contrato', select: 'numero'}]).then((requisicao) => {
        res.render('requisicoes/view', {requisicao})
    }).catch()
})

module.exports = router

//Funcoes

    //Pesquisar contrato vigente
    
