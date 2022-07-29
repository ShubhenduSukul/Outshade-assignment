const eventModel = require("../models/event.js")
const mongoose = require("mongoose")
const userModel = require("../models/user.js")

const isValid = (value) => {
    if (typeof value === undefined || typeof value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
}

const isValidRequestBody = (data) => {
    return Object.keys(data).length > 0
}



// 1.create events
const createEvent = async function (req, res) {
    try {
        let data = req.body;
        let { name, description, eventDate, createdBy } = data

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "please pass data in request body" })
        }

        if (!isValid(name)) {
            return res.status(400).send({ status: false, message: "name is required" })
        }

        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "description is required" })
        }

        if (!isValid(eventDate)) {
            return res.status(400).send({ status: false, message: "eventDate is required" })
        }

        if (!isValid(createdBy)) {
            return res.status(400).send({ status: false, message: "createsBy is required" })
        }

        //check user is present or not
        let checkObjectId = await userModel.findOne({ _id: createdBy })
        if (!checkObjectId) {
            return res.status(404).send({ status: false, message: "User Not Found" })
        }

        let saveData = await eventModel.create(data)
        return res.status(201).send({ status: true, message: "Success", data: saveData })
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}





//2.invite events
const inviteEvents = async function (req, res) {
    try {
        let user = req.body.invitee;
        let idOftoken = req.userId;

        if (!isValid(user)) {
            return res.status(400).send({ status: false, message: "invitee is required" })
        }

        if (!mongoose.isValidObjectId(user)) {
            return res.status(400).send({ status: false, message: "Not a valid intivee" })
        }

        let checkUser = await userModel.findOne({ _id: user })
        if (!checkUser) {
            return res.status(404).send({ status: false, message: "user not found" })
        }

        let findEvent = await eventModel.findOne({ createdBy: idOftoken })
        if (!findEvent) {
            return res.status(404).send({ status: false, message: "event not found" })
        }
        findEvent.invitees = findEvent.invitees.concat({ intivee: user, invitedAt: new Date() })
        await findEvent.save();

        return res.status(200).send({ status: true, message: "Invited Suceessfully" })
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }

}




//3.list the all events
const listEvent = async function (req, res) {
    try {
        let data = req.query;

        let getList = await eventModel.find().populate("user")
        if (getList.length === 0) {
            return res.status(404).send({ status: false, message: "events not found" })
        }
        return res.status(200).send({ status: true, message: "list of event", data: getList })
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}



module.exports = { createEvent, inviteEvents, listEvent }