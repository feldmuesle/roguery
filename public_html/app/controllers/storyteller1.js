/* 
 * This file manages outputting the story-lines to the right player and updates his stats
 */

var events = require('events');
var storyteller = new events.EventEmitter();
var sockets = require('./socket_server.js');
//var clients = sockets.clients;


exports.test = function(){
    console.log('hello from storyteller clients: '+sockets.clients);
};
//var clients = []; // all socket online
//
//exports.updateSockets = function(sockets){
//    clients = sockets;
//};

function addListeners (player){
    var socket = getSocket(player.user);
    console.log('socket from storyteller: '+socket.id);
    
//    storyteller.once('updatePlayer', function(data){
//       socket.emit('updatePlayer', data); 
//    });
    
        
    storyteller.once('writeOnce', function(data){
        console.log('hello from storyteller-listener write: sending msg to client');
        socket.emit('output', data);    
    });
    
};

exports.addListeners = function(player){
    console.log('hello from addListeners');
    addListeners(player);
};

exports.updateAttr = function(text, player){  
    console.log('hello from storyteller.write');
    console.log(text);
    storyteller.removeAllListeners();
    addListeners(player);
    storyteller.emit('writeOnce', {'text': text});
};

exports.write = function(text, player){  
    console.log('hello from storyteller.write');
    console.log(text);
    storyteller.removeAllListeners();
    addListeners(player);
    storyteller.emit('writeOnce', {'text': text});
};

//exports.updatePlayer = function(player, roomName){  
//    storyteller.removeAllListeners();
//    addListeners(player.socketId);
//    storyteller.emit('updatePlayer', {'player':player, 'room': roomName});
//};


/***********************************************************************************/
/****** helper-functions **********************************************************/

//get the players socket
function getSocket(user){
    console.log('hello from getSocket storyteller');
    var clients = sockets.clients;
    for(var i=0; i<clients.length; i++){
        if(clients[i]['user'] == user){
            return clients[i].socket;
        }
    }    
}
