const validator = require("validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const userModel = require("../models/user.js")


const isValid = (value) => {
    if (typeof value === undefined || typeof value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
}

const isValidRequestBody = (data) => {
    return Object.keys(data).length > 0
}

const isValidTitle = (title) => {
    return ["Mr", "Miss", "Mrs"].indexOf(title) !== -1
}



//1.User Creation
const createUser = async function (req, res) {
    try {
        let data = req.body
        let { title, fullName, email, mobile, password } = data

        //mandatory validations
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "please pass data in request body" })
        }

        if (!(isValid(title))) {
            return res.status(400).send({ status: false, message: "title is required" })
        }

        if (!(isValid(fullName))) {
            return res.status(400).send({ status: false, message: "fullName is required" })
        }

        if (!(isValid(email))) {
            return res.status(400).send({ status: false, message: "email is required" })
        }

        if (!(isValid(mobile))) {
            return res.status(400).send({ status: false, message: "mobile is required" })
        }

        if (!(isValid(password))) {
            return res.status(400).send({ status: false, message: "password is required" })
        }

        // patten validation
        if (!isValidTitle(title)) {
            return res.status(400).send({ status: false, message: "invalid title" })
        }

        if (!validator.isEmail(email)) {
            return res.status(400).send({ status: false, message: "invalid email" })
        }

        if (!validator.isStrongPassword(password)) {
            return res.status(400).send({ status: false, message: "invalid password" })
        }

        if (!(/^[789]\d{9}$/.test(mobile))) {
            return res.status(400).send({ status: false, message: "invalid mobile number" })
        }

        // unique validation
        let findEmail = await userModel.findOne({ email: email })
        if (findEmail) {
            return res.status(400).send({ status: false, message: "email is already exist" })
        }

        let findMobile = await userModel.findOne({ mobile: mobile })
        if (findMobile) {
            return res.status(400).send({ status: false, message: "mobile number is already exist" })
        }

        //password hashing
        const salt = await bcrypt.genSalt(10)
        encrypted = await bcrypt.hash(password, salt)

        let details = { title, fullName, email, mobile, password: encrypted, createdAt: new Date() }

        let saveData = await userModel.create(details)
        return res.status(201).send({ status: true, data: saveData })
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}




//2.User login
const logIn = async function (req, res) {
    try {
        let data = req.body;
        let { email, password } = data

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "please pass data in request body" })
        }

        if (!(isValid(email))) {
            return res.status(400).send({ status: false, message: "email is required" })
        }

        if (!(isValid(password))) {
            return res.status(400).send({ status: false, message: "password is required" })
        }

        if (!validator.isEmail(email)) {
            return res.status(400).send({ status: false, message: "invalid email" })
        }

        if (!validator.isStrongPassword(password)) {
            return res.status(400).send({ status: false, message: "invalid password" })
        }

        let findUser = await userModel.findOne({ email })
        if (findUser) {
            let validatePassword = await bcrypt.compare(password, findUser.password)
            if (!validatePassword) {
                return res.status(400).send({ status: false, message: "Invalid password" })
            }
        }
        else {
            return res.status(404).send({ status: false, message: "User Not Found" })
        }

        //generating token
        let token = jwt.sign({ userId: findUser._id }, process.env.SECRETE_KEY, { expiresIn: "1h" })
        findUser.token = token
        await findUser.save();

        res.cookie("jwt", token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
        return res.status(200).send({ status: true, message: "login Successful" })

    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}



//3.User Logout
const logout = async function (req, res) {
    try {
        const cookies = req.cookies.jwt;

        let findToken = await userModel.findOne({ token: cookies })
        if (!findToken) {
            return res.status(404).send({ status: false, message: "token not found" })
        } else {
            res.clearCookie("jwt")
            findToken.token = null
            await findToken.save();
        }
        return res.status(200).send({ status: true, message: "logged out Successfully" })
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}



//4.change password
const changePassword = async function (req, res) {
    try {
        let password = req.body.password;
        let idOfToken = req.userId

        if (!isValidRequestBody(password)) {
            return res.status(400).send({ status: false, message: "please pass password in request body" })
        }

        if (!validator.isStrongPassword(password)) {
            return res.status(400).send({ status: false, message: "invalid password" })
        }
        // password hashing
        let salt = await bcrypt.genSalt(10)
        encrypted = await bcrypt.hash(password, salt)

        let checkId = await userModel.findOneAndUpdate({ _id: idOfToken }, { password: encrypted }, { new: true })
        return res.status(200).send({ status: true, message: "Password Changed Successfully" })
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}



//5.Reset Password
const resetPassword = async function (req, res) {
    try {
        let data = req.body;
        let { email, password } = data

        let checkEmail = await userModel.findOne({ email })
        if (!checkEmail) {
            return res.status(404).send({ status: false, message: "User Not Found" })
        }

        // password hashing
        let salt = await bcrypt.genSalt(10);
        encrypted = await bcrypt.hash(password, salt);
        checkEmail.password = encrypted;
        await checkEmail.save();

        return res.status(200).send({ status: true, message: "Password Reset Done..!" })
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}




//6.Update Password
const updatePassword = async function (req, res) {
    try {
        let password = req.body.password;
        let idOfToken = req.userId

        if (!isValidRequestBody(password)) {
            return res.status(400).send({ status: false, message: "please pass password in request body" })
        }

        if (!validator.isStrongPassword(password)) {
            return res.status(400).send({ status: false, message: "invalid password" })
        }
        // password hashing
        let salt = await bcrypt.genSalt(10)
        encrypted = await bcrypt.hash(password, salt)

        let checkId = await userModel.findOneAndUpdate({ _id: idOfToken }, { password: encrypted }, { new: true })
        return res.status(200).send({ status: true, message: "Password Changed Successfully" })
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}

module.exports = { createUser, logIn, logout, changePassword, resetPassword, updatePassword }