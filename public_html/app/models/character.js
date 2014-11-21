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
    
    //set maxStam to random bit higher than stamina
//    var stamina = Helper.sanitizeNumber(JSON.stringify(self.attributes.stamina));
//    var rand = Helper.getRandomNumber(1,5);
//    console.log('maxstam result: '+stamina +rand);
//    self.attributes.maxStam = stamina + rand;
//    var attr = self.attributes.toObject();
//    for(var key in attr){
//        if(attr.hasOwnProperty(key)){
//            console.log('pre save character-attributes: '+key);
//            var value = attr[key];
//            self.attributes[key] = Helper.sanitizeNumber(JSON.stringify(value));
//            if(key =='maxStam'){
//                self.attributes[key] = Helper.sanitizeNumber(JSON.stringify(attr['stamina']));
//            }
//        }      
//    }
    next();
});

// restrict-delete: check if the item is used in an event and prevent deletion
CharacterSchema.pre('remove', function(next){
    console.log('hello from character pre-remove');
    var self = this || mongoose.model('Character');
    
    self.model('Player').find({'character._id': self._id}).exec(function(err, players){
        if(err){console.log(err); next(err);}
        console.log('hello from player-query');
        return players;
    })
    .then(function(players){
        if(players.length > 0){
            var customErr = new Error('Cannot delete character due to depending player');
            console.log('yes there is an error');
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


// create a character in DB
{

//    var cat = {
//        id: 2,
//        name: 'Moritz',
//        guild: mongoose.Types.ObjectId('5451451c931f36e4238895c9'),
//        gender: 'male',
//        attributes:{},
//        weapon: mongoose.Types.ObjectId('5451451c931f36e4238895c3'),
//        inventory: []   
//    };
//    
//    var dwarf = {
//        id: 1,
//        name: 'Thurax',
//        guild: mongoose.Types.ObjectId('5451451c931f36e4238895ca'),
//        gender: 'male',
//        attributes:{},
//        weapon: mongoose.Types.ObjectId('5451451c931f36e4238895c8'),
//        inventory: []   
//    };
//
//    var character = new CharacterModel(dwarf);
//    console.log(character);
//    character.save(function(err, character){
//        if(err){console.log(err); return;}
//        console.log('character saved');
//        console.log(character);
//    
//    });
}
