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
var values = Helper.getRandAttributes(130,12);

var CharacterSchema = new Schema({
    id          :   Number,
    name        :   {type:String, trim:true, lowercase:true, validate:valEmpty},
    guild       :   {type: Schema.Types.ObjectId, ref:'Guild', index:true},
    gender      :   {type:String, trim:true, default:'male'},
    attributes  : {
            stamina  :   {type : Number, default:values[0]},
            maxStam  :   {type : Number, default:values[1]},
            charisma :   {type : Number, default:values[2]},    
            duelling :   {type : Number, default:values[3]},
            scouting :   {type : Number, default:values[4]},
            roguery  :   {type : Number, default:values[5]},
            heroism  :   {type : Number, default:values[6]},
            streetwise:  {type : Number, default:values[7]},    
            magic    :   {type : Number, default:values[8]},
            healing  :   {type : Number, default:values[9]},
            luck     :   {type : Number, default:values[10]},
            coins    :   {type : Number, default:values[11]}
        },
    inventory   :   [{type: Schema.Types.ObjectId, ref:'Item', index:true}],
    weapon      :   {type: Schema.Types.ObjectId, ref:'Weapon', index:true}
});


CharacterSchema.set('toObject', {getters : true});

//
//sanitize strings before saving
CharacterSchema.pre('save', function(next){
    var self = this || mongoose.model('Character');
    self.name = Helper.sanitizeString(self.name);
//    var attr = self.attributes.toObject();
//    var attrib = Object.keys(attr);
//    console.log('self '+self);
//    console.log('self attributes '+self.attributes);
//    console.dir(attr);
//    console.log('self attributes '+attrib);
//    for(var key in attr){
//        if(attr.hasOwnProperty(key)){
//            console.log('pre save character-attributes: '+key);
//            var value = attr[key];
//            attr[key] = Helper.sanitizeNumber(parseInt(value));
//        }      
//    }
    next();
});

CharacterSchema.statics.createForPlayer = function(charObj){
    var model = this || mongoose.model('Character');
    var character = new model();
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
