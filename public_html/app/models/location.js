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
    event   :   {type: Schema.Types.ObjectId, index:true}
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