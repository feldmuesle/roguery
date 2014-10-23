/* 
 * This file contains all functions concerning the game
 */

// get all neccessary imports

var Item = require('../models/item.js');
var Player = require('../models/player.js');
var Guild = require('../models/guild.js');
var Weapon = require('../models/weapon.js');
var Character = require('../models/character.js');

// start the game
exports.startGame = function(character){
    var playingChar = Character.createNew(character);
    //TODO: create new player with character
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