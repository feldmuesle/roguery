/* 
 * This file handles the socket-connection client-side
 */

// configure socket.io clientside
var socket = io.connect();

// initialize variables
var character;
var attrDesc; // the description for attribute-amounts
var nextEvent; // next event to continue to when pressing continue-button
var currEvent = 0; // current event - used for saving
var savedGames=[] // array holding the saved games of player



// constants
var MAXSUM = 100;  // max-sum of attributes add-up
var COINS = 20 // default amount for coins
//var ATTRNUM = 12;  // number of attributes

$(document).ready(function(){   


/********* interaction with game **********/
    $('#play').click(function(){
        
        console.log('character from random: ');
        var data = {
            user : user,
            character : character
        };
        socket.emit('play', data);
        console.dir(data);
    });
    
    $('#playSaved').click(function(){
        // hide the gallery
        $('#gallery').hide();
        var data = {
            user : user,
            character : character
        };
        socket.emit('playSaved', data);
        console.dir(data);
    });
    
    // start playing with customized character
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
    
    // save current game
    $('#save').click(function(){
        console.log('save this game');
        
        // check if an event is set yet (prevent user to save game immediatly after start)
        if(currEvent != 0){
            var data = {
                'user'       : user,
                'character' : character, 
                'event'      : currEvent
            };
            socket.emit('saveGame', data);
           console.log('game saved '+currEvent);
        }
        
    });
    
    // delete a saved game
    $('#gameDel').click(function(){
        
        var data = {
            'user'       : user,
            'character' : character
        };
        socket.emit('gameDel', data);
        console.log('game deleted');        
    });
    
    // load gallery with previously saved games
    $('#viewSaved').click(function(){
        console.log('view previously saved games');
        // fetch the latest saved games including backup of last game
        socket.emit('viewSaved', {'user':user});
    });
    
    $('#newGame').click(function(){
    console.log('you want to play a new game');
    // TODO: emit to socket and delete backup and replayed and set saved to true;
    socket.emit('newGame', {'user':user});
    
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
    
    // start a new game with approved character
    socket.on('startGame', function(data){
        console.log('start game with player');
        character = data['character'];
        console.log('character recieved back: ');
        console.dir(character);
        gameInit();
        displayPlayerStats(character);
        if(character.attributes.coins != 20){
            updatePlayerStats('coins', character.attributes.coins);
        }
    });
    
    socket.on('newGame', function(data){
        $('#storyWrapper').hide();
        $('#profileBox').hide();    
        $('#gallery').show();
        showGallery();
    });
    
    //notify user that game has been saved
    socket.on('gameSaved', function(data){
       console.log(data['msg']); 
    });
    
    
    socket.on('output', function(data){
        var className;
        if(data['class'] ){
            className = data['class'];
        }else{
            className = 'story';
        }
        var text = data['text'];
        appendToChat(className, capitaliseFirstLetter(text));
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
    
    socket.on('updateInventory', function(data){
        console.log('update inventory');
        character = data['character'];
        var item = data['item'];
        var action = data['action'];
//        action == 'loose' ? action='-' : action='+';
        var msg = 'You '+action+'  '+item.name;//attribute+' '+action+amount;
        appendToChat('info', capitaliseFirstLetter(msg));
        updateInventory(item, action);
//        
//        var value = character.attributes[attribute];
//        updatePlayerStats(attribute, value);
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
        currEvent = data['current']; // set current event in case of saving
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
       currEvent = data['current'];
       console.log(nextEvent);
       console.log('please press continue to proceed');
       var continueBtn = '<span id="continueBtn" class="link">continue</span>';
        appendToChat('gameBtn', continueBtn);
       
    });
    
    socket.on('viewSavedGames', function(data){
        savedGames = data['games'];
        var backup = data['backup'];
        var index = getIndexByKeyValue(savedGames, '_id', backup);
        
        console.log('show the saved games!');
        createGallery(savedGames, 'saved');
        $('#heading').find('h2').html('<span class="fa fa-sign-in"></span> continue saved game');
        $('#viewGallery').show();
        $('#viewSaved').hide();
        if(index != null){
            console.log('we know which one is the backup!');
            $('#thumb'+index).css('border','1px solid red');
            
        }
    });
    
    socket.on('gameDeleted', function(data){
        console.log('game has been deleted');
       savedGames = data['characters'];
       createGallery(savedGames, 'saved');
        $('#heading').find('h2').html('<span class="fa fa-sign-in"></span> continue saved game');
        $('#viewGallery').show();
        $('#viewSaved').hide();
//        if(index != null){
//            console.log('we know which one is the backup!');
//            $('#thumb'+index).css('border','1px solid red');
//            
//        }
       
    });
    
    
    
});// document.ready --> end


