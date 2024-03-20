const mongoose = require("mongoose");

let Draft = mongoose.Schema({
    
    MID: {
        type: String,
        unique: true,
    },
    title:{
        type: String,
    },

    body:{
        type: String,
    },
    To:{
        type: [String],
    },
    Cc: [String],
    Bcc: [String],

    sentDate:{
        type: Date,
        require: true
    },

    attachFile: [String],
    
});


module.exports =  mongoose.model("Draft", Draft) ;