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

var WeaponModel = mongoose.model('Weapon', WeaponSchema);
module.exports = WeaponModel;

// create some weapons
{
//    var trident = {id:1, name:'trident'};
//    var crossbow = {id:2, name:'crossbow'};
//    var mace = {id:3, name:'mace'};
//    var sword = {id:4, name:'sword'};
//    var dagger = {id:5, name:'dagger'};
//    var battleaxe = {id:6, name:'battleaxe'};
//
//
//    var weapons = [trident, crossbow, mace, sword, dagger, battleaxe];
//    
//    for( var j=0; j<weapons.length; j++){
//        var weapon = new WeaponModel(weapons[j]);
//        weapon.save(function(err, weapon){
//            if(err){console.log(err); return;}
//            console.log('weapon saved.');
//            console.log(weapon);
//        });
//        console.log('i = '+j);
//    }
}