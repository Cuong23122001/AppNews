const express = require('express')
const { ObjectId, MaxKey } = require('mongodb')
const { getDB, insertObject, deleteCoordinator, deleteStaff, deleteManager } = require('../databaseHandle')
const { requireUser } = require('../middleware')
const bodyParser = require('body-parser');
const router = express.Router()

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())

router.get('/', requireUser,async (req, res) => {
    const acc = req.session["User"]
    const db = await getDB();
    const allnews = await db.collection('Newspaper').find({}).toArray();
    const user = await db.collection('User').findOne({'username':acc.name});
    res.render('user/indexUser',{data:allnews,user:user})
})
router.get('/indexUser', requireUser,async (req, res) => {
    const acc = req.session["User"]
    const db = await getDB();
    const allnews = await db.collection('Newspaper').find({}).toArray();
    const user = await db.collection('User').findOne({'username':acc.name});
    res.render('user/indexUser',{data:allnews,user:user})
})
router.get('/infoUser',requireUser, async(req, res) => {
    const acc = req.session["User"]
    const db = await getDB();
    const user = await db.collection('User').findOne({'username':acc.name});
    console.log(user)
    res.render("user/infoUser", {data:user})
})
router.get('/updateUser',requireUser,async(req,res)=>{
    const acc = req.session["User"]
    const db = await getDB();
    const user = await db.collection('User').findOne({'username':acc.name});
    res.render("user/updateUser", {data:user})
})
router.post('/updateUser',requireUser,async(req,res)=>{
    const id = req.body.txtId;
    const name = req.body.txtName;
    const age = req.body.txtAge;
    const email = req.body.txtEmail;
    const phone = req.body.txtPhone;
    const address = req.body.txtAddress;
    const filter = { _id: ObjectId(id) }
    const updateUser = {
        $set: {
            name: name,
            age: age,
            email: email,
            phone: phone,
            address: address
        }
    }

    const db = await getDB();
    await db.collection('User').updateOne(filter, updateUser);

    res.redirect("/user/infoUser")
})

router.get('/chargeMoney',requireUser,async(req,res)=>{
    res.render("user/chargeMoney")
})
router.post('/chargeMoney',requireUser,async(req,res)=>{
    const acc = req.session["User"]
    const db = await getDB();
    const user = await db.collection('User').findOne({'username':acc.name})
    
    const qr = req.body.txtSelect;
    var coin = user.coin;
    if(qr == "20000"){
        coin += 16;
    }else if (qr == "50000") {
        coin += 40;
    }else if (qr == "100000") {
        coin += 80;
    }else if (qr == "200000") {
        coin += 160;
    }else if (qr == "500000") {
        coin += 400;
    }

    console.log(coin)
    await db.collection('User').updateOne({'username':acc.name},{
        $set:{
            coin:coin
        }
    })

    res.redirect("/user/")
})
router.post("/user-sub",requireUser,async(req,res)=>{
    console.log("connected");
    const account = req.session["User"]
    const writerID = req.body.writerID;

    
    const db = await getDB();
    const user = await db.collection('User').findOne({'username':account.name}) 

    const x = await db.collection('Writer').findOne({ $and: [{ _id: ObjectId(writerID) }, { 'subcribe': user._id }] });
    if (x == null) {
        await db.collection('Writer').updateOne({ _id: ObjectId(writerID) }, {
            $push: {
                'subcribe': user._id
            }
        })
    }else{
        await db.collection('Writer').updateOne({ _id: ObjectId(writerID) }, {
            $pull: {
                'subcribe': user._id
            }
        })
    }
})







router.get('/detailNewsOfWriter', requireUser ,async(req, res) => {
    const id = req.query.id;
    const db = await getDB();
    await db.collection("Newspaper").updateOne({ _id: ObjectId(id) }, { $inc: { "view": 1 } })
    const news = await db.collection("Newspaper").findOne({ _id: ObjectId(id) })
    res.render("user/detailNewsOfWriter", { news: news})
})











module.exports = router;