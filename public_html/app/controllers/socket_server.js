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

// add socket to array of current connected sockets
var addSocket = function(socket, user){
    
    var index = Helper.getIndexByKeyValue(clients, 'user', user);
    
    if(index == null){
        socket.room = user;
        var client = {'user':user, 'socket':socket};
        clients.push(client);
        numUsers++;
        console.log('socket added to clientArray');      
        
    } else {
        console.log('user already registered, no new client added.');
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
    
    socket.on('viewSaved', function(data){
        console.log('view the saved games.');
        var userId = data['user']; 
        var sanId = Helper.sanitizeString(userId);
        
        Player.find({user: sanId, gameSave:{$ne:'false'}}, '-user -_id').populate('character character.guild')
            .exec(function(err, players){
                if(err){ return console.log(err);}
                console.dir(players);
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
    
    socket.on('playSaved', function(data){
       console.log('continue to play a saved game.');
       var character = data['character'];
       var user = data['user'];
       
       //check if socket and user are already set in clients-array
        var index = Helper.getIndexByKeyValue(clients, 'user',user);
        console.log('index '+index);
        if(index === null){
            addSocket(socket, user);
            index = Helper.getIndexByKeyValue(clients, 'user',user);

        }
        console.log('clients socketId= '+clients[index]);
        console.log('yeah we found the player!');
       
        Game.continueSavedGame(character, function(data){
            var player = data['player'];
            var event = data['event'];
            var character = player.character[0];
            var storyteller = new Storyteller(socket);   
            
            //store playerId together with socket
            clients[index].player = player._id;  

            // start the game client-side
            socket.emit('startGame', {'character':character});

            Game.runEventChain(storyteller, player, event, function(data){
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
            var index = Helper.getIndexByKeyValue(clients, 'user',data['user']);
            
            if(index != null){
                var userId = clients[index].user;
                Game.startGame(character, userId, function(data){
                    
                    var player = data['player'];
                    var event = data['event'];
                    var location = data['location'];
                    var character = player.character[0];
                    var storyteller = new Storyteller(socket);
                    //store playerId together with socket
                    clients[index].player = player._id;                    
                    
                    // start the game client-side
                    socket.emit('startGame', {'character':character});
                    socket.emit('output', {'type':'location', 'text':location.text});
                    
                    Game.runEventChain(storyteller, player, event, function(data){
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
        var player = clients[index].player;
        var storyteller = new Storyteller(socket);
        
        // fetch entire chosen event from db and run new eventChain
        Game.getChoice(choiceId, function(event){
            console.log('hello from getChoice callback, event= '+event);
            Game.runEventChain(storyteller, player, event, function(data){
               
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
    
    // save game for user
    socket.on('saveGame', function(data){
        var userId = data['user'];
        var character = data['character'];
        var event = data['event'];

        console.log('save the game');
        Player.saveGame(userId, character, event, function(err){
            
            if(err){
                socket.emit('gameSaved', {'msg':'oops, could not save game'});
            }else {
                socket.emit('gameSaved', {'msg':'game has been saved'});
            }
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
            var clientI =  Helper.getIndexByKeyValue(clients, 'socket', socket);
            console.log('client-index: '+clientI);
            console.log('client '+clients[clientI]);
            var player = clients[clientI].player;
            var userId = clients[clientI].user;
            clients.splice(clientI, 1);
            console.log('user removed from clients');
            console.dir(player);
            // check first if there is a player set at all
            if(player != undefined){
                
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
                        console.log('queried player:');
                        console.dir(player);
                        if(player.gameSave != 'true'){ // would be true if the user had saved player himself
                            player.gameSave = 'backup';
                            player.save(function(err, savedPlayer){
                                if(err){console.log(err); return;}
                                
                                // finally remove all remaining players that are saved automatically
                                var savedId = savedPlayer._id.toString();
                                
                                players.forEach(function(doc){
                                    console.dir(doc);
                                    var id = doc._id.toString();
                                    
                                   if(doc.gameSave == 'false' && id != savedId){
                                       console.log('player has been removed '+doc._id);                                       
                                       doc.remove();
                                   } 
                                });
                            });
                        }else {
                            // do not overwrite the saved game, but create a new player and save as backup
                            var newPlayer = Player.createNewBackup(player.character[0], userId);
                            newPlayer.event = player.event;
                            newPlayer.gameSave = 'backup';
                            newPlayer.save(function(err){
                                if(err){console.log(err); return;}
                                console.log('a backup of this saved game has been saved.');
                                
                                // finally remove all remaining players that are saved automatically
                                players.forEach(function(doc){
                                   if(doc.gameSave == 'false'){
                                       console.log('player has been removed '+doc._id);
                                       doc.remove();

                                   } 
                                });
                            });
                        }   
                        console.log('players: ');
                        console.dir(players);
                        console.log(players.length);
                        
                    });
                });
            }            

        }
    }); // socket.on'disconnect' -> end
{   
////    Game.insertTestItem();    
////    Game.insertTestNpc();
////    Game.insertTestRoom();
////    Game.deleteRoomById(3);
////    Game.deleteNpcById(7);
////    Game.createGuild();
//
////      Game.test(3);
//    
//    /********* GAMESTART - CONNECT ****************************************************/
//{   
//    // check if the nickname is already taken
//    socket.on('check nickname', function(data){
//       var nickname = data['nickname'];
//       var guild    = data['guild'];
//       var userId   = data['userId'];
//       var gender = data['gender'];
//       
//       User.findOne({'nickname': nickname}, function(err, user){
//            if(err){console.error(err); return;}
//
//            // if there's already a user with this nickname, prompt user to choose another one
//            if(user){
//                socket.emit('nickname taken', {
//                   nickname :   nickname,
//                   message  :  'the nickname'+ nickname +' is already taken, please choose a different nickname.'
//                });  
//
//            }else{
//                // fire up a new game
//                Game.startNewGame(userId, nickname, guild, gender, socket, function(game){
//                    // configure socket 
//                    socket.pseudo = game['player'].nickname;
//                    socket.room = game['room'].name;
//                    socket.roomId = game['room'].id;
//                    socket.join(game['room'].name);
//                    
//                    // start game clientside
//                    socket.emit('start game', {
//                        player  :   game['player'],
//                        room    :   game['room'],
//                        users   :   game['online'],
//                        roomies :   game['roomies']
//                    });       
//                    
//                    // set variables to broadcast, since socket.broadcast has to be done outside of this callback!            
//                    var broadcast = {
//                        currSocket  :   socket,
//                        players     :   game['online'],
//                        roomies     :   game['roomies']
//                    };
//                    // emit events for eventEmitter to catch outside of callback
//                    eventEmitter.emit('broadcast user joined', broadcast);
//                    eventEmitter.emit('broadcast players in room', broadcast);
//                });    
//            }              
//        }); // end of promise-chain
//        
//        // broadcast to all users
//        // has to be done outside of callback, but only once for this socket, not sockets of all players
//        eventEmitter.once('broadcast user joined', function(data){
//                        
//            socket.broadcast.emit('user joined',{
//                username    :   data['currSocket'].pseudo,
//                numUsers    :   data['players'].length,
//                usersOnline :   data['players']
//            });
//        });   
//        
//        // update playerlist for all players in same room
//        eventEmitter.once('broadcast players in room', function(data){
//            
//            socket.broadcast.to(socket.room).emit('playerlist',{
//                playersInRoom   :  data['roomies'],
//                currRoom        :  data['currSocket'].room
//            });
//            
//        });  
//    }); // socket.on'check nickname' end
//    
//    socket.on('loadGame', function(data){
//        var userId = data['userId'];
//        var playersOnline;
//        var playersInRoom;
//        
//        
//        Game.loadGame(userId, socket, function(data){
//          // configure socket of player
//            console.log('hello from loadGame1-callback-function');
//            data['player'].socketId = socket.id;
//            socket.pseudo = data['player'].nickname;
//            socket.room = data['room'].name;
//            socket.roomId = data['room'].id;
//            socket.join(data['room'].name);
//            
//            
//            // send the game to the client
//            socket.emit('start game', {
//                player  :   data['player'],
//                room    :   data['room'],
//                users   :   data['online'],
//                roomies :   data['roomies']
//            });
//            
//            
//            // set variables to broadcast, since socket.broadcast has to be done outside of this callback!            
//            var broadcast = {
//                currSocket  :   socket,
//                players     :   data['online'],
//                roomies     :   data['roomies']
//            };
//            
//            // broadcast to all players online and update players-online-list
//            eventEmitter.emit('broadcast user joined', broadcast);
//            
//            //broadcast new playerlist to players in same room 
//            eventEmitter.emit('broadcast players in room', broadcast);
//            
//        });// function loadGame-callback -> end        
//        
//        eventEmitter.once('broadcast user joined', function(data){
//                        
//            socket.broadcast.emit('user joined',{
//                username    :   data['currSocket'].pseudo,
//                numUsers    :   data['players'].length,
//                usersOnline :   data['players']
//            });
//        });   
//        
//        eventEmitter.once('broadcast players in room', function(data){
//            
//            socket.broadcast.to(socket.room).emit('playerlist',{
//                playersInRoom   :  data['roomies'],
//                currRoom        :  data['currSocket'].room
//            });
//            
//        });  
//    }); // socket.on 'load game' -> end
//} // codeblock GameStart -> end
//
//    /******* GAMEEND - DISCONNECT ***********************************************/
//    
//    //when a user disconnects
//    socket.on('disconnect', function(data){
//        console.log('disconnecting - is there anything?');
//                console.dir(data);
//        Game.removePlayer(socket , function(data){
//            
//            // broadcast to all users online that user has left and update players-online-list
//            socket.broadcast.emit('user left',{
//                username        :   socket.pseudo,
//                numUsers        :   data['numUsers'],
//                usersOnline     :   data['online']
//            });
//            
//            //broadcast new playerlist to players in same room as left user
//            socket.broadcast.to(socket.room).emit('playerlist',{
//                playersInRoom   :  data['roomies'],
//                currRoom        :  socket.room
//            });
//        });     
//
//    }); // socket.on'disconnect' -> end
//    
//    /******** CHANGE ROOM ****************************************************************/
//    socket.on('changeRoom',function(data){
//        console.log('change room to : '+data['newRoomId']);
//        var oldRoom = data['oldRoom'];
//        var newRoomId = data['newRoomId'];
//        var player = data['player'];
//        var index = data['index'];
//        
//        Game.changeRoom(oldRoom, newRoomId, player, function(data){
//            
//            console.log('hello from socket_server changeRoom-function-callback');
//
//            var room = data['newRoom'];
//            var oldRoomies = data['oldRoomies'];
//            var newRoomies = data['newRoomies'];
//            
//            //console.log('npcs in socket-callback '+npcs);
//            // save new room in sockets session
//            socket.leave(oldRoom.name);
//            socket.join(room.name);
//            socket.room = room.name;
//            socket.roomId = room.id;  
//            
//            
//            // let the player enter new room and update his players-in-room-list
//            console.log('data to user in new room '+room.id+' sent');
//            socket.emit('enterRoom',{
//                roomies : newRoomies,
//                room    : room
//           }); 
//           
//           // get needed data for broadcasting to players in old room
//           var goodbye = player.nickname +' '+oldRoom.exits[index].goodbye
//                            + ' and leaves the '+oldRoom.name+'.';
//            
//            // get needed data for broadcasting arrival to players in new room
//           var hello = player.nickname +' '+oldRoom.exits[index].hello
//                            + ' and enters the '+room.name+'.';
//           
//           var broadcast = {
//               'oldRoom'    : oldRoom.name,   
//               'goodbye'    : goodbye,
//               'oldRoomies' : oldRoomies,
//               'newRoom'    : room.name,
//               'hello'      : hello,               
//               'newRoomies' : newRoomies
//           };
//           
//           eventEmitter.emit('broadcast roomTraffic', broadcast);
//            
//        });
//        
//        // broadcast once to players in old or new room
//        eventEmitter.once('broadcast roomTraffic', function(data){
//            
//            // if there are other users left in the old room
//            if(data['oldRoomies'].length > 0){
//                console.log('data to users in old room '+data['oldRoom']+' sent');
//                 socket.broadcast.to(data['oldRoom']).emit('roomTraffic',{
//                    'roomies' : data['oldRoomies'],
//                    'info' : data['goodbye'],
//                    'currRoom': data['oldRoom']
//                });
//            }
//            
//            // broadcast and update playerlist if there are other players in room
//            if(data['newRoomies'].length > 1){
//                 console.log('data to users in new room '+data['newRoom']+' sent');
//                 socket.broadcast.to(data['newRoom']).emit('roomTraffic',{
//                    'roomies'   : data['newRoomies'],
//                    'currRoom'  : data['newRoom'],
//                    'info'      : data['hello']
//                });
//            }
//         });   
//        
//    }); // socket.on 'changeRoom' -> end
//    
//    
//    /******** COMMANDS ****************************************************************/
//    socket.on('command', function(data){
//        var commands = data['command'];
//        var player = data['player'];
//        var room = data['room'];
//        Game.checkCommand(commands, player, room, function(response){
//            console.log('data returned to callback '+response);
//        });
//        
//    });
//    
//    /******** CHAT ****************************************************************/
//    socket.on('chat',function(data){
//          socket.broadcast.to(socket.room).emit('message',data);
//          console.log('user '+ data['username'] + ' sends '+ data['msg']+' on socket.room' + socket.room);
//    });
}
}; // module.exports.response -> end
