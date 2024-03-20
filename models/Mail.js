const mongoose = require("mongoose");
const cryptoCipher = require('../middlewares/encrypt_decrypt');

const commentSchema = mongoose.Schema({ 

    UID: {
        type: String,
    },

    userComment:{
        type: [String],
    },

 });

let Mail = mongoose.Schema({
    
    MID: {
        type: String,
        require: true,
        unique: true,
        set: (value) => {
            return cryptoCipher.encrypt(value)
        },
        get: (value) => {
            return cryptoCipher.decrypt(value)
        }
    },
    senderUID:{
        type:String,
        require: true,
        select: true
    },
    title:{
        type: String,
        require: true,
        set: (value) => {
            return cryptoCipher.encrypt(value)
        },
        get: (value) => {
            return cryptoCipher.decrypt(value)
        }
    },

    body:{
        type: String,
        require: true,
        set: (value) => {
            return cryptoCipher.encrypt(value)
        },
        get: (value) => {
            return cryptoCipher.decrypt(value)
        }
    },
    To:{
        type: [String],
        set: (value) => {

            result = []
            for(i in value)
            {
                if(value[i] == ""){continue;}
                result.push(cryptoCipher.encrypt(value[i]))
            }
            return result
        },
        get: (value) => {
            result = []
            for(i in value)
            {
                if(value[i] == ""){continue;}
                result.push(cryptoCipher.decrypt(value[i]))
            }
            return result
        }
    },
    Cc: {
        type: [String],
        set: (value) => {

            result = []
            for(i in value)
            {
                if(value[i] == ""){continue;}
                result.push(cryptoCipher.encrypt(value[i]))
            }
            return result
        },
        get: (value) => {
            result = []
            for(i in value)
            {
                if(value[i] == ""){continue;}
                result.push(cryptoCipher.decrypt(value[i]))
            }
            return result
        }
    },
    Bcc: {
        type: [String],
        set: (value) => {

            result = []
            for(i in value)
            {
                if(value[i] == ""){continue;}
                result.push(cryptoCipher.encrypt(value[i]))
            }
            return result
        },
        get: (value) => {
            result = []
            for(i in value)
            {
                if(value[i] == ""){continue;}
                result.push(cryptoCipher.decrypt(value[i]))
            }
            return result
        }
    },

    sentDate:{
        type: Date,
        require: true
    },

    attachFile: [String],
    
    userReaded :{
        type: [String],
        get: (value) => {
            result = []
            for(i in value)
            {
                if(value[i] == ""){continue;}
                result.push(cryptoCipher.decrypt(value[i]))
            }
            return result
        }
    },

    userComment: [commentSchema]
});

Mail.index({ title: 'text', body: 'text' });


module.exports =  mongoose.model("Mail", Mail) ;