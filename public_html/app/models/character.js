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
var values = Helper.getRandAttributes(130,10);

var CharacterSchema = new Schema({
    id          :   Number,
    name        :   {type:String, trim:true, lowercase:true, validate:valEmpty},
    guild       :   {type:String, ref:'Guild', index:true},
    gender      :   {type:String, trim:true, default:'male'},
    attributes  : {
            stamina  :   {type : Number, default:values[0]},
            maxStam  :   {type : Number, default:values[1]},
            charisma :   {type : Number, default:values[2]},    
            duelling :   {type : Number, default:values[3]},
            scouting :   {type : Number, default:values[4]},
            roguery  :   {type : Number, default:values[5]},
            magic    :   {type : Number, default:values[6]},
            healing  :   {type : Number, default:values[7]},
            luck     :   {type : Number, default:values[8]},
            coins    :   {type : Number, default:values[9]}
        },
    inventory   :   [{type:String, ref:'Item', index:true}],
    weapon      :   {type:String, ref:'Weapon', index:true}
});


CharacterSchema.set('toObject', {getters : true});

//
//sanitize strings before saving
CharacterSchema.pre('save', function(next){
    var self = this || mongoose.model('Character');
    self.name = Helper.sanitizeString(self.name);
    self.guild = Helper.sanitizeString(self.guild);
    self.weapon = Helper.sanitizeString(self.guild);
    
    for(var key in self.attributes){
        self.attributes[key] = Helper.sanitizeNumber(self.attributes[key]);
    }
    next();
});

CharacterSchema.statics.createForPlayer = function(charObj){
    var model = this || mongoose.model('Character');
    var character = new model();
    Guild.find({'name':charObject.guild.name}).exec(function(err, guild){
        if(err){console.log(err); return;}        
        character.guild = guild._id;
    })
    .then(
        Weapon.find({'name':charObject.weapon.name}).exec(function(err, weapon){
            if(err){console.log(err); return;}     
            character.weapon = weapon._id;
        })
    );
};

var CharacterModel = mongoose.model('Character', CharacterSchema);
module.exports = CharacterModel;


// create a character in DB
{
//    var guild = mongoose.Types.ObjectId('5446775b89d2d7b813093013');
//    var weapon = mongoose.Types.ObjectId('5446609291fb5af016aaeed5');
//    var witch = {
//        id: 1,
//        name: 'Omaimai',
//        guild: guild,
//        gender: 'female',
//        attributes:{},
//        weapon: weapon,
//        inventory: []   
//    };
//    
//    var cat = {
//        id: 2,
//        name: 'Moritz',
//        guild: mongoose.Types.ObjectId('5446775b89d2d7b813093010'),
//        gender: 'male',
//        attributes:{},
//        weapon: mongoose.Types.ObjectId('5446609291fb5af016aaeed5'),
//        inventory: []   
//    };
//    
//    var dwarf = {
//        id: 1,
//        name: 'Thurax',
//        guild: 'dwarf',//mongoose.Types.ObjectId('5446775b89d2d7b813093011'),
//        gender: 'male',
//        attributes:{},
//        weapon: 'trident',//mongoose.Types.ObjectId('5446609291fb5af016aaeed5'),
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
