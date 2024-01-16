// REQUIRING NEEDFUL NPM MODULES

const express=require('express')
const morgan=require('morgan')
const session=require('express-session')
const uuid=require('uuid')
const nocache=require('nocache')

// REQUIRING LOCAL MODULES

const Router=require('./routers/router')

const PORT=process.env.PORT||3000
const app=express()
const key=uuid.v4()

// CACHE-CONTROL
app.use((req,res,next)=>{
    res.set('Cache-Control','no-store')
    next()
})

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(nocache())

app.set('view engine','ejs')

// CREATING A SESSION

app.use(session({
    secret:key,              // convert this to  a strong secret key
    resave:false,           // don't save the session if it not modified
    saveUninitialized:true, // save new sessions that not initialized

    cookie:{
        httpOnly:true, // prevent client from accessing the session cookie
        maxAge:3600000, // setting the expiry of the session
    }
}))

// ROUTES

app.use(Router)

//ERROR HANDLING MIDDLEWARE

app.use((err,req,res,next)=>{
    res.status(500).send("INTERNAL SERVER ERROR")
})

//PORT LISTENING
       
app.listen(PORT,()=>{console.log("Listening to the server on http://localhost:3000")})