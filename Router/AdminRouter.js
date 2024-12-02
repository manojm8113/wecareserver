const router=require('express').Router()
const admin=require('../Model/AdminSchema')
const cryptojs=require('crypto-js')
const verifyToken=require('../Verification/verifyToken')
router.post('/signup',async(req,res)=>{
    console.log("body datas",req.body);
    req.body.Password=cryptojs.AES.encrypt(req.body.Password,process.env.crypto).toString()
    try{
        const newAdmin=new admin(req.body)
        const datas=await newAdmin.save()
        res.status(200).json("success")
    }catch(err){
        res.status(500).json("failed to register")
    }
})
router.get('/getuserDatas',async(req,res)=>{
    console.log("body datas",req.body);
try{
const datas=await users.find()
res.status(200).json(datas)
}catch(err){
res.status(500).json("failed")
}
})
router.get('/Getdatas/:id',verifyToken,async(req,res)=>{
    console.log("body datas",req.headers.token);
try{
const datas=await users.findById(req.params.id)
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
router.put('/updateData/:id', async (req, res) => {
    console.log("Token:", req.headers.authorization);
    console.log("req.params.id:", req.params.id);
    try {
      const updatedDetails = await users.findByIdAndUpdate(
        req.params.id, 
        { $set: req.body }, 
        { new: true }
      );
      res.status(200).json(updatedDetails);
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).json("Internal server error");
    }
  }); 
module.exports=router