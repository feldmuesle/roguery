/* 
 * This file handles the socket-connection client-side
 */

// configure socket.io clientside
var socket = io.connect();

// initialize variables
var character;
var attrDesc; // the description for attribute-amounts
var nextEvent; // next event to continue to when pressing continue-button


// constants
var MAXSUM = 100;  // max-sum of attributes add-up
//
var COINS = 20 // default amount for coins
//var ATTRNUM = 12;  // number of attributes

$(document).ready(function(){   


/********* interaction with game **********/
    $('#play').click(function(){
        // hide the gallery
        $('#gallery').hide();
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
        
        var character = getCustomized();
        
       // if it's valid, send it to the server and start the game
       if(validateSum(character.attributes)){
           
           var data = {
               user : user,
               character : character
           }; 
           
           socket.emit('play', data);
           console.log('attributes adjusted - socket.play');
          
           $('#characterForms').modal('hide');
       }       
    });
    
    //click a choice
    $(document).on('click','.choice', function(){
        console.log('you clicked a choice');
        var self = this;
        var choiceId = self.id.substr(6,this.id.length); // choice = 6 chars
        clearText();
        socket.emit('choiceMade', {'choice':choiceId});
    });
    
    //click continue
    $(document).on('click','#continueBtn', function(){
        console.log('you clicked continue');
        clearText();
        socket.emit('choiceMade', {'choice':nextEvent.toString()});
        
    });
    
    // in case data has been tempered and escaped client-side-validation
    socket.on('notValid', function(data){
        console.log('hello from NotValid socket');
        console.dir(data);
       character = data;
       customizeCharacter(character);
    });
    
    socket.on('initialize', function(data){
        console.log('game is initialized');
        attrDesc = data['attrDesc'];
        console.log(attrDesc);
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
        appendToChat('story', capitaliseFirstLetter(text));
    });
    
    socket.on('updateAttr', function(data){
        character = data['character'];
        var attribute = data['attribute'];
        var amount = data['amount'];
        var action = data['action'];
        action == 'loose' ? action='-' : action='+';
        var msg = attribute+' '+action+amount;
        appendToChat('info', capitaliseFirstLetter(msg));
        
        var value = character.attributes[attribute];
        updatePlayerStats(attribute, value);
    });
    
    socket.on('rollDice', function(data){
        var attribute = data['attribute'];
        var difficulty = data['difficulty'];
        var outcome = data['outcome'];
        var advanced = data['advanced'];
        
        var msg = attribute+' roll, difficulty '+difficulty +' - You '+outcome;
        if(advanced){
            msg = attribute+' roll, difficulty '+difficulty +' ADVANCED! - You '+outcome;
        }
        appendToChat('dices', capitaliseFirstLetter(msg));
    });
    
    socket.on('choices', function(data){
        console.log('hello form choices');
        var choices = data['choices'];
        var list = '<ul>';
        for(var i=0; i<choices.length; i++){
            var choice = '<li id="choice'+choices[i].id+'" class="choice link">'+choices[i].choiceText+'</li>';
            list += choice;
        }
        list += '</ul>';
        console.log('append to chat '+list);
        
        appendToChat('dices', list);
    });


    socket.on('pressContinue', function(data){
       nextEvent = data['event'];
       console.log(nextEvent);
       console.log('please press continue to proceed');
       var continueBtn = '<span id="continueBtn" class="link">continue</span>';
        appendToChat('gameBtn', continueBtn);
       
    });
});


