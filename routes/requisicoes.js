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

router.get('/', eAdmin,(req, res) => {
    
    Requisicao.find().sort({data_criacao: "asc"}).then((requisicoes) => {
        res.render("requisicoes/index", {requisicoes})
    }) 
})

router.get('/add', eAdmin, (req, res) => {
    Insumo.find().populate("origem").sort({descricao: "asc"}).then((insumos) =>{
        res.render("requisicoes/add", {insumos})
    })

})

router.post('/salvar', (req,res) => {
    //criar var nova_requisicao e atribuir os valores da req.body.insumos
    //preencher insumos buscando do banco de dados

    Insumo.find({_id: {$in: req.body.insumos.map(row => (row.id))}}).then((insumo) => {
        var novaRequisicao ={
            data_criacao: Date.now(),
            quantidade_itens: req.body.insumos.length,
            valor_total: req.body.valor_total,
            status: "Salva",
            solicitante: "Implementar sessões",
            contrato: "Implementar contrato",
            observacoes: req.body.obs,
            insumos: []
        }

        var novoInsumo = {}
        for(var i = 0; i < req.body.insumos.length; i++){
        novoInsumo = insumo.map(row => ({ 
            descricao: row.descricao, 
            origem: row.origem, 
            codigo_origem: row.codigo_origem, 
            unidade: row.unidade_medida,
            preco: row.preco_mediano
        }))
            novoInsumo[i].quantidade = req.body.insumos[i].quantidade
            novoInsumo[i].observacao = "Implementar observacao individual"
            novaRequisicao.insumos.push(novoInsumo[i])
            //console.log(novoInsumo[i])
        }
        console.log(novaRequisicao.insumos)
        //console.log(novaRequisicao)

        new Requisicao(novaRequisicao).save().then(() => {
            req.flash("success_msg", "Requisição salva com sucesso.")
            res.send({error: false, message: 'Requisição salva com sucesso.'})
        }).catch((err) => {
            console.log("Houve um erro ao salvar requisicao.")
        })

    }).catch((err) => {
        console.log("Houve erro ao incluir insumos na requisição: " + err)
    })
})

router.post('/enviar', eAdmin, (req, res) => {
    //verificar contrato atual
    var contratoVi = contratoVigente()    
        
    Insumo.find({_id: {$in: req.body.insumos.map(row => (row.id))}}).then((insumo) => {
        
        var novaRequisicao ={
            //data_criacao: Date.now(),
            quantidade_itens: req.body.insumos.length,
            valor_total: req.body.valor_total,
            status: "Enviada",
            solicitante: res.locals.user._id,
            contrato: contratoVi._id,
            observacoes: req.body.obs,
            insumos: []
        }

        var novoInsumo = {}
        for(var i = 0; i < req.body.insumos.length; i++){
        novoInsumo = insumo.map(row => ({ 
            descricao: row.descricao, 
            origem: row.origem, 
            codigo_origem: row.codigo_origem, 
            unidade: row.unidade_medida,
            preco: row.preco_mediano
        }))
            novoInsumo[i].quantidade = req.body.insumos[i].quantidade
            novoInsumo[i].observacao = "Implementar observacao individual"
            novaRequisicao.insumos.push(novoInsumo[i])
            //console.log(novoInsumo[i])
        }
        console.log(novaRequisicao.insumos)

        new Requisicao(novaRequisicao).save().then(() => {
            req.flash("success_msg", "Requisição enviada com sucesso.")
            res.send({error: false, message: 'Requisição salva com sucesso.'})
        }).catch((err) => {
            console.log("Houve um erro ao enviar requisicao.")
        })

    }).catch((err) => {
        console.log("Houve erro ao incluir insumos na requisição: " + err)
    })
    
    /*
    
    console.log(req.body.insumos)
    var ids = req.body.insumos.map(row => (row.id))
    console.log(ids)
    var nova_requisicao = {
        data_criacao: Date.now(),
        data_envio: Date.now(),
        quantidade_itens: req.body.insumos.length,
        status: "Enviada",
        solicitante: "Implementar sessões",
        contrato: "Implementar contrato",
        observacao: req.body.obs,
        prazo_entrega: Date.now(),
        insumos: []
    }

    var novo_insumo
        
              
        Insumo.find({_id: { $in: ids}}).then((insumo) => {
            console.log(insumo)
            
            novo_insumo = {
                descricao: insumo.descricao,
                base_origem: insumo.base_origem._id,
                codigo_origem: insumo.codigo_origem,
                unidade: insumo.unidade_medida,
                preco: insumo.preco_mediano,
                status_requisicao: "Solicitado",
                //preco_total: req.body.insumos[i].quantidade * insumo.preco_mediano
            }
            //console.log("Dentro do for:")
            //console.log(novo_insumo)
            nova_requisicao.insumos.push(novo_insumo)
        }).catch((err) => {
            console.log("Houve um problema." + err)
        })

    //for ( var i = 0; i < nova_requisicao.quantidade_itens; i++){ // para cada item da requisicao eu estou fazendo um find no banco.

        
        
        
    //}
    console.log('------------------------ Requisicao ----------------')
    console.log(nova_requisicao)
        //console.log("Insumo " + i + ": " + req.body.insumos[i].id)
    //req.body.insumos
    res.send({error: false, menssage: 'Insumos cadastrados com sucesso.'})

    */
})

router.get('/editar', (req, res) => {

})

module.exports = router

    //Funcoes

    //Pesquisar contrato vigente
    var contratoVigente = () => {
        Contrato.findOne({status: true}).then((contrato) => {
            console.log(contrato)
            return contrato
        })
    }
