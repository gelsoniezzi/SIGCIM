const app = require('express')()
const bodyParser = require('body-parser')
var exphbs = require('express-handlebars')


app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const hbs = exphbs.create({ defaultLayout: 'main', extname: 'hbs', layoutsDir: 'views/layouts'});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
  var insumos = [
    {descricao: "Toalha", valor: 15.50},
    {descricao: "Barbeador", valor: 0.50},
    {descricao: "Moto", valor: 1015.50},
  ]
  res.render('insumos', {insumos: insumos})
})

app.get('/insumos', (req, res) => {
  res.render('insumos')
})


app.post('/ajax/insumos', (req, res) => {
  console.log(req.body)
  // setTimeout(() => {})

  //res.send({ error: false, message: 'Insumos cadsatrados com sucesso' })
  res.redirect('/cadastrou')
  // }, 1000)
})


app.listen(3001, () => {
  console.log('servidor funcionando')
})