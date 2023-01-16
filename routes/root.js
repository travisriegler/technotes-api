const express = require('express')
const router = express.Router()
const path = require('path')

//regex provides more options to ensure they are properly directed to here
router.get('^/$|/index(.html)?', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})

module.exports = router