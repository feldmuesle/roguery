/* 
 * This file handles the socket-connection client-side
 */

// configure socket.io clientside
var socket = io.connect();

// initialize variables
var player;
var character;

// constants
var MAXSUM = 130;  // max-sum of attributes add-up

$(document).ready(function(){   

    $('#play').click(function(){
           console.log('character from random: ');
           console.dir(character);
           socket.emit('play', character);
    });
    
    $('#btnPlay').click(function(){
       // if it's valid, send it to the server and start the game
       if(validateSum(character.attributes)){
           getCustomized();
           socket.emit('play', character);
           console.log('attributes adjusted - socket.play');
           console.dir(character);
       }       
    });
    
    // in case data has been tempered and escaped client-side-validation
    socket.on('notValid', function(data){
        console.log('hello from NotValid socket');
        console.dir(data);
       character = data;
       customizeCharacter(character);
    });

});


