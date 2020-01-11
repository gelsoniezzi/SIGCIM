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
const {eTecnico} = require('../helpers/estaLogado')

//rota index

router.get('/', eTecnico, (req, res) => {
    
    Requisicao.find({ordem_compra: false})
    .populate(
        [{ path: 'contrato', select: 'numero' },
        {path: 'solicitante', select: 'nome'}, 
        {path: 'campus_destino', select: 'nome'}])
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
    
    try {
        var contrato = await Contrato.findOne({status: true})
    } catch (err) {
        console.log('Não foi possível localizar o contrato vigente.' + err)
    }  

    try {
        var insumos = await Insumo.find({_id: {$in: req.body.insumos.map(row => (row.id))}})
    }catch (err) {
        console.log('Não foi possível localizar os insumos.' + err)
    }

    var novaRequisicao = {                    
        data_criacao: new Date(),
        data_ordem: new Date(),
        quantidade_itens: req.body.insumos.length,
        valor_total: 0,
        campus_destino: req.body.campus_destino,
        contrato: contrato._id,
        bdi: contrato.fator_reducao,
        solicitante: res.locals.user._id,
        observacoes: req.body.observacoes,
        insumos: [],
        ordem_compra: req.body.ordem_compra
    }

    var prazo = new Date()
    prazo.setDate(novaRequisicao.data_ordem.getDate()+3)
    novaRequisicao.prazo_entrega = prazo

    for(var i = 0; i< req.body.insumos.length; i++){                    
        var novoInsumo = {
            descricao: insumos[i].descricao,
            base_origem: insumos[i].base_origem,
            codigo_origem: insumos[i].codigo_origem,
            unidade_medida: insumos[i].unidade_medida,
            preco_mediano: insumos[i].preco_mediano,
            preco_bdi: insumos[i].preco_mediano * contrato.fator_reducao,
            quantidade: req.body.insumos[i].quantidade,
            preco_total: 0,
            status_requisicao: req.body.ordem_compra ? 'Solicitado': '',
            observacao: '',
        }
        novoInsumo.preco_total = novoInsumo.preco_mediano * novoInsumo.quantidade
        novoInsumo.preco_total_bdi = novoInsumo.preco_total * contrato.fator_reducao
        novaRequisicao.valor_total += novoInsumo.preco_total
        novaRequisicao.insumos.push(novoInsumo)
    }

    novaRequisicao.valor_total_bdi = novaRequisicao.valor_total * contrato.fator_reducao
    req.body.ordem_compra ? novaRequisicao.status = 'Solicitada': novaRequisicao.status = 'Salva'


    try {
        await new Requisicao(novaRequisicao).save()
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


router.get('/json/edit/:id', (req, res) => {
    Requisicao.findOne({_id: req.params.id}).populate([{ path: 'solicitante', select: 'nome' }, {path: 'contrato', select: 'numero'}]).then((requisicao) => {
        res.send(requisicao)
    }).catch()
})

router.get('/ordens', eTecnico, (req, res) => {
    Requisicao.find({ordem_compra: true}).populate([{ path: 'contrato', select: 'numero' },{path: 'solicitante', select: 'nome'}, {path: 'campus_destino', select: 'nome'}]).sort({data_criacao: "asc"}).then((requisicoes) => {
        res.render('ordens/index',{requisicoes})
    }) 
    
})

router.get('/ordens/edit/:id', (req, res) => {
    res.render('ordens/edit')
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
    requisicao.status = 'Solicitada'
    requisicao.contrato = contrato._id
    requisicao.bdi = contrato.fator_reducao

    var prazo = new Date()
    prazo.setDate(requisicao.data_ordem.getDate()+3)
    requisicao.prazo_entrega = prazo

    //Calcular bdi e status de cada item.
    for(var i = 0; i < requisicao.quantidade_itens; i++){
        requisicao.insumos[i].preco_bdi =  requisicao.insumos[i].preco * contrato.fator_reducao
        requisicao.insumos[i].preco_total_bdi =  requisicao.insumos[i].preco_total * contrato.fator_reducao

        requisicao.insumos[i].status = 'Solicitado'
    }
    
    //requisicao = {...novaOrdem}
    console.log(requisicao)
    
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
        {path: 'contrato', select: 'numero' },
        {path: 'solicitante', select: 'nome'},
        {path: 'campus_destino', select: 'nome'},
        {path: 'insumos.base_origem', select: 'abreviacao'}
    ])
    .then((requisicao) => {
        res.send(requisicao)
    }).catch()
})

module.exports = router