const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Requisicao")
require("../models/Insumo")
const Requisicao = mongoose.model("requisicoes")
const Insumo = mongoose.model("insumos")


//rota index

router.get('/', (req, res) => {
    Requisicao.find().sort({data_criacao: "asc"}).then((requisicoes) => {
        res.render("requisicoes/index", {requisicoes})
    }) 
})

router.get('/add', (req, res) => {
    Insumo.find().populate("origem").sort({descricao: "asc"}).then((insumos) =>{
        res.render("requisicoes/addvue", {insumos})
    })

})

router.post
})


module.exports = router