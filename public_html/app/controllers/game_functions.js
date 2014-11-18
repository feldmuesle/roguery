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
var attrDesc = require('../models/attributes.json');

var Helper = require('./helper_functions.js');

/******** private game functions and calculations ***********/

function rollSuperDice(player, storyteller, attribute, difficulty){
    
    var playerAttr = player.character[0].attributes[attribute]; 
    
    if(playerAttr > difficulty+5){

        // cast 20 sided superdice 
        var superDice = Helper.getRandomNumber(1,20);
        console.log('superDice '+superDice);

        // if superDice is higher than playerAttr add one point of attribute to player/increase maxStam by one                  
        if(superDice > playerAttr){
            var outcome = {
                'attribute':attribute,
                'difficulty':difficulty,
                'outcome':'win',
                'advanced':true
            };
            storyteller.rollDice(outcome);
    
            console.log('advanced!' +superDice);
            if(attribute == 'stamina'){
                player.character[0].attributes.maxStam++;
                storyteller.updateAttr('maxStam', 1, 'gain');
            }else{
                player.character[0].attributes[attribute]++;
                storyteller.updateAttr(attribute, 1, 'gain');
            }
            console.log('you gained one point of '+attribute);
            return player;
        }
    }
    // player just won dices, no superDice
    var outcome = {
        'attribute':attribute,
        'difficulty':difficulty,
        'outcome':'win',
        'advanced':false
    };
    
    storyteller.rollDice(outcome);
    return player;
}

function getRandomEvent(event, player){
    var randoms = event.continueTo.random;
    var length = randoms.length;
    var reqFlags = [];
    var randomsFiltered = [];
    var reqMatches;
    var rejectMatches;
    var picked;
    console.log('hello from getRandomEvent');
    if(event.setFlag){
        console.log('a flag is set!');
        // loop through player's flags and check if he already has it
        player = player.addFlag(event.flag);      
    }
    
    // loop through array of random events and get all request-flags
    for(var i=0; i<length; i++){
        
        var randReqs = [];
        var randRejects = [];
        
        // loop through req-flags of each event
        randoms[i].reqFlag.forEach(function(flag){
            console.log('there is some requirements');
            randReqs.push(flag);
        });
        
        // loop through reject-flags of each event
        randoms[i].rejectFlag.forEach(function(flag){
            randRejects.push(flag);
        });
        
//        for(var j=0; j< randoms[i].reqFlag.length; j++){
//            randReqs.push(randoms[i].reqFlag[j]);
//        }

//        console.dir(randoms[i]);
        reqMatches = Helper.findMatchInArrays(player.flags, randReqs);
        rejectMatches = Helper.findMatchInArrays(player.flags, randRejects);
        
        // if there are the events is not rejected
        if(!rejectMatches){
            
            // if there are any matches requiring, sort them in new array
            if(reqMatches){
                console.log('some requires match');
                reqFlags.push(randoms[i]);
            }else{
                randomsFiltered.push(randoms[i]);
            }
        }
    } // loop through random events end
    
    // check if there were any requested events added
    if(reqFlags.length > 0){
        console.log('a requested event got picked');
        picked = Helper.getRandomArrayItem(reqFlags);
    }else {
        console.log('a filtered random event got picked');
        picked = Helper.getRandomArrayItem(randomsFiltered);
    }
    
    var sendBack = {
        'player'    : player,
        'pick'      : picked
    };
    
    return sendBack;
    
    // TODO: 
    // - check each for request and reject-flags 
    // match against players flags
    // if request match, take only them
    // if no requests, check for reject and filter them away from random events, return filtered events
    // pick random event and return it for next
    // 
    
}

function rollDices(diceBranch, storyteller, player){
    console.log('roll dices');
    
    // get attribute
    var attribute = diceBranch.attribute;
    var difficulty = diceBranch.difficulty;
    var continueTo = {};
    var continType = '';
    console.log('attribute: '+attribute);
    // get players amount of attribute
    var playerAttr = player.character[0].attributes[attribute]; 
    console.log('playerAttr: '+playerAttr);
    // roll dices
    var dice1 = Helper.getRandomNumber(1,6);
    console.log('dice1 '+dice1);
    var dice2 = Helper.getRandomNumber(1,6);
    console.log('dice2 '+dice2);
    // add dices to players amount of given attribute
    var playerAttr = player.character[0].attributes[attribute]+dice1 + dice2; 
    
    
    if(playerAttr > difficulty){
        // player wins dice
        // check if the roll is advanced
        player = rollSuperDice(player, storyteller, attribute, difficulty);
        
        continType = diceBranch.success.type;
        
        if(continType == 'succLoco'){
            continueTo = diceBranch.success.location;
            continType = 'location';
            console.log('success continue to location: '+diceBranch.success.location.name);
        }else{
            continueTo = diceBranch.success.event;
            continType = 'event';
            console.log('success continue to event: '+diceBranch.success.event.name);
        }
        

    }else{
        console.log('you got beaten!');
        // tell player about outcome of dice-rolls
                       
        var outcome = {
            'attribute':attribute,
            'difficulty':difficulty,
            'outcome':'loose',
            'advanced':false
        };
        storyteller.rollDice(outcome);
        
        //special for magic-rolls beat-up: loose 1 or 2 stamina(rand)
        if(attribute == 'magic'){
            var rand = Helper.getRandomNumber(1,2);
            player.character[0].attributes.stamina -= rand;
            storyteller.updateAttr(player.character[0], attribute, rand, 'loose');
        }
        
        continType = diceBranch.failure.type;
        
        if(continType == 'succLoco'){
            continueTo = diceBranch.failure.location;
            continType = 'location';
            console.log('failure continue to location: '+diceBranch.failure.location.name);
        }else{
            continueTo = diceBranch.failure.event;
            continType = 'event';
            console.log('failure continue to event: '+diceBranch.failure.event.name);
        }
    }
    
    var data={
        'continType': continType,
        'continueTo': continueTo,
        'player'    : player
    };
    return data;
}

// run a single event and return the player(with added/lost attr, items) and where to continueTo next
function runEvent(storyteller, player, event){
    console.log('hello from runEvent'); //, player is: '+player);
    console.log('event: '+event.name);
    storyteller.write(event.text);
    // check if there are any attributes involved in event
    if(event.attributes.length > 0){
        for(var i=0; i<event.attributes.length; i++){
            var evAttr = event.attributes[i];
            if(evAttr.action == 'loose'){
                var character = player.character[0];
                player = player.looseAttr(evAttr.attribute, evAttr.amount);
                
                // check if player is dead by loosing to much stamina
                if(player == 'dead'){
                    // end the game
                    event.branchType = 'end'; 
                    character.attributes['stamina'] = 0;
                    
                }else{
                    character = player.character[0];
                }
                console.log('player looses '+evAttr.amount+' of '+evAttr.attribute);
                storyteller.updateAttr(character, evAttr.attribute, evAttr.amount, 'loose');
                                                
            }else{
                player.character[0].attributes[evAttr.attribute] += evAttr.amount;
                var character = player.character[0];
                console.log('player gains '+evAttr.amount+' of '+evAttr.attribute);
                storyteller.updateAttr(character, evAttr.attribute, evAttr.amount, 'gain');
            }
        }
    }
    // check if there are any items involved in event
    if(event.items.length > 0){
        for(var i=0; i<event.items.length; i++){
            var evItems = event.items[i];
            if(evItems.action == 'loose'){
                player.character[0].attributes[evItems.attribute] -= evItems.amount;
                console.log('player looses '+evAttr.amount+' of '+evItems.item.name);
            }else if(evItems.action == 'gain'){
                player.character[0].items.push(evItems.item.name);
                console.log('player gains '+evItems.amount+' of '+evItems.item.name);
            }
        }
    }    
    
    
    // check branchtype
    var branchType = event.branchType;
    var next = {};
    var continueTo = {};
    var continType = '';
    
    console.log('branchType: '+branchType);
//    console.dir(event);
    switch(branchType){
        case 'dice':
            //TODO: roll the dices
            // get players attribute vs dice
            var result = rollDices(event.dice, storyteller, player);
            continType = result['continType'];
            continueTo = result['continueTo']; // == event/location from dice-roll
            player = result['player'];
            console.log('hello after roll dices');            
            break;
        
        case'choices':
            continType = 'choices';
            next.choices = event.choices;
            break;
            
        case'continue':
            console.log('continue');
            if(event.continueTo.type == 'continueLoco'){
                console.log('continue to a location;');
                continType = 'location';
                continueTo = event.continueTo.location;
            }else if(event.continueTo.type == 'continueEvent'){
                console.log('continue to a event;');
                continType = 'event';
                continueTo = event.continueTo.event;
            }else{
                // pick a random location 
                console.log('hello from game-machine, random continue');
                var nextStep = getRandomEvent(event, player);
                continType = 'event';
                continueTo = nextStep['pick'];
                player = nextStep['player'];
                console.log('random event has been picked');
                
            }
            break;
            
        case'end':
            
            if(player == 'dead'){
                continType = 'dead';
            }
            break;
            
    } 
    next.continType =  continType;
    next.continueTo = continueTo;
    next.player = player;
        
    //save player for every event
    player.save(function(err){
        if(err){console.log(err); return;}
        console.log('player has been saved');
        
    });
    return next;
}

// process Outcome after running a event and decide what to do next
function processOutcome( continueChain, storyteller, result, callback ) {
    var next = {};
    var player = result['player'];
    var continType = result['continType'];
    next.continType = continType;
    next.player = result['player'];
//    console.log('hello from processOutcoume');
//    console.dir(result);
    if(continueChain){
        
        if(continType == 'choices') {
            console.log('processOutcome: choices given, let player decide');    
            next.choices = result['choices']; // expect array of objId
            processOutcome(false,storyteller, next, callback);
            //query events to get choices-text, ids
            //stop the chain and return cb with choices
            
        } else if(continType == 'event' && result['continueTo'].newPara){
            console.log('next event start a new paragraph');
            next.continType = 'pressContinue';             
            next.continueEvent = result['continueTo'];
            console.dir('next event id = '+result['continueTo'].id);
            
            processOutcome(false,storyteller, next, callback);
        } else {
            var continueTo = result['continueTo'];
            //continue chain and trigger next event/location
            console.log('processOutcome: trigger new '+continType);
            console.dir(continueTo);

            if(continType == 'event'){
                // get new event from db and trigger a new event
                var opts = Event.getPopuQuery();
                Event.findOne({'id': continueTo.id}).populate(opts).exec(function(err,event1){
                    if(err){console.log(err); return;}
                    console.log('to do: fire new event');
                    var result = runEvent(storyteller, player, event1);
                    processOutcome( true, storyteller, result, callback );
                });
            }else{
                console.log('continue to location - test here');
                // trigger a new location
                Location.findOne({'id': continueTo.id}, '-_id').populate('event').exec(function(err,loco1){
                    if(err){console.log(err); return;}
                    console.log('from within location-query');
                    console.dir(loco1);
                    return loco1;
                }).then(function(loco1){
                    storyteller.write(loco1.text);
                    console.log('to do: fire new location');
                    console.dir(loco1);
                    next.continType = 'event';
                    next.continueTo = loco1.event;                    
                    processOutcome(true,storyteller, next, callback);               
                });
            }
        }  
    }else{
        console.log('continueChain is false');
        callback(result);
    }
};

/****** exported game-functions **************/
// start the game
exports.startGame = function(character, userId, cb){
    console.log('start game');
    
    // create new player
    Player.createNew(character, userId, function(player){
        
        console.log('player created and repopulated with weapon and guild');
//        console.dir(player);
        
        //TODO: 
        //- get random location 
        Location.find({'start':true},'-_id').exec(function(err, locos){
            if(err){console.log(err); return;}        
                return locos;
        }).then(function(locos){
            var location = Helper.getRandomArrayItem(locos);
            var opts = Event.getPopuQuery();
//            var opts = Event.getPopuQuery();
            Event.findOne({'_id':location.event}).populate(opts).exec(function(err, event){
                if(err){console.log(err); return;}
                return event;
            }).then(function(event){
                
                //get a random location
                
                console.log('random location picked: '+location.name);
                
                var data = {
                    'location'  : location,
                    'event'     : event,
                    'player'    : player
                };
                
                return cb(data);
            });
        });
    });  
};

// run events until choices are given and player has to decide next turn
exports.runEventChain = function(storyteller, player, event, cb){
    console.log('run event chain');
    console.log('player - userId = '+player.user);
    var result = runEvent(storyteller, player, event);
    
    processOutcome(true, storyteller, result, function(endResult){
        // the callback is first triggered when there are no more events to continue
        // = either got choices to ask player or game has reached its end or continue to location
        var next = {};
        var continType = endResult['continType'];
        next.continType = continType;
        next.player = endResult['player'];
        console.log('hello from processOutcome-callback');
        //TODO: if next event starts as a new paragraph, stop chain and let player press continue in order to process
        if(continType == 'pressContinue'){
            console.log('a new paragraph should start');
            next.continueEvent = endResult['continueEvent'];
            return cb(next);
        }        
        else if(continType == 'choices') {
            console.log('choices given, let player decide');        
            next.choices = endResult['choices']; // expect array of objId
            return cb(next);
            //query events to get choices-text, ids
            //stop the chain and return cb with choices
        }else if(continType == 'location'){
            //TODO: triggerLocation
        }else{
            console.log('the game has ended here');
        }
    });  
};

// get a choice by eventId
exports.getChoice = function(eventId, cb){
    var id = Helper.sanitizeNumber(eventId);
    var opts = Event.getPopuQuery();
    Event.findOne({'id':id}).populate(opts).exec(function(err, event){
       if(err){console.log(err); return;}
       return cb(event);
    });
};

// check if attributes sum up to maxsum
exports.checkAttributeSum = function (attributes, maxSum){
    var sum=0;
    
    for( var key in attributes){
        if(key != 'maxStam' && key !='coins'){
            var value = attributes[key];
            sum += parseInt(value);
        }        
    }    
    console.log('The sum is: '+sum);
    var valid = (sum == maxSum) ? true : false;
    console.log(valid);
    return valid;
};

exports.getAttrDescriptions = function(){
    return attrDesc;
};