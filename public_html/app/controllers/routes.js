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
    app.get('/crud', isLoggedIn, isAdmin, function (req, res){
        Crud.sendAllModels(res, req);
        
    });
    
    // handle post-requests from crud
    //TODO: restrict access to only for administror
    app.post('/crud',isLoggedIn, isAdmin, function(req, res){
        
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
                    
                case'upgradeUser':
                    Crud.gradeUser(res, req, 'admin');
                    break;
                    
                case'downgradeUser':
                    Crud.gradeUser(res, req, 'user');
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

    
    // logout
    app.get('/logout', function(req, res){
        req.logOut();
        res.redirect('/'); 
    });
    
    //The 404 Route (ALWAYS Keep this as the last route)
    app.get('*', function(req, res){
      res.redirect('/');
    });
};


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

// route middleware to make sure the user is administrator
function isAdmin(req, res, next){
    console.log(req.user);
    if(req.user.userRole == 'admin'){
        console.log('Yes you are an administrator');
        next();
    }else{
        console.log('You are no administrator');
        res.redirect('/');
    }
}