const app = require('express')()
const bodyParser = require('body-parser');
var exphbs = require('express-handlebars');

app.use(bodyParser.json())

const hbs = exphbs.create({ extname: 'hbs', layoutsDir: 'views', defaultLayout: null, });

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');



app.get('/insumos', (req, res) => {
  res.render('insumos')
})


app.post('/ajax/insumos', (req, res) => {
  console.log(req.body)
  // setTimeout(() => {

  //res.send({ error: false, message: 'Insumos cadsatrados com sucesso' })
  res.redirect('/cadastrou')
  // }, 1000)
})


app.listen(3001, () => {
  console.log('servidor funcionando')
})