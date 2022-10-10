const express = require('express')
const { ObjectId, MaxKey } = require('mongodb')
const { getDB, insertObject, deleteCoordinator, deleteStaff, deleteManager } = require('../databaseHandle')
const { requireUser } = require('../middleware')
const bodyParser = require('body-parser');
var appRoot = require('app-root-path');
const async = require('hbs/lib/async');
const router = express.Router()

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())

router.get('/', requireUser, async (req, res) => {
    const acc = req.session["User"]
    const db = await getDB();
    const allnews = await (await db.collection('Newspaper').find({}).toArray()).reverse();
    const user = await db.collection('User').findOne({ 'username': acc.name });

    const a = allnews[0]
    const b = allnews[1]
    const c = allnews[2]

    var x = allnews.length + 1;
    const h = allnews.slice(3, x)

    const category = await db.collection('Category').find({}).toArray();

    var groupCategory = []

    for (let i = 0; i < category.length; i++) {
        const allnews = await db.collection('Newspaper').find({ category: category[i].name }).toArray();
        groupCategory.push(allnews)
    }

    res.render('user/indexUser', { user: user, item1: a, item2: b, item3: c, data: h, group: groupCategory })
})
router.get('/indexUser', requireUser, async (req, res) => {
    const acc = req.session["User"]
    const db = await getDB();
    const allnews = await db.collection('Newspaper').find({}).toArray();
    const user = await db.collection('User').findOne({ 'username': acc.name });
    res.render('user/indexUser', { data: allnews, user: user })
})

//profile user
router.get('/infoUser', requireUser, async (req, res) => {
    const acc = req.session["User"]
    const db = await getDB();
    const user = await db.collection('User').findOne({ 'username': acc.name });
    res.render("user/infoUser", { data: user })
})

//update profile user
router.get('/updateUser', requireUser, async (req, res) => {
    const acc = req.session["User"]
    const db = await getDB();
    const user = await db.collection('User').findOne({ 'username': acc.name });
    res.render("user/updateUser", { data: user })
})
router.post('/updateUser', requireUser, async (req, res) => {
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

// detail newspaper
router.get('/detailNewsOfWriter', requireUser, async (req, res) => {
    const account = req.session["User"]
    const id = req.query.id;

    const db = await getDB();
    const news = await db.collection("Newspaper").findOne({ _id: ObjectId(id) })
    const user = await db.collection('User').findOne({ 'username': account.name })
    const writer = await db.collection("Writer").findOne({ _id: ObjectId(news.idWriter) })
    const allnews = await db.collection('Newspaper').find({}).toArray();
    const hotNews = allnews.slice(0, 5)

    const x = await db.collection("Writer").findOne({ $and: [{ _id: ObjectId(news.idWriter) }, { 'subcribe': user._id }] })
    var checkSub1 = new Boolean(true);
    var checkSub2 = new Boolean(true);

    if (x != null) {
        checkSub1 = Boolean(false)
    } else {
        checkSub2 = Boolean(false)
    }

    const y = await db.collection("Newspaper").findOne({ $and: [{ _id: ObjectId(id) }, { 'like': user._id }] })
    var checkLike1 = new Boolean(true);
    var checkLike2 = new Boolean(true);

    if (y != null) {
        checkLike1 = Boolean(false)
    } else {
        checkLike2 = Boolean(false)
    }
    await db.collection("Newspaper").updateOne({ _id: ObjectId(id) }, { $inc: { "view": 1 } })
    let coinViews = news.view * 1 / 1000;
    await db.collection('Writer').updateOne({ _id: ObjectId(news.idWriter) }, {
        $set: {
            coinViews: coinViews
        }
    })

    //show comment
    const comment = news.comment.reverse();

    res.render("user/detailNewsOfWriter", {comment:comment,
        user: user,news: news, hotNews: hotNews, writer: writer, checkSub1: checkSub1, checkSub2: checkSub2, checkLike1: checkLike1, checkLike2: checkLike2
    })
})

//Comment newspaper
router.post("/user-comment", requireUser, async (req, res) => {
    console.log("connected comment");
    const account = req.session["User"]

    const id = req.body.newsID;
    const comment = req.body.comment;
    //date time current
    const d = new Date();
    var minutes = d.getMinutes();
    var formatDate = ""
    
    if (minutes > 9) {
        formatDate = [d.getHours(), d.getMinutes()].join(':') + ' ' + [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('/')
    } else {
        var minutes = '0' + minutes;
        formatDate = [d.getHours(), minutes].join(':') + ' ' + [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('/')
    }
    const date = formatDate;

    const db = await getDB();
    const user = await db.collection('User').findOne({ 'username': account.name })
    await db.collection('Newspaper').updateOne({ _id: ObjectId(id) }, {
        $push: {
            'comment': {
                "_id":ObjectId(),
                "user": {
                    "_id": user._id,
                    "name": user.name
                },
                "comments": comment,
                "date":date,
                "reply":[]
            }
        }
    })
    return;
})
router.post("/user-reply-comment",requireUser,async(req,res)=>{
    console.log("connected reply");
    const account = req.session["User"];
    const newsID = req.body.newsID;
    const commentID = req.body.commentID;
    const date = req.body.date;
    const reply = req.body.reply;

    const db  = await getDB();
    const user = await db.collection('User').findOne({ 'username': account.name })

    await db.collection('Newspaper').updateOne({ _id:ObjectId(newsID), 'comment._id': ObjectId(commentID)  }, {
        $push: {
            "comment.$.reply": {
                "_id":ObjectId(),
                "user": {
                    "_id": user._id,
                    "name": user.name
                },
                "reply": reply,
                "date":date
            }
        }
    })
    return;

})
//subcribe writer
router.post("/user-sub", requireUser, async (req, res) => {
    console.log("connected subcribe");
    const account = req.session["User"]
    const writerID = req.body.writerID;

    const db = await getDB();
    const user = await db.collection('User').findOne({ 'username': account.name })
    const writer = await db.collection('Writer').findOne({ _id: ObjectId(writerID) })
    var coin = writer.coinSub;

    const x = await db.collection('Writer').findOne({ $and: [{ _id: ObjectId(writerID) }, { 'subcribe': user._id }] });
    if (x == null) {
        coin = coin + 2;
        await db.collection('Writer').updateOne({ _id: ObjectId(writerID) }, {
            $push: {
                'subcribe': user._id
            }
        })
        await db.collection('Writer').updateOne({ _id: ObjectId(writerID) }, {
            $set: {
                coinSub: coin
            }
        })
    } else {
        coin = coin - 2;
        await db.collection('Writer').updateOne({ _id: ObjectId(writerID) }, {
            $pull: {
                'subcribe': user._id
            }
        })
        await db.collection('Writer').updateOne({ _id: ObjectId(writerID) }, {
            $set: {
                coinSub: coin
            }
        })
    }
})

//like newspaper
router.post("/user-like", requireUser, async (req, res) => {
    console.log("connected like");
    const account = req.session["User"]
    const id = req.body.newsID;

    const db = await getDB();
    const user = await db.collection('User').findOne({ 'username': account.name })

    const x = await db.collection('Newspaper').findOne({ $and: [{ _id: ObjectId(id) }, { 'like': user._id }] });
    if (x == null) {
        await db.collection('Newspaper').updateOne({ _id: ObjectId(id) }, {
            $push: {
                'like': user._id
            }
        })
    } else {
        await db.collection('Newspaper').updateOne({ _id: ObjectId(id) }, {
            $pull: {
                'like': user._id
            }
        })
    }
})

//Charge money 
router.get('/chargeMoney', requireUser, async (req, res) => {
    res.render("user/chargeMoney")
})
router.post('/chargeMoney', requireUser, async (req, res) => {
    const acc = req.session["User"]
    const db = await getDB();
    const user = await db.collection('User').findOne({ 'username': acc.name })

    const qr = req.body.txtSelect;
    var coin = user.coin;
    if (qr == "20000") {
        coin += 16;
    } else if (qr == "50000") {
        coin += 40;
    } else if (qr == "100000") {
        coin += 80;
    } else if (qr == "200000") {
        coin += 160;
    } else if (qr == "500000") {
        coin += 400;
    }

    await db.collection('User').updateOne({ 'username': acc.name }, {
        $set: {
            coin: coin
        }
    })

    res.redirect("/user/")
})



module.exports = router;