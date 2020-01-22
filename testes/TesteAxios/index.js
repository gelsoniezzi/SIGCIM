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
res.render('insumos', {insumos})
})

app.get('/lista', (req, res) => {
  var requisicoes = [
    {id: 1, qtd: 2, itens: [{desc: 'Mouse', qtd: 3, price: 2.99}, {desc: 'Toalha', qtd: 5, price: 0.99}]},
    {id: 2, qtd: 1, itens: [{desc: 'Acucar', qtd: 1, price: 1}, {desc: 'Toalha', qtd: 2, price: 0.99}]},
    {id: 3, qtd: 3, itens: [{desc: 'Mouse', qtd: 3, price: 2.99}, {desc: 'Toalha', qtd: 5, price: 0.99}, {desc: 'Copo', qtd: 1, price: 5.99}]}
  ]
  res.render('requisicoes', {requisicoes})
})

app.get('/edit/:id',(req, res) => {
  res.render('edit',{id: 1, name: 'Gelson'})
})

app.get('/envio', (req, res) => {
  var insumos = [
    { id: 1, name: 'pipoca2', price: 3.49 },
    { id: 2, name: 'guaraná2', price: 4.49 },
    { id: 3, name: 'sal2', price: .49 },
    { id: 4, name: 'manteiga3', price: 10.49 }
  ]
  res.send(insumos)
})

app.get('/insumos', (req, res) => {
  res.render('insumos')
})


app.post('/ajax/insumos', (req, res) => {
  console.log(req.body)
  res.send({message: 'cadastrou'})
})


app.listen(3001, () => {
  console.log('servidor funcionando')
})