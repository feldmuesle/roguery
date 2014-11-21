/* Model for locations */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Helper = require('../controllers/helper_functions.js');

//validators
var valEmpty = [Helper.valEmpty, 'The field \'{PATH}:\' must just not be empty.'];

var LocationSchema = Schema({
    id      :   {type: Number, unique:true},
    name    :   {type:String, trim:true, lowercase:true, validate:valEmpty},
    text    :   {type:String, trim:true, lowercase:true, validate:valEmpty},
    event   :   {type: Schema.Types.ObjectId, ref:'Event', index:true},
    start   :   {type:Boolean, default:false}
});

LocationSchema.set('toObject', {getters : true});

//sanitize strings before saving
LocationSchema.pre('save', function(next){
    var self = this || mongoose.model('Location');
    console.log('hello from pre-save: '+self.name);
    self.name = Helper.sanitizeString(self.name);
    self.text = Helper.sanitizeString(self.text);
    next();
});

// restrict-delete: check if the location is used by other documents
LocationSchema.pre('remove', function(next){
    console.log('hello from location pre-remove');
    var self = this || mongoose.model('Location');
    
    // check if the location is used as a start-location for a guild
    self.model('Guild').find({'start': self.id}).exec(function(err, guilds){
        if(err){console.log(err); next(err);}
        console.log('hello from guild-query');
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
                console.log('hello from events-query');
                return events;
                console.dir(events);
            })
        .then(function(events){
            if(guilds.length > 0){
                var customErr = new Error('Cannot delete location due to depending guild \''+guilds[0].name+'\'');
                console.log('yes there is an error');
                next(customErr);
            }else if(events.length > 0){
                var customErr = new Error('Cannot delete location due to depending event \''+events[0].name+'\'');
                console.log('yes there is an error');
                next(customErr);
            }else{
                next();
            }              
        });             
    });
});

var LocationModel = mongoose.model('Location', LocationSchema);
module.exports = LocationModel;

// create some locations
{
//    var forrest = {id:1, name:'forrest', text:'The path gets smaller and' 
//    +'smaller and before you notice it you are standing in the middle of the forrest.'};
//    
//    var desert = {id:2, name:'desert', text:'The vegetation gets more and more spare'+
//    'and you arrive in the desert.'};
//
//    var locations = [forrest, desert];
//    console.log(locations.length);
//    
//    for( var j=0; j<locations.length; j++){
//        var location = new LocationModel(locations[j]);
//        location.save(function(err, locations){
//            if(err){console.log(err); return;}
//            console.log('location saved.');
//            console.log(locations);
//        });
//        console.log('i = '+j);
//    }
}