const express = require('express');
const session = require('express-session')
const { getDB, getRole, insertObject,ObjectId} = require('./databaseHandle');

const app = express()

app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use(session({ secret: '124447yd@@$%%#', cookie: { maxAge: 900000 }, saveUninitialized: false, resave: false }))

app.get('/', async(req, res) => {
    const db = await getDB();
    const allnews = await db.collection('Newspaper').find({}).toArray();
    const a = allnews[0]
    const b = allnews[1]
    const c = allnews[2]
    res.render('index',{item1:a, item2:b, item3:c})
})
app.get('/detailNews',  async(req, res) => {
    const id = req.query.id;
    const db = await getDB();
    await db.collection("Newspaper").updateOne({ _id: ObjectId(id) }, { $inc: { "view": 1 } })
    const news = await db.collection("Newspaper").findOne({ _id: ObjectId(id) })
    res.render("detailNews", { news: news})
})
app.get('/register',async (req, res) => {
    res.render("register");
})
app.post('/register', async (req, res) => {
    const username = req.body.txtUsername;
    const password = req.body.txtPassword;
    var coin = 0;
    const role = req.body.txtSelect;

    console.log(role)

    const newAccount = {
        username: username,
        password: password,
        role: role
    }
    const newUser = {
        username: username,
        coin:coin
    }

    if (role == "Manager") {
        insertObject('Account', newAccount)
        insertObject('Manager', newUser)
    } else if (role == "Writer") {
        insertObject('Account', newAccount)
        insertObject('Writer', newUser)
    } else if (role == "User") {
        insertObject('Account', newAccount)
        insertObject('User', newUser)
    }

    res.redirect('/');
})

//Login
app.use(session({
    key: 'user_id',
    secret: '124447yd@@$%%#',
    cookie: { maxAge: 900000 },
    saveUninitialized: false,
    resave: false
}))
app.get('/', (req, res) => {
    res.render('login')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const name = req.body.txtUsername;
    const pass = req.body.txtPassword;
    const role = await getRole(name, pass);
    if (role == -1) {
        res.render('login')
    } else if (role == "Admin") {
        req.session["Admin"] = {
            name: name,
            role: role
        }
        res.redirect('admin')

    } else if (role == "Manager") {
        req.session["Manager"] = {
            name: name,
            role: role
        }
        res.redirect('manager')

    } else if (role == "Writer") {
        req.session["Writer"] = {
            name: name,
            role: role
        }
        res.redirect('writer')

    } else if (role == "User") {
        req.session["User"] = {
            name: name,
            role: role
        }
        res.redirect('user')
    }
})

const adminController = require('./controller/admin')
app.use('/admin', adminController)

const userController = require('./controller/user')
app.use('/user', userController)

const managerController = require('./controller/manager')
app.use('/manager', managerController)

const writerController = require('./controller/writer');
const async = require('hbs/lib/async');
app.use('/writer', writerController)

const PORT = process.env.PORT || 2001;
app.listen(PORT)
console.log("app running is: ", PORT)