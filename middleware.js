function requireAdmin(req, res, next) {
    if (req.session["Admin"]) {
        return next()
    } else {
        res.redirect('/login')
    }
}

function requireManager(req, res, next) {
    if (req.session["Manager"]) {
        return next()
    } else {
        res.redirect('/login')
    }
}

function requireWriter(req, res, next) {
    if (req.session["Writer"]) {
        return next()
    } else {
        res.redirect('/login')
    }
}

function requireUser(req, res, next) {
    if (req.session["User"]) {
        return next()
    } else {
        res.redirect('/login')
    }
}

module.exports = {
    requireAdmin,
    requireManager,
    requireWriter,
    requireUser
}