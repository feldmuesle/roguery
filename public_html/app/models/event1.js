/* Model for events */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Flag = require('./flag.js');
var Location = require('./location.js');
var Helper = require('../controllers/helper_functions.js');

//validators
var valEmpty = [Helper.valEmpty, 'The field \'{PATH}:\' must just not be empty.'];

var EventSchema = Schema({
    id          :   {type: Number, unique:true},
    name        :   {type:String, trim:true, lowercase:true, validate:valEmpty},
    text        :   {type:String, trim:true, lowercase:true, validate:valEmpty},
    location    :   {type: Schema.Types.ObjectId, ref:'Location', index:true, required:true},
    newPara     :   {type:Boolean, default:false},
    isChoice    :   {type:Boolean, default:false},
    choiceText  :   {type:String, trim:true, lowercase:true},
    setFlag     :   {type:Boolean, default:false},
    flag        :   {type: Schema.Types.ObjectId, ref:'Flag', index:true},
    items       :   [EventItemSchema],
    reqFlag     :   [{type: Schema.Types.ObjectId, ref:'Flag', index:true}],
    attributes  :   [AttributeSchema],
    branchType  :   {type:String, trim:true, lowercase:true, required:true},
    branch      :   [{type: Schema.Types.Mixed}]
});

// sub-schemas

var EventItemSchema = new Schema({
    item    :    {type:String, ref:'Item'},
    action  :    {type:String, trim:true, lowercase:true, required:true}  
});
var EventItemModel = mongoose.model('EventItem', EventItemSchema);

var AttributeSchema = new Schema({
    attribute   :   {type:String, trim:true, lowercase:true},
    action      :   {type:String, trim:true, lowercase:true},
    amount      :   {type:Number, min:1, max:10}
}); 
var AttributeModel = mongoose.model('Attribute', AttributeSchema);

var DiceSchema = new Schema({
    
    attribute   :   {type:String, trim:true, lowercase:true, required:true},
    difficulty  :   {type:Number, min:5, max:25, required:true},
    success     :   {
        type    :   {type:String, trim:true, lowercase:true, required:true},
        location:   {type: Schema.Types.ObjectId, ref:'Location', index:true},
        event   :   {type: Schema.Types.ObjectId, ref:'Event', index:true}
    },
    failure     :   {
        type    :   {type:String, trim:true, lowercase:true, required:true},
        location:   {type: Schema.Types.ObjectId, ref:'Location', index:true},
        event   :   {type: Schema.Types.ObjectId, ref:'Event', index:true}
        }
        
});

var DiceModel = mongoose.model('Dice', DiceSchema);

var ChoiceSchema = new Schema({
    type    :   {type:String, trim:true, lowercase:true, required:true},
    amount  :   {type:Number, min:1, max:8, required:true},
    events  :   [{type: Schema.Types.ObjectId, ref:'Event', index:true}]
});
var ChoiceModel = mongoose.model('Choice', ChoiceSchema);

var ContinueSchema = new Schema({
    event   :   {type: Schema.Types.ObjectId, ref:'Event', index:true},
    location:   {type: Schema.Types.ObjectId, ref:'Location', index:true}
});
var ContinueModel = mongoose.model('Continue', ContinueSchema);


EventSchema.set('toObject', {getters : true});

//sanitize strings before saving
EventSchema.pre('save', function(next){
    var self = this || mongoose.model('Event');
    console.log('hello from pre-save: '+self.name);
    self.name = Helper.sanitizeString(self.name);
    self._id  = self.name;
    next();
});

/********** statics *************/

// insert attributes if there are any
EventSchema.statics.addAttributes = function(attributes, event){
    console.log('attributes are: '+attributes);
    if(attributes != 'false'){
        // loop through array and create attribute for each
        attributes.forEach(function(attr){
            var attribute = new AttributeModel(attr);
            event.attributes.push(attribute);
        });                     
    }
    return event;
};

// insert items if there are any
EventSchema.statics.addItems = function(items, event){
    console.log('items are: '+items);
    if(items != 'false'){
        // loop through array and create attribute for each
        items.forEach(function(item){
            var eventItem = new EventItemModel(item);
            event.items.push(eventItem);
        });                     
    }
    return event;
};

// add branch if branchtype = dice
EventSchema.statics.addDiceBranch = function(branch, event, cb){
    
    var self = this || mongoose.model('Event');
    var dice = new DiceModel();
    dice.attribute = branch.attribute;
    dice.difficulty = branch.difficulty;
    dice.success.type = branch.success.type;
    dice.failure.type = branch.failure.type;
    
    var locos = [];
    var events = [];
    // sanitize the ids before using in query
    var succTrigger = Helper.sanitizeNumber(branch.success.trigger);
    var failTrigger = Helper.sanitizeNumber(branch.failure.trigger);
    
    
    branch.success.type == 'succLoco'? locos.push(succTrigger):events.push(succTrigger);
    branch.failure.type == 'failLoco'? locos.push(failTrigger):events.push(failTrigger);
    
    if(locos.length == 2){
        console.log('expected 2 locations: getting '+locos.length);
        Location.find({'id':{$in : locos}}).exec(function(err, locos){
            if(err){console.log(err); return;}
            
            if(locos[0].id == succTrigger){
                dice.success.location = locos[0]._id;
                locos.length >1 ? dice.failure.event = locos[1]._id : dice.failure.location = locos[0]._id;
            }
            console.log('dice: trigger two locations '+dice);
            event.branch.push(dice);
            console.log('Dicebranch pushed '+event.branch);
            return cb(event);
        }); 
    } else if(events.length == 2){
        console.log('expected 2 events: getting '+events.length);
        console.log(events);
        self.find({'id':{$in : events}}).exec(function(err, ev){
            if(err){console.log(err); return;}
            
            console.log('eventId = '+ev[0].id);
            console.log('succesTrigger= '+succTrigger);
            
            if(ev[0].id == succTrigger){
                dice.success.event = ev[0]._id;
                //check if there are two records= events are different
                ev.length >1 ? dice.failure.event = ev[1]._id : dice.failure.event = ev[0]._id;                    
            }          
            console.log('dice: trigger two locations '+dice);
            event.branch.push(dice);
            console.log('Dicebranch pushed '+event.branch);
            return cb(event);
        }); 
    } else {
        console.log('expected 1 event: '+events.length);
        console.log('expected 1 location: '+locos.length);
        if(branch.success.type == 'succLoco'){
            // if there's only one location and it's for success, failure must be event
            Location.findOne({'id':succTrigger}).exec(function(err, loco){
                if(err){console.log(err); return;}
                dice.success.location = loco;
            })
            .then(
                self.findOne({'id':failTrigger}).exec(function(err, ev){
                    if(err){console.log(err); return;}
                    dice.success.event = ev;
                    event.branch.push(dice);
                    console.log('branch pushed '+event.branch);
                    return cb(event);
                })
            );  
        // else it must be the other way around        
        }else {
            self.findOne({'id':succTrigger}).exec(function(err, ev){
                if(err){console.log(err); return;}
                dice.success.event = ev;
            })
            .then(
                Location.findOne({'id':failTrigger}).exec(function(err, loco){
                    if(err){console.log(err); return;}
                    dice.success.location = loco;
                    event.branch.push(dice);
                    console.log('branch pushed '+event.branch);
                    return cb(event);
                })
            );  
        }
    }
    
    
    //event.branch.push(dice);
    // return cb(event)
};

// add branch if branchtype = continue
EventSchema.statics.addContinueBranch = function(branch, event, cb){
    
    var self = this || mongoose.model('Event');
    var newBranch = new ContinueModel();
    // sanitize id before making query
    var continueTo = Helper.sanitizeNumber(branch.continueTo);
    console.log('hello from addContinueBranch');
    
    if(branch.type == 'continueLoco'){
        Location.findOne({'id':continueTo}).exec(function(err, loco){
            if(err){console.log(err); return;}
            newBranch.location = loco._id;
            console.log('this is the branch-model '+newBranch);
            event.branch.push(newBranch);
            console.log('branch pushed '+event.branch);
            return cb(event);
        }); 
    }else {
        self.findOne({'id':continueTo}).exec(function(err, doc){
            if(err){console.log(err); return;}
            newBranch.event = doc._id;
            event.branch.push(newBranch);
            return cb(event);});
    }
};


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