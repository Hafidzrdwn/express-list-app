const express = require('express')
const router = express.Router()
const db = require('../lib/db')
const { validationResult } = require('express-validator')
const { itemNameCheck, itemTagsCheck, itemPriceCheck } = require('../lib/validator')
const { fixResult, validationErrorsHandler } = require('../lib/fix')
const { checkIsNotLogin } = require('../middlewares/checkAuth')

const tags = [
    'makanan berat',
    'makanan ringan',
    'penyedap rasa',
    'bumbu masakan',
    'makanan',
    'minuman',
    'lauk pauk',
    'bahan mentah',
    'makanan frozen',
    'sayuran',
    'buah',
    'saus',
    'biskuit',
    'minuman soda',
    'jus'
]

router.route('/list')
  .get(checkIsNotLogin, (req, res) => {
    // mengakses data dari database 
    db.query(
      'SELECT * FROM items WHERE user_id = ? ORDER BY id DESC', [req.session.userId],
      (error, results) => {
        if (error) throw new Error('Server Error!!')

        results = Object.values(JSON.parse(JSON.stringify(results)))
        const rows = fixResult(results)
        
        res.render('user/index', {
          items: rows,
          page_name: 'List',
          loggedin: req.loggedin
        })
      }
      )
  })
  .post([
    checkIsNotLogin,
    itemNameCheck,
    itemTagsCheck,
    itemPriceCheck
  ], (req, res) => {

    const body = req.body
    let errors = validationResult(req);
    let name = body.name
    let tags = body.tags
    let counts = body.counts
    let price = body.price
    let sql = `INSERT INTO items (user_id, name, tags, counts, price) VALUES (${req.session.userId}, "${name}", "${tags}" , ${counts}, ${price})`
    const checkItem = `SELECT COUNT(*) FROM items WHERE name = "${name}"`
    let itemCount = 0

    db.query(checkItem, (error, results) => {
      if (error) throw new Error('Server Error!!')

      if (errors.isEmpty()) {

        itemCount = parseInt(results[0]['COUNT(*)'])
    
        if (itemCount > 0) {
          sql = `UPDATE items SET counts = counts + ${parseInt(counts)} WHERE name = "${name}"`
        }

        db.query( sql , (error, results) => {
            if (error) throw new Error('Server Error!!')
            
            req.flash('info', 'Mantap, item berhasil ditambahkan ke keranjang!!')
            req.flash('icon', 'check-circle')
            res.redirect('/list')
          })
      } else {
        errors = validationErrorsHandler(errors.array())
        req.flash('nameError', errors.name)
        req.flash('tagsError', errors.tags)
        req.flash('priceError', errors.price)

        if (errors.hasOwnProperty('tags')) {
          req.flash('tagsInit', 'border-danger')
        }

        res.redirect('/new')
      }
    })
  })

router.get('/new', checkIsNotLogin , (req, res) => {
  res.render('user/new', {
    page_name: 'Add Item',
    tags: tags,
    loggedin: req.loggedin
  })
})

router.route('/list/:id')
  .get(checkIsNotLogin, (req, res) => {
    db.query(
      'SELECT * FROM items WHERE id=?',
      [req.params.id],
      (error, results) => {
        if (error) throw new Error('Server Error!!')

        results = Object.values(JSON.parse(JSON.stringify(results)))
        const rows = fixResult(results)

        res.render("user/edit", {
          item: rows[0],
          page_name: 'Edit Item',
          tags: tags,
          loggedin: req.loggedin
        })
      }
    )
  })
  .post([
    checkIsNotLogin,
    itemNameCheck,
    itemTagsCheck,
    itemPriceCheck
  ], (req, res) => {

    const body = req.body
    let errors = validationResult(req);
    let name = body.name
    let tags = body.tags
    let counts = body.counts
    let price = body.price 
    let itemId = req.params.id
    
    if (errors.isEmpty()) {
      let sql = `UPDATE items SET name = "${name}", tags = "${tags}", price = ${price} , counts = ${counts} WHERE items.id = ${itemId}`
        
      db.query( sql, (error, results) => {
        if (error) throw new Error('Server Error!!')

          if (results.affectedRows) {
            req.flash('info', `Mantap, ${name} berhasil diedit!!`)
            req.flash('icon', 'check-circle')
            res.redirect('/list')
          }
        }
      )
    } else {
      errors = validationErrorsHandler(errors.array())
      req.flash('nameError', errors.name)
      req.flash('tagsError', errors.tags)
      req.flash('priceError', errors.price)

      if (errors.hasOwnProperty('tags')) {
        req.flash('tagsInit', 'border-danger')
      }

      res.redirect(`/list/${itemId}`)
    }
  })

router.get('/list/delete/:id', checkIsNotLogin, (req, res) => {
  db.query(
    'DELETE FROM items WHERE id=?',
    [req.params.id],
    (error, results) => {
      if (error) throw new Error('Server Error!!')

      req.flash('info', 'Yuhuu item berhasil dihapus!!')
      req.flash('icon', 'trash-alt')
      res.redirect('/list')
    }
  )
})
 
router.get('/logout', checkIsNotLogin, (req, res) => {
  delete req.session.loggedin
  delete req.session.username
  delete req.session.userId
  
  res.redirect('/')
})


module.exports = router