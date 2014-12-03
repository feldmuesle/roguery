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
    
    if(playerAttr >= difficulty+5){

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
                storyteller.updateAttr(player.character[0],'stamina', 1, 'gain');
            }else{
                player.character[0].attributes[attribute]++;
                storyteller.updateAttr(player.character[0], attribute, 1, 'gain');
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

// filter away choices that request flags/items player doesn't have or reject flags
function filterChoices(event, player){
    console.log('hello from filter choices');
    var choices = event.choices; // array of objectIds
    var length = choices.length;  
    var reqMatches = false;
    var rejectMatches = false;    
    var filtered = [];
    
    // loop through array of random events and get all request-flags
    for(var i=0; i<length; i++){
        console.log('filter choices loop nr.'+i+1);
        console.log('choice: '+choices[i].name);
        var choiceReqs = [];
        var choiceRejects = [];
        var itemMatches = true;
        var hasItem = false;
        var hasRequires = false; 
        

        // loop through req-flags of each event
        choices[i].reqFlag.forEach(function(flag){
            console.log('there are request-flags, gets added to req-array');
            hasRequires = true;
            choiceReqs.push(flag);
        });
        if(choices[i].reqFlag.length <1){
            console.log('choice has no flags required');
            reqMatches = 'none';
        }
        
        // loop through reject-flags of each event
        choices[i].rejectFlag.forEach(function(flag){
            console.log('there are reject-flags, gets added to reject-array');
            choiceRejects.push(flag);
        });
        if(choices[i].rejectFlag.length <1){
            console.log('choice has no flags rejected');
        }
        
        // loop through items of each event and check if there are any required items
        choices[i].items.forEach(function(evItem){            
            
            if(evItem.action === 'require'){                
                var item = evItem.item[0]._id;
                var index = player.character[0].inventory.indexOf(item);
                hasItem = true; 
                if(index < 0){
                    // player does not have item                     
                    itemMatches = false;
                    console.log('player does not have required item.');
                }else{
                    console.log('player has required item');
                }             
            }else{
                console.log('items otherwise engaged than required');
                
            }
        });
        
        if(choices[i].items.length <1){
            console.log('choice has no items attached');
            itemMatches = 'none';
        }

        reqMatches = Helper.findMatchInArrays(player.flags, choiceReqs);
        rejectMatches = Helper.findMatchInArrays(player.flags, choiceRejects);
        console.log('reqMatches: '+reqMatches);
        console.log('rejectMatches: '+rejectMatches);
        // if no match the events is not rejected
        if(!rejectMatches){
            // if there are any matches requiring, sort them in new array
            if((itemMatches && reqMatches) || (itemMatches && !hasRequires)||(reqMatches && !hasItem) ){
                console.log('choice matches or no match needed, added');
                filtered.push(choices[i]);
            }else{
                console.log('item or requested flag not matched. filtered away.');
            }
        }else{
            console.log('choice got rejected');
        }
    } // loop through random events end
        
    console.log(filtered.length +' filtered choices');
    return filtered;
}

function getRandomEvent(event, player){
    var randoms = event.continueTo.random;
    var length = randoms.length;
    var filtered = [];
    var reqItems = []; // array stores only events requiring items the player has
    
    var picked = 'nothing';
    console.log('hello from getRandomEvent');
    if(event.setFlag){
        console.log('a flag is set within reandom! '+event.flag);
        // player.addFlag() loops through player's flags and check if he already has it
        player = player.addFlag(event.flag);      
    }
    
    // loop through array of random events and get all request-flags
    for(var i=0; i<length; i++){
        console.log('random event loop nr.'+i+1);
        console.log(randoms[i].name);
        var reqMatches = true;
        var rejectMatches = false;
        var itemMatches = true;

        // check if event has any flags required
        if(randoms[i].reqFlag.length >0){
            // loop through req-flags of each event
            randoms[i].reqFlag.forEach(function(flag){
                var index = player.flags.indexOf(flag);
                if(index < 0){
                    reqMatches = false;
                    console.log('player does not have required flag');
                }else{
                    console.log('player has required flag');
                }
            });
        }else{
          console.log('event has no flags required');  
        }
        
        // check if event has any flags required
        if(randoms[i].rejectFlag.length >0){
            // loop through reject-flags of each event
            randoms[i].rejectFlag.forEach(function(flag){
                var index = player.flags.indexOf(flag);
                if(index >= 0){
                    rejectMatches = true;
                    console.log('event rejects players flag');
                }else{
                    console.log('player has not rejected flag');
                }
            });
        }else{
            console.log('event has no flags required');  
        }
        
        
        // check if event has any flags required
        if(randoms[i].items.length >0){
            // loop through items of each event and check if there are any required items
            randoms[i].items.forEach(function(evItem){

    //            var rejectItems = [];
                if(evItem.action === 'require'){                
                    var item = evItem.item[0]._id;
                    var index = player.character[0].inventory.indexOf(item);
                    console.log('index');
                    if(index < 0){
                        itemMatches = false;
                        console.log('player does not have required item');
                    }else{
                        if(!rejectMatches){
                            console.log('player has requested item');
                            reqItems.push(randoms[i]);
                        }                    
                    }
                }else{
                    console.log('items engaged in other means.');
                }
            });
        
        }else{
            console.log('event has no items attached');  
        }
        
        
        // if there are the events is not rejected
        // if there are events
        if(!rejectMatches){
            // if there are any matches requiring, sort them in new array
            if(itemMatches && reqMatches){
                filtered.push(randoms[i]);  
                console.log('random event passed filter');
            }else{
                console.log('player does not have required item or flag, event filtered away');
            }
            
        }else{
            console.log('player has flag rejected by this event, event filtered away');
        }
    } // loop through random events end
    console.log('filtered events: '+filtered.length);
    // check if there were any events requiring an item the player has added
    if(filtered.length > 0){
        // if the event requires an item which the player has, its in reqItems-array
        // pick that event
        if(reqItems.length > 0){
            console.log('an event requiring an item got picked');
            picked = Helper.getRandomArrayItem(reqItems);    
        }else{
            console.log('an event without requiring an item got picked');
            picked = Helper.getRandomArrayItem(filtered); 
        }               
    }else{
        console.log('all random events got filtered away');
        picked = 'none';
    }
    
    console.log('picked: '+picked.name);
    
    // return player and picked event;
    var sendBack = {
        'player'    : player,
        'pick'      : picked
    };
    
    return sendBack;    
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
    console.log('playerAttr to begin with: '+playerAttr);
    // roll dices
    var dice1 = Helper.getRandomNumber(1,6);
    console.log('dice1 '+dice1);
    var dice2 = Helper.getRandomNumber(1,6);
    console.log('dice2 '+dice2);
    // add dices to players amount of given attribute
    var playerAttr = player.character[0].attributes[attribute]+dice1 + dice2; 
    console.log('playerAttr with dices: '+playerAttr);
    
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
//            console.log('this is a magic roll');
            var rand = Helper.getRandomNumber(1,2);
            console.log('failed magic-roll:player should loose '+rand+' of stamina');
            if(player.character[0].attributes.stamina - rand > 1){
                player.character[0].attributes.stamina -= rand;
                storyteller.updateAttr(player.character[0], 'stamina', rand, 'loose');
//                console.log('player lost stamina because of lost magic-roll');
            }
            
        } 
        
        continType = diceBranch.failure.type;
        console.log('failure continType: '+continType);
        if(continType == 'failLoco'){
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
    var condition = 'alive';
//    console.log('event: ');
//    console.dir(event);
    player.event = event._id;
    
    // set flag if event has one set
    if(event.setFlag){
        console.log('a flag is set!' +event.flag);
        // player.addFlag() loops through player's flags and check if he already has it
        player = player.addFlag(event.flag);      
    }
    
    
    player.markModified('flags');
    player.character[0].markModified('inventory');
    //save player for every event -save in processOutcome instead!!
    player.save(function(err){
        if(err){console.log(err); console.log('there is an error'); return;}
//        console.dir(doc);
        console.log('player in event has been saved');
//       console.log('inventory:'+player.character[0].inventory);
//       console.log('flags:'+player.flags);
        
    });// end of player-save
    
    
    if(event.text.length >0){
        storyteller.write(event.text);
    }
    
//    console.dir(event);
    
    // check if there are any attributes involved in event
    // check also if there are coins to lose and item-gain = buying-situation involved in event 
    if(event.attributes.length > 0){
        console.log('there are attributes');
        for(var i=0; i<event.attributes.length; i++){
            var evAttr = event.attributes[i]; 
            if(evAttr.action == 'loose'){
                var noThanks = false;
                var buy = false;
                // check if there are coins and if an item is to gain as well
                // then it must be a buying-situation
                // check if player has enough money, else remove item-gain  
                
                if(evAttr.attribute == 'coins' && event.items.length > 0){
                    
                    var playerCoins = player.character[0].attributes['coins'];
                    console.log('player has '+playerCoins+' available.');
                    
                    // loop through all items the event has
                    for(var i=0; i< event.items.length; i++){ 
                    
                        if(event.items[i].action == 'gain'){
                            // check if player got item in inventory
//                            var itemId = event.items[i].item[0].id;
                            var itemId = event.items[i].item[0]._id;
//                            var index = Helper.getIndexByKeyValue(player.character[0].inventory,'id',itemId);
                            var index = player.character[0].inventory.indexOf(itemId);
                            

                            if(index >=0){
                                var msg = 'Luckily you have already '
                                            +event.items[i].item[0].name;
                                msg += ' and don\'t need to buy one.';
                                storyteller.write(msg);
                                event.items.splice(i,1);
                                noThanks = true;
                            } else{
                                

                                // if player can't afford it
                                if(playerCoins < evAttr.amount){  
                                    var msg = 'You don\'t have enough coins to buy '
                                            +event.items[i].item[0].name;
                                    storyteller.write(msg);
                                    event.items.splice(i,1);
                                    noThanks = true;

                                }else{
                                    console.log('player can afford it!');

                                    player = player.looseAttr('coins', evAttr.amount);
                                    var character = player.character[0];
                                    var msg = 'You buy '+event.items[i].item[0].name;
                                    storyteller.write(msg);
//                                    storyteller.updateAttr(character, evAttr.attribute, evAttr.amount, 'loose');
                                    buy = true;
                                }    
                            }                                            
                        }
                    }
                }
                
                if(!noThanks || buy){
                    console.log('gain is false');
                    var character = player.character[0];
                    var oldValue = character.attributes[evAttr.attribute];
                    // make player loose attributes and return player afterwards
                    condition = player.looseAttr(evAttr.attribute, evAttr.amount); 
                    // check if player is dead by loosing to much stamina
                    console.log('condition: '+condition);
                    
                    var newValue = player.character[0].attributes[evAttr.attribute];

                    // make sure not to take more attributes than existing
                    var newAmount = oldValue - newValue; 

                    
                    console.log('player looses '+newAmount+' of '+evAttr.attribute);
                    storyteller.updateAttr(character, evAttr.attribute, newAmount, 'loose');
                    
                    if(condition == 'dead'){
                        // end the game
                        console.log('player has died.');
                        //remove all items of event - they are not needed
                        event.items = [];
                        event.branchType = 'end'; 
                        event.attributes = [];
                    }else {
                        player = condition;
                    }
                }
                
                                                
            }else{
                // gain of stamina must not exceed maxstamina
                if(evAttr.attribute == 'stamina'){
                    console.log('you are about to gain stamina');
                    var maxStam = player.character[0].attributes['maxStam'];
                    var stamina = player.character[0].attributes['stamina'];
                    var newStam = evAttr.amount + stamina;
                    // if the added stamina exceeds maxStam
                    if( newStam >= maxStam){
                        // set stamina to maxstam
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
            var id = evItems.item[0].id;
            var index = -1;
            console.dir(evItems);
            console.dir(player.character[0].inventory);
            
            if(player.character[0].inventory.length > 0){
                var isPopulated = Helper.checkArrayForObject(player.character[0].inventory);
                
                if(isPopulated){
                    console.log('players inventory is populated');
                    index = Helper.getIndexByKeyValue(player.character[0].inventory,'id',id);

                }else{
                    id= evItems.item[0]._id;
                    console.log('players inventory is not populated');
                    index = player.character[0].inventory.indexOf(id);
                }
            }
            
            console.log('index: '+index);
            
            if(evItems.action == 'loose'){
                
                if(index != null && index >= 0){
                    player.character[0].inventory.splice(index,1);
                    console.log('player looses '+evItems.item[0].name);
                    var character = player.character[0];
                    storyteller.updateInventory(character, evItems.item[0], evItems.action);
                }
                
            }else if(evItems.action == 'gain'){
                
                //check if player already has item in inventory
                if(index != null && index >= 0){
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
            // roll the dices and get players attribute vs dice outcome
            var result = rollDices(event.dice, storyteller, player);
            continType = result['continType'];
            continueTo = result['continueTo']; // == event/location from dice-roll
            player = result['player'];           
            break;
        
        case'choices':
            var choices = filterChoices(event, player);
            console.dir(choices);
            if(choices.length < 1){
                continType = 'systemErr';
                next.choices = null;
            }else{
                continType = 'choices';
                next.choices = choices;
            }            
            break;
            
        case'continue':
            
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
                var result = getRandomEvent(event, player);
                
                // check if any are returned or all filtered away
                if(result['pick'] === 'none'){
                    continType = 'systemErr';
                    continueTo = null;
                }else{
                    continType = 'event';
                    continueTo = result['pick'];
                    console.log('random event has been picked');     
                }
                           
            }
            break;
            
        case'end':
            console.log('condition in branchtype: '+condition);
            if(condition == 'dead'){
                console.log('branchtype player is dead');
                var msg = 'This has been a lethal strike and you are released from this world. RIP';
                storyteller.writeWithClass('info',msg);
            }
            continType = 'end';
            
            break;
            
    } 
    next.continType =  continType;
    next.continueTo = continueTo;
    next.player = player;    

    return next;
    
    
}

//run event without action taken(gain/lose), used for replaying saved event, just rewrite story
function runPassiveEvent(storyteller, player, event){
    console.log('hello from passive event');
    var condition = 'alive';        
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
                if(evAttr.attribute == 'coins' && event.items.length > 0){
                    
                    for(var i=0; i< event.items.length; i++){
                        if(event.items[i].action == 'gain'){
                            gain = true;
                            var msg = '';
                            // check if player got item in inventory
                            var itemId = event.items[i].item[0].id;
                            var index = Helper.getIndexByKeyValue(player.character[0].inventory,'id',itemId);
                            
                            if(index != null){
                                var msg = 'Luckily you have already '
                                            +event.items[i].item[0].name;
                                msg += ' and don\'t need to buy one.';
                            }else {
                                // if player didn't buy it last time, it's because he could not afford it
                                msg = 'You still don\'t have enough money to buy '
                                            +event.items[i].item[0].name;
                            }
                                    
                            storyteller.write(msg);
                            event.items.splice(i,1);
                        }
                        
                    }                                       
                }
                
                if(!gain){

                    // check if player is dead by loosing to much stamina
                    if(player.character[0].attributes.stamina == 0){
                        
                        // end the game
                        condition = 'dead';
                        //remove all items of event - they are not needed
                        event.items = [];
                        event.branchType = 'end'; 
                        event.attributes = [];
                    }
                    
                    console.log('player looses '+evAttr.amount+' of '+evAttr.attribute);
                    var msg = evAttr.attribute+' -'+evAttr.amount;
                    storyteller.writeWithClass('info',msg);
                }
                
                                                
            }else{                
                var msg = evAttr.attribute+' +'+evAttr.amount;
                console.log('player gains '+evAttr.amount+' of '+evAttr.attribute);
                storyteller.writeWithClass('info',msg);                
                
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
            console.log('condition in branchtype: '+condition);
            if(condition == 'dead'){
                console.log('branchtype player is dead');
                var msg = 'This has been a lethal strike and you are released from this world. RIP';
                storyteller.writeWithClass('info',msg);
            }
            continType = 'end';
            
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
    console.log('process outcome: continType: '+continType);
    
    
    if(continueChain){
        
        if(continType == 'choices') {
            console.log('processOutcome: choices given, let player decide');    
            next.choices = result['choices']; // expect array of objId
            //TODO: filter choices
            processOutcome(false,storyteller, next, callback);
            //query events to get choices-text, ids
            //stop the chain and return cb with choices
            
        } else if(continType == 'event' && result['continueTo'].newPara){
            console.log('next event start a new paragraph');
            next.continType = 'pressContinue';             
            next.continueEvent = result['continueTo'];            
            processOutcome(false,storyteller, next, callback);
            
        // in case there has been an error when filtering choices or picking a random event
        } else if(continType == 'systemErr'){   
            console.log('there is an error');
            next.continType = 'systemErr';             
            next.continueEvent = null;
//            storyteller.tellError();
            processOutcome(false,storyteller, next, callback);
            
        }else if(continType == 'end' || continType == 'dead'){            
            console.log('it has come to an end: continType= '+continType);
            processOutcome(false,storyteller, next, callback);
            
        }else{
            var continueTo = result['continueTo'];
            //continue chain and trigger next event/location
            console.log('processOutcome: trigger new '+continType);
//            console.dir(continueTo);

            if(continType == 'event'){
                // get new event from db and trigger a new event
                var opts = Event.getPopuQuery();
                Event.findOne({'id': continueTo.id}).populate(opts).exec(function(err,event1){
                    if(err){storyteller.tellError();return;}
                    console.log('to do: fire new event');
                    // check if there is any event at all
                    if(event1){
                        var result = runEvent(storyteller, player, event1);
                        processOutcome( true, storyteller, result, callback );
                    }else{
                        console.log('something went wrong, no event to continue to');
                        storyteller.tellError();
                        processOutcome(false, storyteller, result, callback);
                    }
                    
                });
            }else{
                // trigger a new location
                Location.findOne({'id': continueTo.id}, '-_id').populate('event').exec(function(err,loco1){
                    if(err){storyteller.tellError();return;}
//                    console.dir(loco1);
                    return loco1;
                }).then(function(loco1){
                    storyteller.write(loco1.text);;
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
exports.getSavedGame = function(character, cb){
    
    var sanChar = Helper.sanitizeString(character._id);
    var charOpts = [{path:'character.weapon', select:'name id -_id'}, 
                {path:'character.inventory', select:'name id -_id'}, 
                {path:'character.guild', select:'name id image -_id'}];
            
    Player.findOne({'character._id':sanChar}).populate(charOpts).exec(function(err, player){
        if(err){ return cb({'err':err});}        
        
        player.gameSave = 'saved';
//        player.save(function(){
//            return player;
//        });
        return player;
        
    }) 
    .then(function(player){
        console.log('get saved game: player = ');
        console.dir(player);
        var opts = Event.getPopuQuery();
        Event.findOne({'_id':player.event}).populate(opts).exec(function(err, event){
            if(err){ return cb({'err':err});}            
            return event;
        }).then(function(event){            
            
            var data ={
                'player': player,
                'event' : event
            };
            return cb(data);
            
        });     
    });
};

// clean  up in saved players, remove backups and replayed, set saved to true
exports.setSavings = function(user, cb){
    var sanId = Helper.sanitizeString(user);
    
    //get all players of user
    Player.remove({'user' : sanId, 'gameSave':{$in :['backup','replay','false']}}, function(err, players){
        if(err){console.log(err); return;}
        
        console.log('all backups and replays removed');
        Player.findOne({'user':sanId, 'gameSave':'saved'}, function(err, player){
            if(err){console.log(err); return;}
            
            // check if there is a saved player at all
            if(player){
                player.gameSave = 'true';
                player.save(function(err){
                    if(err){console.log(err); return;}
                    console.log('saved player set to true');
                    return cb();
                });
            }else{
                return cb();
            }
            
        });
    });
};

// continue a saved game by running first event without actions
exports.continueSavedGame = function(storyteller, player, event, cb){
    // run first event without any actions, since actions have already happened to player
    var result = runPassiveEvent(storyteller, player, event);
    
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
            return cb(next);
        }
    });  
};

// start the game
exports.startGame = function(character, userId, cb){
    console.log('start game');
    // TODO: get guild-location of character and make location- select dependent on outcome . then(blaba)
    // create new player
    var flags = []; // new player has no flags yet;
    Player.createNew(character, flags, userId, function(data){
        var player = data['player'];
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
        else if(continType === 'choices') {
            console.log('choices given, let player decide');        
            next.choices = endResult['choices']; // expect array of objId            
            //query events to get choices-text, ids
            //stop the chain and return cb with choices
            return cb(next);
        }else if(continType === 'systemErr'){
            console.log('there is an error');
            return cb(next);
        }else{
            
            console.log('the game has ended here');
            return cb(next);
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
    console.log('process eventchain: continType = '+continType);

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
    }else if(continType == 'systemErr'){
        newData = {'msg': 'We are terribly sorry, but there has been an error. Please contact the system administrator'};
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