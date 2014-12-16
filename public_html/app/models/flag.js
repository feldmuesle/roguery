/* This file contains the model for flags, which are set to persist certain events */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Event = require('./event.js');
var Helper = require('../controllers/helper_functions.js');

//validators
var valEmpty = [Helper.valEmpty, 'The field \'{PATH}:\' must just not be empty.'];

var FlagSchema = Schema({
   id   :   {type: Number},
   name :   {type:String, trim:true, lowercase:true, validate:valEmpty}
});

FlagSchema.set('toObject', {getters : true});

//sanitize strings before saving
FlagSchema.pre('save', function(next){
    var self = this || mongoose.model('Flag');
    self.name = Helper.sanitizeString(self.name);
    next();
});

//restrict remove to flags who are'nt req in any other events
FlagSchema.pre('remove', function(next){
    
    var self = this || mongoose.model('Flag');
    
    self.model('Event').find({'reqFlag': mongoose.Types.ObjectId(self._id)},{multi: true}, 
        function(err, events){        
            if(err){console.log(err); return;}
            
            // throw err if there are events referrencing to this flag
            if(events.length > 0){
                var newEr = new Error('Cannot remove flag because of events referencing to it.');
                next(newEr);
            }else{
                // no events referencing. Flag can be removed
                next();
            }        
     });    
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
            cb(flag);
        });
    });
};

var FlagModel = mongoose.model('Flag', FlagSchema);
module.exports = FlagModel;

