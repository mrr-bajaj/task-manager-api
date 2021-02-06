const express = require('express')
const User = require('../models/user')
const multer = require('multer')
const sharp = require('sharp')
const auth =require('../middleware/auth')
const router = express.Router()


//Create Resources
router.post('/users',async (req,res)=>{
    const user = new User(req.body)
    const token = await user.generateAuthToken()
    try{
       // await user.save()
        res.status(201).send({user,token})
    }catch(e){
       // console.log(e) 
        res.status(400).send(e)
    }
    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((e)=>{
    //     res.status(400).send(e)
    //   //  res.send(e)
    // })
})

router.post('/users/login',async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }catch(e){
        res.status(400).send()
    }
})


router.post('/users/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send() 
    }catch(e){
        res.status(500).send()
    }
})


router.post('/users/logoutAll',auth,async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

//Read Resources
router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user)
    // try{
    //     const users = await User.find({})
    //     res.send(users)
    // }catch(e){
    //     res.status(500).send(e)
    // }
    // User.find({}).then((users)=>{
    //     res.send(users)
    // }).catch((e)=>{
    //     res.status(500).send()
    // })
})
//not use
// router.get('/users/:id',async(req,res)=>{
//     const _id = req.params.id
//     try{
//         const user = await User.findById(_id)
//         if(!user){
//             return res.status(404).send()
//         }
//         res.send(user)
//     }catch(e){
//         res.status(500).send(e)
//     }
//     // User.findById(_id).then((user)=>{
//     //     if(!user){
//     //         return res.status(404).send()
//     //     }
//     //     res.send(user)
//     // }).catch((e)=>{
//     //     res.status(500).send()
//     // })
// })

router.patch('/users/me',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid Update!'})
    }
    try{
       // const user = await User.findById(req.params.id)
       const user = await req.user
        updates.forEach((update)=> user[update]=req.body[update])
        await user.save()
    //const user = await User.findByIdAndUpdate(req.params.id,req.body,{new: true, runValidators: true})
    res.send(user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/users/me',auth,async(req,res)=>{
    try{
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload with proper image extension'))
        }
        cb(undefined,true)
    }
})
router.post('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({height: 250, width: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{ 
    res.status(400).send({error: error.message})
})

router.get('/users/:id/avatar',async(req,res)=>{
    try{
    const user = await User.findById(req.params.id)
    if(!user || !user.avatar){
        throw new Error()
    }
    res.set('Content-Type','image/jpg')
    res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})

router.delete('/users/me/avatar',auth,async(req,res)=>{
    req.user.avatar = undefined
    await req.user.save() 
    res.status(200).send()
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})
module.exports = router