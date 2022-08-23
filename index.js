//import .env HARUS PALING ATAS

const  dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;
const cors = require('cors');
const bearerToken = require('express-bearer-token');
const session = require('express-session');
const passport = require('passport');

app.use(session({
    resave:false,
    saveUninitialized:true,
    secret:'SECRET'
}));

// CONFIG PASSPORT
require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(cors()); // untuk memberikan akses ke frontend
app.use(express.static('public')); // akses ke directory file image agar bisa dilihat di web
app.use(bearerToken())

app.get('/', (req, res) =>{
    console.log("access from client")
    res.status(200).send('<h1>ESHOP API</h1>')
});

//DB Check connection
const { dbConf } = require('./config/db');
dbConf.getConnection((error, connection) => {
    if (error){
        console.log("Error MySQL Connection", error.sqlMessage);
    }
    console.log(`Connect ✅ : ${connection.threadId}`)
})

// CONFIG ROUTERS
const { authRouter } = require('./routers');
const { productRouter } = require('./routers');
const { cartRouter } = require('./routers');
app.use('/auth', authRouter);
app.use('/product', productRouter);
app.use('/cart', cartRouter);


app.listen(PORT, () => console.log(`Running API at ${PORT}`));