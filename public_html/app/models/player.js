 /* This file contains the model for the player */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Helper = require('../controllers/helper_functions.js');
var Character = require('./character.js');

//validators
var valEmpty = [Helper.valEmpty, 'The field \'{PATH}:\' must just not be empty.'];

var PlayerSchema = Schema({
   character    :   [Character.schema],
   user         :   {type:Schema.ObjectId, ref:'User', required:true},
   flags        :   [{type:Schema.ObjectId, ref:'Flag', index:true}],
   event        :   {type:Schema.ObjectId, ref:'Event', index:true},
   gameSave     :   {type:String, default:'false'}
});

PlayerSchema.set('toObject', {getters : true});

PlayerSchema.statics.saveGame = function(user, character, event, cb){
    
    var self = this || mongoose.model('Player');
    
    // sanitize query-values
    var sanId = mongoose.Types.ObjectId(user);
    var sanChar = mongoose.Types.ObjectId(character._id);
    
    console.log('sanId: '+sanId);
    console.log('sanChar: '+sanChar);
    
    self.findOne({'character._id':sanChar}, function(err, player){
        if(err){console.log(err); return;}
        if(player){
            
            console.log('the player to save has been found');
            console.dir(player);
//            player.character[0] = character;
            player.event = event; 
            player.gameSave = 'true'; 

            player.save(function(err){
                
                console.log('player has been saved for real.');
                return cb(err);
            });
        }
    });
};

PlayerSchema.statics.returnObjectId = function(idString){
    console.log('try to cast to objectId');
    var string = idString.toString();
    console.log(string);
    var objectId = mongoose.Types.ObjectId(string);
    console.log(objectId);
    return objectId;
};

// method used for creating a new player and character used for backup when disconnecting
PlayerSchema.statics.createNewBackup = function(character, userId){
    console.log('create new Player');
    var self = this || mongoose.model('Player');
    
    var player = new PlayerModel();
    var newChar = new Character();
    newChar.id = character.id;
    newChar.name = character.name;
    newChar.attributes = character.attributes;
    newChar.gender = character.gender;
    newChar.guild = character.guild;
    newChar.weapon = character.weapon;
    newChar.inventory = character.inventory; 
    
    player.user = userId;
    player.character = newChar;
    
    return player;
    
};

PlayerSchema.statics.createNew = function (character, userId, cb){
    console.log('create new Player');
    var self = this || mongoose.model('Player');
    var guildId;
    var weaponId;
    // check if the guildId is a string or in an object
    if(character.guild.id){
        // sanitize values used for getting objectIds of guild and weapon
        guildId = Helper.sanitizeNumber(JSON.stringify(character.guild.id));
        weaponId = Helper.sanitizeNumber(JSON.stringify(character.weapon.id));
    }else{
        guildId = Helper.sanitizeNumber(character.guild);
        weaponId = Helper.sanitizeNumber(character.weapon);
    }   
    
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

/******* methods **********************/
PlayerSchema.methods.looseAttr = function(attr, amount){
    var self = this || mongoose.model('Player');
    var own = self.character[0].attributes[attr];
    if(own - amount > 0){
        self.character[0].attributes[attr] -= amount;
    }else {
        self.character[0].attributes[attr] = 0;
        if(attr == 'stamina'){
            console.log('it all became too much for you, you died');
            return 'dead';
        }
    }
    console.log('new '+attr+': '+self.character[0].attributes[attr]);
    return self;
};

PlayerSchema.methods.addFlag = function(newFlag){
    var self = this || mongoose.model('Player', PlayerSchema);
    var existsAlready = false;
    self.flags.forEach(function(flag){
            if(flag == newFlag){
                existsAlready = true;
                return;
            }
        });
    // if it's a new flag, add it to player
    if(!existsAlready){
        self.flags.push(newFlag._id); 
        console.log('new flag added to player');
    }  
    return self;
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