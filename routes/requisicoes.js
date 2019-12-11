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


//rota index

router.get('/', (req, res) => {
    Requisicao.find().sort({data_criacao: "asc"}).then((requisicoes) => {
        res.render("requisicoes/index", {requisicoes})
    }) 
})

router.get('/add', (req, res) => {
    Insumo.find().populate("origem").sort({descricao: "asc"}).then((insumos) =>{
        res.render("requisicoes/add", {insumos})
    })

})

router.post('/enviar', (req, res) => {
    //verificar contrato atual
    console.log(req.body.observacoes)
    var nova_requisicao = {
        data_criacao: Date.now(),
        data_envio: Date.now(),
        quantidade_itens: req.body.insumos.length,
        status: "Enviada",
        solicitante: "Implementar sessões",
        contrato: "Implementar contrato",
        observacao: req.body.observacoes,
        prazo_entrega: Date.now(),
        insumos: []
    }
    // Copiar as informações de cada insumo para o array de insumos da requisicao.

    for ( var i = 0; i < nova_requisicao.quantidade_itens; i++){
        var novo_insumo
        Insumo.findOne({_id: req.body.insumos[i].id}).then((insumo) => {
            //console.log(insumo)
            
            novo_insumo = {
                descricao: insumo.descricao,
                base_origem: insumo.base_origem._id,
                codigo_origem: insumo.codigo_origem,
                unidade: insumo.unidade_medida,
                preco: insumo.preco_mediano,
                status_requisicao: "Solicitado",
                //preco_total: req.body.insumos[i].quantidade * insumo.preco_mediano
            }
            console.log("Dentro do for:")
            console.log(novo_insumo)
            
        })
        nova_requisicao.insumos.push(novo_insumo)
    }
    console.log(nova_requisicao)
        //console.log("Insumo " + i + ": " + req.body.insumos[i].id)
    //req.body.insumos
    res.send({error: false, menssage: 'Insumos cadastrados com sucesso.'})

})





module.exports = router