/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var Player = require('../models/player.js');
var Guild = require('../models/guild.js');
var Weapon = require('../models/weapon.js');
var Character = require('../models/character.js');
var Crud = require('./crud_functions.js');
var Helper = require('./helper_functions.js');

module.exports = function(app, passport){
        
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
    
    
    
    // show start-screen for existing player
    app.get('/game', isLoggedIn, function (req, res){
                
        console.log('hello from game-routes');
        
        var opts = [{path:'weapon', select:'name id -_id'}, 
                    {path:'inventory', select:'name id -_id'}, 
                    {path:'guild', select:'name id image -_id'}];
        Character.find({},'-_id').populate(opts).exec(function(err, characters){
                if(err){ return console.log(err);}
                return characters;
            })
        .then(function(characters){
            Weapon.find({},'-_id').exec(function(err, weapons){
                if(err){ return console.log(err);}
                return weapons;
            })
        .then(function(weapons){
            // find previously saved games and backup from last disconnected game
            Player.find({user: req.user._id, gameSave:{$ne:'false'}}, '-user -_id').populate('character').exec(function(err, players){
                if(err){ return console.log(err);}
                                              
                //if the user has any saved games(players), get the characters
                var games = [];
                for(var i=0; i<players.length; i++){
                    games.push(players[i].character[0]);
                }              
                
                //get the guilds from characters to ensure administrator has released them; 
                var guilds = [];
                for(var i=0; i<characters.length; i++){
                    var appGuildId = characters[i].guild.id;
                    var index = Helper.getIndexByKeyValue(guilds, 'id',appGuildId);
                    if(index === null){
                        var guild = {
                            'id'    : appGuildId,
                            'name'  : characters[i].guild.name,
                            'image' : characters[i].guild.image
                        };
                        guilds.push(guild);
                    }
                }

                res.render('game.ejs', {
                   'guilds'     :   guilds,
                   'characters' :  characters,
                   'userId'     :   req.user._id,
                   'username'   :   req.user.username,
                   'games'      :   games,
                   'weapons'    :   weapons,
                   'message'    :   ''
               }); 
           });
       });
    });
    });
    
    // show crud-page
    //TODO: make only accessible to administrators 
    app.get('/crud', isLoggedIn, function (req, res){
        Crud.sendAllModels(res, req);
        
    });
    
    // handle post-requests from crud
    //TODO: restrict access to only for administror
    app.post('/crud',isLoggedIn, function(req, res){
        
        console.log('the form sent is: '+req.body.form);
        var action;
        if(req.body.form){
            action = req.body.form;
        }else{
            action = req.body.delete;
        }
        
        // if a form was sent, either create or update
        if(action){
            
            switch(action){
                
                case'createEvent':
                    Crud.createEvent(res, req);
                    break;
                
                case'createLocation':
                    Crud.createLocation(res, req);
                    break;
                    
                case'createGuild':
                    Crud.createGuild(res, req);
                    break;
                    
                case'createWeapon':
                    Crud.createWeapon(res, req);
                    break;
                
                case'createItem':
                    Crud.createItem(res, req);
                    break;
                    
                case'createCharacter':
                    Crud.createCharacter(res, req);
                    break;
                    
                case'updateEvent':
                    Crud.updateEvent(res, req);
                    break;
                
                case'updateLocation':
                    Crud.updateLocation(res, req);
                    break;
                    
                case'updateGuild':
                    Crud.updateGuild(res, req);
                    break;
                    
                case'updateWeapon':
                    Crud.updateWeapon(res, req);
                    break;
                
                case'updateItem':
                    Crud.updateItem(res, req);
                    break;
                    
                case'updateCharacter':
                    Crud.updateCharacter(res, req);
                    break;
                
                case'itemDel':
                    Crud.deleteItem(res, req);
                    break;
                    
                case'guildDel':
                    Crud.deleteGuild(res, req);
                    break;
                    
                case'weaponDel':
                    Crud.deleteWeapon(res, req);
                    break;
                    
                case'locoDel':
                    Crud.deleteLocation(res, req);
                    break;
                    
                case'eventDel':
                    Crud.deleteEvent(res, req);
                    break;
                    
                case'charDel':
                    Crud.deleteCharacter(res, req);
                    break;
                
            }
        }// if form was sent -> end
    
    });
    
 
//    app.post('/crud',isLoggedIn, isMe, function(req, res){});

    
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