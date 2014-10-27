/* Model for events */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Helper = require('../controllers/helper_functions.js');

//validators
var valEmpty = [Helper.valEmpty, 'The field \'{PATH}:\' must just not be empty.'];

var EventSchema = Schema({
    id          :   {type: Number, unique:true},
    name        :   {type:String, trim:true, lowercase:true, validate:valEmpty},
    text        :   {type:String, trim:true, lowercase:true, validate:valEmpty},
    location    :   {type: Schema.Types.ObjectId, ref:'Location', index:true, required:true},
    newPara     :   {type:Boolean, default:false},
    isChoice    :   {type:String, trim:true, lowercase:true, required:true},
    setFlag     :   {type:String, trim:true, lowercase:true, required:true},
    item        :   [{  item    :    {type:String, ref:'Item'},
                        action  :    {type:String, trim:true, lowercase:true, required:true}   
                }],
    reqFlag     :   [{type: Schema.Types.ObjectId, ref:'Flag', index:true}],
    attributes  :   [{
                    attribute  :   {type:String, trim:true, lowercase:true},
                    action  :    {type:String, trim:true, lowercase:true},
                    amount  :   {type:Number, min:1, max:10}                    
                }],
    branchType  : {type:String, trim:true, lowercase:true, required:true},
    branch      :   [{type: Schema.Types.Mixed}]
});

DiceSchema = new Schema({
    
    attribtue   :   {type:String, trim:true, lowercase:true, required:true},
    difficulty  :   {type:Number, min:5, max:25, required:true},
    success     :   {
        type    :   {type:String, trim:true, lowercase:true, required:true},
        location:   {type: Schema.Types.ObjectId, ref:'Location', index:true},
        events  :   [{type: Schema.Types.ObjectId, ref:'Event', index:true}]
    },
    failure     :   {
        type    :   {type:String, trim:true, lowercase:true, required:true},
        location:   {type: Schema.Types.ObjectId, ref:'Location', index:true},
        events  :   [{type: Schema.Types.ObjectId, ref:'Event', index:true}]
        }
        
});

ChoiceSchema = new Schema({
    type    :   {type:String, trim:true, lowercase:true, required:true},
    amount  :   {type:Number, min:1, max:8, required:true},
    events  :   [{type: Schema.Types.ObjectId, ref:'Event', index:true}]
});

ContinueSchema = new Schema({
    event   :   {type: Schema.Types.ObjectId, ref:'Event', index:true},
    location:   {type: Schema.Types.ObjectId, ref:'Location', index:true}
});

EventSchema.set('toObject', {getters : true});

//sanitize strings before saving
EventSchema.pre('save', function(next){
    var self = this || mongoose.model('Event');
    console.log('hello from pre-save: '+self.name);
    self.name = Helper.sanitizeString(self.name);
    self._id  = self.name;
    next();
});

var EventModel = mongoose.model('Event', EventSchema);
module.exports = EventModel;

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