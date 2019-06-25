// Carregando modulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const adminContratos = require("./routes/adminContratos")
    const admin = require("./routes/admin")
    const insumo = require("./routes/insumos")
    const path = require("path")
    const mongoose = require('mongoose')
    const session = require("express-session")
    const flash = require("connect-flash")

// Configuracoes

    // Sessao
        app.use(session({
            secret: "SigCIMUfersa",
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash())
    // Midleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            next()
        })
    // Body parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    //mongoose
        mongoose.Promise = global.Promise
        mongoose.connect("mongodb://localhost/sigcim").then(() => {
            console.log("Conectado ao mongodb. ")
        }).catch((err) => {
            console.log("Erro ao se conectar ao mongodb: "+ err)
        })
    // Public
        app.use(express.static(path.join(__dirname, "public")))

        /*
        app.use((req, res, next) =>{
            console.log("Oi, eu sou um midleware");
            next();
        })
        */


// Rotas
    app.get("/contratos", (req, res) => {
        res.send("Lista de contratos.")
    })

    app.get("/teste", (req, res) => {
        res.render("admin/teste")
    })

    app.use('/adminContratos', adminContratos)
    app.use("/admin", admin)
    app.use("/insumos", insumo)

    app.get('/', (req, res) => {
        res.render('admin/index')

    })

    
// Outros
    const PORT = 8081
    app.listen(PORT, () => {
        console.log("Servidor rodando!")
    })