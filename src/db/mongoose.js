const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
})

// const me = new User({
//     name : '     Andrew',
//     email: 'shuBHam@gmail.com',
//     password: '   passwrd123'
// })

// me.save().then(()=>{
//     console.log(me)
// }).catch((error)=>{
//     console.log(error)
// })

