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
   flags        :   [{type:Schema.ObjectId, ref:'Flag', index:true}]
});

PlayerSchema.set('toObject', {getters : true});

//sanitize strings before saving
PlayerSchema.pre('save', function(next){
    var self = this || mongoose.model('Player');
    self.name = Helper.sanitizeString(self.name);
    next();
});

var PlayerModel = mongoose.model('Player', PlayerSchema);
module.exports = PlayerModel;

// create a player in DB
{
    var user = mongoose.Types.ObjectId('544635f19009d81408166e16');
    var guild = mongoose.Types.ObjectId('5446775b89d2d7b813093013');
    var weapon = mongoose.Types.ObjectId('5446609291fb5af016aaeed5');
    var witch = {
        id: 1,
        name: 'Omaimai',
        guild: guild,
        gender: 'female',
        attributes:{},
        weapon: weapon,
        inventory: []   
    };
    
    var cat = {
        id: 2,
        name: 'Moritz',
        guild: mongoose.Types.ObjectId('5446775b89d2d7b813093010'),
        gender: 'male',
        attributes:{},
        weapon: mongoose.Types.ObjectId('5446609291fb5af016aaeed5'),
        inventory: []   
    };

    var character = new Character(cat);
    console.log(character);
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