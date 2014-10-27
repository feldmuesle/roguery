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

/****** statics ************/

// create Flag with auto-increment-id
FlagSchema.statics.createFlag = function(flagText, cb){
    var self = this || mongoose.model('Flag');
    return self.find(function(err, flags){
        if(err){console.log(err); return;}
        var id = Helper.autoIncrementId(flags); 
        var flag = new FlagModel();
        flag.id = id;
        flag.name = flagText;

        flag.save(function(err, flag){
            if(err){console.log(err); return;}
            console.log('new flag has been saved');
            cb(flag);
        });
    });
};




var FlagModel = mongoose.model('Flag', FlagSchema);
module.exports = FlagModel;

// create some flags
{
//    var flag1 = {id:1, name:'defeated troll'};
//    var flag2 = {id:1, name:'run from witch'};
//
//
//    var flags = [flag1, flag2];
//    console.log(flags.length);
//    
//    for( var j=0; j<flags.length; j++){
//        var flag = new FlagModel(flags[j]);
//        flag.save(function(err, flag){
//            if(err){console.log(err); return;}
//            console.log('flag saved.');
//            console.log(flag);
//        });
//        console.log('i = '+j);
//    }
}