// REQUIRING NEEDFUL MODULES

const expres=require('express')
const router=expres.Router()
const mongoose=require('mongoose')
const bcrypt=require('bcrypt')

// LOCAL MODULES
const users=require('../models/models')

// SETTING ADMIN DETAILS

const credential={
    email:"admin@gmail.com",
    password:"123"
}

//        USER ROUTES 

// MAINPAGE
router.get('/',async(req,res)=>{
    if(req.session.adminlogged){
        res.redirect('/adminhome')
    }

    try{
        const findUser=await users.findOne({email:req.session.email},{})
        if(findUser){
            if(req.session.userlogged){
                res.redirect('/userhome')
            }else{
                res.render('register')
            }
        }else{
            res.render('register')
        }
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

// ROUTE FOR USER LOGIN

router.post('/userlogin',async (req,res)=>{
    const{email,password}=req.body

    try{
        const user=await users.findOne({email})
        if(!user){
            return res.render('userlogin')
        }

        const passmatch=await bcrypt.compare(password,user.password)
        if(passmatch){
            req.session.name=user.name
            req.session.email=user.email
            req.session.password=password
            req.session.userlogged=true
            return res.redirect('/userhome')
        }else{
            return res.render('userlogin')
        }
    }

    catch(error){
        console.error(error)
        return res.status(500).send('INTERNAL SERVER ERROR')
    }
})

// ROUTE FOR USER LOGINPAGE

router.get('/userlogin',(req,res)=>{
    if(req.session.adminlogged){
        res.redirect('/adminhome')
    }

    try{
        if(req.session.userlogged){
            res.render('userhome',
            {
                name: req.session.name,
				email: req.session.email,
				password: req.session.password
            })
        }else{
            res.render('userlogin')
        }
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

// ROUTE FOR USER REGISTER

router.get('/userregister',(req,res)=>{
    if(req.session.adminlogged){
        res.redirect('/adminhome')
    }

    try{
        if(req.session.userlogged){
            res.redirect('/userhome')
        }else{
            res.render('/register')
        }
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

router.post('/userregister',async (req,res)=>{
    if(req.session.adminlogged){
        res.redirect('/userhome')
    }

    const{name,email,password}=req.body

    // CHECKING IF THE USER EXISTS
    const existuser= await users.findOne({email},{})
    if(existuser){
        return res.redirect('/register')
    }

    const salt=10
    const hashedpass=await bcrypt.hash(password,salt)

    const newuser=await users.create({
        name,
        email,
        password:hashedpass  // STORE HASHED PASSWORD IN DATABASE
    })

    // STORE USER DATA INTO THE SESSION
    req.session.name = req.body.name;
	req.session.email = req.body.email;
	req.session.password = req.body.password;
    req.session.userlogged=true
    res.redirect('/userhome')

})

// ROUTE FOR USERHOME

router.get('/userhome',async (req,res)=>{
    if(req.session.adminlogged){
        res.redirect('/adminhome')
    }

    try{
        if(req.session.userlogged){
            const username=req.session.name
            console.log(req.session);
            res.render('userhome',{username})
        }else{
            res.redirect('/')
        }
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

// ROUTE FOR USER LOGOUT

router.post('/userlogout',(req,res)=>{
    if(req.session.adminlogged){
        res.redirect('/adminhome')
    }

    try{
        req.session.destroy()
        res.redirect('/')
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

// ROUTE FOR ADMIN LOGIN PAGE

router.get('/adminlogin',(req,res)=>{
    if(req.session.userlogged){
        res.redirect('/userhome')
    }

    try{
        if(req.session.adminlogged){
            res.redirect('/adminhome')
        }else{
            res.render('adminlogin')
        }
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

router.post('/adminlogin',(req,res)=>{
    if(req.session.userlogged){
        res.redirect('/userhome')
    }

    try{
        if(req.session.adminlogged){
            res.redirect('/adminhome')
        }else if(req.body.email==credential.email&&req.body.password==credential.password){
            req.session.user=req.body.email
            req.session.adminlogged=true
            res.redirect('/adminhome')
        }else{
            res.render('/adminlogin')
        }
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

//  ADDING USERS DATA ON ADMIN HOME AS TABLE

router.get('/adminhome',async (req,res)=>{
    if(req.session.userlogged){
        res.redirect('/userhome')
    }

    try{
        if(req.session.adminlogged){
            var i=0
            const userData= await users
            .find()
            .sort({    // sorting userdata in ascending order
                name:1,
                email:1
            })
            res.render('adminhome',{
                userData,
                i,
                userUpdated:req.query.userUpdated,
                userAddedMessage:req.query.userAddedMessage,
                userName:req.query.userName,
                deletedUserName:req.query.deletedUserName,
                userDeletedMessage:req.query.userDeletedMessage
            })
        }else{
            res.redirect('/adminlogin')
        }
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

// ADMIN INSERTION OF USERS

router.post('/adminadd',async(req,res)=>{
    const{name,email,password}=req.body
    console.log(req.body);


    if(req.session.userlogged){
        res.redirect('/userhome')
    }

    try{
        if(req.session.adminlogged){
            const adminAddingUser=await users.findOne({email})
            if(adminAddingUser){
                console.log(adminAddingUser);
                return res.redirect('/adminadd?message=Admin,this email already exists')
            }
            const saltround=10
            const hashpass=await bcrypt.hash(password,saltround)
            req.body.password = hashpass;
			const newuser = await users.create(req.body);
			const userName = req.body.name
            res.redirect('/adminhome?userAddedMessage=Successfully added new User&UserName='+encodeURIComponent(userName))
        }else{
            res.redirect('/adminlogin')
        }
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

// ADMIN SEARCH USER

router.post('/search',async(req,res)=>{
    if(req.session.userlogged){
        res.redirect('/userhome')
    }
    try{
        // variable or value for serial number
        var i=0
        const data=req.body
        console.log('req.body', req.body);
        const userData=await users.find({
            $or:[
                {name:{$regex:'.*'+data.search+'.*',$options:'ims'}},
                {email:{$regex:'.*'+data.search+'.*',$options:'ims'}}
            ]
        })
        console.log('userData', userData);
        res.render('adminhome',{
            userData,
            i,
            userUpdated:req.query.userUpdated,
            userAddedMessage:req.query.userAddedMessage,
            userName:req.query.userName,
            deletedUserName:req.query.deletedUserName,
            userDeletedMessage:req.query.userDeletedMessage
        })
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

// ADMIN ADD USER

router.get('/add',(req,res)=>{
    if(req.session.userlogged){
        res.redirect('/username')
    }

    try{
        if(req.session.adminlogged){
            res.redirect('/adminadd')
        }else{
            res.redirect('/adminlogin')
        }
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERRROR")
    }
})

// ADMIN SEARCH USER

router.get('/adminadd',(req,res)=>{
    if(req.session.userlogged){
        res.redirect('/userhome')
    }

    try{
        if(req.session.adminlogged){
            res.render('adminadd',{message:false})
        }else{
            res.redirect('/adminlogin')
        }
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

// ADMIN USER DELETION

router.get('/delete/:id',async(req,res)=>{
    if(req.session.userlogged){
        res.redirect('/userhome')
    }

    try{
        const id=req.params.id
        const findbyId=await users.find({_id:id})
        const user=findbyId[0]
        const deletedUserName=user.name
        const deleted=await users.deleteOne({_id:id})
        res.redirect('/adminhome?userDeletedMessage=Successfully Deleted User&deletedUserName=' + encodeURIComponent(deletedUserName));
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

// ADMIN EDIT USER

router.get('/edit/:id',async(req,res)=>{
    if(req.session.userlogged){
        res.redirect('/userhome')
    }

    try{
        if(req.session.adminlogged){
            const id=req.params.id
            const editUserData=await users.findOne({_id:id})
            res.render('adminuserdata',{editUserData})
        }else{
            res.redirect('/adminlogin')
        }
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

// ADMIN UPDATE USER

router.post('/update/:id',async (req,res)=>{
    if(req.session.userlogged){
        res.redirect('/userhome')
    }

    try{
        let updatedData=req.body
        let id=req.params.id

        // checking or ensure id is a valid objectid in database
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).send("INVALID USER ID")
        }

        const result= await users.updateOne(
            {_id:id},
            {
                $set:{
                    name:updatedData.name,
                    email:updatedData.email
                }
            }
        )

        if(result.nModified===0){
            return res.status(404).send("USER NOT-FOUND")
        }

        res.redirect('/adminhome?userUpdated=User Details Updated Successfully')
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

// ROUTE FOR ADMIN LOGOUT 

router.get('/adminlogout',(req,res)=>{
    if(req.session.userlogged){
        res.redirect('/userhome')
    }

    try{
        req.session.destroy()
        res.redirect('/')
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

// SETTING 404 PAGE

router.use((req,res)=>{
    try{
        res.status(404).render('404')
    }

    catch(error){
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

// EXPORTING ROUTER

module.exports=router