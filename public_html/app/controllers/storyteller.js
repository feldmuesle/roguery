/* 
 * This file manages outputting the story-lines to the right player and updates his stats
 */

var storyTeller = function Storyteller (socket){
    var self = this;
    self.socket = socket;
    
    self.setsocket = function(socket){self.socket = socket;};
    
    self.write = function(text){
        console.log(text);
        console.log('hello from storyteller-listener write: sending msg to client');
        self.socket.emit('output', {'text':text});
    };
    
    self.updateAttr = function(character, attribute, amount, action){
        console.log(action +' '+amount+' '+attribute);  
        console.log('hello from storyteller-listener write: sending msg to client');
        var data = {
            'character': character,
            'attribute': attribute,
            'action'   : action,
            'amount'   : amount
        };
        self.socket.emit('updateAttr', data);
    };
    
    self.rollDice = function(data){ // data = 
        
        self.socket.emit('rollDice', data);
    };
     
    
};

module.exports = storyTeller;