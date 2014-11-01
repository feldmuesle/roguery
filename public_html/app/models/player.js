/* This file contains the model for the player */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Helper = require('../controllers/helper_functions.js');
var Character = require('./character.js');

//validators
var valEmpty = [Helper.valEmpty, 'The field \'{PATH}:\' must just not be empty.'];

var PlayerSchema = Schema({
   character    :   [Character.schema],
   user         :   {type:Schema.ObjectId, ref:'User'},
   flags        :   [{type:Schema.ObjectId, ref:'Flag', index:true}],
   event        :   {type:Schema.ObjectId, ref:'Flag', index:true},
   gameSave     :   {type:Boolean, default:false}
});

PlayerSchema.set('toObject', {getters : true});

//sanitize strings before saving
PlayerSchema.pre('save', function(next){
    var self = this || mongoose.model('Player');
    self.name = Helper.sanitizeString(self.name);
    next();
});

PlayerSchema.statics.createNew = function (character, userId, cb){
    console.log('create new Player');
    var self = this || mongoose.model('Player');
    // sanitize values used for getting objectIds of guild and weapon
    var guildId = Helper.sanitizeNumber(JSON.stringify(character.guild.id));
    var weaponId = Helper.sanitizeNumber(JSON.stringify(character.weapon.id));
    var guild = self.model('Guild');
    var weapon = self.model('Weapon');
    var player = new PlayerModel();
    
    
    guild.findOne({'id': guildId},'_id').exec(function(err, guild){
        if(err){console.log(err); return;}
        return guild;
    })
    .then(function(guild){
        weapon.findOne({'id': weaponId},'_id').exec(function(err, weapon){
            if(err){console.log(err); return;}
            return weapon;
        })
        .then(function(weapon){
            character.guild = guild._id;
                character.weapon = weapon._id;
                player.character = character;
                player.user = mongoose.Types.ObjectId(userId);
                player.save(function(err,player){
                    if(err){console.log(err); return;}
                   //repopulate
                   self.populate(player,'character.weapon character.guild',function(err, player){
                       if(err){console.log(err); return;}
                       return cb(player);
                   });
                });                
        });
    });
  
};

var PlayerModel = mongoose.model('Player', PlayerSchema);
module.exports = PlayerModel;

// create a player in DB
{
//    var user = mongoose.Types.ObjectId('544635f19009d81408166e16');
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
//    var dwarf = {
//        id: 3,
//        name: 'Thurax',
//        guild: mongoose.Types.ObjectId('5446775b89d2d7b813093011'),
//        gender: 'male',
//        attributes:{},
//        weapon: mongoose.Types.ObjectId('5446609291fb5af016aaeed5'),
//        inventory: [mongoose.Types.ObjectId('54465bb75b0df4d814539619'),
//                    mongoose.Types.ObjectId('54465bb75b0df4d81453961c')]   
//    };
//
//    var character = new Character(dwarf);
//    console.log(character);
//    var player = new PlayerModel();
//    player.character = character;
//    player.user = user;
//    player.save(function(err, player){
//        if(err){console.log(err); return;}
//        console.log('player saved');
//        console.log(player);
//    
//    });
}