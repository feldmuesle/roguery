/* 
 * This file controlls all crud-functions
 */

// require modules

// import all models
var mongoose = require('mongoose');
var Location = require('../models/location.js');
var Flag = require('../models/flag.js');
var Item = require('../models/item.js');
var Player = require('../models/player.js');
var Guild = require('../models/guild.js');
var Weapon = require('../models/weapon.js');
var Character = require('../models/character.js');
var Event = require('../models/event1.js');
var Helper = require('./helper_functions.js');



exports.createEvent = function(reqBody, id, cb){
    
    var location = reqBody.location;
    var isChoice = reqBody.isChoice;
    var setFlag = reqBody.setFlag;
    var reqFlag = reqBody.reqFlag;
    var flags = []; // for sanitized flagIds if reqFlag is not false
    var branchType = reqBody.branchType;
    var branch = reqBody.branch;       
    console.log(branch);
    console.log('reqFlag is: '+reqFlag);
    
    
    // create event
    var event = new Event();
    event.id = id;
    event.name = reqBody.name;
    event.text = reqBody.text;
    event.newPara = reqBody.newPara;
    event.branchType = branchType;
    
    // get attributes and items
    event = Event.addAttributes(reqBody.attributes, event);
    event = Event.addItems(reqBody.items, event);
    
    //set choice-text if event is a choice
    if(isChoice !='false'){
        event.choiceText = isChoice;
        event.isChoice = true;
    }
    
    //create new flag if event has a flag
    if(setFlag !='false'){
        
        Flag.createFlag(setFlag, function(flag){
            event.setFlag=true;
            event.flag = flag._id;
            console.log('flag-callback - event.flag set '+event.flag);
        }).exec(function(err){
            if(err){console.log(err); return;}                        
        })
        .then(
            // set the location to Object-id
            Location.find({'id':location}).exec(function(err, loco){
                if(err){console.log(err); return;}
                
                return loco;
            }).then(function(loco){
                console.log('Then loco'+loco);
                console.log('');
                // get flagId if there is any
                Flag.find({'id':reqFlag}).exec(function(err, flag){
                    if(err){console.log('reqFlag is '+reqFlag);} 
                    if(flag){
                        event.reqFlag.push(flag._id); 
                    } 
                    event = Event.createSubDocs(reqBody,event);
                    event.location = loco._id;
                    console.log(event);
                    return cb(event);
                });
            }   
                
            )
        );
    // if no flag is set and we therefor don't need to create one
    }else{
        event.setFlag = false;
        // set the location to Object-id
            Location.findOne({'id':location}).exec(function(err, loco){
                if(err){console.log(err); return;}
                event.location = loco._id;
                console.log('location set '+event.location);                
            })
            .then(function(){
                // get flagId if there is any
                if(reqFlag != 'false'){
                    // if it's not false, it's an array
                    // sanitize all flag-ids in reqFlag-array
                    reqFlag.forEach(function(flag){
                        flags.push(Helper.sanitizeNumber(flag));
                    });
                    console.log('sanitized flag-array: '+flags);
                    
                    Flag.find({'id':{$in :flags}}).exec(function(err, flags){
                        if(err){console.log('reqFlag is '+reqFlag);} 
                        
                        flags.forEach(function(flag){
                            event.reqFlag.push(flag._id);
                        });                                                                       
                        console.log(event);
//                                                
                    }).then(function(){
                        console.log('hello from then-> get branch '+branchType);
                        //TODO: switch according to branchtype and get branch
                        
                        // insert branch depending on branchType
                        switch(branchType){
                            case'dice':
                                console.log('roll the dices');
                                Event.addDiceBranch(branch, event, function(branchEvent){
                                    return cb(branchEvent);
                                });                     
                                
                                break;
                            case'choice':
                                console.log('make choices');
                                break;
                            case'continue':
                                console.log('continue');
                                Event.addContinueBranch(branch, event, function(branchEvent){
                                    return cb(branchEvent);
                                });                                
                                break;
                                
                            case'end':
                                console.log('the end');
                                return cb(event);
                                break;
                        }
                        
//                        return cb(event);
                    });
                }else{                    
                    event = Event.createSubDocs(reqBody,event);
                    console.log(event);
                    return cb(event);
                }
                
            });  
    }
};