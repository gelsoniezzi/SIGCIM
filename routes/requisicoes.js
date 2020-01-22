const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Requisicao")
require("../models/Insumo")
require("../models/Usuario")
require("../models/Contrato")
require('../models/Opcao')
require('../models/Campi')
const Requisicao = mongoose.model("requisicoes")
const Insumo = mongoose.model("insumos")
const Usuario = mongoose.model("usuarios")
const Contrato = mongoose.model("contratos")
const Opcao = mongoose.model('opcoes')
const Campus = mongoose.model('campi')
//Autenticacao
const {eTecnico} = require('../helpers/estaLogado')

//rota index

router.get('/', eTecnico, (req, res) => {
    
    Requisicao.find({ordem_compra: false})
    .populate([
        { path: 'contrato', select: 'numero' },
        {path: 'solicitante', select: 'nome'}, 
        {path: 'campus_destino', select: 'nome'},
    ])
    .sort({data_criacao: "asc"})
    .then((requisicoes) => {
        res.render("requisicoes/index", {requisicoes})
    }) 
})

router.get('/add', eTecnico, (req, res) => {
    Insumo.find().populate("base_origem").sort({descricao: "asc"}).then((insumos) =>{
        res.render("requisicoes/add", {insumos})
    })

})

router.post('/salvarRequisicao', async (req, res) => {

    console.log(req.body.requisicao.campus_destino)
    try {
        var contrato = await Contrato.findOne({status: true})
    } catch (err) {
        console.log('Não foi possível localizar o contrato vigente.' + err)
    }  
    
    try {
        var insumos = await Insumo.find({_id: {$in: req.body.requisicao.insumos.map(row => (row.id_original))}})
    }catch (err) {
        console.log('Não foi possível localizar os insumos.' + err)
    }

    try {
        var campus = await Campus.findById(req.body.requisicao.campus_destino)
    } catch (err) {
        console.log('Não foi possível localizar o campus de destino.' + err)
    }  
    var novaRequisicao = {                    
        data_criacao: new Date(),
        data_ordem: new Date(),
        quantidade_itens: req.body.requisicao.insumos.length,
        valor_total: 0,
        campus_destino: campus._id,
        contrato: contrato._id,
        bdi: contrato.fator_reducao,
        solicitante: res.locals.user._id,
        observacoes: req.body.requisicao.observacoes,
        insumos: [],
        ordem_compra: req.body.requisicao.ordem_compra,
    }
    novaRequisicao.status = req.body.requisicao.ordem_compra ? 'Solicitada' : 'Salva'
    var prazo = new Date()
    prazo.setDate(novaRequisicao.data_ordem.getDate()+3)
    novaRequisicao.prazo_entrega = prazo

    for(var i = 0; i< req.body.requisicao.insumos.length; i++){                    
        var novoInsumo = {
            id_original: insumos[i]._id,
            descricao: insumos[i].descricao,
            base_origem: insumos[i].base_origem,
            codigo_origem: insumos[i].codigo_origem,
            unidade_medida: insumos[i].unidade_medida,
            preco_mediano: insumos[i].preco_mediano,
            preco_bdi: insumos[i].preco_mediano * contrato.fator_reducao,
            quantidade: req.body.requisicao.insumos[i].quantidade,
            preco_total: 0,
            status: 'Solicitado',
            observacao: '',
        }
        novoInsumo.preco_total = novoInsumo.preco_mediano * novoInsumo.quantidade
        novoInsumo.preco_total_bdi = novoInsumo.preco_total * contrato.fator_reducao
        novaRequisicao.valor_total += novoInsumo.preco_total
        novaRequisicao.insumos.push(novoInsumo)
    }

    novaRequisicao.valor_total_bdi = novaRequisicao.valor_total * contrato.fator_reducao

    console.log(novaRequisicao)
    try {
        await new Requisicao(novaRequisicao).save()
        if(req.body.ordem_compra){
            req.flash("success_msg", "Ordem de compra enviada com sucesso.")
            console.log('try ordem compra true')
        }else{
            req.flash("success_msg", "Requisição salva com sucesso.")
            console.log('try ordem compra false')
        }
    } catch (err) {
        req.flash("error_msg", "Houve um erro no processo. " + err)
        console.log('catch' + err)
        res.send({error: true, message: 'Problemas.'})
    }    
    res.send({error: false, message: 'Requisição enviada com sucesso.'}) 
})

router.post('/editarRequisicao', async (req, res) => {

    // pegar requisicao
    try{
        var requisicao = await Requisicao.findOne({_id: req.body.requisicao._id})
    }catch( err){
        console.log('Não foi possível localizar a requisição.' + err)
    }
    try {
        var contrato = await Contrato.findOne({status: true})
    } catch (err) {
        console.log('Não foi possível localizar o contrato vigente.' + err)
    }  
    try {
        var insumos = await Insumo.find({_id: {$in: req.body.requisicao.insumos.map(row => (row.id_original))}})
    }catch (err) {
        console.log('Não foi possível localizar os insumos.' + err)
    }

    requisicao.campus_destino = req.body.requisicao.campus_destino._id
    requisicao.contrato = contrato._id
    requisicao.bdi = contrato.fator_reducao
    requisicao.observacoes = req.body.requisicao.observacoes
    requisicao.insumos = []
    requisicao.ordem_compra = req.body.ordem_compra
    requisicao.valor_total = 0

    requisicao.status = req.body.requisicao.ordem_compra ? 'Solicitada' : 'Salva'

    if(req.body.ordem_compra){
        requisicao.data_ordem = new Date()
        var prazo = new Date()
        prazo.setDate(requisicao.data_ordem.getDate()+3)
        requisicao.prazo_entrega = prazo
    }

    for(var i = 0; i< req.body.requisicao.insumos.length; i++){                    
        var novoInsumo = {
            id_original: insumos[i]._id,
            descricao: insumos[i].descricao,
            base_origem: insumos[i].base_origem,
            codigo_origem: insumos[i].codigo_origem,
            unidade_medida: insumos[i].unidade_medida,
            preco_mediano: insumos[i].preco_mediano,
            preco_bdi: insumos[i].preco_mediano * contrato.fator_reducao,
            quantidade: req.body.requisicao.insumos[i].quantidade,
            preco_total: 0,
            status: 'Solicitado',
            observacao: '',
        }
        novoInsumo.preco_total = novoInsumo.preco_mediano * novoInsumo.quantidade
        novoInsumo.preco_total_bdi = novoInsumo.preco_total * contrato.fator_reducao
        requisicao.valor_total += novoInsumo.preco_total
        requisicao.insumos.push(novoInsumo)
    }

    requisicao.valor_total_bdi = requisicao.valor_total * contrato.fator_reducao
   


    try {
        await requisicao.save()
        if(req.body.ordem_compra){
            req.flash("success_msg", "Ordem de compra enviada com sucesso.")
        }else{
            req.flash("success_msg", "Requisição salva com sucesso.")
        }
    } catch (err) {
        req.flash("error_msg", "Houve um erro no processo." +err)
    }    
    res.send({error: false, message: 'Requisição enviada com sucesso.'}) 
})

router.get('/editar', eTecnico, (req, res) => {

})

router.get('/view/:id', eTecnico, (req, res) => {
    Requisicao.findOne({_id: req.params.id}).populate([{ path: 'solicitante', select: 'nome' }, {path: 'contrato', select: 'numero'}, {path: 'campus_destino', select: 'nome'}]).then((requisicao) => {
        res.render('requisicoes/view', {requisicao})
    }).catch()
})

router.get('/edit/:id', (req, res) => {
    res.render('requisicoes/edit')
})

router.get('/ordens', eTecnico, (req, res) => {
    Requisicao.find({ordem_compra: true})
    .populate([
        { path: 'contrato', select: 'numero' },
        {path: 'solicitante', select: 'nome'}, 
        {path: 'campus_destino', select: 'nome',},
    ])
    .sort({data_criacao: "asc"}).then((requisicoes) => {
        res.render('ordens/index',{requisicoes})
    }) 
    
})

router.get('/ordens/edit/:id', (req, res) => {
    res.render('ordens/edit')
})

router.get('/ordens/view/:id', (req, res) => {
    res.render('ordens/view')
})

router.get('/ordens/confirm/:id', (req, res) => {
    res.render('ordens/confirm')
})

router.post('/ordens/confirm/', async (req, res) => {
    try {
        var requisicao = await Requisicao.findById(req.body.requisicao._id)
    } catch (error) {
        req.flash("error_msg", "Não foi possivel localizar a ordem de compra.")
    }
    
    var novosStatus = req.body.requisicao.insumos.map(row => (row.status))

    //console.log(status)
    var pendente = novosStatus.find(element => element === 'Pendente')
    var solicitado = novosStatus.find(element => element === 'Solicitado')

    if(solicitado){
        requisicao.status = 'Solicitada'
    }else{
        pendente ? requisicao.status = 'Pendente' : requisicao.status = 'Entregue'
    }

    for(var i = 0; i < requisicao.insumos.length; i++)
        requisicao.insumos[i].status = novosStatus[i]


    try {  
        await requisicao.save()
        req.flash("success_msg", "Alterações salvas com sucesso.")        
    } catch (err) {
        req.flash("error_msg", "Não foi possível alterar a ordem de compra.")
    }
    
    res.send('')

})

router.post('/ordens/cancel/', async (req, res) => {
    //console.log(req.body.requisicao)
    //Localizar a requisicao (ordem compra)
    try {
        var requisicao = await Requisicao.findOne({_id: req.body.requisicao._id})
    } catch (err) {
        req.flash("error_msg", "Não foi possivel localizar a ordem de compra.")
    }

    //alterar os dados
    requisicao.cancelamento = req.body.requisicao.cancelamento
    requisicao.status = req.body.requisicao.status
    for(var i = 0; i < requisicao.insumos.length; i ++)
        requisicao.insumos[i].status = 'Cancelado'
    //console.log(requisicao)
    //Salvar no bd
    try {
        requisicao.save()
    } catch (err) {
        req.flash("error_msg", "Não foi possivel cancelar a ordem de compra.")
        res.send({message: 'Deu erro.'})
    }
    req.flash("success_msg", "Ordem de compra cancelada com sucesso.")
        res.send({message: 'Ok.'})
})

router.get('/ordens/cancel/:id',  (req, res) => {
    res.render('ordens/cancel')
})

router.get('/gerarOrdem/:id', async (req, res) => {

    try {
        var requisicao = await Requisicao.findOne({_id: req.params.id})
    }catch (err) {
        console.log('Não foi possível localizar a requisição solicitada.' + err)
    }
    //consultar contrato vigente
    try {
        var contrato = await Contrato.findOne({status: true})
    } catch (err) {
        console.log('Não foi possível localizar o contrato vigente.' + err)
    }

    requisicao.ordem_compra = true,
    requisicao.data_ordem = Date.now()
    requisicao.status = 'Solicitado'
    requisicao.contrato = contrato._id
    requisicao.bdi = contrato.fator_reducao

    var prazo = new Date()
    prazo.setDate(requisicao.data_ordem.getDate()+3)
    requisicao.prazo_entrega = prazo

    //procurar insumos

    try {
        var insumos = await Insumo.find({_id: {$in: requisicao.insumos.map(row => (row.id_original))}})
    } catch(err) {
        console.log('Não foi possível localizar os insumos da requisição.' + err)
    }

    
    //Calcular bdi e status de cada item.
    for(var i = 0; i < requisicao.insumoslength; i++){
        requisicao.insumos[i].preco_bdi =  requisicao.insumos[i].preco_mediano * contrato.fator_reducao
        requisicao.insumos[i].preco_total_bdi =  requisicao.insumos[i].preco_total * contrato.fator_reducao
        requisicao.insumos[i].status = 'S5e1b29fff98f091a551f5a84'
    }
    
    //requisicao = {...novaOrdem}
    //console.log(requisicao)
    
    //Salvar alterações no banco

    //Enviar o e-mail
    try {
        await requisicao.save()
    } catch (err) {
        req.flash("error_msg", "Não foi possível gerar a ordem de compra." + err)
        res.redirect('/requisicoes')
    }
    req.flash("success_msg", "Ordem de compra gerada com sucesso.")
    res.redirect('/requisicoes/ordens')
    


})

router.get('/ajax/loadRequisicao/:id', (req, res) => {
    Requisicao.findOne({_id: req.params.id})
    .populate([
        {path: 'contrato'},
        {path: 'solicitante', select: 'nome'},
        {path: 'campus_destino', select: 'nome'},
        {path: 'insumos.base_origem', select: 'abreviacao'}
    ])
    .then((requisicao) => {
        res.send(requisicao)
    }).catch()
})

router.get('/json/edit/:id', (req, res) => {
    Requisicao.findOne({_id: req.params.id}).populate([{ path: 'solicitante', select: 'nome' }, {path: 'contrato', select: 'numero'}]).then((requisicao) => {
        res.send(requisicao)
    }).catch()
})

module.exports = router