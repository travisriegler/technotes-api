const { format } = require('date-fns')
const { v4: uuid } = require('uuid')
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

const logEvents = async (message, logFileName) => {
    //grab the current date and time
    const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss')

    //each item is the date, a unique id, and message
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`

    try {

        //if the logs folder does not exist, create it
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
        }

        //if the logs folder does exist, append to the logFileName the lof item
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)
    } catch (err) {
        console.log(err)
    }
}

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
    console.log(`${req.method} ${req.path}`)
    next()
	//todo: remove this or limit it in production, it will log EVERYTHING
}

module.exports = { logEvents, logger }
