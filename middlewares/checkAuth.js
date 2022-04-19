module.exports = (req, res, next) => {
    if (req.path == '/') next()

    if (req.session.loggedin) {
        req.loggedin = true
        next()
    } else {
        res.render('templates/no_auth', {
          page_name: 'Login required',
          loggedin: false
        })
    } 
}
