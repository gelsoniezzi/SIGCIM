// Carregando modulos
    const express = require('express') //importando express
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    var app = module.exports = express() //const app = express() <- Passando o express para a val app
    const contratos = require("./routes/contratos")
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
            cookie: {maxAge: 14400000},
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
            res.locals.user = req.user || null

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
        var hbs = handlebars.create({defaultLayout: 'main',
        helpers: {
            json: function (value, options) {
                return JSON.stringify(value);
            },
            currency: function(value){
              //console.log('currency', value)
              return Number(value).toLocaleString('pt-BR', { 
                style:'currency', currency:'BRL'
              })
            },
            date_br:function(strDate){
            if (strDate){
                const date = new Date(strDate);              
                return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
            }else{
                return 'Não informado.'
            }
            },
            inc: (value, options) => {
                return parseInt(value) + 1      
            },
            fix: (value) => {
                return value.toFixed(2)
            }
        }}
        )
        app.engine(hbs.extname, hbs.engine)
        app.set('view engine', hbs.extname)        
        //HandlebarsIntl.registerWith(hbs.handlebars)
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
       app.use('/scripts', express.static(__dirname + '/node_modules/'))


// Rotas

    app.get("/teste", (req, res) => {
        res.render("admin/teste")
    })

    app.use('/contratos', contratos)
    app.use("/admin", admin)
    app.use('/usuarios', usuario)
    app.use("/insumos", insumo)
    app.use("/requisicoes", requisicao)

    app.get('/', (req, res) => {
        res.render('admin/index')
    })
    
    
    app.get('/session', (req, res) => {
        req.session.treinamento = "Formação Node.js"
        req.session.ano = 2019
        req.session.user = {
            matricula: 1885704,
            email: "gimg@live.com"
        }
        res.send("Sessão gerada")

    })

    app.get('/estaLogado', (req, res) => {
        var usuario = null
        if (res.locals.user){
            usuario = {
                perfil_usuario: res.locals.user.perfil_usuario,
                nome: res.locals.user.nome,
                matricula: res.locals.user.matricula
            }
        }       
        res.send({            
            user: usuario
        })
        
    })
    
    

    
// Outros
    const PORT = 8081
    app.listen(PORT, () => {
        console.log("Servidor rodando!")
    })