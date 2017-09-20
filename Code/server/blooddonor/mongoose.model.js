var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaObject = new Schema({
    firstName: {
        type: String,
        trim: true,
        required: true,
        match: /^.{3,40}$/
    },
    lastName: {
        type: String,
        trim: true,
        required: true,
        match: /^.{3,40}$/
    },
    contactNumber: {
        type: String,
        trim: true,
        required: true,
        match: /^.{3,40}$/
    },
    email: {
        type: String,
        trim: true,
        required: true,
        match: /^.{3,50}$/
    },
    address: {
        type: String,
        trim: true,
        required: true,
        match: /^.{3,200}$/
    },
    bloodGroup: {
        type: String,
        trim: true,
        required: true,
        match: /^.{1,40}$/
    },
    ip: {
        type: String
    },
    loc: {
        type: { type: String },
        coordinates: [],
    }
});
schemaObject.index({ "loc": "2dsphere" });
module.exports = mongoose.model('Blooddonor', schemaObject);