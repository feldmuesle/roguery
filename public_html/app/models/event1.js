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
//    branch      :   [{type: Schema.Types.Mixed}]
    dice        :   {    
        attribute   :   {type:String, trim:true, lowercase:true},
        difficulty  :   {type:Number, min:5, max:25},
        success     :   {
            type    :   {type:String, trim:true},
            location:   {type: Schema.Types.ObjectId, ref:'Location', index:true},
            event   :   {type: Schema.Types.ObjectId, ref:'Event', index:true}
        },
        failure     :   {
            type    :   {type:String, trim:true},
            location:   {type: Schema.Types.ObjectId, ref:'Location', index:true},
            event   :   {type: Schema.Types.ObjectId, ref:'Event', index:true}
        }        
    },
    choices         :  [{type: Schema.Types.ObjectId, ref:'Event', index:true}],
    continueTo      : {
            type    :   {type:String, trim:true},
            event   :   {type: Schema.Types.ObjectId, ref:'Event', index:true},
            location:   {type: Schema.Types.ObjectId, ref:'Location', index:true},
            random  :   [{type: Schema.Types.ObjectId, ref:'Event', index:true}]
        }
});

// sub-schemas
{
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
//
//var DiceSchema = new Schema({
//    
//    attribute   :   {type:String, trim:true, lowercase:true, required:true},
//    difficulty  :   {type:Number, min:5, max:25, required:true},
//    success     :   {
//        type    :   {type:String, trim:true, lowercase:true, required:true},
//        location:   {type: Schema.Types.ObjectId, ref:'Location', index:true},
//        event   :   {type: Schema.Types.ObjectId, ref:'Event', index:true}
//    },
//    failure     :   {
//        type    :   {type:String, trim:true, lowercase:true, required:true},
//        location:   {type: Schema.Types.ObjectId, ref:'Location', index:true},
//        event   :   {type: Schema.Types.ObjectId, ref:'Event', index:true}
//        }
//        
//});
//
//var DiceModel = mongoose.model('Dice', DiceSchema);
//
//var ChoiceSchema = new Schema({
//    type    :   {type:String, trim:true, lowercase:true, required:true},
//    amount  :   {type:Number, min:1, max:8, required:true},
//    events  :   [{type: Schema.Types.ObjectId, ref:'Event', index:true}]
//});
//var ChoiceModel = mongoose.model('Choice', ChoiceSchema);
//
//var ContinueSchema = new Schema({
//    event   :   {type: Schema.Types.ObjectId, ref:'Event', index:true},
//    location:   {type: Schema.Types.ObjectId, ref:'Location', index:true}
//});
//var ContinueModel = mongoose.model('Continue', ContinueSchema);
}

EventSchema.set('toObject', {getters : true});

//sanitize strings before saving
EventSchema.pre('save', function(next){
    var self = this || mongoose.model('Event');
    console.log('hello from pre-save: '+self.name);
    self.name = Helper.sanitizeString(self.name);
    self._id  = self.name;
    next();
});

/*********** methods *************/
EventSchema.methods.saveUpdateAndReturnAjax = function(res){
    
    // define population-query for events
    var populateQuery = [{path:'flag', select:'name id -_id'}, 
        {path:'reqFlag', select:'name id -_id'}, {path:'location', select:'name id -_id'}, 
        {path:'dice.failure.location', select:'name id -_id'},{path:'items', select:'name id -_id'}, 
        {path:'dice.success.location', select:'name id -_id'}, {path:'dice.success.event', select:'name id -_id'}, 
        {path:'dice.failure.event', select:'name id -_id'},{path:'choices', select:'name id -_id'}, 
        {path:'continueTo.location', select:'name id -_id'}, {path:'continueTo.event', select:'name id -_id'}, 
        {path:'continue.random', select:'name id -_id'} ];
    
    var event = this || mongoose.model('Event');
        event.save(function(err){
            if(err){
                console.log('something went wrong when updating a event.');
                console.log('error '+err); 
                res.send({
                    'success'   : false,
                    'msg'       : 'could not update event',
                    'errors'    : err.errors});
            }else{
                EventModel.find({},'-_id').populate(populateQuery).exec(function(err, events){
                    if(err){ return console.log(err);}
                    
                    console.log('events sent back after update:');
                    console.dir(events);
                    return events;
                    
                    }).then(function(events){
                        res.send({
                        'success'   : true,
                        'msg'       : 'yuppi! - event has been updated.',
                        'events'   :   events
                    });

                });  
            }   
        });     
};

/********** statics *************/

//get populationQuery
EventSchema.statics.getPopuQuery = function(){
    
    var populateQuery = [{path:'flag', select:'name id -_id'}, 
        {path:'reqFlag', select:'name id -_id'}, {path:'location', select:'name id -_id'}, 
        {path:'dice.failure.location', select:'name id -_id'},{path:'items', select:'name id -_id'}, 
        {path:'dice.success.location', select:'name id -_id'}, {path:'dice.success.event', select:'name id -_id'}, 
        {path:'dice.failure.event', select:'name id -_id'},{path:'choices', select:'name id -_id'}, 
        {path:'continueTo.location', select:'name id -_id'}, {path:'continueTo.event', select:'name id -_id'}, 
        {path:'continue.random', select:'name id -_id'} ];
    
    return populateQuery;
};

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
    console.log('hello from addDiceBranch');
    var self = this || mongoose.model('Event');
    event.dice.attribute = branch.attribute;
    event.dice.difficulty = branch.difficulty;
    event.dice.success.type = branch.success.type;
    event.dice.failure.type = branch.failure.type;
    console.log('event.dice so far: '+event.dice);
    var locos = [];
    var events = [];
    // sanitize the ids before using in query
    var succTrigger = Helper.sanitizeNumber(branch.success.trigger);
    var failTrigger = Helper.sanitizeNumber(branch.failure.trigger);
    
    
    branch.success.type == 'succLoco'? locos.push(succTrigger):events.push(succTrigger);
    branch.failure.type == 'failLoco'? locos.push(failTrigger):events.push(failTrigger);
    
    if(locos.length == 2){
        console.log('expected 2 locations: getting '+locos.length);
        console.log('sanitized ids '+locos);
        Location.find({'id':{$in : [1,2]}}).exec(function(err, locos){
            if(err){console.log(err); return;}
            console.log('hello from find dice-locos');
            if(locos[0].id == succTrigger){
                console.log('yes it is true');
                event.dice.success.location = locos[0]._id;
                console.log('event.dice.success.location '+event.dice.success.location);
                
                locos.length >1 ? event.dice.failure.location = locos[1]._id : event.dice.failure.location = locos[0]._id;
            }else{
                event.dice.failure.location = locos[0]._id;
                console.log('event.dice.success.location '+event.dice.success.location);
                
                locos.length >1 ? event.dice.success.location = locos[1]._id : event.dice.success.location = locos[0]._id;
                
            }
            console.log('dice: trigger two locations '+event.dice);
            
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
                event.dice.success.event = ev[0]._id;
                //check if there are two records= events are different
                ev.length >1 ? event.dice.failure.event = ev[1]._id : event.dice.failure.event = ev[0]._id;                    
            }          
            console.log('dice: trigger two locations '+event.dice);
            return cb(event);
        }); 
    } else {
        console.log('expected 1 event: '+events.length);
        console.log('expected 1 location: '+locos.length);
        if(branch.success.type == 'succLoco'){
            // if there's only one location and it's for success, failure must be event
            Location.findOne({'id':succTrigger}).exec(function(err, loco){
                if(err){console.log(err); return;}
                event.dice.success.location = loco;
            })
            .then(
                self.findOne({'id':failTrigger}).exec(function(err, ev){
                    if(err){console.log(err); return;}
                    event.dice.failure.event = ev;
                    return cb(event);
                })
            );  
        // else it must be the other way around        
        }else {
            self.findOne({'id':succTrigger}).exec(function(err, ev){
                if(err){console.log(err); return;}
                event.dice.success.event = ev;
            })
            .then(
                Location.findOne({'id':failTrigger}).exec(function(err, loco){
                    if(err){console.log(err); return;}
                    event.dice.failure.location = loco;
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
    console.log('hello from addContinueBranch');
    var self = this || mongoose.model('Event');
    
    // if its an event/location, sanitize id before making query
    if(branch.type != 'continueRand'){
        var continueTo = Helper.sanitizeNumber(branch.continueTo);
    }
    
    event.continueTo.type = branch.type;
    
    if(branch.type == 'continueLoco'){
        Location.findOne({'id':continueTo}).exec(function(err, loco){
            if(err){console.log(err); return;}
            event.continueTo.location = loco._id;
            console.log('branch pushed '+event.branch);
            return cb(event);
        }); 
    }else if(branch.type == 'continueEvent'){
        self.findOne({'id':continueTo}).exec(function(err, doc){
            if(err){console.log(err); return;}
            event.continueTo.event = doc._id;
            return cb(event);
        });
    }else {
        // TODO: get random event before sending to client
        return cb(event);
    }
};

// add branch if branchtype = choices
EventSchema.statics.addChoicesBranch = function(branch, event, cb){
    
    var self = this || mongoose.model('Event');
    
    // if its an event/location, sanitize id before making query
//    if(branch.type == 'choiceCustom'){
        var sanitized = [];
        
        // if its custom choices there is an array of ids that need to be sanitized before query
        branch.events.forEach(function(eve){
            
            var ev = Helper.sanitizeNumber(eve);
            sanitized.push(ev);
        });
        
        // get all events out of db
        self.find({'id':{$in:sanitized}}).exec(function(err, events){
           if(err){console.log(err); return;}
           events.forEach(function(ev){              
              event.choices.push(ev._id);
           });
           ;
           return cb(event); 
        });
//    }
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