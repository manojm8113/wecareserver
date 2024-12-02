const mongoose=require('mongoose')
const doctrosSchema=new mongoose.Schema({
    image:{type:String,required:true},
    doctorname:{type:String,required:true},
    section:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    phone:{type:Number,required:true},
    description:{type:String,required:true},
    password:{type:String,required:true}
      
},{timestamps:true})
module.exports=mongoose.model("wecare_doctors",doctrosSchema)