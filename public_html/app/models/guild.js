/* 
 * This is the model-file for guilds
 */

var mongoose = require('mongoose');
var Helper = require('../controllers/helper_functions.js');
var valEmpty = [Helper.valEmpty, 'The field \'{PATH}:\' must just not be empty.'];

var GuildSchema = new mongoose.Schema({
    id      : {type: Number, unique:true, required:true},
    name    : {type:String, trim:true, lowercase:true, unique:true, validate:valEmpty},
    image   : {type:String, trim:true, validate:valEmpty},
    start   : {type:Number, min:0, required:true, default:0} //if 0 means pick random location, else location-id
});

GuildSchema.pre('save', function(next){
    console.log('hello from guild-pre-save');
    // sanitize all strings
    var self = this || mongoose.model('Guild');
    self.name = Helper.sanitizeString(self.name);
    self.image = Helper.sanitizeString(self.image);
    next();
});

// restrict-delete: check if the item is used in an event and prevent deletion
GuildSchema.pre('remove', function(next){
    console.log('hello from guild pre-remove');
    var self = this || mongoose.model('Guild');
    
    self.model('Player').find({'character.guild': self._id}).exec(function(err, players){
        if(err){console.log(err); next(err);}
        console.log('hello from players-query');
        return players;
    })
    .then(function(players){
        
        self.model('Character').find({'guild':self._id}).exec(function(err, characters){
            if(err){console.log(err); next(err);}
            console.log('hello from characters-query');
            return characters;
        })
        .then(function(characters){
            if(players.length > 0){
                var customErr = new Error('Cannot delete guild due to depending player');
                console.log('yes there is an error');
                next(customErr);
            }else if(characters.length > 0){
                var customErr = new Error('Cannot delete guild due to depending character \''+characters[0].name+'\'');
                console.log('yes there is an error');
                next(customErr);
            }else{
                next();
            }   
        });             
    });
});

// get images-array
GuildSchema.statics.getImages = function(){
    // image-array of guild-images
    var images = ['elf.jpg', 'healer.jpg', 'troll.jpg', 'courtesan.jpg', 'dwarf.jpg', 'faun.jpg',
        'gnome.jpg', 'hunterPrincess.jpg', 'ninja.jpg', 'pirate.jpg', 'witchPrincess.jpg', 
        'friendlyTroll.jpg'];
    return images;

};


//update guild
GuildSchema.statics.updateGuild = function(input){
    
    var Guild = this || mongoose.model('Guild');  
    
};

var GuildModel = mongoose.model('Guild', GuildSchema);
module.exports = GuildModel;

// create some guilds
{
//    var cat = {id:1, name:'cat'};
//    var dwarf = {id:2, name:'dwarf'};
//    var warrior = {id:3, name:'warrior'};
//    var witch = {id:4, name:'witch'};
//    var wizard = {id:5, name:'wizard'};
//    var troll = {id:6, name:'troll'};
//
//
//    var guilds = [cat, dwarf, warrior, witch, wizard, troll];
//
//    for( var i=0; i< guilds.length; i++){
//        var guild = new GuildModel(guilds[i]);
//        guild.save(function(err, guild){
//            if(err){console.log(err); return;}
//            console.log('guild saved.');
//            console.log(guild);
//        });
//    }
}
