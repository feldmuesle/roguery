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
    self.name = Helper.sanitizeString(self.name);
    next();
});

// restrict-delete: check if the item is used in an event and prevent deletion
ItemSchema.pre('remove', function(next){
   
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
    
    var self = this || mongoose.model('Item');
    self.model('Player').update(
        {inventory: mongoose.Types.ObjectId(self._id)},
        {$pull: {inventory : mongoose.Types.ObjectId(self._id)}},
        {multi:true},
        function(err,next){
            if(err){console.error(err); return;}   
            next;
        }
    );
});

var ItemModel = mongoose.model('Item', ItemSchema);
module.exports = ItemModel;
