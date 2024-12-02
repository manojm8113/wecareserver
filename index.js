const express=require('express');
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const app=express();
const cors=require('cors')
dotenv.config()
app.use(cors()) 
// Apply CORS middleware
app.use(cors({
    origin: "https://wecarehospital.vercel.app/",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

const userRouter=require('./Router/Userrouter')
const userMessage=require('./Router/Contactrouter')
const Doctors=require('./Router/Doctorrouter')
const doctorLogin=require('./Router/Doctorlogin')
const Admin=require('./Router/AdminRouter')
const adminLogin=require('./Router/AdminLogin');
const appointment=require('./Router/Appointmentrouter');

mongoose.connect(process.env.MongoUrl).then(()=>{
    console.log("database is connected");
}).catch((err)=>{
    console.log("database is not connected");
})
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use("/userRegister",userRouter)
app.use("/usermessage",userMessage)
app.use("/doctors",Doctors)
app.use("/doctorLogin",doctorLogin)
app.use("/AdminSignup",Admin)
app.use("/AdminLogin",adminLogin)
app.use("/appointment",appointment)
app.listen(5000,()=>{
console.log("port is reserved");
})