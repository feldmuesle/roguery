/* Model for weapons */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Helper = require('../controllers/helper_functions.js');

//validators
var valEmpty = [Helper.valEmpty, 'The field \'{PATH}:\' must just not be empty.'];

var WeaponSchema = Schema({
    id   :   {type:Number, unique:true},
    name :   {type:String, trim:true, lowercase:true, unique:true, validate:valEmpty}
});

WeaponSchema.set('toObject', {getters : true});

//sanitize strings before saving
WeaponSchema.pre('save', function(next){
    var self = this || mongoose.model('Weapon');
    self.name = Helper.sanitizeString(self.name);
    next();
});

// restrict-delete: check if the item is used in an event and prevent deletion
WeaponSchema.pre('remove', function(next){
   
    var self = this || mongoose.model('Weapon');
    
    self.model('Player').find({'character.weapon': self._id}).exec(function(err, players){
        if(err){console.log(err); next(err);}
        return players;
    })
    .then(function(players){
        
        self.model('Character').find({'weapon':self._id}).exec(function(err, characters){
            if(err){console.log(err); next(err);}
            return characters;
        })
        .then(function(characters){
            if(players.length > 0){
                var customErr = new Error('Cannot delete weapon due to depending player');
                next(customErr);
            }else if(characters.length > 0){
                var customErr = new Error('Cannot delete weapon due to depending character \''+characters[0].name+'\'');
                next(customErr);
            }else{
                next();
            }   
        });             
    });
});

var WeaponModel = mongoose.model('Weapon', WeaponSchema);
module.exports = WeaponModel;
