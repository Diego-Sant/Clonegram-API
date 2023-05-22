const express = require("express")
const router = express()
 
router.use("/api/usuarios", require("./UserRoutes"))
router.use("/api/fotos", require("./PhotoRoutes"))
 
// Testar rota
router.get("/", (req, res) => {
    res.send("API Working!")
})
 
module.exports = router