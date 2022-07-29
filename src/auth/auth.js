const { compareSync } = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const authentication = async function (req, res, next) {
    try {
        let token = req.cookies.jwt;
        if (!token) {
            return res.status(404).send({ status: false, message: "token Not Found" })
        }

        let verifyToken = jwt.verify(token, process.env.SECRETE_KEY)
        if (!verifyToken) {
            return res.status(401).send({ status: false, message: "Invalid token" })
        }
        req.userId = verifyToken.userId
        next()
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }

}
const authorization = async function (req, res, next) {
    try {
        let idOftoken = req.userId;
        let userId = req.body.createdBy;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid ObjectId" })
        }

        if (userId !== idOftoken) {
            return res.status(401).send({ status: false, message: "Unauthorized Access!" })
        }
        next()
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}

module.exports = { authentication, authorization }