const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const flash = require('express-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')

const app = express()
const PORT = process.env.PORT || 9000

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


// code untuk menspesifikasikan folder yang menyimpan file CSS dan gambar 
app.use(express.static(path.join(__dirname, 'public')))
// untuk mendapatkan nilai dari formulir yang dikirim
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookieParser())
app.use(session({ 
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }
}))
app.use(flash());

// Bootstrap Config
app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
)
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
)
app.use("/jquery", express.static(path.join(__dirname, "node_modules/jquery/dist/")))

// Router
const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')

app.use('/auth', authRouter)
app.use('/', userRouter)

// Display home page
app.get('/', (req, res) => {
  
  let loggedin = false
  let username = ''
  
  if (req.session.loggedin) {
    loggedin = true
    username = req.session.username
  }

  res.render('user/home', {
    page_name: 'Home',
    loggedin: loggedin,
    username: username
  })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).render('404')
})

app.listen(PORT, () => {
  console.log(`App running at port ${PORT}`)
})



