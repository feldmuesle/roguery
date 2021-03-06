/* 
 * This file manages outputting the story-lines to the right player and updates his stats
 */

var storyTeller = function Storyteller (socket){
    
    var self = this;
    self.socket = socket;
    
    self.setsocket = function(socket){self.socket = socket;};
    
    self.write = function(text){
        self.socket.emit('output', {'text':text});
    };
    
    self.writeWithClass = function(className, text){
        self.socket.emit('output', {'text':text, 'class':className});
    };
    
    self.updateAttr = function(character, attribute, amount, action){

        var data = {
            'character': character,
            'attribute': attribute,
            'action'   : action,
            'amount'   : amount
        };
        self.socket.emit('updateAttr', data);
    };
    
    self.updateInventory = function(character, item, action){
        
        var data = {
            'character': character,
            'item': item,
            'action'   : action
        };
        self.socket.emit('updateInventory', data);
    };
    
    self.rollDice = function(data){    
        self.socket.emit('rollDice', data);
    };
    
    self.tellError = function(){
        var msg = 'Ooops, something went wrong. Please contact the system administrator.';
      self.socket.emit('systemErr', {'msg':msg});  
    };    
};

module.exports = storyTeller;