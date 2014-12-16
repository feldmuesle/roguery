/* 
 * This is the model-file for playing characters
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Helper = require('../controllers/helper_functions.js');
var Item = require('./item.js');
var Weapon = require('./weapon.js');
var Guild = require('./guild.js');
var valEmpty = [Helper.valEmpty, 'The field \'{PATH}:\' must just not be empty.'];
var values = Helper.getRandAttributes(120,10);

var CharacterSchema = new Schema({
    id          :   {type : Number},
    name        :   {type:String, trim:true, validate:valEmpty},
    guild       :   {type: Schema.Types.ObjectId, ref:'Guild', index:true, required:true},
    gender      :   {type:String, trim:true, default:'male'},
    attributes  : {
            stamina  :   {type : Number, default:values[0]},
            maxStam  :   {type : Number, default:values[0]+5},
            charisma :   {type : Number, default:values[1]},    
            duelling :   {type : Number, default:values[2]},
            scouting :   {type : Number, default:values[3]},
            roguery  :   {type : Number, default:values[4]},
            heroism  :   {type : Number, default:values[5]},
            streetwise:  {type : Number, default:values[6]},    
            magic    :   {type : Number, default:values[7]},
            healing  :   {type : Number, default:values[8]},
            luck     :   {type : Number, default:values[9]},
            coins    :   {type : Number, default:20}
        },
    inventory   :   [{type: Schema.Types.ObjectId, ref:'Item', index:true}],
    weapon      :   {type: Schema.Types.ObjectId, ref:'Weapon', index:true, required:true}
});


CharacterSchema.set('toObject', {getters : true});

//
//sanitize strings before saving
CharacterSchema.pre('save', function(next){
    
    var self = this || mongoose.model('Character');
    // sanitize strings
    self.name = Helper.sanitizeString(self.name);
    next();
});

// restrict-delete: check if the item is used in an event and prevent deletion
CharacterSchema.pre('remove', function(next){
    
    var self = this || mongoose.model('Character');
    
    self.model('Player').find({'character._id': self._id}).exec(function(err, players){
        if(err){console.log(err); next(err);}        
        return players;
    })
    .then(function(players){
        if(players.length > 0){
            var customErr = new Error('Cannot delete character due to depending player');
            next(customErr);
        }else{
            next();
        }                      
    });
});

CharacterSchema.statics.createForPlayer = function(charObj){
    var model = this || mongoose.model('Character');
    var character = new model();
    // set amount of coins to default
    character.attributes.coins = COINS;
    
    Guild.find({'name':charObj.guild.name}).exec(function(err, guild){
        if(err){console.log(err); return;}        
        character.guild = guild._id;
    })
    .then(
        Weapon.find({'name':charObj.weapon.name}).exec(function(err, weapon){
            if(err){console.log(err); return;}     
            character.weapon = weapon._id;
        })
    );
};

var CharacterModel = mongoose.model('Character', CharacterSchema);
module.exports = CharacterModel;
