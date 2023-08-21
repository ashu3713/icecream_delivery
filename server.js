require('dotenv').config()
const express = require('express')
const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts')
const path= require('path')
const mongoose = require('mongoose')
const app = express()
const PORT = process.env.PORT || 3000
const session = require('express-session')
const flash = require ('express-flash')
const MongoDbStore = require('connect-mongo')
const passport = require('passport')
const Emitter = require('events')

// database connection 
// main().catch(err => console.log(err));
// async function main() {
//   await mongoose.connect('mongodb://0.0.0.0:27017/pizza');
// }

const DBConnection = async() => {
  const MONGODB_URL=`mongodb+srv://ashu:ashu@file-sharing.9ts8yd0.mongodb.net/?retryWrites=true&w=majority`;
  try{
     await mongoose.connect(MONGODB_URL,{useNewUrlParser: true});
     console.log('Database connected successfully');
  }catch(error){
      console.error('error while connecting the database',error.message);
  }
}
DBConnection();

// Event emitter
const eventEmitter = new Emitter()                              // used to listen event emit from clientside
app.set('eventEmitter', eventEmitter)                           // binding app with event emitter and we can access eventEmitter in our whole project


// session config
app.use(session({
    secret: process.env.COOKIE_SECRET ,
    resave: false,
    saveUninitialized: false,
    store: MongoDbStore.create({
        mongoUrl: process.env.MONGO_CONNECTION_URL,
        collectionName: 'sessions'
      }),
    cookie: {maxAge: 1000 * 60 * 60 *24} // cookie valid time 24 hrs
  }));


// flash config
app.use(flash())


// passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())


 
// Assets
app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())


// global middle ware
app.use((req,res,next) => {
   res.locals.session = req.session
   res.locals.user = req.user
   next()
})



// set Template Engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')


// import for routes
require('./routes/web')(app)


 
const server = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})


// socket

const io = require('socket.io')(server)
io.on('connection', (socket) => {
      // Join
      socket.on('join', (orderId) => {                        // here orderid recieves data(orderid) which we have sent from client side(app.js)
        socket.join(orderId)
      })
})

eventEmitter.on('orderUpdated', (data) => {                             // listen the event emitted by statusController.js
    io.to(`order_${data.id}`).emit('orderUpdated', data)                // we have emited the event to socket which will be listen in app.js(client side)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})