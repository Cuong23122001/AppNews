const express = require('express');
const session = require('express-session')
const { getDB, getRole, insertObject } = require('./databaseHandle');

const app = express()
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use(session({ secret: '124447yd@@$%%#', cookie: { maxAge: 900000 }, saveUninitialized: false, resave: false }))

app.get('/', (req, res) => {
    res.render("index");
})

app.get('/register', (req, res) => {
    res.render("register");
})
app.post('/register', async (req, res) => {
    const username = req.body.txtUsername;
    const password = req.body.txtPassword;
    const role = req.body.txtSelect;

    console.log(role)

    const newAccount = {
        username: username,
        password: password,
        role: role
    }
    const newUser = {
        username: username
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

    res.render('index');
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

const writerController = require('./controller/writer')
app.use('/writer', writerController)

const PORT = process.env.PORT || 2001;
app.listen(PORT)
console.log("app running is: ", PORT)