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

PlayerSchema.statics.saveGame = function(user, flags, character, event, cb){
    
    var self = this || mongoose.model('Player');
    
    // sanitize query-values
    var sanId = mongoose.Types.ObjectId(user);
    var sanChar = mongoose.Types.ObjectId(character._id);
        
    self.findOne({'user': sanId,'character._id':sanChar, 'gameSave':{$ne : 'saved'}}, function(err, player){
        if(err){return cb(err);}
        
        if(player){
            // if it's a saved game already, save it
            if(player.gameSave == 'replay'){
 
                // find the real saved player
                self.findOne({'gameSave':'saved'}, function(err, savedPlayer){
                    if(err){console.log(err);}
                    savedPlayer.event = event;
                    savedPlayer.flags = flags;
                    savedPlayer.character = player.character;
                    savedPlayer.gameSave = 'true';
                    savedPlayer.save(function(err){  
                        if(err){console.log(err);}
                        return cb(err);
                    });                    
                });                
                
            }else{
                var newPlayer = self.createNewBackup(player.character[0], user);
                newPlayer.gameSave = 'true';
                newPlayer.event = event;                
                newPlayer.flags = player.flags;
                newPlayer.save(function(err){
                    if(err){console.log('there is an error');console.log(err);}
                    return cb(err);
                });
            }
        }
    });
};

PlayerSchema.statics.returnObjectId = function(idString){

    var string = idString.toString();
    var objectId = mongoose.Types.ObjectId(string);
    return objectId;
};

// method used for creating a new player and character used for backup when disconnecting
PlayerSchema.statics.createNewBackup = function(character, userId){
            
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

PlayerSchema.statics.createNew = function (character, flags, userId, cb) {
    
    var self = this || mongoose.model('Player');
    var guildId;
    var weaponId;
    var charItems = [];
    
    // get all item-ids if there are any
    if(character.inventory.length > 0){        
        
        for(var i=0; i<character.inventory.length; i++){
            var id = character.inventory[i].id.toString();
            var sanId = Helper.sanitizeString(id);
            charItems.push(sanId); 
        }
    }
    
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
    var item = self.model('Item');
    var player = new PlayerModel();
    
    // get all object-ids of referenced fields
    item.find({'id':{$in : charItems}},'_id').exec(function(err, items){
        if(err){cb(err); return;}
        return items;
    }).then(function(items){
    
        guild.findOne({'id': guildId},'_id').exec(function(err, guild){
            if(err){cb(err); return;}
            return guild;
        })
        .then(function(guild){
            weapon.findOne({'id': weaponId},'_id').exec(function(err, weapon){
                if(err){cb(err); return;}
                return weapon;
            })
            .then(function(weapon){                
                
                var newChar = new Character();
                newChar.attributes = character.attributes;
                newChar.name = character.name;
                newChar.guild = guild._id;
                newChar.weapon = weapon._id;
                newChar.inventory = items;
                player.character.push(newChar);
                player.user = mongoose.Types.ObjectId(userId);
                player.flags = flags; 
                player.save(function(err,player){
                    if(err){cb(err); return;}
                   //repopulate
                   self.populate(player,'character.weapon character.guild',function(err, player){
                       if(err){cb(err); return;}
                       // get player also with inventory for client
                       self.populate(player, 'character.inventory', function(err, clientPlayer){
                           if(err){cb(err); return;}
                           
                           var data = {
                               'player':player,
                               'clientPlayer':clientPlayer                               
                           };
                           return cb(data);
                       });
                       
                   });
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
            return 'dead';
        }
    }
    return self;
};

PlayerSchema.methods.addFlag = function(newFlag){
 
    var self = this || mongoose.model('Player', PlayerSchema);
    var existsAlready = false;
    self.flags.forEach(function(flag){
        // object-id need to be string to be able to be compared
        var stringyfied = flag.toString();
        
        if(stringyfied == newFlag._id){
            existsAlready = true;
            return;
        }
    });
    // if it's a new flag, add it to player
    if(!existsAlready){
        self.flags.push(newFlag._id); 
    }  
    return self;
};

var PlayerModel = mongoose.model('Player', PlayerSchema);
module.exports = PlayerModel;
