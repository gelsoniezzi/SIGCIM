const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require ("../models/Campi")
require ('../models/Categoria')
require ('../models/Opcao')
const Campus = mongoose.model("campi")
const Categoria = mongoose.model('categorias')
const Opcao = mongoose.model('opcoes')
// Rota index
router.get('/', (req, res) => {
    res.render("admin/index")
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

router.get('/sistema', async (req, res) => {
    try {
        var categorias = await Categoria.find()
    } catch (err) {
        req.flash("error_msg", "Não foi possível carregar as categorias." + err)
        res.redirect('/admin/sistema') 
    }

    try {
        var opcoes = await Opcao.find().populate('categoria').sort('categoria')
    } catch (err) {
        req.flash("error_msg", "Não foi possível carregar as opções de select." + err)
        res.redirect('/admin/sistema') 
    }

    res.render('sistema/index', {categorias: categorias, opcoes: opcoes})
})

router.get('/categorias/add', (req, res) => {
    res.render('sistema/categorias/add')
})

router.post('/categorias/add', async (req, res) => {
    var novaCategoria = {
        nome: req.body.nome,
        status: req.body.status
    }

    try {
        await new Categoria(novaCategoria).save()
        req.flash("success_msg", "Categoria criada com sucesso.")
        res.redirect('/admin/sistema') 
    } catch (err) {
        req.flash("error_msg", "Não foi possível salvar a categoria" + err)
        res.redirect('/admin/sistema') 
    }    
})

router.get('/opcoes/add', async (req, res) => {
    try {
        var categorias = await Categoria.find()
    } catch (err) {
        req.flash("error_msg", "Não foi possível localizar as categorias" + err)
        res.redirect('/admin/sistema') 
    }
    res.render('sistema/opcoes/add', {categorias})
})

router.post('/opcoes/add', async (req, res) => {
    var novaOpcao = {
        nome: req.body.nome,
        categoria: req.body.categoria,
        status: req.body.status
    }

    try {
        await new Opcao(novaOpcao).save()
        req.flash("success_msg", "Opção criada com sucesso.")
        res.redirect('/admin/sistema') 
    } catch (err) {
        req.flash("error_msg", "Não foi possível salvar a opção" + err)
        res.redirect('/admin/sistema') 
    }    
})

router.post('/ajax/loadOpcoes', async (req, res) => {
    
    try {
        var categoria = null
        if (req.body.id){
            categoria = {categoria: req.body.id}
        }

        var opcoes = await Opcao.find(categoria).populate('categoria')
    } catch (err) {
        console.log("Não foi possível localizar as opções. Erro: " + err)
    }
    res.send(opcoes)
})

module.exports = router
