const router=require('express').Router()
const contact=require('../Model/Contactschema')

router.post('/contact',async(req,res)=>{
    console.log("body datas",req.body);
    try{
        const newmessage=new contact(req.body)   
        const datas=await newmessage.save()
        res.status(200).json("success")
    }catch(err){
        res.status(500).json("failed to send message")
    }
})
router.get('/messages',async(req,res)=>{
    console.log("body datas",req.body);
try{
const datas=await contact.find()
res.status(200).json(datas)
}catch(err){
res.status(500).json("failed")
}
})
router.delete('/deletedata/:id',async(req,res)=>{
    console.log("body datas",req.body);
try{
const datas=await users.findByIdAndDelete(req.params.id)
res.status(200).json(datas)
}catch(err){
res.status(500).json("failed")
}
})

module.exports=router