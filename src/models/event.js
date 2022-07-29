const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    eventDate: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: ObjectId,
        ref: "users",
        required: true
    },
    invitees: [{
        invite: {
            type: ObjectId,
            ref: "users"
        },
        invitedAt: {
            type: Date
        }
    }],
    createdAt: {
        type: Date
    },
    modified: {
        type: Date
    }
})

module.exports = mongoose.model("event", eventSchema)