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


function getBranch(branchType, branch, event, cb){
    
    // insert branch depending on branchType
    switch(branchType){
        case'dice':
            console.log('roll the dices');
            Event.addDiceBranch(branch, event, function(branchEvent){
                return cb(branchEvent);
            });                     

            break;
        case'choices':
            console.log('make choices');
            Event.addChoicesBranch(branch, event, function(branchEvent){
                return cb(branchEvent);
            });  
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
}


exports.createEvent = function(reqBody, id, cb){
//    console.log('reqBody in createEvent: ');
//    console.dir(reqBody);
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
    
    // there are four possible cases of promise-chains,
    //  either flags is set and required, 
    // not set and not required, 
    // one of each and the other way arround
    
    //if event has a flag set and flags required
    if(setFlag !='false' && reqFlag != 'false'){
        
        // set the location to Object-id
        Location.findOne({'id':location}).exec(function(err, loco){
            if(err){console.log(err); return;}
            event.location = loco._id;
            console.log('location set '+event.location);                
        })
        .then(function(){
            // get and sanitize all flag-ids in reqFlag-array
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

            }).then(function(){
                // insert branch depending on branchType
                getBranch(branchType, branch, event, function(event){

                    // create new flag and save it in DB
                    Flag.createFlag(setFlag, function(flag){
                        event.setFlag=true;
                        event.flag = flag._id;
                        console.log('flag-callback - event.flag set'+event.setFlag+' '+event.flag);
                        return cb(event);
                    });

                });
            });                   
        });
    // if no flag is set but flags required
    }else if( setFlag == 'false' && reqFlag != 'false'){
        // set the setFlag-property to bool
        event.setFlag = false;
        
        // set the location to Object-id
            Location.findOne({'id':location}).exec(function(err, loco){
                if(err){console.log(err); return;}
                event.location = loco._id;
                console.log('location set '+event.location);                
            })
            .then(function(){
                // get and sanitize all flag-ids in reqFlag-array
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
                    // insert branch depending on branchType
                    getBranch(branchType, branch, event, function(event){
                       return cb(event); 
                    });
                });
            });
    // if flag is set but none required        
    }else if(setFlag != 'false' && reqFlag == 'false'){          
        
        // set the location to Object-id
        Location.findOne({'id':location}).exec(function(err, loco){
            if(err){console.log(err); return;}
            event.location = loco._id;
            console.log('location set '+event.location);                
        })
        .then(function(){              
            // insert branch depending on branchType
            getBranch(branchType, branch, event, function(event){

                // create new flag and save it in DB
                Flag.createFlag(setFlag, function(flag){
                    event.setFlag=true;
                    event.flag = flag._id;
                    console.log('flag-callback - event.flag set'+event.setFlag+' '+event.flag);
                    return cb(event); 
                });                   
            });
        });
            
    // no flag set nor required
    }else{
        // set the setFlag-property to bool
        event.setFlag = false;
        
        Location.findOne({'id':location}).exec(function(err, loco){
                if(err){console.log(err); return;}
                event.location = loco._id;
                console.log('location set '+event.location);                
            })
            .then(function(){              
                // insert branch depending on branchType
                getBranch(branchType, branch, event, function(event){
                   return cb(event); 
                });
        });
    }
};