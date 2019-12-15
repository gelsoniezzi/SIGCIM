const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")


// Rota index
router.get('/', (req, res) => {
    res.render("admin/index")
})

router.get('/teste', (req, res) => {
    res.render("admin/teste")
})

module.exports = router
