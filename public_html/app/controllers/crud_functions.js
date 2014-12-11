/* 
 * This file controlls all crud-functions
 */

// require modules

// import all models
var mongoose = require('mongoose');
var User = require('../models/user.js');
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

// add reject-flags if there are any and return cb with altered event
var setRejectFlags = function( rejectFlag, event, cb){
    console.log('hello from setRejectFlags');
    if(rejectFlag != 'false'){
        var flags = []; // for sanitized flagIds if reqFlag is not false
        // get and sanitize all flag-ids in reqFlag-array
        rejectFlag.forEach(function(flag){
            flags.push(Helper.sanitizeNumber(flag));
        });
        
        Flag.find({'id':{$in :flags}}).exec(function(err, flags){
            if(err){console.log('reject Flag is '+rejectFlag);} 
            
            // add all flags that should be rejected
            flags.forEach(function(flag){
                event.rejectFlag.push(flag._id);
            });                                                                       
            console.log('rejectflags are set: '+event.rejectFlag);
            return cb(event);

        });
    }else{
        // otherwise just return event as it is
        return cb(event);
    }
};

// add reject-flags if there are any and return cb with altered event
var setRequestFlags = function( reqFlag, event, cb){
    console.log('hello from setRequestFlags');
    if(reqFlag != 'false'){
        var flags = []; // for sanitized flagIds if reqFlag is not false
        // get and sanitize all flag-ids in reqFlag-array
        reqFlag.forEach(function(flag){
            flags.push(Helper.sanitizeNumber(flag));
        });
        
        Flag.find({'id':{$in :flags}}).exec(function(err, flags){
            if(err){console.log('reqFlag  is '+reqFlag);} 
            
            // add all flags that should be rejected
            flags.forEach(function(flag){
                event.reqFlag.push(flag._id);
            });                                                                       
            console.log('reqflags are set: '+event.reqFlag);
            return cb(event);

        });
    }else{
        // otherwise just return event as it is
        return cb(event);
    }
};


// this creates an Mongoose-event and sets all properties according to req-event and returns it
var createEvent = function(reqBody, id, cb){
//    console.log('reqBody in createEvent: ');
//    console.dir(reqBody);
    var location = reqBody.location;
    var isChoice = reqBody.isChoice;
    var setFlag = reqBody.setFlag;
    var reqFlag = reqBody.reqFlag;
    var rejectFlag = reqBody.rejectFlag;
    var branchType = reqBody.branchType;
    var branch = reqBody.branch;       
    console.log(branch);
    
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
        //console.log('choiceText is set: '+isChoice);
    }
    
    // set the location to Object-id
    Location.findOne({'id':location}).exec(function(err, loco){
        if(err){console.log(err); return;}
        event.location = loco._id;
        console.log('location set '+event.location.name);                
    })
    .then(function(){
        
        //set req-flags if there are any
        setRequestFlags(reqFlag, event, function(event){
           
            //set reject-flags if there are andy
            setRejectFlags(rejectFlag, event, function(event){
                
                // insert branch depending on branchType
                getBranch(branchType, branch, event, function(event){

                    //finally check if a flag is set
                    if(setFlag != 'false'){
                        event.setFlag=true;
                        //TODO: create flag!
                    }else{
                        event.setFlag = false;                        
                    }
                    return cb(event);
                });
            });
        });                           
    });    
};

//this is the actual Crud-function saving a new event and sending a response back to the client
exports.createEvent = function(res, req){
    var populate = Event.getPopuQuery();
    console.log('a new event wants to be created');
    Event.find({},'-_id').populate(populate).exec(function(err, events){
        if(err){console.log(err); return;}
        var id = Helper.autoIncrementId(events); 

        createEvent(req.body, id, function(event){
            console.log('hello from Crud-callback');
            console.log(event);
            
            // if event has a flag, create new flag and save it in DB
            if(event.setFlag){
                Flag.createFlag(req.body.setFlag, function(flag){
                    event.setFlag=true;
                    event.flag = flag._id;
                    console.log('flag-callback - event.flag set'+event.setFlag+' '+event.flag);
                    event.saveUpdateAndReturnAjax(res);
                });
            }else{
                event.flag = null;
                event.saveUpdateAndReturnAjax(res);
            }          
            
        }); // Crud.cb end
    }); // event.find end    
};

exports.createWeapon = function (res, req){
    
    // get all records there are to find next id 
    Weapon.find(function(err, weapons){
        if(err){console.log(err); return;}
        var id = Helper.autoIncrementId(weapons); 
        var weapon = new Weapon();
        weapon.id = id;
        weapon.name = req.body.name;

        console.log('weapon to create: '+weapon);

        weapon.save(function(err){
           if(err){
                console.log('something went wrong when creating an weapon.');
                console.log('error '+err); 
                res.send({
                    'success'   : false,
                    'msg'       : 'could not save weapon',
                    'errors'    : err.errors});
            }else{
                weapons.push(weapon);
                res.send({
                        'success'   : true,
                        'msg'       : 'yuppi! - weapon has been created.',
                        'weapons'   :  weapons
                });  
            }    
        });        
    });            
};

exports.createItem = function(res, req){
    // get all records there are to find next id 
    Item.find(function(err, items){
        if(err){console.log(err); return;}
        var id = Helper.autoIncrementId(items); 
        var item = new Item();
        item.id = id;
        item.name = req.body.name;

        console.log('item to create: '+item);

        item.save(function(err){
           if(err){
                console.log('something went wrong when creating an item.');
                console.log('error '+err); 
                res.send({
                    'success'   : false,
                    'msg'       : 'could not save item',
                    'errors'    : err.errors});
            }else{
                // add new item to items-array
                items.push(item);
                res.send({
                    'success'   : true,
                    'msg'       : 'yuppi! - item has been created.',
                    'items'   :   items
                });
            }    
        });        
    });              
};

exports.createGuild = function(res, req){
    console.log('a new guild wants to be created');
    Guild.find(function(err, guilds){
        if(err){console.log(err); return;}
        var id = Helper.autoIncrementId(guilds); 
        var guild = new Guild();
        guild.id = id;
        guild.name = req.body.name;
        guild.image = req.body.image;
        guild.start = req.body.location;

        console.log('guild to create: '+guild);

        guild.save(function(err){
           if(err){
                console.log('something went wrong when creating an guild.');
                console.log('error '+err); 
                res.send({
                    'success'   : false,
                    'msg'       : 'could not save guild',
                    'errors'    : err.errors});
            }else{
                guilds.push(guild);
                res.send({
                        'success'  : true,
                        'msg'      : 'yuppi! - guild has been created.',
                        'guilds'   :  guilds
                });  
            }    
        });        
    });            
};

exports.createLocation = function(res, req){
    console.log('a new location wants to be created');
    var event = Helper.sanitizeNumber(req.body.event);
    
    // first get the object-id for event used for referrencing
    Event.find({'id':event},'_id').exec(function(err, event){
        if(err){console.log(err); return;}
        return event;
    })
    .then(function(event){
         Location.find({},'-_id',function(err, locations){
            if(err){console.log(err); return;}
            var id = Helper.autoIncrementId(locations); 
            var location = new Location();
            location.id = id;
            location.name = req.body.name;
            location.text = req.body.text;
            location.start = req.body.start;
            location.event = event._id;

            console.log('location to create: '+location);

            location.save(function(err){
               if(err){
                    console.log('something went wrong when creating an location.');
                    console.log('error '+err); 
                    res.send({
                        'success'   :   false,
                        'msg'       :   'could not save location',
                        'errors'    :   err.errors});
                }else{
                    locations.push(location);
                    res.send({
                        'success'   :   true,
                        'msg'       :   'yuppi! - location has been created.',
                        'locations' :   locations
                    });                    
                }    
            });        
        });      
    });    
};

exports.createCharacter = function(res, req){
    var characterObj = req.body.character;
    // sanitize values used in query to get obj.ref
    var guild = Helper.sanitizeNumber(characterObj.guild);
    var weapon = Helper.sanitizeNumber(characterObj.weapon);

    Guild.findOne({'id':guild},'_id').exec(function(err,guild){
        if(err){console.log(err); return;}
        return guild;
    }).then( function(guild){
        Weapon.findOne({'id':weapon},'_id').exec(function(err,weapon){
            if(err){console.log(err); return;}
            return weapon;
        }).then( function(weapon){
            console.log('a new character wants to be created');
            Character.find(function(err, characters){
                if(err){console.log(err); return;}
                var id = Helper.autoIncrementId(characters); 
                characterObj.guild = guild._id;
                characterObj.weapon = weapon._id;
                // throw characterObj inside and get automatically new mongoos-character
                var character = new Character(characterObj);
                character.id = id;
//                character.name = req.body.character.name;

                console.log('character to create: '+character);
                console.log('character recieved: ');
                console.dir(req.body.character);


                character.save(function(err){
                   if(err){
                        console.log('something went wrong when creating an characters.');
                        console.log('error '+err); 
                        res.send({
                            'success'   : false,
                            'msg'       : 'could not save characters',
                            'errors'    : err.errors});
                    }else{
                        characters.push(character);
                        res.send({
                            'success'   :   true,
                            'msg'       :   'yuppi! - characters has been created.',
                            'characters':   characters
                        });
                    }    
                });        
            });           
        });
    });
};

exports.updateLocation = function(res, req){
    // sanitize values used in queries
    var locationId = Helper.sanitizeNumber(req.body.id);
    var eventId = Helper.sanitizeNumber(req.body.event);

    // get event-object id used for referrencing
    Event.findOne({'id':eventId},'_id').exec(function(err, event){
        if(err){console.log(err); return;}
        return event;
    })
    .then(function(event){

        Location.findOne({'id':locationId}, function(err, location){
           if(err){console.log(err); return;}

            location.name = req.body.name;
            location.text = req.body.text;
            location.start = req.body.start;
            location.event = event._id;

            location.save(function(err){                    
                if(err){
                    console.log('something went wrong when updating a location.');
                    console.log('error '+err); 
                    res.send({
                        'success'   :   false,
                        'msg'       :   'could not update location',
                        'errors'    :   err.errors});
                }else{
                    Location.find({},'-_id').populate('event','id name -_id').exec(function(err, locations){
                        if(err){ return console.log(err);}
                        res.send({
                            'success'   :   true,
                            'msg'       :   'yuppi! - location has been updated.',
                            'locations' :   locations
                        });

                    });  
                }    
            });
        });
    });
};

exports.updateGuild = function(res, req){
    var guildId = Helper.sanitizeNumber(req.body.id);
    Guild.findOne({'id':guildId}, function(err, guild){
       if(err){console.log(err); return;}

        guild.name = req.body.name;
        guild.image = req.body.image;
        guild.start = req.body.location;

        guild.save(function(err){
            if(err){
                console.log('something went wrong when updating a guild.');
                console.log('error '+err); 
                res.send({
                    'success'   : false,
                    'msg'       : 'could not update guild',
                    'errors'    : err.errors});
            }else{
                Guild.find({},'-_id',function(err, guilds){
                    if(err){ return console.log(err);}
                    res.send({
                        'success'   :  true,
                        'msg'       :  'yuppi! - guild has been updated.',
                        'guilds'    :  guilds
                    });

                });  
            }    
        });
    });
};

exports.updateCharacter = function(res,req){
    var characterUp = req.body.character;
    console.log('character to update: '+characterUp);
    var characterId = Helper.sanitizeNumber(characterUp.id);
    var guild = Helper.sanitizeNumber(characterUp.guild);
    var weapon = Helper.sanitizeNumber(characterUp.weapon);

    Guild.findOne({'id':guild},'_id').exec(function(err,guild){
        if(err){console.log(err); return;}
        return guild;
    }).then( function(guild){
        Weapon.findOne({'id':weapon},'_id').exec(function(err,weapon){
        if(err){console.log(err); return;}
        return weapon;
    }).then( function(weapon){
        Character.findOne({'id':characterId}, function(err, character){
       if(err){console.log(err); return;}

        character.name = characterUp.name;
        character.guild = guild._id;
        character.weapon = weapon._id;
        character.attributes = {};
        character.inventory = [];

        for(var key in characterUp.attributes){
            character.attributes[key] = characterUp.attributes[key];
        }

        character.save(function(err){
            if(err){
                console.log('something went wrong when updating a character.');
                console.log('error '+err); 
                res.send({
                    'success'   :   false,
                    'msg'       :   'could not update character',
                    'errors'    :   err.errors});
            }else{
                Character.find({},'-_id').populate('guild weapon inventory','name id -_id')
                    .exec(function(err, characters){
                    if(err){ return console.log(err);}
                    res.send({
                        'success'       :   true,
                        'msg'           :   'yuppi! - character has been updated.',
                        'characters'    :   characters
                    });

                });  
            }    
        });
    });
    });
    });
};

exports.updateItem = function(res, req){
    var itemId = Helper.sanitizeNumber(req.body.id);
    Item.findOne({'id':itemId}, function(err, item){
       if(err){console.log(err); return;}

        item.name = req.body.name;

        item.save(function(err){                    
            if(err){
                console.log('something went wrong when updating a item.');
                console.log('error '+err); 
                res.send({
                    'success'   :   false,
                    'msg'       :   'could not update item',
                    'errors'    :   err.errors});
            }else{
                Item.find({},'-_id',function(err, items){
                    if(err){ return console.log(err);}
                    res.send({
                        'success'   :   true,
                        'msg'       :   'yuppi! - item has been updated.',
                        'items'     :   items
                    });

                });  
            }    
        });
    });
};

exports.updateWeapon = function(res, req){
    var weaponId = Helper.sanitizeNumber(req.body.id);
    Weapon.findOne({'id':weaponId}, function(err, weapon){
        if(err){console.log(err); return;}
        //TODO: if no weapon is found it should send error instead of returning!
        weapon.name = req.body.name;

        weapon.save(function(err){
            if(err){
                console.log('something went wrong when updating a weapon.');
                console.log('error '+err); 
                res.send({
                    'success'   : false,
                    'msg'       : 'could not update weapon',
                    'errors'    : err.errors});
            }else{
                Weapon.find({},'-_id',function(err, weapons){
                    if(err){ return console.log(err);}
                    res.send({
                        'success'   : true,
                        'msg'       : 'yuppi! - weapon has been updated.',
                        'weapons'   :   weapons
                    });

                });  
            }    
        });
    });  
};

exports.gradeUser = function(res, req, role){
    var admin = req.user;
    console.dir(admin);
    console.dir(req.body);
    var userId = Helper.sanitizeString(req.body.id);
    
    //check for the admin if password matches and he really is an admin
    User.findOne({_id:admin._id}).exec(function(err, admin){
        if(err){console.log(err); return;}
        return admin;
    })
    .then(function(admin){
        var adminString = admin._id.toString();
                
        if(admin.validPassword(req.body.password) && admin.userRole === 'admin' && userId != adminString){
            User.findOne({'_id':userId}, function(err, user){
                if(err){console.log(err); return;}
            
                user.userRole = role;

                user.save(function(err){
                    if(err){
                        console.log('something went wrong when upgrading the user.');
                        console.log('error '+err); 
                        res.send({
                            'success'   : false,
                            'msg'       : 'could not update user',
                            'errors'    : err.errors});
                    }else{
                        User.find({},'_id username userRole',function(err, users){
                            if(err){ return console.log(err);}
                            res.send({
                                'success'   : true,
                                'msg'       : 'yuppi! - user-role updated.',
                                'users'   :   users
                            });

                        });  
                    }    
                });
            });
        }else{
            res.send({
                'success'   : false,
                'msg'       : 'You are not allowed to change this user-role',
                'errors'   :  null
            });
        }
        
    });  
};

exports.updateEvent = function(res, req){
    var eventId = Helper.sanitizeNumber(req.body.id);
    Event.findOne({'id':eventId}, function(err, event){
       if(err){console.log(err); return;}
       console.log('update event - event was found.');
       createEvent(req.body, eventId, function(newEvent){

//                    console.log('db-event '+event);
                    console.log('new event '+newEvent);
            // set all fields except for the set-flag property 
            event.name = newEvent.name;
            event.location = newEvent.location;
            event.text = newEvent.text;
            event.newPara = newEvent.newPara;
            event.isChoice = newEvent.isChoice;
            event.choiceText = newEvent.choiceText;
            event.id = newEvent.id;
            event.dice = newEvent.dice;
            event.continueTo = newEvent.continueTo;
            event.items = newEvent.items;
            event.attributes = newEvent.attributes;
            event.reqFlag = newEvent.reqFlag;
            event.rejectFlag = newEvent.rejectFlag;
            event.choices = newEvent.choices;
            event.branchType = newEvent.branchType;

//            console.log('db event '+event);
            // update or delete flag from db-event
            if(event.setFlag == true && newEvent.setFlag == false){
                // delete the flag from db if not required from any other event
                console.log('delete flag from db');
                // find flag and remove it if not req by other events
                Flag.findOne({'_id':event.flag}).exec(function(err, flag){
                    if(err){console.log(err); return;}

                    flag.remove(function(err){                                
                        if(err){
                            // pre-remove middleware will prevent removal if flag is required by other events
                            // Keep flag and save update ant return ajax-call
                            event.saveUpdateAndReturnAjax(res);
                            console.log(err); return;
                        }
                        console.log('flag has been removed');
                        event.setFlag = false;
                        event.flag = null;                               
                        // save update ant return ajax-call
                        event.saveUpdateAndReturnAjax(res);
                    });                                           
                });                       

            }else if (event.setFlag == true && newEvent.setFlag == true){
                console.log('update flag in db');
                // TODO: get flagdesc from req.body for name-update
                var flagName = Helper.sanitizeString(req.body.setFlag);
                Flag.update({'_id':event.flag},{'name':flagName}, function(err, flag){
                    if(err){console.log(err); return;}
                    console.log('flag has been updated');
                });
                event.setFlag = true;
                // save update ant return ajax-call
                        event.saveUpdateAndReturnAjax(res);
            }else {
                event.flag = newEvent.flag;
                event.setFlag = newEvent.setFlag;
                // save update ant return ajax-call
                event.saveUpdateAndReturnAjax(res);
            }           
//            console.log('updated event '+event);             
        });
    });
};

exports.sendAllModels = function(res, req){
    // define population-query for events
        var populateQuery = [{path:'flag', select:'name id _id'},{path:'rejectFlag', select:'name id -_id'}, 
            {path:'reqFlag', select:'name id -_id'}, {path:'location', select:'name id -_id'}, 
            {path:'dice.failure.location', select:'name id -_id'},{path:'items', select:'name id -_id'}, 
            {path:'dice.success.location', select:'name id -_id'}, {path:'dice.success.event', select:'name id -_id'}, 
            {path:'dice.failure.event', select:'name id -_id'},{path:'choices', select:'name id -_id'}, 
            {path:'continueTo.location', select:'name id -_id'}, {path:'continueTo.event', select:'name id -_id'}, 
            {path:'continueTo.random', select:'name id -_id'} ];
        
        // instead of 
        //'flag reqFlag location items dice.failure.location dice.failure.event'+
//                    ' dice.success.location dice.success.event choices continueTo.event continueTo.location'+
//                    ' continueTo.random'
        User.find({},'_id username userRole').exec(function(err, users){
            if(err){ return console.log(err);}
            return users;
        })
        .then(function(users){           
            Guild.find({},'-_id').exec(function(err, guilds){            
                if(err){ return console.log(err);}
                return guilds;                      
            })
        .then(function(guilds){
            Character.find({},'-_id').populate('guild weapon inventory','name id -_id').exec(function(err, characters){
                if(err){ return console.log(err);}
                return characters;
            })
        .then(function(characters){
            Event.find({}, '-_id').populate(populateQuery).exec(function(err, events){
                if(err){ console.log(err); return;}
                return events;
            }) 
        .then(function(events){
            Item.find({},'-_id').exec(function(err, items){
                if(err){ console.log(err); return;}
                return items;
            })
        .then(function(items){
            Location.find({},'-_id').populate('event','id name').exec(function(err, locations){
                if(err){ return console.log(err);}
                return locations;
            })
        .then(function(locations){
            Flag.find({},'-_id').exec(function(err, flags){
                if(err){ return console.log(err);}
                return flags;
            })    
        .then(function(flags){
            Weapon.find({},'-_id').exec(function(err, weapons){
                
                // also put all character-attr. in an array
                var char = new Character();
                var testChar= char.toObject();
                // make sure to only get our custom-keys and not prototype
                var attributes = Object.keys(testChar.attributes);
                // remove maxStamina
                var index = attributes.indexOf('maxStam');
                attributes.splice(index,1);
                
                //get the images for the guilds
                var images  = Guild.getImages();

                console.log(attributes);
                
                if(err){ return console.log(err);}
                res.render('crud.ejs', {
                   'userId'     :   req.user._id,
                   'username'   :   req.user.username,
                   'users'      :   users,
                   'message'    :   '',
                   'weapons'    :   weapons,
                   'characters' :   characters,
                   'events'     :   events,     
                   'attributes' :   attributes,
                   'guilds'     :   guilds,
                   'images'     :   images,
                   'items'      :   items,
                   'locations'  :   locations,
                   'flags'      :   flags  
               });
            });
        });    
        });
        });
    });
    });
    }); 
    });
};

exports.deleteItem = function(res, req){    
    var itemId = Helper.sanitizeNumber(req.body.itemId);
    Item.findOne({'id':itemId},function(err, item){
        if(err){console.error(err); return;}

        item.remove(function(err){
            if(err){
            console.log('could not delete item.');
            console.log('error '+err.toString());
            console.log(typeof err);
            console.log('try: '+err.message);
            console.dir(err);
            res.send({
                'success'   :   false,
                'msg'       :   'could not delete item',
                'errors'    :   err.message});
            }else{
                Item.find(function(err, items){
                    if(err){console.log(err); return;}

                    res.send({
                        'success':   true,
                        'msg'    :   'Item has been removed.',
                        'items'  :   items
                    }); 
                });
            }
        });
       console.log('item has been removed');
    }); 
};

exports.deleteGuild = function(res, req){
    var guildId = Helper.sanitizeNumber(req.body.guildId);
        Guild.findOne({'id':guildId},function(err, guild){
            if(err){console.error(err); return;}

            guild.remove(function(err){
                if(err){
                console.log('could not delete guild.');
                res.send({
                    'success'   :   false,
                    'msg'       :   'could not delete guild',
                    'errors'    :   err.message});
                }else{
                    Guild.find(function(err, guilds){
                        if(err){console.log(err); return;}

                        res.send({
                            'success':   true,
                            'msg'    :   'Guild has been removed.',
                            'guilds' :   guilds
                        }); 
                    });
                }
            });
       }); 
};

exports.deleteWeapon = function(res, req){
    var weaponId = Helper.sanitizeNumber(req.body.weaponId);
    Weapon.findOne({'id':weaponId},function(err, weapon){
        if(err){console.error(err); return;}

        weapon.remove(function(err){
            if(err){
            console.log('could not delete weapon.');
            res.send({
                'success'   :   false,
                'msg'       :   'could not delete weapon',
                'errors'    :   err.message});
            }else{
                Weapon.find(function(err, weapons){
                    if(err){console.log(err); return;}

                    res.send({
                        'success':   true,
                        'msg'    :   'Weapon has been removed.',
                        'weapons':   weapons
                    }); 
                });
            }
        });
    }); 
};

exports.deleteLocation = function(res, req){
    var locoId = Helper.sanitizeNumber(req.body.locationId);
    Location.findOne({'id':locoId},function(err, loco){
        if(err){console.error(err); return;}

        loco.remove(function(err){
            if(err){
            console.log('could not delete location.');
            res.send({
                'success'   :   false,
                'msg'       :   'could not delete location',
                'errors'    :   err.message});
            }else{
                Location.find(function(err, locos){
                    if(err){console.log(err); return;}

                    res.send({
                        'success':   true,
                        'msg'    :   'Location has been removed.',
                        'locations'  :   locos
                    }); 
                });
            }
        });
    }); 
};

exports.deleteEvent = function(res, req){
    
    var populateQuery = [{path:'flag', select:'name id _id'},{path:'rejectFlag', select:'name id -_id'}, 
            {path:'reqFlag', select:'name id -_id'}, {path:'location', select:'name id -_id'}, 
            {path:'dice.failure.location', select:'name id -_id'},{path:'items', select:'name id -_id'}, 
            {path:'dice.success.location', select:'name id -_id'}, {path:'dice.success.event', select:'name id -_id'}, 
            {path:'dice.failure.event', select:'name id -_id'},{path:'choices', select:'name id -_id'}, 
            {path:'continueTo.location', select:'name id -_id'}, {path:'continueTo.event', select:'name id -_id'}, 
            {path:'continueTo.random', select:'name id -_id'} ];
        
    var eventId = Helper.sanitizeNumber(req.body.eventId);
    Event.findOne({'id':eventId},function(err, event){
        if(err){console.error(err); return;}

        event.remove(function(err){
            if(err){
            console.log('could not delete event.');
            res.send({
                'success'   :   false,
                'msg'       :   'could not delete event',
                'errors'    :   err.message});
            }else{
                Event.find().populate(populateQuery).exec(function(err, events){
                    if(err){console.log(err); return;}

                    res.send({
                        'success':   true,
                        'msg'    :   'Event has been removed.',
                        'events' :   events
                    }); 
                });
            }
        });
    }); 
};

exports.deleteCharacter = function(res, req){
    var charId = Helper.sanitizeNumber(req.body.charId);
    Character.findOne({'id':charId},function(err, character){
        if(err){console.error(err); return;}

        character.remove(function(err){
            if(err){
            console.log('could not delete character.');
            res.send({
                'success'   :   false,
                'msg'       :   'could not delete character',
                'errors'    :   err.message});
            }else{
                Character.find(function(err, characters){
                    if(err){console.log(err); return;}

                    res.send({
                        'success':   true,
                        'msg'    :   'Character has been removed.',
                        'characters' :   characters
                    }); 
                });
            }
        });
    }); 
};