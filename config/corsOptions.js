const allowedOrigins = require('./allowedOrigins')

const corsOptions = {
	origin: (origin, callback) => {
	
		//if the origin is one of the allowed origins
		if (allowedOrigins.indexOf(origin) !== -1) {
			//first is error, second is whether it is allowed (true or false). true here because it was one of the allowed origins
			callback(null, true)
			
		//if the origin is not one of the allowed origins
		} else {
			callback(new Error('Not allowed by CORS'))
		}
	},
	credentials: true, //set it here to true and it handles it for us, needed for cookies i think
	optionsSuccessStatus: 200 //default is 204 but some devices have issues with 204, so 200 to be safe
}

module.exports = corsOptions


// doing || !origin allows postman and other things to also access it.