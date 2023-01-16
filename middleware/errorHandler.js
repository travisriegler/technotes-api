const { logEvents } = require('./logger')

const errorHandler = (err, req, res, next) => {

    //log the error name, error message, and request details
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
    console.log(err.stack)

    //if there is not already a status code, set it to 500
    const status = res.statusCode ? res.statusCode : 500 // server error 

    res.status(status)

    //added isError to help redux and RTK query
    res.json({ message: err.message, isError: true })
}

module.exports = errorHandler