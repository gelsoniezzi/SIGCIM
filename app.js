// Carregando modulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    var app = module.exports = express() //const app = express()    
    const adminContratos = require("./routes/adminContratos")
    const admin = require("./routes/admin")
    const insumo = require("./routes/insumos")
    const requisicao = require("./routes/requisicoes")
    const usuario = require("./routes/usuarios")
    const path = require("path")
    const mongoose = require('mongoose')
    const mongooseAI = require('mongoose-auto-increment')
    const session = require("express-session")
    const flash = require("connect-flash")
    const passport = require('passport')
    require("./config/auth")(passport)
    var HandlebarsIntl = require('handlebars-intl');  

// Configuracoes

    // Sessao
        app.use(session({
            secret: "SigCIMUfersa",
            cookie: {maxAge: 3000000},
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    // Midleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            //res.locals.user = req.user || null

            next()
        })
    // Body parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())

    // Setup and export the Express app.
        
        app.set('name', 'SIGCIM - ...');
        //app.set('port', config.port);
        //app.set('available locales', config.availableLocales);
        app.set('default locale', 'pt-BR')

    // Handlebars        
        var hbs = handlebars.create({defaultLayout: 'main'})
        app.engine(hbs.extname, hbs.engine)
        app.set('view engine', hbs.extname)        
        HandlebarsIntl.registerWith(hbs.handlebars)
        //require('handlebars-intl/dist/locale-data/pt')
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
    app.use('/usuarios', usuario)
    app.use("/insumos", insumo)
    app.use("/requisicoes", requisicao)

    app.get('/', (req, res) => {
        res.render('admin/index')
    })
    
    /*
    app.get('/session', (req, res) => {
        req.session.treinamento = "Formação Node.js"
        req.session.ano = 2019
        req.session.user = {
            matricula: 1885704,
            email: "gimg@live.com"
        }
        res.send("Sessão gerada")

    })

    app.get('/leitura', (req, res) => {
        res.json({
            treinamento: req.session.treinamento,
            ano: req.session.ano,
            user: req.session.user
        })
        
    })
    */
    

    
// Outros
    const PORT = 8081
    app.listen(PORT, () => {
        console.log("Servidor rodando!")
    })