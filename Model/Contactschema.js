const mongoose=require('mongoose')
const contactSchema=new mongoose.Schema({
    Username:{type:String,required:true},
    Email:{type:String,required:true},
    Subject:{type:String,required:true},
    Message:{type:String,required:true}
  
},{timestamps:true})
module.exports=mongoose.model("usermessage",contactSchema)