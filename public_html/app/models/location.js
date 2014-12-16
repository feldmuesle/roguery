/* Model for locations */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Helper = require('../controllers/helper_functions.js');

//validators
var valEmpty = [Helper.valEmpty, 'The field \'{PATH}:\' must just not be empty.'];

var LocationSchema = Schema({
    id      :   {type: Number, unique:true},
    name    :   {type:String, trim:true, lowercase:true, validate:valEmpty},
    text    :   {type:String, trim:true, validate:valEmpty},
    event   :   {type: Schema.Types.ObjectId, ref:'Event', index:true},
    start   :   {type:Boolean, default:false}
});

LocationSchema.set('toObject', {getters : true});

//sanitize strings before saving
LocationSchema.pre('save', function(next){
    var self = this || mongoose.model('Location');
    self.name = Helper.sanitizeString(self.name);
    self.text = Helper.sanitizeString(self.text);
    next();
});

// restrict-delete: check if the location is used by other documents
LocationSchema.pre('remove', function(next){
   
    var self = this || mongoose.model('Location');
    
    // check if the location is used as a start-location for a guild
    self.model('Guild').find({'start': self.id}).exec(function(err, guilds){
        if(err){console.log(err); next(err);}        
        return guilds;
    })
    .then(function(guilds){
        
        self.model('Event').find().or(
                        [{'location':self._id},
                        {'dice.success.location': self._id },
                        {'dice.failure.location': self._id},
                        {'continueTo.location': self._id}])
            .exec(function(err, events){
                if(err){console.log(err); next(err);}
                return events;
            })
        .then(function(events){
            if(guilds.length > 0){
                var customErr = new Error('Cannot delete location due to depending guild \''+guilds[0].name+'\'');
                next(customErr);
            }else if(events.length > 0){
                var customErr = new Error('Cannot delete location due to depending event \''+events[0].name+'\'');
                next(customErr);
            }else{
                next();
            }              
        });             
    });
});

var LocationModel = mongoose.model('Location', LocationSchema);
module.exports = LocationModel;
