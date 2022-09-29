var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var User = require("./User");
var Question = require("./Question");

var commentSchema = new Schema({
    content: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);