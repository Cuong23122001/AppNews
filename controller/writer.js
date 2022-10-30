const express = require('express')
const { render, send } = require('express/lib/response')
const async = require('hbs/lib/async')
const { ObjectId, MaxKey } = require('mongodb')
const { getDB, insertObject } = require('../databaseHandle')
const { requireWriter } = require('../middleware')
const multer = require('multer')
const path = require('path')


const router = express.Router()

// index writer
router.get('/', requireWriter, async (req, res) => {
    const db = await getDB();
    const allnews = await db.collection('Newspaper').find({}).toArray();
    res.render('writer/indexWriter', { data: allnews })
})
router.get('/indexWriter', requireWriter, async (req, res) => {
    const db = await getDB();
    const allnews = await db.collection('Newspaper').find({}).toArray();
    res.render('writer/indexWriter', { data: allnews })
})
//set files storage
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        var datetime = Date.now()
        cb(null, file.fieldname + '_' + datetime + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

//writer info
router.get('/infoWriter', requireWriter, async (req, res) => {
    const acc = req.session["Writer"]
    const db = await getDB();
    const writer = await db.collection('Writer').findOne({ 'username': acc.name });
    console.log(writer)
    res.render("writer/infoWriter", { data: writer })
})

//update writer info
router.get('/updateWriter', requireWriter, async (req, res) => {
    const acc = req.session["Writer"]
    const db = await getDB();
    const writer = await db.collection('Writer').findOne({ 'username': acc.name });
    res.render("writer/updateWriter", { data: writer })
})
router.post('/updateWriter', upload.single('folderImages'), requireWriter, async (req, res) => {
    const id = req.body.txtId;
    const file = req.file;
    const name = req.body.txtName;
    const age = req.body.txtAge;
    const email = req.body.txtEmail;
    const phone = req.body.txtPhone;
    const address = req.body.txtAddress;
    const subcribe = [];
    var coinSub = 0;
    var coinViews = 0;
    var coinTotal = 0;
    const filter = { _id: ObjectId(id) }
    const updateUser = {
        $set: {
            files: file,
            name: name,
            age: age,
            email: email,
            phone: phone,
            address: address,
            subcribe: subcribe,
            coinSub: coinSub,
            coinViews: coinViews,
            coinTotal: coinTotal
        }
    }

    const db = await getDB();
    await db.collection('Writer').updateOne(filter, updateUser);
    const user = await db.collection('Writer').findOne({ _id: ObjectId(id) });
    res.redirect("/writer/infoWriter", { data: user })
})

//upload article
router.get('/uploadNews', requireWriter, async (req, res) => {
    const db = await getDB();
    const category = await db.collection('Category').find({}).toArray();
    res.render("writer/uploadNews", { category: category })
})
router.post('/uploadNews', upload.single('folderImages'), requireWriter, async (req, res) => {
    const acc = req.session["Writer"]
    const db = await getDB();
    const writerName = await db.collection('Writer').findOne({ 'username': acc.name });
    const nameWriter = writerName.name;
    const idWriter = writerName._id;
    const title = req.body.txtTitle;
    const text = req.body.txtContent;
    const files = req.file;
    const like = [];
    const dislike = [];
    const view = 0;
    const comment = [];
    const category = req.body.txtSelect;

    //date time current
    const d = new Date();
    var minutes = d.getMinutes();
    var months = d.getMonth() + 1;
    var days = d.getDate();
    var formatDate = ""
    if (months > 9) {
        if (days > 9) {
            if (minutes > 9) {
                formatDate = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('/') + ' ' + [d.getHours(), d.getMinutes()].join(':')
            } else {
                var minutes = '0' + minutes;
                formatDate = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('/') + ' ' + [d.getHours(), minutes].join(':')
            }
        } else {
            days = '0' + days;
            if (minutes > 9) {
                formatDate = [days, d.getMonth() + 1, d.getFullYear()].join('/') + ' ' + [d.getHours(), d.getMinutes()].join(':')
            } else {
                var minutes = '0' + minutes;
                formatDate = [days, d.getMonth() + 1, d.getFullYear()].join('/') + ' ' + [d.getHours(), minutes].join(':')
            }
        }
    } else {
        months = '0' + months;
        if (days > 9) {
            if (minutes > 9) {
                formatDate = [d.getDate(), months, d.getFullYear()].join('/') + ' ' + [d.getHours(), d.getMinutes()].join(':')
            } else {
                var minutes = '0' + minutes;
                formatDate = [d.getDate(), months, d.getFullYear()].join('/') + ' ' + [d.getHours(), minutes].join(':')
            }
        } else {
            days = '0' + days;
            if (minutes > 9) {
                formatDate = [days, months, d.getFullYear()].join('/') + ' ' + [d.getHours(), d.getMinutes()].join(':')
            } else {
                var minutes = '0' + minutes;
                formatDate = [days, months, d.getFullYear()].join('/') + ' ' + [d.getHours(), minutes].join(':')
            }
        }
    }
    const date = formatDate;

    const uploadNews = {
        writer: nameWriter,
        idWriter: idWriter,
        date: date,
        title: title,
        text: text,
        category: category,
        view: view,
        like: like,
        dislike: dislike,
        comment: comment,
        files: files
    }

    await db.collection("Category").updateOne({ name: category }, {
        $push: {
            news: uploadNews
        }
    })

    insertObject('Newspaper', uploadNews)
    res.redirect('indexWriter')
})
router.get('/detailNewsOfWriter', async (req, res) => {
    const id = req.query.id;
    const db = await getDB();
    const news = await db.collection("Newspaper").findOne({ _id: ObjectId(id) })
    res.render("writer/detailNewsOfWriter", { news: news })
})

module.exports = router;