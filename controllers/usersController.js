const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler') //means we dont have to do so many try/catch blocks with mongoose/mongodb
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
	
	//.select('-password') means dont give us the password for security purposes
	//.lean() means just give us the data, don't give us the methods like .save etc attached
	const users = await User.find().select('-password').lean()
	
	//!!!IMPORTANT - when checking if you got something from the db, when it is an array then you have to check length also. this was !users at first but it returned an empty array instead of the 'no users found' message.
	if(!users?.length) {
		//include return in the if statements for safety reasons to ensure it 100% stops there
		return res.status(400).json({ message: 'No users found'})
	}
	
	//remember its best to pick out the data you actually need from users and then send that data rather than the entire user profile
	res.json(users)
	
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {

	const { username, password, roles } = req.body

    // Confirm data
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate username
	//mongoose says if passing something in and expecting a promist (await), you should add .exec() to the end
	//i added the -password here for security purposes
    //adding this tells mongoose/mongodb to check for case insensitivity, caps or not will not matter. wont have 2 users with Dave and dave
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).select('-password').lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    // Hash password 
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const userObject = (!Array.isArray(roles) || !roles.length)
        ? { username, "password": hashedPwd }
        : { username, "password": hashedPwd, roles }

    // Create and store new user 
    const user = await User.create(userObject)

    if (user) { //created 
        res.status(201).json({ message: `New user ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
	
})

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {

	const { id, username, roles, active, password } = req.body

    // Confirm data 
	//do we have a id, username, are roles an array, are there any roles in the role array, is active a boolean?
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields except password are required' })
    }

    // Does the user exist to update?
	//I added the -password for security
    const user = await User.findById(id).select('-password').exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Check for duplicate 
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).select('-password').lean().exec()

    // Allow updates to the original user 
	//if we found a user from the duplicate search above, and there is a _id field on it, convert to string and compare to the id we received in the request body. If it does not match, then we have a duplicate.
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

	//if it does match, then they are just trying to update their own user info
    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        // Hash password 
        user.password = await bcrypt.hash(password, 10) // salt rounds 
    }

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })

})

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {

	const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })
    }

    // Does the user still have assigned notes?
    const note = await Note.findOne({ user: id }).lean().exec()
    if (note) {
        return res.status(400).json({ message: 'User has assigned notes' })
    }

    // Does the user exist to delete?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)

})

module.exports = {
	getAllUsers,
	createNewUser,
	updateUser,
	deleteUser
}
