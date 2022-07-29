const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.js")
const eventController = require("../controllers/event.js")
const auth = require("../auth/auth")


//User Api's
router.post("/register", userController.createUser);
router.post("/login", userController.logIn);
router.get("/logout", userController.logout)
router.post("/changePassword", auth.authentication, userController.changePassword)
router.post("/resetPassword", userController.resetPassword)
router.post("/updatePassword", auth.authentication, userController.updatePassword)

//Event Api's
router.post("/event", auth.authentication, auth.authorization, eventController.createEvent);
router.post("/invite", auth.authentication, eventController.inviteEvents)
router.get("/events", auth.authentication, eventController.listEvent)

module.exports = router;