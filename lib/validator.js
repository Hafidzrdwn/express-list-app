const { check } = require('express-validator')
const db = require('./db')

module.exports = {
  // item
  itemNameCheck:
    check('name').custom(value => {
      if (value === "") {
        throw new Error('Nama item tidak boleh kosong!!')
      } else {
        let rgx = /^[A-Za-z ]+$/

        if (!rgx.test(value)) {
          throw new Error('Nama item tidak boleh mengandung angka dan simbol!!')
        }
      }

      return true
    })
      .escape()
      .toLowerCase()
      .trim()
  ,
  itemTagsCheck:
    check('tags').custom(value => {

      if (value == undefined) {
        throw new Error('Pilih tags item anda!!')
      } else {
        if (Array.isArray(value) && value.length > 3) {
          throw new Error('Tags maksimal hanya dapat menampung 3 tag!!')
        }
      }
      
    return true
    })
  ,
  itemPriceCheck:
    check('price')
      .notEmpty()
      .withMessage('Harga item harus diisi!!')
  ,
  // AUTH
  checkUsername:
    check('username').custom(value => {

      if (value.length <= 0) {
        throw new Error('Username harus diisi!!')
      } else {

        if (value.length < 3) {
          throw new Error('Username minimal diisi 3 karakter!!')
        }

        if (value.length > 12) {
          throw new Error('Username maksimal diisi 12 karakter!!')
        }

        let rgx = /^[A-Za-z]+$/

        if (!rgx.test(value)) {
          throw new Error('Username dilarang mengandung spasi, angka, dan simbol!!')
        }

      }

      return true
    })
    .escape()
    .trim()
  ,
  checkEmail:
    check('email')
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage('Email tidak valid!!')
      .custom((value, { req }) => {
        return new Promise((resolve, reject) => {

          const sql = `SELECT * FROM users WHERE email = '${req.body.email}'`

          db.query(sql, (err, res) => {
            if (err) {
              reject(new Error('Server Error!!'))
            }

            if (res.length > 0) {
              reject(new Error('Email sudah terdaftar, silahkan gunakan email lain!!'))
            }

            resolve(true)
          })
        })
      })
  ,
  checkPassword:
    check('password')
      .escape()
      .trim()
      .notEmpty()
      .withMessage('Password harus diisi!!')
      .custom(value => {
        
        if (value.length < 8) {
          throw new Error('Panjang password minimal 8 karakter!!')
        }

        if (value.length > 25) {
          throw new Error('Panjang password maksimal 25 karakter!!')
        }

        return true
      })
  , 
  checkLoginEmail: 
    check('email')
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage('Email tidak valid!!')
}