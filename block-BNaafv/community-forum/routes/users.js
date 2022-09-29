var express = require('express');
var router = express.Router();
var User = require("../models/User");
var auth = require("../middleware/auth");

// registration route
router.post('/', async function(req, res, next) {
    try {
        let user = await User.create(req.body);
        let token = await user.signToken();
        return res.status(200).json({ user: user.userJSON(token) });
    } catch (error) {
        next(error);
    }
});

// login route
router.post("/login", async function(req, res, next) {
    let { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ error: "Email/passwrod is required to login" });
    }
    let user = await User.findOne({ email });
    if (user) {
        if (!user.isBlocked) {
            let result = await user.verifyPassword(password);
            if (result) {
                let token = await user.signToken();
                return res.status(200).json({ user: user.userJSON(token) });
            } else {
                return res.status(401).json({ error: "Password is incorrect" });
            }
        } else {
            return res.status(401).json({ error: "You are blocked by user" });
        }

    } else {
        return res.status(200).json({ error: "Email is not registered" });
    }
});

router.use(auth.verifyToken);

// current-user
router.get("/current-user", async function(req, res, next) {
    let userId = req.user.userId;
    try {
        let user = await User.findById(userId);
        return res.status(200).json({ user: user.getUserFormat() });
    } catch (error) {
        return next(error);
    }
});

// follow 
router.put("/:username/follow", async function(req, res, next) {
    let username = req.params.username;
    let userId = req.user.userId;
    let user = await User.findOne({ username });
    try {
        if (user) {
            if (user.followers.includes(userId)) {
                return res.status(200).json({ error: `You already follow ${username}` });
            } else {
                let updatedCurrentLoggedInUser = await User.findByIdAndUpdate(userId, { $push: { followings: user.id } }, { new: true });
                let updatedUser = await User.findByIdAndUpdate(user.id, { $push: { followers: userId } }, { new: true });
                return res.status(200).json({ user: updatedCurrentLoggedInUser.getUserFormat() });
            }
        } else {
            return res.status(400).json({ error: `Did not found any user with this username ${username}` });
        }
    } catch (error) {
        return next(error);
    }
});

// unfollow user
router.delete("/:username/follow", async function(req, res, next) {
    let username = req.params.username;
    let userId = req.user.userId;
    let user = await User.findOne({ username });
    try {
        if (user) {
            if (user.followers.includes(userId)) {
                let updatedCurrentLoggedInUser = await User.findByIdAndUpdate(userId, { $pull: { followings: user.id } }, { new: true });
                let updatedUser = await User.findByIdAndUpdate(user.id, { $pull: { followers: userId } }, { new: true });
                return res.status(200).json({ user: updatedCurrentLoggedInUser.getUserFormat() });
            } else {
                return res.status(200).json({ error: `You don't follow ${username}` });
            }
        } else {
            return res.status(400).json({ error: `Did not found any user with this username ${username}` });
        }
    } catch (error) {
        return next(error);
    }
});


module.exports = router;