/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


//var RoomModel = require('../models/room.js');
var Item = require('../models/item.js');
var Player = require('../models/player.js');
var Guild = require('../models/guild.js');
var Weapon = require('../models/weapon.js');
var Character = require('../models/character.js');
var Helper = require('./helper_functions.js');

module.exports = function(app, passport, game){
        
    // homepage (with login-links)
    app.get('/', function(req, res){
        console.log('hello from index');
        res.render('index.ejs'); // load index.ejs as template
    });
    
    // show the login-form and pass in any flash data if it exists
    app.get('/login', function(req, res){
       res.render('login.ejs', {message: req.flash('loginMessage')}); 
    });
    
    // process the login form
    app.post('/login', passport.authenticate('local-login',{
        successRedirect: '/game',
        failureRedirect: '/login',
        failureFlash: true
    }));
    
    // show the signup-form and pass in any flash data if it exists
    app.get('/signup', function(req, res){
        
        console.log('Hello from route get signup');
       res.render('signup.ejs', {message: req.flash('signupMessage')}); 
       
    });
    
    // process the signup form
    app.post('/signup',passport.authenticate('local-signup',{
        successRedirect: '/game', // if everything worked redirect to user-profile
        failureRedirect: '/signup', // if something went wrong, redirect to singup
        failureFlash: true // allow flash-messages
    }));
    
    // show crud-page
    //TODO: make only accessible to administrators 
    app.get('/crud', isLoggedIn, function (req, res){
        
        Guild.find().exec(function(err, guilds){            
            if(err){ return console.log(err);}
            return guilds;                      
        })
        .then(function(guilds){
            Character.find().populate('guild weapon inventory').exec(function(err, characters){
                if(err){ return console.log(err);}
                return characters;
            })
        .then(function(characters){
            Item.find().exec(function(err, items){
                if(err){ return console.log(err);}
                return items;
            })
        .then(function(items){
            Weapon.find().exec(function(err, weapons){
                if(err){ return console.log(err);}
                res.render('crud.ejs', {
                   userId   :   req.user._id,
                   username :   req.user.username,
                   message  :   '',
                   weapons  :   weapons,
                   characters:  characters,
                   guilds   :   guilds,
                   items    :   items
               });
            });
        });
        }); 
    });
    });
    
    // show start-screen for existing player
    app.get('/game', isLoggedIn, function (req, res){
        
        console.log('hello from game-routes');
        Guild.find().exec(function(err, guilds){            
            if(err){ return console.log(err);}
            return guilds;                      
        })
        .then(function(guilds){
            Character.find().populate('guild weapon inventory').exec(function(err, characters){
                if(err){ return console.log(err);}
                return characters;
            })
        .then(function(characters){
            Weapon.find().exec(function(err, weapons){
                if(err){ return console.log(err);}
                return weapons;
            })
        .then(function(weapons){
            Player.find({user: req.user._id}).exec(function(err, players){
                if(err){ return console.log(err);}

                res.render('game.ejs', {
                   guilds   :   guilds,
                   characters:  characters,
                   userId   :   req.user._id,
                   username :   req.user.username,
                   games    :   players,
                   weapons  :   weapons,
                   message  :   ''
               }); 
           });
       });
    });
    });
    });  
    
    // handle post-requests from crud
    //TODO: restrict access to only for administror
    app.post('/crud',isLoggedIn, function(req, res){
        
        console.log('the form sent is: '+req.body.form);
        
        /********** CREATE ***************/
        if(req.body.form == 'createWeapon'){

            console.log('a new item wants to be created');
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
        }// create weapon end
        
        if(req.body.form == 'createGuild'){

            console.log('a new guild wants to be created');
            Guild.find(function(err, guilds){
                if(err){console.log(err); return;}
                var id = Helper.autoIncrementId(guilds); 
                var guild = new Guild();
                guild.id = id;
                guild.name = req.body.name;

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
        }
        
        
        if(req.body.form == 'createItem'){
            
            console.log('a new item wants to be created');
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
                        items.push(item);
                        res.send({
                            'success'   : true,
                            'msg'       : 'yuppi! - item has been created.',
                            'items'   :   items
                        });
                    }    
                });        
            });            
        }
        
        if(req.body.form == 'createCharacter'){
            
            console.log('a new character wants to be created');
            Character.find(function(err, characters){
                if(err){console.log(err); return;}
                var id = Helper.autoIncrementId(characters); 
                var character = new Character(req.body.character);
                character.id = id;
//                character.name = req.body.character.name;
                
                console.log('character to create: '+character);
                console.log('character recieved: ');
                console.dir(req.body.character);
                
                
//                character.save(function(err){
//                   if(err){
//                        console.log('something went wrong when creating an item.');
//                        console.log('error '+err); 
//                        res.send({
//                            'success'   : false,
//                            'msg'       : 'could not save item',
//                            'errors'    : err.errors});
//                    }else{
//                        characters.push(character);
//                        res.send({
//                            'success'   :   true,
//                            'msg'       :   'yuppi! - item has been created.',
//                            'characters':   characters
//                        });
//                    }    
//                });        
            });            
        }
        
        /*********** UPDATE *********************/
    
        if(req.body.form == 'updateItem'){

            var itemId = Helper.sanitizeNumber(req.body.id);
            Item.findOne({'id':itemId}, function(err, item){
               if(err){console.log(err); return;}

                item.name = req.body.name;

                item.save(function(err){
                    if(err){
                        console.log('something went wrong when updating a item.');
                        console.log('error '+err); 
                        res.send({
                            'success'   : false,
                            'msg'       : 'could not update item',
                            'errors'    : err.errors});
                    }else{
                        Item.find(function(err, items){
                            if(err){ return console.log(err);}
                            res.send({
                                'success'   : true,
                                'msg'       : 'yuppi! - item has been updated.',
                                'items'   :   items
                            });

                        });  
                    }    
                });
            });
        }// update item end
        
        if(req.body.form == 'updateWeapon'){

            var weaponId = Helper.sanitizeNumber(req.body.id);
            Weapon.findOne({'id':weaponId}, function(err, weapon){
               if(err){console.log(err); return;}

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
                        Weapon.find(function(err, weapons){
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
        }// update weapon end 
        
        if(req.body.form == 'updateGuild'){
            
            var guildId = Helper.sanitizeNumber(req.body.id);
            Guild.findOne({'id':guildId}, function(err, guild){
               if(err){console.log(err); return;}

                guild.name = req.body.name;

                guild.save(function(err){
                    if(err){
                        console.log('something went wrong when updating a guild.');
                        console.log('error '+err); 
                        res.send({
                            'success'   : false,
                            'msg'       : 'could not update guild',
                            'errors'    : err.errors});
                    }else{
                        Guild.find(function(err, guilds){
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
        }// update guild end
    });
    
    
    
    
    
//    app.get('/crud',isLoggedIn, isMe, function (req, res){
//        
//        console.log('hello from get/crud ');
//        
//        var npcListen = require('./npc_listeners.js').listeners;
//        var itemListen = require('./item_listeners.js').listeners;
//        // get all the stuff out of DB
//        RoomModel.find().populate('npcs inventory').exec(function(err, rooms){
//            if(err){ console.log(err); return;}
//            
//            NpcModel.find().populate('inventory trade.has trade.wants').exec(function(err,npcs){
//                if(err){ console.log(err); return;}
//                
//                ItemModel.find(function(err, items){
//                   if(err){ console.log(err); return;}
//                   
//                    GuildModel.find(function(err, guilds){
//                        if(err){ console.log(err); return;}
//                        console.log(guilds);
//                        res.render('crud.ejs', {
//                                'locations'   :   rooms,
//                                'npcListen'   :   npcListen,
//                                'itemListen'  :   itemListen,
//                                'npcs'        :   npcs,
//                                'items'       :   items,
//                                'guilds'      :   guilds,
//                                'user'        :   req.user,
//                                'message'     :   ''
//                            });   
//                        
//                    });               
//                });
//            });          
//        });
//    });  
//    
//    app.post('/crud',isLoggedIn, isMe, function(req, res){
//        
//        console.log('the form sent is: '+req.body.form);
//        
//        /********** CREATE ***************/
//        if(req.body.form == 'createItem'){
//            
//            console.log('a new item wants to be created');
//            ItemModel.find(function(err, items){
//                var id = Helper.autoIncrementId(items); 
//                var item = new ItemModel();
//                item.id = id;
//                item.keyword = req.body.keyword;
//                item.description = req.body.description;
//                item.shortDesc = req.body.shortDesc;
//                item.maxLoad = req.body.maxLoad;
//                item.behaviours = req.body.behaviours;
//                
//                console.log('item to create: '+item);
//                
//                item.save(function(err){
//                   if(err){
//                        console.log('something went wrong when creating an item.');
//                        console.log('error '+err); 
//                        res.send({
//                            'success'   : false,
//                            'msg'       : 'could not save item',
//                            'errors'    : err.errors});
//                    }else{
//                        ItemModel.find(function(err, items){
//                            if(err){ return console.log(err);}
//                            res.send({
//                                    'success'   : true,
//                                    'msg'       : 'yuppi! - item has been created.',
//                                    'items'   :   items
//                                });
//
//                        });  
//                    }    
//                });        
//            });            
//        }
//        
//        if(req.body.form == 'createRoom'){
//            console.log('a new room wants to be created');
//            
//            RoomModel.find(function(err, rooms){
//                if(err){console.error(err); return;}; 
//                var id = Helper.autoIncrementId(rooms); 
//                var room = new RoomModel();
//                room.id = id;
//                console.log('new id is : '+id);
//                room.name = req.body.keyword;
//                room.description = req.body.description;
//                var npcs = req.body.npcs;
//                var items = req.body.items;
//                var exits = req.body.exits;
//
//
//                RoomModel.createRoomWithNpc(room, exits, npcs, items, function(err, newRoom){
//                    if(err){console.error(err); return;}; 
//                    console.log('hello from callback' +newRoom);
//
//                    newRoom.save(function(err){
//                        if(err){
//                            console.log('something went wrong when creating a room.');
//                            console.log('error '+err); 
//                            res.send({
//                                'success'   : false,
//                                'msg'       : 'could not save room, due to',
//                                'errors'    : err.errors});
//                        }else{
//                            RoomModel.find().populate('npcs inventory').exec(function(err, rooms){
//                                if(err){ return console.log(err);}
//
//                                res.send({
//                                    'success'   : true,
//                                    'msg'       : 'yuppi! - room has been updated.',
//                                    'locations'   :   rooms
//
//                                });
//
//                            });
//
//                        }    
//                    });  
//
//                });
//            });                
//        };
//        
//        if(req.body.form == 'createNpc'){
//            console.log('a new npc wants to be created');
//            NpcModel.find(function(err, npcs){
//                if(err){console.error(err); return;}; 
//                var id = Helper.autoIncrementId(npcs); 
//                var npc = {
//                    'id': id,
//                    'keyword' : req.body.keyword,
//                    'gender' : req.body.gender,
//                    'description' : req.body.description,
//                    'shortDesc' : req.body.shortDesc,
//                    'maxLoad' : req.body.maxLoad,
//                    'pacifist' : req.body.pacifist,
//                    'actions':{
//                        'playerDrops': req.body.playerDrops,
//                        'playerEnters': req.body.playerEnters,
//                        'playerChat': req.body.playerChat
//                    },
//                    'attributes':{
//                        'hp':req.body.hp,
//                        'sp': req.body.sp,
//                        'health': req.body.health
//                    },
//                    behaviours : req.body.behaviours                    
//                };                
//                var items = req.body.items;
//                
//                // check if npc wants to trade anything
//                if(req.body.has){
//                    npc.has = req.body.has;
//                    npc.wants = req.body.wants;
//                    npc.swap = req.body.swap;
//                    console.log(npc.has+', '+npc.wants+', '+npc.swap);
//                }
//                
//                // attach item-objectId-references properly
//                NpcModel.createNpcinDB(npc, items, function(err, npc){
//                    if(err){ return console.log(err);}
//                     
//                    npc.save(function(err){
//                    
//                        if(err){
//                            console.log('something went wrong when creating a npc.');
//                            console.log('error '+err); 
//                            res.send({
//                                'success'   : false,
//                                'msg'       : 'could not save npc:',
//                                'errors'    : err.errors
//                            });
//                        }else{
//                            // get all the npcs including the new one    
//                            NpcModel.find().populate('inventory trade.has trade.wants').exec(function(err,npcs){
//                                if(err){ return console.log(err);}
//
//                                res.send({
//                                    'success'   : true,
//                                    'msg'       : 'hurray! - npc has been created.',
//                                    'npcs'        :   npcs
//                                });
//
//                            }); 
//                        } 
//                    });
//                });
//            });
//        }
//        
//        if(req.body.form == 'createGuild'){
//            
//            console.log('a new item wants to be created');
//            GuildModel.find(function(err, guilds){
//                if(err){console.error(err); return;}; 
//                var id = Helper.autoIncrementId(guilds); 
//                var guild = new GuildModel();
//                guild.id = id;
//                guild.name = req.body.name;
//                guild.hp = req.body.hp;
//                guild.sp = req.body.sp;
//                
//                console.log('guild to create: '+guild);
//                
//                guild.save(function(err){
//                   if(err){
//                        console.log('something went wrong when creating an guild.');
//                        console.log('error '+err); 
//                        res.send({
//                            'success'   : false,
//                            'msg'       : 'could not save guild',
//                            'errors'    : err.errors});
//                    }else{
//                        GuildModel.find(function(err, guilds){
//                            if(err){ return console.log(err);}
//                            res.send({
//                                    'success'   : true,
//                                    'msg'       : 'yuppi! - guild has been created.',
//                                    'guilds'   :   guilds
//                                });
//
//                        });  
//                    }    
//                });        
//            });            
//        }
//        
//        /********* UPDATE **************/   
//        if(req.body.form == 'updateItem'){
//            
//            var itemId = Helper.sanitizeNumber(req.body.id);
//            ItemModel.findOne({'id':itemId}, function(err, item){
//               if(err){console.log(err); return;}
//               
//                item.keyword = req.body.keyword;
//                item.description = req.body.description;
//                item.shortDesc = req.body.shortDesc;
//                item.maxLoad = req.body.maxLoad;
//                item.behaviours = req.body.behaviours;
//                
//                item.save(function(err){
//                    if(err){
//                        console.log('something went wrong when updating a room.');
//                        console.log('error '+err); 
//                        res.send({
//                            'success'   : false,
//                            'msg'       : 'could not update item',
//                            'errors'    : err.errors});
//                    }else{
//                        ItemModel.find(function(err, items){
//                            if(err){ return console.log(err);}
//                            res.send({
//                                    'success'   : true,
//                                    'msg'       : 'yuppi! - item has been updated.',
//                                    'items'   :   items
//                                });
//
//                        });  
//                    }    
//                });
//            });
//        }
//        
//        if(req.body.form == 'updateRoom'){
//            console.log('want to update room');
//            var roomId = Helper.sanitizeNumber(req.body.id);
//            var room = {
//                    id      :   roomId,
//                    name    :   req.body.keyword,
//                    description : req.body.description
//                };
//            
//            var npcs = req.body.npcs;
//            var items = req.body.items;
//            var exits = req.body.exits;
//            
//            RoomModel.updateRoom(room, exits, npcs, items, function(err, room){
//                if(err){console.error(err); return;};
//                console.log('hello from updateRoom-callback '+room);
//                room.save(function(err){
//                    if(err){
//                        console.log('something went wrong when creating a room.');
//                        console.log('error '+err); 
//                        res.send({
//                            'success'   : false,
//                            'msg'       : 'could not update room, due to',
//                            'errors'    : err.errors});
//                    }else{
//                        RoomModel.find().populate('npcs inventory').exec(function(err, rooms){
//                            if(err){ return console.log(err);}
//                            res.send({
//                                    'success'   : true,
//                                    'msg'       : 'yuppi! - room has been updated.',
//                                    'locations'   :   rooms
//                                });
//
//                        });  
//                    }    
//                }); 
//            });
//        }
//        
//        if(req.body.form == 'updateNpc'){
//            
//            var npc = {
//                    'id': req.body.id,
//                    'keyword' : req.body.keyword,
//                    'gender' : req.body.gender,
//                    'description' : req.body.description,
//                    'shortDesc' : req.body.shortDesc,
//                    'maxLoad' : req.body.maxLoad,
//                    'pacifist' : req.body.pacifist,
//                    'actions':{
//                        'playerDrops': req.body.playerDrops,
//                        'playerEnters': req.body.playerEnters,
//                        'playerChat': req.body.playerChat
//                    },
//                    'attributes':{
//                        'hp':req.body.hp,
//                        'sp': req.body.sp,
//                        'health': req.body.health
//                    },
//                    'behaviours' : req.body.behaviours                    
//                };
//                
//            var items = req.body.items;
//            
//            // check if npc wants to trade anything
//            if(req.body.has){
//                npc.has = req.body.has;
//                npc.wants = req.body.wants;
//                npc.swap = req.body.swap;
//                console.log(npc.has+', '+npc.wants+', '+npc.swap);
//            }
//            
//            NpcModel.updateNpc(npc, items, function(err, npc){
//                if(err){ return console.log(err);}
//                console.log('hello from updateNpc-callback');
//                npc.save(function(err){
////                    if(err){ return console.log(err);}
//                    if(err){
//                        console.log('something went wrong when updating a npc.');
//                        console.log('error '+err); 
//                        res.send({
//                            'success'   : false,
//                            'msg'       : 'could not update npc:',
//                            'errors'    : err.errors
//                        });
//                    }else{
//                        // get all the npcs including the new one    
//                        NpcModel.find().populate('inventory trade.has trade.wants').exec(function(err,npcs){
//                            if(err){ return console.log(err);}
//
//                            res.send({
//                                'success'   : true,
//                                'msg'       : 'hurray! - npc has been updated.',
//                                'npcs'      :   npcs
//                            });
//
//                        }); 
//                    } 
//                });                
//            });            
//        }
//        
//        if(req.body.form == 'updateGuild'){
//            
//            var guildId = Helper.sanitizeNumber(req.body.id);
//            GuildModel.findOne({'id':guildId}, function(err, guild){
//               if(err){console.log(err); return;}
//               
//                guild.name = req.body.name;
//                guild.hp = req.body.hp;
//                guild.sp = req.body.sp;
//                
//                guild.save(function(err){
//                    if(err){
//                        console.log('something went wrong when updating a room.');
//                        console.log('error '+err); 
//                        res.send({
//                            'success'   : false,
//                            'msg'       : 'could not update guild',
//                            'errors'    : err.errors});
//                    }else{
//                        GuildModel.find(function(err, guilds){
//                            if(err){ return console.log(err);}
//                            res.send({
//                                    'success'   : true,
//                                    'msg'       : 'yuppi! - item has been updated.',
//                                    'guilds'   :   guilds
//                                });
//
//                        });  
//                    }    
//                });
//            });
//        }
//        
//        /********* DELETE **************/      
//        if(req.body.delete == 'itemDel'){
//            var itemId = req.body.itemId;
//            ItemModel.findOne({'id':itemId},function(err, item){
//                if(err){console.error(err); return;}
//               
//                item.remove(function(err){
//                    if(err){console.log(err); return;}
//                   
//                    ItemModel.find(function(err, items){
//                        if(err){console.log(err); return;}
//
//                        res.send({
//                            'success':   true,
//                            'msg'    :   'item has been removed.',
//                            'items'  :   items
//                        }); 
//                    });
//                });
//               console.log('item has been removed');
//           }); 
//        }
//        
//        if(req.body.delete == 'npcDel'){
//            var npcId = req.body.npcId;
//            console.log(npcId);
//           NpcModel.findOne({'id':npcId},function(err, npc){
//               if(err){console.error(err); return;}
//               
//               npc.remove(function(err){
//                    if(err){console.log(err); return;}
//                   
//                    NpcModel.find(function(err, npcs){
//                        if(err){console.log(err); return;}
//
//                        res.send({
//                            'success':   true,
//                            'msg'    :   'npc has been removed.',
//                            'npcs'  :    npcs
//                        });
//                   }); 
//                   
//               });
//           }); 
//        }
//        
//        if(req.body.delete == 'roomDel'){
//            var roomId = req.body.roomId;
//           RoomModel.findOne({'id':roomId}).remove().exec(function(err){
//               if(err){console.error(err); return;}
//               console.log('room has been removed');
//               
//               RoomModel.find(function(err, rooms ){
//                        if(err){console.log(err); return;}
//
//                        res.send({
//                            'success'   :   true,
//                            'msg'       :   'room has been removed.',
//                            'locations' :    rooms
//                        });
//                   });
//           }); 
//           
//        }
//        
//        if(req.body.delete == 'guildDel'){
//            var guildId = Helper.sanitizeNumber(req.body.itemId);
//            GuildModel.findOne({'id':guildId},function(err, guild){
//                if(err){console.error(err); return;}
//               
//                guild.remove(function(err){
//                    if(err){console.log(err); return;}
//                   
//                    GuildModel.find(function(err, guilds){
//                        if(err){console.log(err); return;}
//
//                        res.send({
//                            'success':   true,
//                            'msg'    :   'guild has been removed.',
//                            'guilds'  :   guilds
//                        }); 
//                    });
//                });
//               console.log('guild has been removed');
//           }); 
//        }
//        
//    });
    
    // logout
    app.get('/logout', function(req, res){
        req.logOut();
        res.redirect('/'); 
    });
};

//middelware to check if nickname exists
//function checkNickname(req, res){
//    var User = require('../models/user.js');
//    User.findOne({'nickname': req.body.nickname}, function(err, user){
//        if(err){console.error(err); return;}
//        
//        // if there's already a user with this nickname, prompt user to choose another one
//        if(user){
//            
//            var GuildModel = require('../models/guilds.js');
//            GuildModel.find(function(err, guilds){
//                if(err){ return console.log(err);}
//
//                // show form again to user
//                res.render('game.ejs', {
//                   guilds   :   guilds,
//                   user     :   req.user,
//                   message  :   'this nickname is already taken, please choose a different nickname.'
//               }); 
//            });
//
//        }else{
//            console.log('there is no player called '+req.body.nickname+' yet');
//            User.findOneAndUpdate({_id : req.user._id}, {nickname : req.body.nickname}, function(err, user){
//               if(err){console.error(err); return;}
//            }); 
//            
//        }              
//    });
//}
//
//
////middleware to get all the stuff out of db (room, npcs, items)
//function getEverything(res, req, next){
//    
//    var npcListen = require('./npc_listeners.js').listeners;
//    var itemListen = require('./item_listeners.js').listeners;
//    RoomModel.find().populate('npcs inventory').exec(function(err, rooms){
//            if(err){ return console.log(err);}
//            
//            NpcModel.find().populate('inventory').exec(function(err,npcs){
//                if(err){ return console.log(err);}
//                
//                ItemModel.find(function(err, items){
//                   if(err){ return console.log(err);}
//                    
//                    var data = {
//                    locations   :   rooms,
//                    npcListen   :   npcListen,
//                    itemListen  :   itemListen,
//                    npcs        :   npcs,
//                    items       :   items,
//                    user        :   req.user,
//                    message     :   ''
//                    };
//                    
//                    req.everything = data;
//                    return next();
//                   
//                });
//            });          
//        });
//}
//
//
//
////middleware to get guild-model and render it
//function showGuilds(user, res){
//    var guild = require('../models/guilds.js');
//    guild.find(function(err, guilds){
//        if(err){ return console.log(err);}
//        res.render('game.ejs', {
//           user: user, // get user out of session and into template
//           guilds : guilds
//       }); 
//    });
//
//}
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        console.log('Yes your are authenticated');
        next();
    }else{
        console.log('you are not logged in');
        res.redirect('/');
    }
}

// route middleware to make sure the user is me
function isMe(req, res, next){
    console.log(req.user);
    if(req.user.email == 'lisa'){
        console.log('Yes you are me');
        next();
    }else{
        console.log('you are not me');
        res.redirect('/');
    }
}