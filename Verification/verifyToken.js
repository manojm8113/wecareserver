const jwt=require('jsonwebtoken')
const verifyToken=(req,res,next)=>{
    console.log('jsonwebtoken',req.headers.token);
    let authHeader=req.headers.token
    if(authHeader){
        jwt.verify(authHeader,process.env.JWTSEKEY,(err,user)=>{
            if(err)res.status(403).json("token is not valid")
            console.log("*********",user);
        if(user.id==req.params.id){
            next();
        }else{
            return res.status(403).json("Your id and token is notmatch")
        }
        })
    }else{
        return res.status(401).json("Your not authenticated")
    }
};
module.exports=verifyToken