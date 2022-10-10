const express = require('express')
const { append, redirect } = require('express/lib/response')
const async = require('hbs/lib/async')
const { ObjectId, getDB, insertObject } = require('../databaseHandle')
const { requireManager } = require('../middleware');

const router = express.Router()

//index Manager
router.get('/', requireManager,async (req, res) => {
    res.render('manager/indexManager')
})
router.get('/indexManager', requireManager,async (req, res) => {
    res.render('manager/indexManager')
})

//add Category
router.get('/addCategory',requireManager,async(req,res)=>{
    res.render('manager/addCategory')
})
router.post('/addCategory',requireManager,async(req,res)=>{
    const name = req.body.txtCategory;
    const description = req.body.txtDescription;
    const news = []
    const addCategory={
        name:name,
        description:description,
        news:news
    }
    insertObject('Category',addCategory)

    res.redirect('/manager/')
})











module.exports = router;