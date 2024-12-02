const mongoose=require('mongoose')
const adminSchema=new mongoose.Schema({
    Username:{type:String,required:true},
    Email:{type:String,unique:true,required:true},
    Phone:{type:Number,required:true},
    Password:{type:String,required:true}
},{timestamps:true})
module.exports=mongoose.model("admindata",adminSchema)