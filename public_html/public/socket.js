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
    initialize();
    
    $('#play').click(function(){
        
        var data = {
            user : user,
            character : character
        };
        socket.emit('play', data);
    });
    
    $('#playSaved').click(function(){
        // hide the gallery
        $('#gallery').hide();
        var data = {
            user : user,
            character : character
        };
        socket.emit('playSaved', data);
    });
    
    // start playing with customized character
    $('#btnPlay').click(function(){
              
        var character = getCustomized();
        
        // if it's valid, send it to the server and start the game
        if(validateSum(character.attributes)){

            var data = {
                user : user,
                character : character
            };            
            socket.emit('play', data);  
            // close modal
            $('#characterForms').modal('hide');           
        }       
    });
    
    // save current game
    $('#save').click(function(){
        
        // check if an event is set yet (prevent user to save game immediatly after start)
        if(currEvent != 0){
            var data = {
                'user'       : user,
                'character' : character, 
                'event'      : currEvent
            };
            socket.emit('saveGame', data);
        }        
    });
    
    // delete a saved game
    $('#gameDel').click(function(){
        
        var data = {
            'user'       : user,
            'character' : character
        };
        socket.emit('gameDel', data);       
    });
    
    // load gallery with previously saved games
    $('#viewSaved').click(function(){
        // fetch the latest saved games including backup of last game
        socket.emit('viewSaved', {'user':user});
    });
    
    $('#newGame').click(function(){
        // emit to socket and delete backup and replayed and set saved to true;
        socket.emit('newGame', {'user':user});
    });
    
    //click a choice
    $(document).on('click','.choice', function(){
        var self = this;
        var choiceId = self.id.substr(6,this.id.length); // choice = 6 chars
        clearText();
        socket.emit('choiceMade', {'choice':choiceId});
    });
    
    //click continue
    $(document).on('click','#continueBtn', function(){        
        clearText();
        socket.emit('choiceMade', {'choice':nextEvent.toString()});        
    });
    
    // in case data has been tempered and escaped client-side-validation
    socket.on('notValid', function(data){
        character = data;
        customizeCharacter(character);
    });
    
    // set attributes-description
    socket.on('initialize', function(data){
        attrDesc = data['attrDesc'];
    });
            
    // start a new game with approved character
    socket.on('startGame', function(data){
        character = data['character'];
        gameInit();
        displayPlayerStats(character);
        if(character.attributes.coins != 20){
            updatePlayerStats('coins', character.attributes.coins);
        }
    });
    
    socket.on('newGame', function(data){
        $('#storyWrapper').hide();
        $('#profileBox').hide();
        $('#newGame').hide();
        $('#save').hide();
        $('#gallery').show();
        showGallery();
    });
    
    //notify user that game has been saved
    socket.on('gameSaved', function(data){
       console.log(data['msg']); 
       savedGameNotify(data['msg']);
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
        character = data['character'];
        var item = data['item'];
        var action = data['action'];
//        action == 'loose' ? action='-' : action='+';
        var msg = 'You '+action+'  '+item.name;//attribute+' '+action+amount;
        appendToChat('info', capitaliseFirstLetter(msg));
        updateInventory(item, action);
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
        
        var choices = data['choices'];
        currEvent = data['current']; // set current event in case of saving
        var list = '<ul>';
        for(var i=0; i<choices.length; i++){
            var choice = '<li id="choice'+choices[i].id+'" class="choice link">'+choices[i].choiceText+'</li>';
            list += choice;
        }
        list += '</ul>';
        appendToChat('dices', list);
    });


    socket.on('pressContinue', function(data){
        nextEvent = data['event'];
        currEvent = data['current'];
        var continueBtn = '<span id="continueBtn" class="link">continue</span>';
        appendToChat('gameBtn', continueBtn);
       
    });
    
    socket.on('viewSavedGames', function(data){
        savedGames = data['games'];
        var backup = data['backup'];
        var index = getIndexByKeyValue(savedGames, '_id', backup);
        
        createGallery(savedGames, 'saved');
        $('#heading').find('h2').html('<span class="fa fa-sign-in"></span> continue saved game');
        $('#viewGallery').show();
        $('#viewSaved').hide();
        
        if(index != null){            
            var textOver = document.createElement('h3');
            $(textOver).attr('class', 'textOver');
            $(textOver).html('backup');
            $('#thumb'+index).children('.imgBox').append(textOver);            
        }
    });
    
    socket.on('gameDeleted', function(data){
       
        savedGames = data['characters'];
        createGallery(savedGames, 'saved');
        $('#heading').find('h2').html('<span class="fa fa-sign-in"></span> continue saved game');
        $('#viewGallery').show();
        $('#viewSaved').hide();       
    });
    
    socket.on('end', function(data){
       gameOver(); 
    });
    
    socket.on('dead', function(data){
       gameOver(); 
    });
    
    socket.on('systemErr', function(data){
        appendToChat('error', capitaliseFirstLetter(data['msg']));
    });      
    
});// document.ready --> end


