const express=require("express");
//const users=require("./MOCK_DATA.json");//isko comment kiya kyunki ab file se nhi database se connect kiya hai.
const fs=require("fs");//fs module importing,file me likhne ke liye.
const mongoose=require("mongoose");
 

const app=express();
const PORT=5000;

//connecting to mongodb
mongoose
.connect("mongodb://127.0.0.1:27017/utube-app-1")//utube-app-1 is name of database created.
.then(()=>console.log("Mongodb connected"))//above statement returns a promise so we then it if ok ,else we catch if error.
.catch((err)=>console.log("Mongo Error",err));




//schema
const userschema=new mongoose.Schema({//// this is schema making.
    firstname:{
        type:String,
        required:true, //means ,ye field hona hi chahiye(ye khali nhi ho sakta)bydefault false hota hai.
    },
    lastname:{
        type:String,

    },
    email:{
        type:String,
        required:true,
        unique:true,//checks karega ki same id exist to nhi karti
    },
    jobtitle:{
        type:String,

    },
    gender:{
        type:String,

    },
    
},
{timestamps:true}//kaun si entry ka hui hai isse ye pata chalega.
);

const user=mongoose.model('user',userschema)//this is model making.declared user is acts as a class.




app.use(express.urlencoded({extended:false}));//ye ek middleware hai.jab bhi form data aega ye oose body me dalne ka kam karega(json object banake.)
//app.use(express.json({extended:false}));//frontend se  json aega to ye usko convert kar ke body me dal dega.
app.use((req,res,next)=>{
    console.log("Hello from middleware 1");
    req.myusername="ashu@dagmail";//middleware ke andar ,req object  me cahnges kar sakte hain. ye changes throughout routes and other middlewares bhi  persist karenge.
    fs.appendFile("./log.txt",
    `\n${Date.now()}:${req.ip} ${req.method}:${req.path}`,//log file me log banage ki kaun sa user kab enter kiyua ip kya hai uskka.
    (err,data) => {
      next();

    });
    
    next();//isse agla middleware call ho jaenge.
    //res.end(); //req res cycle yahi se khtam ho jaegi,req aage nhi ja payegi.
});
app.use((req,res,next)=>{
    console.log("hello from middleware 2");
    console.log(req.myusername);//change in req object still persists here.
    next();//iss next  ke call se aage ke routes call honge,kyunki aage koi aur middlewares nhi hai,
})

//routes
//inn route ke help se jo data milta hai, oose hum react ya kisi bhi frontend technology se aur achhe se display kara sakte hain.
app.get("/api/users",async (req,res)=>{//ye route users ka sara data json format me as it is utha ke de dega.
   const alldbusers= await user.find({});
   
   
    return res.json(alldbusers);

});
app.get("/users", async(req,res)=>{//ye route html page ko  server par render karega aur names utha ke  de dega..
    const alldbusers=await user.find({})//ye database se get karega.database me jo onject hain unpar map lagaya hia hai.
    const html=`
    <ul>
    
    ${alldbusers.map((user)=>`<li>${user.firstname}-${user.email}</li>`).join()}
    </ul
    `;
    res.send(html);
   // ${users.map((user)=>`<li>${user.firstname}-${user.email}</li>`).join()}//ye  json file se get kar raha hai.
})
//++++++++++++++++++++++++++++++++
app.route("/api/users/:id")
.get( async (req,res)=>{//id ek variable hai,search ke iske jagah par 1,2,3,.... kuchh bhi dal sakte hain.
//   const id=Number(req.params.id);//number me typcast karna .
//   const user=users.find((user)=>user.id===id);//ye route oos id ka pura info de dga .
 const user1=await user.findById(req.params.id);//specific id ka user lake dega.

 if(!user1) return res.status(404).json({error:"user not found"});
  return res.json(user1);

})
.patch(async (req,res)=>{
    //edit user with id
    await user.findByIdAndUpdate(req.params.id,{lastname:"changed"});//lastname me changed ke jagah par data frontend se lena hota hai. 
    return res.json({status:"success"});

})
.delete(async(req,res)=>{
    //delete user with id
    await user.findByIdAndDelete(req.params.id)//it delets the whole object identifying by id.
    return res.json({status:"success"});

});
//inn routes ko alag alag bhi rakh sakte hain par path modify karte wakt easy hoga .
//inn teeno routes ka path same same par methids alag hain,isliye hum inko ek bhi chaining kar ke group kar sakte hain.
//+++++++++++++++++++++++

app.post("/api/users", async(req,res)=>{
    const body=req.body;//frontend se jo bhi data aega ,ab chahe vo form se aye ya kaise bhi aye, vo body me hi aata hai.
    //+++++++++++++++++++++++++
    //ye status codes return karenge.
    if(!body ||
        !body.first_name||
        !body.last_name||
        !body.email||
        !body.gender||
        !body.job_title
        ){
        return res.status(400).json({msg:"All fields are req..."});
        }
     //++++++++++++++++++++
    const result= await user.create({//this inserts a data in collection.this returns a aobject.
        firstname:body.first_name,
        lastname:body.last_name,
        email:body.email,
        gender:body.gender,
        jobtitle:body.job_title
    });
    //console.log("result",result);

    return res.status(201).json({msg:"success"});
    // users.push({...body, id:  users.length+1});//destructuring body and appending id.
    // //console.log("body",body)
    // fs.writeFile('./MOCK_DATA.json',JSON.stringify(users),(err,data)=>{//frontend se jo bhi data aega oose ,json file me jake likh dega
    // return res.json({status:"success",id:users.length});
    // });
    

});







app.listen(PORT,()=>console.log(`Server started at port ${PORT}`));//listening on this port.

 





