/* This file contains the model for flags, which are set to persist certain events */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Helper = require('../controllers/helper_functions.js');

//validators
var valEmpty = [Helper.valEmpty, 'The field \'{PATH}:\' must just not be empty.'];

var FlagSchema = Schema({
   id:   Number,
   name:   {type:String, trim:true, lowercase:true, validate:valEmpty}
});

FlagSchema.set('toObject', {getters : true});

//sanitize strings before saving
FlagSchema.pre('save', function(next){
    var self = this || mongoose.model('Flag');
    self.name = Helper.sanitizeString(self.name);
    next();
});

var FlagModel = mongoose.model('Flag', FlagSchema);
module.exports = FlagModel;