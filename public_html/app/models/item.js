/* Model for items */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Helper = require('../controllers/helper_functions.js');

//validators
var valEmpty = [Helper.valEmpty, 'The field \'{PATH}:\' must just not be empty.'];

var ItemSchema = Schema({
    id      :   {type: Number, unique:true},
    name    :   {type:String, trim:true, lowercase:true, validate:valEmpty}
});

ItemSchema.set('toObject', {getters : true});

//sanitize strings before saving
ItemSchema.pre('save', function(next){
    var self = this || mongoose.model('Item');
    console.log('hello from pre-save: '+self.name);
    self.name = Helper.sanitizeString(self.name);
    console.log('item to update: '+self);
    next();
});

// restrict-delete: check if the item is used in an event and prevent deletion
ItemSchema.pre('remove', function(next){
    console.log('hello from item pre-remove');
    var self = this || mongoose.model('Item');
    
    self.model('Event').find({'items.item.id':self.id}).exec(function(err, events){
        if(err){console.log(err); next(err);}
       
        if(events.length > 0){
            var customErr = new Error('Cannot delete item due to depending event: \' '+events[0].name+'\'');
            next(customErr);
        }else{
            next();
        }        
    });
});

// cascade-delete: delete ref. in player's inventory, when item is deleted
ItemSchema.post('remove', function(next){
    console.log('hello from item post-remove');
    var self = this || mongoose.model('Item');
    self.model('Player').update(
            {inventory: mongoose.Types.ObjectId(self._id)},
            {$pull: {inventory : mongoose.Types.ObjectId(self._id)}},
            {multi:true},
            function(err,next){
                if(err){console.error(err); return;}   
                console.log('item has been removed from player');
                next;
            }
        );
});

var ItemModel = mongoose.model('Item', ItemSchema);
module.exports = ItemModel;

// create some items
{
//    var key = {id:1, name:'a golden key'};
//    var box = {id:2, name:'a little box'};
//    var book = {id:3, name:'a book'};
//    var hat = {id:4, name:'an old hat'};
//    var pearl = {id:5, name:'a black pearl'};
//    var needle = {id:6, name:'a pointy needle'};
//
//
//    var items = [key, box, book, hat, pearl, needle];
//    console.log(items.length);
//    
//    for( var j=0; j<items.length; j++){
//        var item = new ItemModel(items[j]);
//        item.save(function(err, items){
//            if(err){console.log(err); return;}
//            console.log('item saved.');
//            console.log(item);
//        });
//        console.log('i = '+j);
//    }
}