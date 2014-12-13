/* 
 * This file handles the game itself
 */

// get all the models we need
var Helper = require('./helper_functions.js');
var Player = require('../models/player.js');
var Storyteller = require('./storyteller.js');
var Game = require('./game_functions.js');

// set global variables we need
var clients = []; //array of users that are currently connected

exports.clients = clients;
var numUsers =0;
// constants
var MAXSUM = 100; // sum attributes must sum up to
var COINS = 20; // default amount for coins;

// set the token and user
var addToken = function(userId, token){
    
    console.log('hello from addToken, token = '+token);
    console.log('userId: '+userId);
    var index = Helper.getIndexByKeyValue(clients, 'user', userId);
    
    if(index == null){
        var client = {'user':userId, 'token':token};
        clients.push(client);
        numUsers++;
        console.log('new user with token added to clientArray'); 
        
    } else {
        console.log('user already registered, no new client with token added.');
    }    
};

module.exports.addToken = addToken;

// add socket to array of current connected sockets
var addSocket = function(socket, token){
    console.log('hello from addSocket');
    console.log(token);
    
    var index = Helper.getIndexByKeyValue(clients, 'token', token);
    console.log('index: '+index);
    console.dir(clients[index]);
    if(index != null){
        clients[index].socket = socket;
//        numUsers++;
        console.log('socket added to clientArray'); 
        
        
    } else {
        console.log('token not matched');
    }    
};

// socket-response and listeners
module.exports.response = function(socket){
    console.log('hello from socket-response'); 
    console.log('socketId '+socket.id); 
    
    { // send AttributeDescription to client
        var attrDesc = Game.getAttrDescriptions();
        socket.emit('initialize', {'attrDesc':attrDesc});
        
    }
    
    // send previously saved games to client
    socket.on('viewSaved', function(data){
        console.log('view the saved games.');
        var token = data['user']; 
        var index = Helper.getIndexByKeyValue(clients, 'token', token);
        var userId = clients[index].user;
        var userString = userId.toString();
        var sanId = Helper.sanitizeString(userString);
        
        var charOpts = [{path:'character.weapon', select:'name id -_id'}, 
                {path:'character.inventory', select:'name id -_id'}, 
                {path:'character.guild', select:'name id image -_id'}];
        
        Player.find({user: sanId, gameSave:{$nin:['false','replay']}}, '-user -_id').populate(charOpts)
            .exec(function(err, players){
                if(err){ socket.emit('systemErr', {'msg': 'Sorry, we could not find any saved games'}); return;}
//                console.dir(players);
                //if the user has any saved games(players), get the characters
                var games = [];
                var backup; 
                for(var i=0; i<players.length; i++){
                    if(players[i].gameSave == 'backup'){
                        backup = players[i].character[0]._id;
                    }
                    games.push(players[i].character[0]);
                } 
            
                socket.emit('viewSavedGames', {'games':games, 'backup':backup});
            });
        
    });
    
    
    //delete previously saved game
    socket.on('gameDel', function(data){
        var token = data['user'];
        var index = Helper.getIndexByKeyValue(clients, 'token', token);
        var userId = clients[index].user;
        var userString = userId.toString();
        var character = data['character'];
        var sanId = Helper.sanitizeString(userString);
        
        var charOpts = [{path:'character.weapon', select:'name id -_id'}, 
                {path:'character.inventory', select:'name id -_id'}, 
                {path:'character.guild', select:'name id image -_id'}];
        
        Player.find({'user':sanId}).populate(charOpts).exec(function(err, players){
            if(err){ socket.emit('systemErr', {'msg': 'Sorry, something went wrong.'}); return;} 
            
            var characters = [];
            players.forEach(function(player){
                
                var playChar = player.character[0]._id.toString();
                if(playChar == character._id) {
                    player.remove();
                }else{
                    characters.push(player.character[0]);
                }
            });
            
            socket.emit('gameDeleted',{'characters':characters});
            console.log('player has been removed');
        });
    });
    
    
    // continue playing a previously saved game
    socket.on('playSaved', function(data){
       console.log('continue to play a saved game.');
       var character = data['character'];
       var token = data['user'];
       
       //check if socket and user are already set in clients-array
        var index = Helper.getIndexByKeyValue(clients, 'token', token);
       
        if(index != null){
            addSocket(socket, token);
            index = Helper.getIndexByKeyValue(clients, 'token',token);

        }else{
            console.log('something went wrong');
            return;
        }
        
        var user = clients[index].user;
//        console.log('index: '+index);
//        console.dir(clients[index]);
       // returns player and current event when game was saved
        Game.getSavedGame(character, function(data){
            // if there were any errors
            if(data['err']){
                socket.emit('systemErr',{'msg':'Sorry, something went wrong. Please contact the system administrator.'});
                return;
            }
            var savedPlayer = data['player'];
            var flags = savedPlayer.flags;
            var event = data['event'];
            
            // create new player for this
            console.log('create new player with character:');
            console.dir(character);
            Player.createNew(character, flags, user, function(data){
                // if there were any errors
                if(data['err']){
                    socket.emit('systemErr',{'msg':'Sorry, something went wrong. Please contact the system administrator.'});
                    return;
                }
                console.log('new player created for replaying');
                var player = data['player'];
                var clientPlayer = data['clientPlayer']; // same as player but with populated inventory
                player.gameSave = 'replay'; // mark new game, so we can find it and match it agains saved game if resaved
                player.event = event;
                var character = clientPlayer.character[0];
                var storyteller = new Storyteller(socket);

                // start the game client-side
                socket.emit('startGame', {'character':character});            

                Game.continueSavedGame(storyteller, player, event, function(data){
                    console.log('hello from runEventChain-callback');
                    var continType = data['continType'];
                    var player = data['player'];

                    //store player together with socket
                    clients[index].player = player;
                    console.log('continType = '+continType);

                    var toDo = Game.processEventChain(data);
                    var newData = toDo['newData'];
                    var action = toDo['action'];

                    socket.emit(action, newData);
                });
                
            });
            
        });       
    });
        
    //start game and run first event-chain    
    socket.on('play', function(data){
        
        var character = data['character'];
        // add the socket together with user to clientsarray
        addSocket(socket, data['user']);
        
        // check first if the character has the right amount of attributes
        var isValid = Game.checkAttributeSum(character['attributes'], MAXSUM);
        if(isValid){
            console.log('character is valid');
            //OBS! we dont need to check for user, since we just put it there ourselves. 
            //instead userId should get sanitized
            // get userId from clients-array by socket and start the game
            var index = Helper.getIndexByKeyValue(clients, 'token',data['user']);
            
            if(index != null){
                var userId = clients[index].user;
                Game.startGame(character, userId, function(data){
                    
                    var player = data['player'];
                    var event = data['event'];
                    var location = data['location'];
                    var character = player.character[0];
                    var storyteller = new Storyteller(socket);                
                    
                    // start the game client-side
                    socket.emit('startGame', {'character':character});
                    socket.emit('output', {'type':'location', 'text':location.text});
                    
                    Game.runEventChain(storyteller, player, event, function(data){
                        console.log('hello from runEventChain-callback');
                        var continType = data['continType'];
                        var player = data['player'];
                        console.log('playerflags: '+player.flags);
                        
                        //store player together with socket
                        clients[index].player = player;                        
                        
                        console.log('continType = '+continType);
                        var toDo = Game.processEventChain(data);
                        var newData = toDo['newData'];
                        var action = toDo['action'];

                        socket.emit(action, newData);
                        
                    });
                    
                });
            }            
            
        }else{
            console.log('character is not valid - sending alert back');
            console.log(data);
            
            socket.emit('notValid', data['character']);
        }
        
    });
    
    
    socket.on('choiceMade', function(data){
        var choiceId = data['choice'];
        
        // get player out from clients-array by socket 
        var index = Helper.getIndexByKeyValue(clients, 'socket',socket);
        console.log('index '+index);
        var player = clients[index].player;
        var storyteller = new Storyteller(socket);
        
        if(index == null){
            storyteller.tellError();
            return;
        }
        
        // fetch entire chosen event from db and run new eventChain
        Game.getChoice(choiceId, function(event){
            console.log('hello from getChoice callback');
            Game.runEventChain(storyteller, player, event, function(data){
               console.log('HELLO from runEventChain after choices made HELLO HELLO HELLO');
                var continType = data['continType'];
                var player = data['player'];
                console.log('player - userId: '+player.user);

                //store player together with socket
                clients[index].player = player;
                console.log('continType = '+continType);
                                
                var toDo = Game.processEventChain(data);
                var newData = toDo['newData'];
                var action = toDo['action'];
                
                socket.emit(action, newData);
                
                        
                
            });
        });        
        
    });
    
    // save game for user
    socket.on('saveGame', function(data){
        console.log('hello from save game');
        var token = data['user'];
        var character = data['character'];
        var event = data['event'];
        console.log('clients token: '+token);
        console.log('clients event: '+event);
        var index = Helper.getIndexByKeyValue(clients, 'socket', socket);
        var userId = clients[index].user;
        console.log('userId saved in clients: '+userId);
        var socketPlayer = clients[index].player;
        var flags = socketPlayer.flags;

        console.log('save the game');
        Player.saveGame(userId, flags, character, event, function(err){
            
            if(err){
                socket.emit('gameSaved', {'msg':'oops, could not save game'});
            }else {
                socket.emit('gameSaved', {'msg':'game has been saved'});
            }
        });
    });
    
    socket.on('newGame', function(data){
        var token = data['user'];
        var index = Helper.getIndexByKeyValue(clients, 'token', token);
        var user = clients[index].user;
        Game.setSavings(user, function(){
            socket.emit('newGame');
        });
    });
    
    /******* GAMEEND - DISCONNECT ***********************************************/
    
    //when a user disconnects
    socket.on('disconnect', function(){
        console.log('A user is disconnecting');
        // TODO: remove client from clients-array
       
        if(clients.length > 0){ // in case server shut down and avoid negative numbers
            --numUsers;

            //take socket out of clients, then update texter
            console.log('number of clients '+clients.length);
            console.log('socket'+socket.id);
            var clientI =  Helper.getIndexByKeyValue(clients, 'socket', socket);
            
            if(clientI == null){
                console.dir(clients);
                console.log(clients.length);
            }
            
            // save game - check first if there is a player set at all
            if(clients[clientI].player){
                
                var player = clients[clientI].player;
                var userId = clients[clientI].user;                
                
                // get all players of the user
                Player.find({'user':userId}).exec(function(err, players){
                    if(err){console.log(err); return;}
                    return players;
                })
                .then(function(players){
                    
                    // remove all former backups unless it's a saved game initial backup-player
                    players.forEach(function(doc){
                        if(doc.gameSave == 'backup' && doc.id != player.id){
                            doc.remove();
                            console.log('player has been removed');
                        } 
                     });
                    
                    // then find the current player and save a backup if not already saved by user
                    Player.findOne({'_id':player._id}, function(err, player){
                        if(err){console.log(err); return;}
                        
                        if(player){
                            console.log('current Player when saving backup: ');
                        console.dir(player);
                        // create a new back-up of this player
                        var newPlayer = Player.createNewBackup(player.character[0], userId);
                        newPlayer.event = player.event;
                        newPlayer.flags = player.flags;
                        newPlayer.gameSave = 'backup';
                        newPlayer.save(function(err, newOne){
                            if(err){console.log(err); return;}
                            console.log('a backup of this saved game has been saved.');
                            console.dir(newOne);
                            // finally remove all remaining players that are saved automatically
                            players.forEach(function(doc){
                               if(doc.gameSave == 'false'|| doc.gameSave == 'replay'){
                                   console.log('player has been removed '+doc._id);
                                   doc.remove();
                               } 
                               if(doc.gameSave == 'saved'){
                                   doc.gameSave = 'true';
                                   doc.save(function(err){
                                      if(err){console.log('err'); return;}
                                      console.log('saved gameSave set to true again');
                                   });
                               }
                            });                            
                        });                
                        }
                            
                    });
                });
            }            

            //finally remove user form clients
            clients.splice(clientI, 1);
            console.log('user removed from clients');
        }
    }); // socket.on'disconnect' -> end

}; // module.exports.response -> end
