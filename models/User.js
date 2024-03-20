const mongoose = require("mongoose");
const cryptoCipher = require("../middlewares/encrypt_decrypt")

let User = mongoose.Schema({
    publicUID:{
        type:String,
        require: true,
        unique: true,
        set: (value) => {
            return cryptoCipher.encrypt(value)
        },
        get: (value) => {
            return cryptoCipher.decrypt(value)
        },
    },
    UID: {
        type: String,
        require: true,
        unique: true,
    },
    firstName: {
        type: String,
        require: [true,"Missing user first name"],
        set: (value) => {
            return cryptoCipher.encrypt(value)
        },
        get: (value) => {
            return cryptoCipher.decrypt(value)
        },
    },
    lastName: {
        type: String,
        require: [true,"Missing user last name"],
        set: (value) => {
            return cryptoCipher.encrypt(value)
        },
        get: (value) => {
            return cryptoCipher.decrypt(value)
        },
    },

    birthDay:{
        type: Date,
    },

    userName: {
        type: String,
        require: [true, "Missing"],
        unique: [true, "This email is already exist"],
        set: (value) => {
            return cryptoCipher.encrypt(value)
        },
        get: (value) => {
            return cryptoCipher.decrypt(value)
        },
    },
    
    password:{
        type:String,
        require: true,
        
    },
    displaypassword:{
        type:String,
        require: true,
        
    },
    phoneNumber: {
        type: String,
        require: true,
        unique :true,
        set: (value) => {
            return cryptoCipher.encrypt(value)
        },
    },
    avatar: {
        type: String,
        default: "/images/defaultAvatar.png",
    },
    admin: {
        type: Boolean,
        default: false,
        select: false,
    },
    isVerify:{
        type: Boolean,
        default: false
    },
    verifyOTP:{
        type: String
    },

    sentMailsBox:{
        type: [{type: String}],
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
    receivedMailsBox:{
        type: [{type: String}],
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
    draftBox:{
        type: [{type: String}],
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
    starBox:{
        type: [{type: String}],
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
    trashBox:{
        type: [{type: String}],
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
});

User.index({ publicUID: 'text' });

// User.virtual('IbirthDayFormatted').get(function () {
//     return moment(new Date(this.birthDay)).format('DD/MM/YYYY');
//   });

module.exports = mongoose.model("User", User);