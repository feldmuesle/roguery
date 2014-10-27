/* 
 * This file contains possible sub-schemas for events
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AttributeSchema = new Schema({
    attribute   :   {type:String, trim:true, lowercase:true},
    action      :   {type:String, trim:true, lowercase:true},
    amount      :   {type:Number, min:1, max:10}
});

var AttributeModel = mongoose.model('Attribute', AttributeSchema);
exports.AttributeModel;

var DiceSchema = new Schema({
    
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

var DiceModel = mongoose.model('Dice', DiceSchema);
exports.DiceModel;

var ChoiceSchema = new Schema({
    type    :   {type:String, trim:true, lowercase:true, required:true},
    amount  :   {type:Number, min:1, max:8, required:true},
    events  :   [{type: Schema.Types.ObjectId, ref:'Event', index:true}]
});
var ChoiceModel = mongoose.model('Choice', ChoiceSchema);
exports.ChoiceModel;

var ContinueSchema = new Schema({
    event   :   {type: Schema.Types.ObjectId, ref:'Event', index:true},
    location:   {type: Schema.Types.ObjectId, ref:'Location', index:true}
});
var ContinueModel = mongoose.model('Continue', ContinueSchema);
exports.ContinueModel;