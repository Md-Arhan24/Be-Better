const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const user = new mongoose.Schema({
    username:{
        type:String,
        require:[true,"user name required"],
        unique:true,
    },
    email:{
        type:String,
         require:[true,"email name required"],
        unique:true,

    },
    password:{
        type:String,
        require:[true,"password is required"],
    },
    createdAt:{
        type:Date,
        default: new Date(),
    },
    streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: null },
  },
});

//here we dont have to use arrow function
user.pre("save", async function (){
    this.password = await bcrypt.hash(this.password,12);
});

module.exports = mongoose.model("User",user);
