/* 
 * This file contains all functions concerning the game
 */

// get all neccessary imports
var Event = require('../models/event1.js');
var Location = require('../models/location.js');
var Item = require('../models/item.js');
var Player = require('../models/player.js');
var Guild = require('../models/guild.js');
var Weapon = require('../models/weapon.js');
var Character = require('../models/character.js');
var Helper = require('./helper_functions.js');


// start the game
exports.startGame = function(character, userId, cb){
    console.log('start game');
    Player.createNew(character, userId, function(player){
        
        console.log('player created');
        console.dir(player);
        //TODO: 
        //- get random location 
        Location.find({'start':true},'-_id',function(err, locos){
            if(err){console.log(err); return;}
            
            //get a random location
            var location = Helper.getRandomArrayItem(locos);
            console.log('random location piced: '+location.name);
            
        });
        //- initiate player at random location
        //


        return cb(player);
    });  
};




// check if attributes sum up to maxsum
exports.checkAttributeSum = function (attributes, maxSum){
    var sum=0;
    
    for( var key in attributes){
        if(key != 'maxStam'){
            var value = attributes[key];
            sum += parseInt(value);
        }        
    }    
    console.log('The sum is: '+sum);
    var valid = (sum == maxSum) ? true : false;
    console.log(valid);
    return valid;
};