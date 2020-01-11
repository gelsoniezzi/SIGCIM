const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require ("../models/Campi")
const Campus = mongoose.model("campi")

// Rota index
router.get('/', (req, res) => {
    res.render("admin/index")
})

router.get('/teste', (req, res) => {
    res.render("admin/teste")
})

router.get('/addCampus',(req, res) => {
    res.render('admin/addCampus')
})

router.post('/addCampus', (req, res) => {
    novoCampus = {
        nome: req.body.nome,
        endereco: req.body.endereco
    }
    new Campus(novoCampus).save().then(()=> {
        req.flash("success_msg", "Campus criado com sucesso.")
        res.redirect("/admin/campi")
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível salvar o campus." + err)
        res.redirect('/admin/campi') 
    })
})

router.get('/campi', (req, res) => {
    res.render('admin/campi')
})

router.post('/ajax/campi',(req, res) => {
    Campus.find().then((campi) => {
        res.send(campi)
    })
})

module.exports = router
