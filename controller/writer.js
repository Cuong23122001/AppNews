const express = require('express')
const { render, send } = require('express/lib/response')
const async = require('hbs/lib/async')
const { ObjectId, MaxKey } = require('mongodb')
const { getDB, insertObject} = require('../databaseHandle')
const { requireWriter } = require('../middleware')

const router = express.Router()


router.get('/', requireWriter,async (req, res) => {
    const db = await getDB();
    const allnews = await db.collection('Newspaper').find({}).toArray();
    res.render('writer/indexWriter',{data:allnews})
})
router.get('/indexWriter', requireWriter,async (req, res) => {
    res.render('writer/indexWriter',)
})
router.get('/infoWriter',requireWriter, async(req, res) => {
    const acc = req.session["Writer"]
    const db = await getDB();
    const writer = await db.collection('Writer').findOne({'username':acc.name});
    console.log(writer)
    res.render("writer/infoWriter", {data:writer})
})
router.get('/updateWriter',requireWriter,async(req,res)=>{
    const id = req.query.id;
    const acc = req.session["Writer"]
    const db = await getDB();
    const writer = await db.collection('Writer').findOne({'username':acc.name});
    res.render("writer/updateWriter", {data:writer})
})
router.post('/updateWriter',requireWriter,async(req,res)=>{
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
    await db.collection('Writer').updateOne(filter, updateUser);
    const user = await db.collection('Writer').findOne({ _id: ObjectId(id) });
    res.render("writer/infoWriter", {data:user})
})

router.get('/uploadNews',requireWriter,(req,res)=>{
    res.render("writer/uploadNews")
})
router.post('/uploadNews',async (req, res) => {
    const title = req.body.txtTitle;
    const text = req.body.txtContent;
    const like = [];
    const dislike = [];
    const view = 0;
    const comment = [];
    const uploadNews = {
        title: title,
        text: text,
        view: view,
        like: like,
        dislike: dislike,
        comment: comment,
    }
    insertObject('Newspaper', uploadNews)

    res.redirect('indexWriter')
})

module.exports = router;