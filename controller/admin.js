const express = require('express')
const { render, send } = require('express/lib/response')
const async = require('hbs/lib/async')
const { ObjectId, MaxKey } = require('mongodb')
const { getDB, insertObject, deleteCoordinator, deleteStaff, deleteManager } = require('../databaseHandle')
const { requireAdmin } = require('../middleware')

const router = express.Router()

router.get('/', requireAdmin,async (req, res) => {
    const user = req.session["Admin"]
    const db = await getDB();
    const allManage = await db.collection("Manager").find({}).toArray();
    res.render('admin/indexAdmin',{ user: user, acc: allManage })
})
router.get('/addManager', requireAdmin, async (req, res) => {
    
    res.render("admin/addManager")
})
router.post('/addManager', requireAdmin, async (req, res) => {
    const userName = req.body.txtUser;
    const role = req.body.Role;
    const name = req.body.txtName;
    const age = req.body.txtAge;
    const email = req.body.txtEmail;
    const phoneNumber = req.body.txtPhone;
    const address = req.body.txtAddress;

    const objectToUser = {
        userName: userName,
        role: role,
        password: '123456'
    }
    const objectToObject = {
        userName: userName,
        name: name,
        age: age,
        email: email,
        phoneNumber: phoneNumber,
        address: address
    }
    insertObject("Account", objectToUser)
    insertObject("Manager", objectToObject)
    res.render("admin/indexAdmin")
})





module.exports = router;