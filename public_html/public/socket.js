/* 
 * This file handles the socket-connection client-side
 */

// configure socket.io clientside
var socket = io.connect();

// initialize variables
var character;


// constants
var MAXSUM = 130;  // max-sum of attributes add-up
var ATTRNUM = 12;  // number of attributes

$(document).ready(function(){   

    $('#play').click(function(){
           console.log('character from random: ');
           var data = {
               user : user,
               character : character
           };
           socket.emit('play', data);
           console.dir(data);
    });
    
    $('#btnPlay').click(function(){
        // close modal and get values from form
        $('#characterForms').modal('hide');
        var character = getCustomized();
        
       // if it's valid, send it to the server and start the game
       if(validateSum(character.attributes)){
           
           var data = {
               user : user,
               character : character
           }; 
           
           socket.emit('play', data);
           console.log('attributes adjusted - socket.play');
           console.dir(data);
       }       
    });
    
    // in case data has been tempered and escaped client-side-validation
    socket.on('notValid', function(data){
        console.log('hello from NotValid socket');
        console.dir(data);
       character = data;
       customizeCharacter(character);
    });
    
    socket.on('startGame', function(data){
        console.log('start game with player');
        character = data['character'];
        console.log('character recieved back '+character);
        gameInit();
        displayPlayerStats(character);
    });
    
    socket.on('output', function(data){
        
        var type = data['type'];
        var text = data['text'];
        console.dir(data);
        console.log(text);
        appendToChat('story', capitaliseFirstLetter(text));
    });
    
    socket.on('updateAttr', function(data){
        var attribute = data['attribute'];
        var amount = data['amount'];
        var action = data['action'];
        action == 'loose' ? action='-' : action='+';
        var msg = attribute+' '+action+amount;
        appendToChat('info', capitaliseFirstLetter(msg));
    });
    
    socket.on('rollDice', function(data){
        var attribute = data['attribute'];
        var difficulty = data['difficulty'];
        var outcome = data['outcome'];
        var advanced = data['advanced'];
        
        var msg = attribute+' roll, difficulty '+difficulty +' - You '+outcome;
        appendToChat('dices', capitaliseFirstLetter(msg));
    });

});


