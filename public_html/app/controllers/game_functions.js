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
    var reqItems = [];    
    var reqMatches = false;
    var rejectMatches = false;
    var itemMatches = false;
    var picked = 'nothing';
    console.log('hello from getRandomEvent');
    if(event.setFlag){
        console.log('a flag is set!');
        // player.addFlag() loops through player's flags and check if he already has it
        player = player.addFlag(event.flag);      
    }
    
    // loop through array of random events and get all request-flags
    for(var i=0; i<length; i++){
        console.log('random event loop nr.'+i+1);
        var randReqs = [];
        var randRejects = [];
        var rejectItems = 0; // used to store required items that player doesn't have

        // loop through req-flags of each event
        randoms[i].reqFlag.forEach(function(flag){
            console.log('there are request-flags');
            randReqs.push(flag);
        });
        
        // loop through reject-flags of each event
        randoms[i].rejectFlag.forEach(function(flag){
            randRejects.push(flag);
        });
        
        // loop through items of each event and check if there are any required items
        randoms[i].items.forEach(function(evItem){
            
//            var rejectItems = [];
            if(evItem.action === 'require'){                
                var item = evItem.item[0]._id;
                var index = player.character[0].inventory.indexOf(item);
                
                if(index >-1){
//                    randItems.push(item);
                    itemMatches = true;
                    console.log('required item found');
                }else{
                    // player does not have item - store these events in array
                    rejectItems++;
                    itemMatches = false;
                }                
            }
        });

        reqMatches = Helper.findMatchInArrays(player.flags, randReqs);
        rejectMatches = Helper.findMatchInArrays(player.flags, randRejects);
        
        // if there are the events is not rejected
        // if there are events
        if(!rejectMatches){
            // if there are any matches requiring, sort them in new array
            if(itemMatches){
                reqItems.push(randoms[i]);
            }else if(reqMatches){ 
                
                //ckeck if player doesn't have a required item              
                if(rejectItems <1){
                    reqFlags.push(randoms[i]);
                }                
            }else{
                if(rejectItems <1){
                    randomsFiltered.push(randoms[i]);
                }                
            }
        }
    } // loop through random events end
    
    // check if there were any events requiring an item the player has added
    if(reqItems.length > 0){
        console.log('an event requiring an item got picked');
        picked = Helper.getRandomArrayItem(reqItems);
        
    }else if(reqFlags.length > 0){
        console.log('a requested event got picked');
        picked = Helper.getRandomArrayItem(reqFlags);
        
    }else {
        console.log('a filtered random event got picked');
        picked = Helper.getRandomArrayItem(randomsFiltered);
    }
    
    console.log('picked: '+picked);
    
    // return player and picked event;
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
    console.log('hello from runEvent'); 
//    console.log('event: ');
//    console.dir(event);
    player.event = event._id;
    
    //save player for every event -save in processOutcome instead!!
    player.save(function(err){
        if(err){console.log(err); return;}
        console.log('player has been saved');
        console.log(player.event);
        
    });// end of player-save
    
    storyteller.write(event.text);
    // check if there are any attributes involved in event
    // check also if there are coins to lose and item-gain = buying-situation involved in event 
    if(event.attributes.length > 0){
        for(var i=0; i<event.attributes.length; i++){
            var evAttr = event.attributes[i]; 
            if(evAttr.action == 'loose'){
                var gain = false;
                // check if there are coins and if an item is to gain as well
                // then it must be a buying-situation
                // check if player has enough money, else remove item-gain
                if(evAttr.attribute == 'coins' && event.items.length > 0){
                    
                    event.items.forEach(function(item){
                        if(item.item[0].action == 'gain'){
                            gain = true;
                            return;
                        }
                    });                      
                }
                
                if(gain){
                    // TODO: check if player has enough money to buy item
                    // remove gaining-item from event if player does not have the money
                        
                } // otherwise no buying, just proceed 
                else{
                    var character = player.character[0];
                    var oldValue = character.attributes[evAttr.attribute];
                    // make player loose attributes and return player afterwards
                    player = player.looseAttr(evAttr.attribute, evAttr.amount);                
                    var newValue = player.character[0].attributes[evAttr.attribute];

                    // make sure not to take more attributes than existing
                    var newAmount = oldValue - newValue; 

                    // check if player is dead by loosing to much stamina
                    if(player == 'dead'){
                        // end the game
                        event.branchType = 'end'; 
                    }
                    console.log('player looses '+newAmount+' of '+evAttr.attribute);
                    storyteller.updateAttr(character, evAttr.attribute, newAmount, 'loose');
                }
                
                                                
            }else{
                // gain of stamina must not exceed maxstamina
                if(evAttr.attribute == 'stamina'){
                    console.log('you are about to gain stamina');
                    var maxStam = player.character[0].attributes['maxStam'];
                    var stamina = player.character[0].attributes['stamina'];
                    var newStam = evAttr.amount + stamina;
                    
                    if( newStam >= maxStam){
                        player.character[0].attributes['stamina'] = maxStam;
                        var character = player.character[0];
                        console.log('you cannot gain that much stamina');
                        var diff = newStam - maxStam;
                        var gained = evAttr.amount - diff;
                        storyteller.updateAttr(character, evAttr.attribute, gained, 'gain');
                    }else{
                        player.character[0].attributes['stamina'] += evAttr.amount;
                        var character = player.character[0];
                        storyteller.updateAttr(character, evAttr.attribute, evAttr.amount, 'gain');
                    }
                }else{
                    
                    player.character[0].attributes[evAttr.attribute] += evAttr.amount;  
                    var character = player.character[0];
                    console.log('player gains '+evAttr.amount+' of '+evAttr.attribute);
                    storyteller.updateAttr(character, evAttr.attribute, evAttr.amount, 'gain');
                }
                
                
            }
        }
    }
    // check if there are any items involved in event
    if(event.items.length > 0){
        console.log('there are items involved in this event');
       
        for(var i=0; i<event.items.length; i++){
            var evItems = event.items[i];
            var index = player.character[0].inventory.indexOf(evItems.item[0]._id);
            console.dir(evItems);
            console.log(index);
            if(evItems.action == 'loose'){
                
                if(index > -1){
                    player.character[0].inventory.splice(index,1);
                    console.log('player looses '+evItems.item[0].name);
                    var character = player.character[0];
                    storyteller.updateInventory(character, evItems.item[0], evItems.action);
                }
                
            }else if(evItems.action == 'gain'){
                
                //check if player already has item in inventory
                if(index > -1){
                    storyteller.write('You leave the '+evItems.item[0].name+' because you don\'t need more than one.');
                }else{
                    console.log('player gains item');
                    player.character[0].inventory.push(evItems.item[0]._id);
                    console.log('player gains '+evItems.item[0].name);
                    var character = player.character[0];
                    storyteller.updateInventory(character, evItems.item[0], evItems.action);
                }
                
            }
            
        }
    }    
    
    
    // check branchtype
    var branchType = event.branchType;
    var current = event._id;
    var next = {};    
    var continueTo = {};
    var continType = '';
    next.current = current;   
    
    console.log('branchType: '+branchType);

    switch(branchType){
        case 'dice':
            // roll the dices
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
    
    return next;
}

// process Outcome after running a event and decide what to do next
function processOutcome( continueChain, storyteller, result, callback ) {
    var next = {};
    var player = result['player'];
    var continType = result['continType'];
    var current = result['current']; 
    next.current = current;
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
//            console.dir('next event id = '+result['continueTo'].id);
            
            processOutcome(false,storyteller, next, callback);
        } else {
            var continueTo = result['continueTo'];
            //continue chain and trigger next event/location
            console.log('processOutcome: trigger new '+continType);
//            console.dir(continueTo);

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
//                    console.dir(loco1);
                    return loco1;
                }).then(function(loco1){
                    storyteller.write(loco1.text);
                    console.log('to do: fire new location');
//                    console.dir(loco1);
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
// continue a saved game
exports.continueSavedGame = function(character, cb){
    
    var sanChar = Helper.sanitizeString(character._id);
    
    Player.findOne({'character._id':sanChar}).populate('character character.weapon character.guild')
           .exec(function(err, player){
           if(err){ return console.log(err);}
           return player;
           
       }) 
    .then(function(player){
        
        var opts = Event.getPopuQuery();
        Event.findOne({'_id':player.event}).populate(opts).exec(function(err, event){
            if(err){ return console.log(err);}
            var data ={
                'player': player,
                'event' : event
            };
            return cb(data);
        });
        
    });
};

// start the game
exports.startGame = function(character, userId, cb){
    console.log('start game');
    // TODO: get guild-location of character and make location- select dependent on outcome . then(blaba)
    // create new player
    Player.createNew(character, userId, function(player){
        
        var selectopts = {};
        // check if the character's guild has a certain start-location, or if to pick a random one instead
        // guild.start = 0 == pick a random location for start
        if(player.character[0].guild.start == 0){
            selectopts = {'start':true};
        }else{
            selectopts = {'id':player.character[0].guild.start};
        }
        
        //- get random location 
        Location.find(selectopts,'-_id').exec(function(err, locos){
            if(err){console.log(err); return;}        
                return locos;
        }).then(function(locos){
            var location = Helper.getRandomArrayItem(locos);
            var opts = Event.getPopuQuery();
            
            Event.findOne({'_id':location.event}).populate(opts).exec(function(err, event){
                if(err){console.log(err); return;}
                return event;
            }).then(function(event){
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
        // = either got choices to ask player or game has reached its end or continue to 
        
        console.log('hello from processOutcome-callback');
        var next = {};
        var continType = endResult['continType'];
        var current = endResult['current'];
        next.continType = continType;
        next.current = current;
        next.player = endResult['player'];
        
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

// process the outcome of an eventChain
exports.processEventChain = function(data){
    
    var continType = data['continType'];
    var newData = {};

    if(continType == 'choices'){
        var choices = data['choices'];
        var current = data['current'];

        newData = {
            'choices':choices,
            'current':current
        };

    }else if(continType == 'pressContinue'){
        console.log('please press continue');

        var nextEvent = data['continueEvent'].id;
        var current = data['current'];

        newData = {
            'event':nextEvent,
            'current':current
        };
    }else {
        // you have come to the end!
        console.log('you have come to the end!');
        newData = {'end':'The end has come'};
        continType = 'end';
    }
    
    var toDo = {
        'newData':newData,
        'action' :continType
    };
    
    return toDo;
    
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