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

// set the token and userId in clients array
var addToken = function(userId, token){
    
    var index = Helper.getIndexByKeyValue(clients, 'user', userId);
    
    if(index == null){
        var client = {'user':userId, 'token':token};
        clients.push(client);
        numUsers++;
        
    }
};

module.exports.addToken = addToken;

// add socket to clients-array of current connected sockets 
// where token matches the one sendt from client
var addSocket = function(socket, token){
    
    var index = Helper.getIndexByKeyValue(clients, 'token', token);
    
    if(index !== null){
        clients[index].socket = socket;        
    }    
};

// update token for current socket
var updateToken = function(oldToken){
    
    var newToken = Helper.getToken(8);
    var index = Helper.getIndexByKeyValue(clients, 'token', oldToken);
    
    if(index !== null){
        console.log('update token from '+oldToken+' to '+newToken+' for user '+clients[index].user);
        clients[index].token = newToken; 
        return newToken;
    }
};

// socket-response and listeners
module.exports.response = function(socket){
    
    { // send AttributeDescription to client
        var attrDesc = Game.getAttrDescriptions();
        socket.emit('initialize', {'attrDesc':attrDesc});
        
    }
    
    // retrieve token from client and add the socket to matched client
    socket.on('initialized', function(data){        
        var token = data['user'];
        addSocket(socket, token);   
        // update token
        var newToken = updateToken(token);
        socket.emit('updateToken', {'token':newToken});
    });
    
    // send previously saved games to client
    socket.on('viewSaved', function(data){
        
        var token = data['user']; 
        var index = Helper.getIndexByKeyValue(clients, 'token', token);
        var userId = clients[index].user;
        var userString = userId.toString();
        var sanId = Helper.sanitizeString(userString);
        
        var charOpts = [{path:'character.weapon', select:'name id -_id'}, 
                {path:'character.inventory', select:'name id -_id'}, 
                {path:'character.guild', select:'name id image -_id'}];
        
        // get all games that are explixitly saved by user, as well as backups
        Player.find({user: sanId, gameSave:{$nin:['false','replay']}}, '-user -_id').populate(charOpts)
            .exec(function(err, players){
                if(err){ socket.emit('systemErr', {'msg': 'Sorry, we could not find any saved games'}); return;}

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
        
        // get all games the user has
        Player.find({'user':sanId}).populate(charOpts).exec(function(err, players){
            if(err){ socket.emit('systemErr', {'msg': 'Sorry, something went wrong.'}); return;} 
            
            var characters = [];
            players.forEach(function(player){
                
                var playChar = player.character[0]._id.toString();
                
                // remove player 
                if(playChar == character._id) {
                    player.remove();
                }else{
                    characters.push(player.character[0]);
                }
            });
            
            // send the characters left back to client
            socket.emit('gameDeleted',{'characters':characters});
        });
    });
    
    
    // continue playing a previously saved game
    socket.on('playSaved', function(data){
       console.log('continue to play a saved game.');
       var character = data['character'];
       var token = data['user'];
       
       //check if socket and user are already set in clients-array
        var index = Helper.getIndexByKeyValue(clients, 'token', token);
       
        if(index !== null){
            addSocket(socket, token);
            index = Helper.getIndexByKeyValue(clients, 'token',token);

        }else{
            return;
        }
        
        var user = clients[index].user;

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
            Player.createNew(character, flags, user, function(data){
                // if there were any errors
                if(data['err']){
                    socket.emit('systemErr',{'msg':'Sorry, something went wrong. Please contact the system administrator.'});
                    return;
                }
                
                var player = data['player'];
                var clientPlayer = data['clientPlayer']; // same as player but with populated inventory
                player.gameSave = 'replay'; // mark new game, so we can find it and match it agains saved game if resaved
                player.event = event;
                var character = clientPlayer.character[0];
                var storyteller = new Storyteller(socket);

                // start the game client-side
                socket.emit('startGame', {'character':character});            

                Game.continueSavedGame(storyteller, player, event, function(data){
                    
                    var continType = data['continType'];
                    var player = data['player'];

                    //store player together with socket
                    clients[index].player = player;
                    
                    // get new token and update in clients-array
                    var newToken = Helper.getToken(8);
                    clients[index].token = newToken;

                    var toDo = Game.processEventChain(data);
                    var newData = toDo['newData'];
                    var action = toDo['action'];

                    socket.emit(action, newData);
                    // update token client-side
                    socket.emit('updateToken', {'token':newToken});
                });
                
            });            
        });       
    });
        
    //start game and run first event-chain    
    socket.on('play', function(data){
        
        var character = data['character'];
        
        // check first if the character has the right amount of attributes
        var isValid = Game.checkAttributeSum(character['attributes'], MAXSUM);
        
        if(isValid){
            
            // get index for user in clients-array by token sent from client
            var token = data['user'];
            var index = Helper.getIndexByKeyValue(clients, 'token',token);
            
            // if record found, start the game
            if(index !== null){
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
                    
                    // run event-chain
                    Game.runEventChain(storyteller, player, event, function(data){
                        
                        var continType = data['continType'];
                        var player = data['player'];
                                                
                        //store player together with socket
                        clients[index].player = player;   
                        
                        // get new token and update in clients-array
                        var newToken = Helper.getToken(8);
                        clients[index].token = newToken;
                        
                        // process and send result to client
                        var toDo = Game.processEventChain(data);
                        var newData = toDo['newData'];
                        var action = toDo['action'];

                        socket.emit(action, newData);
                        // update token client-side
                        socket.emit('updateToken', {'token':newToken});                        
                    });
                    
                });
            }            
            
        }else{
            // character is not valid, send notification to client            
            socket.emit('notValid', data['character']);
        }        
    });
    
    // continue game after choice is made, start new event-chain
    socket.on('choiceMade', function(data){
        var choiceId = data['choice'];
        
        // get player out from clients-array by socket 
        var index = Helper.getIndexByKeyValue(clients, 'socket',socket);
       
        var player = clients[index].player;
        var storyteller = new Storyteller(socket);
        
        // if player is not found, send an error-message to client through storyteller-object
        if(index == null){
            storyteller.tellError();
            return;
        }
        
        // fetch entire chosen event from db and run new eventChain
        Game.getChoice(choiceId, function(event){
            
            Game.runEventChain(storyteller, player, event, function(data){
               
                var player = data['player'];

                //store player together with socket
                clients[index].player = player;
                
                // get new token and update in clients-array
                var newToken = Helper.getToken(8);
                clients[index].token = newToken;
                                
                // process and send result to client
                var toDo = Game.processEventChain(data);
                var newData = toDo['newData'];
                var action = toDo['action'];
                
                socket.emit(action, newData);  
                
                // update token client-side
                socket.emit('updateToken', {'token':newToken});   
            });
        });                
    });
    
    // save game for user
    socket.on('saveGame', function(data){
        
        var token = data['user'];
        var character = data['character'];
        var event = data['event'];
        
        var index = Helper.getIndexByKeyValue(clients, 'token', token);
        
        // if player is not found, send an error-message to client 
        if(index === null){
            socket.emit('gameSaved', {'msg':'Could not save game'});
            return;
        }
        
        var userId = clients[index].user;        
        var socketPlayer = clients[index].player;
        var flags = socketPlayer.flags;

        // save the player
        Player.saveGame(userId, flags, character, event, function(err){
            
            if(err){
                socket.emit('gameSaved', {'msg':'Ooops, could not save game'});
            }else {
                socket.emit('gameSaved', {'msg':'Game has been saved'});
            }
        });
        
        // get new token and update in clients-array
        var newToken = Helper.getToken(8);
        clients[index].token = newToken;
        socket.emit('updateToken', {'token':newToken});
    });
    
    // after pressing btn 'new game' 
    socket.on('newGame', function(data){
        var token = data['user'];
        var index = Helper.getIndexByKeyValue(clients, 'token', token);
        
        if(index !== null){
            var user = clients[index].user;
            
            // get new token and update in clients-array
            var newToken = Helper.getToken(8);
            clients[index].token = newToken;
        
            // reset all gameSaves on player, start new game and update token client-side
            Game.setSavings(user, function(){
                
                socket.emit('newGame');
                socket.emit('updateToken', {'token':newToken});
            });
        }
        
    });
            
    //when a user disconnects
    socket.on('disconnect', function(){
        
        if(clients.length > 0){ // in case server shut down and avoid negative numbers
            --numUsers;

            //get the right record out of clients array
            var clientI =  Helper.getIndexByKeyValue(clients, 'socket', socket);
            
            if(clientI != null){
                
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
                            } 
                         });

                        // then find the current player and save a backup if not already saved by user
                        Player.findOne({'_id':player._id}, function(err, player){
                            if(err){console.log(err); return;}

                            // create a new back-up of this player if any found
                            if(player){
                                
                                var newPlayer = Player.createNewBackup(player.character[0], userId);
                                newPlayer.event = player.event;
                                newPlayer.flags = player.flags;
                                newPlayer.gameSave = 'backup';
                                
                                newPlayer.save(function(err, newOne){
                                    if(err){console.log(err); return;}
                                    
                                    // finally remove all remaining players that are saved automatically
                                    players.forEach(function(doc){
                                       if(doc.gameSave == 'false'|| doc.gameSave == 'replay'){
                                           
                                           doc.remove();
                                       } 
                                       if(doc.gameSave == 'saved'){
                                           
                                           doc.gameSave = 'true';
                                           doc.save(function(err){
                                              if(err){console.log('err'); return;}
                                              
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
            } // if clientI != null -> end             
        } // if clients.length >0 -> end
    }); // socket.on'disconnect' -> end

}; // module.exports.response -> end
