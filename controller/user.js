const express = require('express')
const { render, send } = require('express/lib/response')
const async = require('hbs/lib/async')
const { ObjectId, MaxKey } = require('mongodb')
const { getDB, insertObject, deleteCoordinator, deleteStaff, deleteManager } = require('../databaseHandle')
const { requireUser } = require('../middleware')

const router = express.Router()


router.get('/', requireUser,async (req, res) => {
    const db = await getDB();
    const allnews = await db.collection('Newspaper').find({}).toArray();
    res.render('user/indexUser',{data:allnews})
})
router.get('/infoUser',requireUser, async(req, res) => {
    const acc = req.session["User"]
    const db = await getDB();
    const user = await db.collection('User').findOne({'username':acc.name});
    console.log(user)
    res.render("user/infoUser", {data:user})
})
router.get('/updateUser',requireUser,async(req,res)=>{
    const id = req.query.id;
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
    const user = await db.collection('User').findOne({ _id: ObjectId(id) });
    res.render("user/infoUser", {data:user})
})













module.exports = router;