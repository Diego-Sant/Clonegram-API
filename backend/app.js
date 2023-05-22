require("dotenv").config()

const express = require("express")
const path = require("path")
const cors = require("cors")

const port = process.env.PORT;
const app = express()

// configurar JSON e form data

app.use(express.json())
app.use(express.urlencoded({extended: false}))

// resolver CORS

app.use(cors({credentials: true, origin: "http://localhost:3000"}));

// diretório de upload

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// conexão com o banco de dados

require("./config/db.js");

// rotas

const router = require("./routes/Router.js")

app.use(router);

app.listen(port, () => {
    console.log(`App rodando na porta ${port}`)
})