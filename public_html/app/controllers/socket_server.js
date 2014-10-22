/* 
 * This file handles the game itself
 */

// modules we need
var events = require('events');
var eventEmitter = new events.EventEmitter();

// global variables we need
var users = []; //array of users that are currently connected
var numUsers =0;

// get all the models we need
//var Texter = require('./texter.js');
//var User = require('../models/user.js');
//var Game = require('./game_functions.js');



module.exports.response = function(socket){
    console.log('hello from socket-response'); 
    };
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
}; // module.exports.response -> end
