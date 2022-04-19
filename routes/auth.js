const express = require('express')
const router = express.Router()
const db = require('../lib/db')
const { validationResult } = require('express-validator')
const { checkUsername, checkEmail, checkPassword, checkLoginEmail } = require('../lib/validator')
const { validationErrorsHandler } = require('../lib/fix')
const bcrypt = require('bcrypt')
const authChecker = require('../middlewares/checkLogin')

router.route('/')
  .get(authChecker, (req, res) => {
      res.render('auth/login', {
      page_name: 'Login'
    })
  })
  .post([
    authChecker,
    checkLoginEmail,
    checkPassword
   ], (req, res) => {
    
    const body = req.body
    let errors = validationResult(req)
    
    if (errors.isEmpty()) {

      let email = body.email
      let password = body.password

      db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
        if (err) throw new Error('Server Error!!')
        
        // if user not found
        if (result.length <= 0) {
          req.flash('error', 'Email tidak ditemukan, silahkan registrasi!!')
          res.redirect('/auth')
        } else {
          // if user found
          // get user password from db 
          const userPw = result[0].password
          const validPw = await bcrypt.compare(password, userPw)

          // if password is valid
          if (validPw) {
            req.session.loggedin = true
            req.session.username = result[0].username
            req.session.userId = result[0].id
            res.redirect('/')
          } else {
            req.flash('error', 'Password anda salah!!')
            res.redirect('/auth')
          }

        }
      })
      
    } else {
      errors = validationErrorsHandler(errors.array())

      req.flash('errEmail', errors.email)
      req.flash('errPassword', errors.password)

      res.redirect('/auth')
    }

  })

router.route('/registration')
  .get(authChecker, (req, res) => {
    res.render('auth/register', {
      page_name: 'Register'
    })
  })
  .post([
    authChecker,
    checkUsername,
    checkEmail,
    checkPassword
  ], async (req, res) => {
    
    const body = req.body
    let errors = validationResult(req)
    const salt = await bcrypt.genSalt(10)

    if (errors.isEmpty()) {

      let user = {
        username: body.username,
        email: body.email,
        password: body.password
      }

      user.password = await bcrypt.hash(user.password, salt)
      
      // Push to table users
      db.query('INSERT INTO users SET ?', user, (err, result) => {
        if (err) throw new Error('Server Error!!')
        
        if (result.affectedRows) {
          
          // Get User Id
          db.query('SELECT id FROM users WHERE email = ?', [user.email], (err, result) => {
            if (err) {
              throw new Error('Server Error!!')
            }

            req.session.loggedin = true
            req.session.username = user.username
            req.session.userId = result[0].id
            res.redirect('/')
          })
 
        }
      })

    } else {
      errors = validationErrorsHandler(errors.array())

      req.flash('errUsername', errors.username)
      req.flash('errEmail', errors.email)
      req.flash('errPassword', errors.password)

      res.redirect('/auth/registration')
    }
  })

module.exports = router