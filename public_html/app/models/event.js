/* Model for events */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Flag = require('./flag.js');
var Item = require('./item.js');
var Location = require('./location.js');
var Helper = require('../controllers/helper_functions.js');

//validators
var valEmpty = [Helper.valEmpty, 'The title of an event must just not be empty.'];

var EventSchema = Schema({
    id          :   {type: Number, unique:true},
    name        :   {type:String, trim:true, lowercase:true, validate:valEmpty},
    text        :   {type:String, trim:true, default:' '},
    location    :   {type: Schema.Types.ObjectId, ref:'Location', index:true, required:true},
    newPara     :   {type:Boolean, default:false},
    isChoice    :   {type:Boolean, default:false},
    choiceText  :   {type:String, trim:true, lowercase:true},
    setFlag     :   {type:Boolean, default:false},
    flag        :   {type: Schema.Types.ObjectId, ref:'Flag', index:true},
    items       :   [EventItemSchema],
    reqFlag     :   [{type: Schema.Types.ObjectId, ref:'Flag', index:true}],
    rejectFlag  :   [{type: Schema.Types.ObjectId, ref:'Flag', index:true}],
    attributes  :   [AttributeSchema],
    branchType  :   {type:String, trim:true, lowercase:true, required:true},
    dice        :   {    
        attribute   :   {type:String, trim:true, lowercase:true},
        difficulty  :   {type:Number},
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

var EventItemSchema = new Schema({
    item    :    [Item.schema],
    action  :    {type:String, trim:true, lowercase:true, required:true}  
});
var EventItemModel = mongoose.model('EventItem', EventItemSchema);

var AttributeSchema = new Schema({
    attribute   :   {type:String, trim:true, lowercase:true, required:true},
    action      :   {type:String, trim:true, lowercase:true, required:true},
    amount      :   {type:Number, min:1, max:10, required:true}
}); 

var AttributeModel = mongoose.model('Attribute', AttributeSchema);

EventSchema.set('toObject', {getters : true});

//sanitize strings before saving
EventSchema.pre('save', function(next){
    var self = this || mongoose.model('Event');
    self.name = Helper.sanitizeString(self.name);
    next();
});

//validation
EventSchema.path('choiceText').validate(function(value){
  
    var self = this || mongoose.model('Event');
    if(self.isChoice){
        return value.length >0;
    }
},'Please provide a text for the choice.');

EventSchema.path('dice.difficulty').validate(function(value){

    var self = this || mongoose.model('Event');
    if(self.branchType == 'dice'){
        if(value >= 5 && value <= 40){
            return true; 
        }else{return false;}
    } 
},'Please provide a difficulty for the diceroll between 5 and 40.');

EventSchema.path('attributes').validate(function(){
   
    var self = this || mongoose.model('Event');

    var pass = true;
    if(self.attributes.length > 0){
        // check if an attribute misses an amount
        self.attributes.forEach(function(attrItem){
            if(attrItem.amount <= 0){
                pass =  false;
                return;
            }
        });
    }
    return pass;
},'Please provide an amount larger than 0 for the attribute');


// restrict-delete: check if the event is used by other documents
EventSchema.pre('remove', function(next){
    
    var self = this || mongoose.model('Event');
    
    // check if the event is used as a event for location
    self.model('Location').find({'event': self._id}).exec(function(err, locos){
        if(err){console.log(err); next(err);}
        return locos;
    })
    .then(function(locos){
        // query other events that use this event
        self.model('Event').find().or(
                    [{'choices':self._id},
                    {'dice.success.event': self._id },
                    {'dice.failure.event': self._id},
                    {'continueTo.event': self._id},
                    {'continueTo.random': self._id}])
            .exec(function(err, events){
                if(err){console.log(err); next(err);}
                return events;
            })
        .then(function(events){
            if(locos.length > 0){
                var customErr = new Error('Cannot delete event due to depending location \''+locos[0].name+'\'');
                next(customErr);
                
            }else if(events.length > 0){
                var customErr = new Error('Cannot delete event due to depending event \''+events[0].name+'\'');
                next(customErr);
                
            }else{
                next();
            }              
        });             
    });
});


/*********** methods *************/
EventSchema.methods.saveUpdateAndReturnAjax = function(res){
    
    // define population-query for events
    var populateQuery = [{path:'flag', select:'name id _id items'}, {path:'rejectFlag', select:'name id -_id'},
        {path:'reqFlag', select:'name id -_id'}, {path:'location', select:'name id -_id'}, 
        {path:'dice.failure.location', select:'name id -_id'}, {path:'items.item', select:'name id'}, 
        {path:'dice.success.location', select:'name id -_id'}, {path:'dice.success.event', select:'name id -_id'}, 
        {path:'dice.failure.event', select:'name id -_id'},{path:'choices', select:'name id'}, 
        {path:'continueTo.location', select:'name id -_id'}, {path:'continueTo.event', select:'name id -_id'},
        {path:'continueTo.random', select:'name id -_id'} ];
    
    var event = this || mongoose.model('Event');
    console.log('save and update ajax');
        event.save(function(err){
            if(err){
                res.send({
                    'success'   : false,
                    'msg'       : 'could not update event',
                    'errors'    : err.errors});
            }else{
                EventModel.find({},'-_id').populate(populateQuery).exec(function(err, events){
                    if(err){ return console.log(err);}                    
                    return events;
                    
                    }).then(function(events){
                        console.log('updated event: '+event);
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
    
    var populateQuery = [{path:'flag', select:'name id _id newPara'},{path:'rejectFlag', select:'name id -_id'}, 
        {path:'reqFlag', select:'name id -_id'}, {path:'location', select:'name id -_id'}, 
        {path:'dice.failure.location', select:'name id -_id'},{path:'items.item'},
        {path:'dice.success.location', select:'name id -_id'}, {path:'dice.success.event', select:'name id -_id'}, 
        {path:'dice.failure.event', select:'name id newPara -_id'},
        {path:'choices', select:'name id newPara choiceText reqFlag rejectFlag items'}, 
        {path:'continueTo.location', select:'name id -_id'}, {path:'continueTo.event', select:'name id newPara -_id'}, 
        {path:'continueTo.random', select:'name id -_id newPara reqFlag rejectFlag items'} ];
    
    return populateQuery;
};

// insert attributes if there are any
EventSchema.statics.addAttributes = function(attributes, event){
    
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
EventSchema.statics.addItems = function(rawItems, event){
    
    // if there are any items at all
    if(rawItems != 'false'){
        var itemIds = [];
        // loop through array and create attribute for each
        rawItems.forEach(function(item){
            var sanId = Helper.sanitizeNumber(item.item);
            itemIds.push(sanId);    
        });         
       
        // query items in array to get object_id
        Item.find({'id':{$in:itemIds}}).exec(function(err, items){
                if(err){console.log(err); return;}
                return items;                        
        }).then(function(items){
            for(var i=0; i<items.length; i++){
               
                
                //loop through rawItems and match id in order to get correct action
                for(var j=0; j<rawItems.length; j++){
                  
                    if(items[i].id == rawItems[j].item){
                        // create new EventItem-model
                        var eventItem = new EventItemModel();
                        eventItem.item = items[i];
                        eventItem.action = rawItems[j].action;
                        event.items.push(eventItem);
                    }
                }                    
            }; 
            return event;
        });      
    }
    return event;
};

// add branch if branchtype = dice
EventSchema.statics.addDiceBranch = function(branch, event, cb){
    
    var self = this || mongoose.model('Event');
    event.dice.attribute = branch.attribute;
    event.dice.difficulty = branch.difficulty;
    event.dice.success.type = branch.success.type;
    event.dice.failure.type = branch.failure.type;
 
    var locos = [];
    var events = [];
    
    // sanitize the ids before using in query
    var succTrigger = Helper.sanitizeNumber(branch.success.trigger);
    var failTrigger = Helper.sanitizeNumber(branch.failure.trigger);    
    
    branch.success.type == 'succLoco'? locos.push(succTrigger):events.push(succTrigger);
    branch.failure.type == 'failLoco'? locos.push(failTrigger):events.push(failTrigger);
    
    if(locos.length == 2){
        Location.find({'id':{$in : locos}}).exec(function(err, locos){
            if(err){console.log(err); return;}
            
            if(locos[0].id == succTrigger){
                
                event.dice.success.location = locos[0]._id;
                // check if there are two locations or only one (because they are the same)
                if(locos.length > 1){
                    event.dice.failure.location = locos[1]._id;
                }else{
                    event.dice.failure.location = locos[0]._id;
                }
            }else{
                event.dice.failure.location = locos[0]._id;
                if(locos.length > 1){
                    event.dice.success.location = locos[1]._id;
                }else{
                    event.dice.success.location = locos[0]._id;
                }
            }            
            return cb(event);
        });
        
    } else if(events.length == 2){
        self.find({'id':{$in : events}}).exec(function(err, ev){
            if(err){console.log(err); return;}
                        
            if(ev[0].id == succTrigger){
                event.dice.success.event = ev[0]._id;
                if(ev[0].id == failTrigger){ // in case they are the same
                    event.dice.failure.event = ev[0]._id;
                }else{
                    event.dice.failure.event = ev[1]._id;
                }                                   
            }else{
                event.dice.success.event = ev[1]._id;
                event.dice.failure.event = ev[0]._id;
            }          
            return cb(event);
        }); 
        
    } else {
        
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
};

// add branch if branchtype = continue
EventSchema.statics.addContinueBranch = function(branch, event, cb){
 
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
            return cb(event);
        }); 
    }else if(branch.type == 'continueEvent'){
        self.findOne({'id':continueTo}).exec(function(err, doc){
            if(err){console.log(err); return;}
            event.continueTo.event = doc._id;
            return cb(event);
        });
    }else {
        // get random event before sending to client
        var sanitized = [];
        branch.continueTo.forEach(function(eve){      
            
            var ev = Helper.sanitizeNumber(eve);
            sanitized.push(ev);
        });
        
        // get all events out of db
        self.find({'id':{$in:sanitized}}).exec(function(err, events){
           if(err){console.log(err); return;}
           events.forEach(function(ev){              
              event.continueTo.random.push(ev._id);
           });
           return cb(event); 
        });
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
