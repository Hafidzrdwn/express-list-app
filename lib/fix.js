const toRupiah = require('@develoka/angka-rupiah-js')

module.exports = {
  
  fixResult: (rows) => {
    let newRows = rows.map((row) => {

      // Tags
      row.tags = row.tags.split(',')
      row.tags.sort()
      
      // Date
      let date = new Date(row.date)
      let year = date.getFullYear()

      function checkZero(str) {
        return (String(str).length > 1) ? String(str) : `0${str}`
      }
      
      let month = checkZero(date.getMonth() + 1)
      let day = checkZero(date.getDate())
      let hours = checkZero(date.getHours())
      let minutes = checkZero(date.getMinutes())      
      let seconds = checkZero(date.getSeconds())

      date = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
      row.date = date

      // Total Price
      row.total_price = parseInt(row.price) * parseInt(row.counts)
      
      row.total_price = {
        num: toRupiah(row.total_price, { formal: false, floatingPoint: 0 }),
        display: toRupiah(row.total_price, { symbol: false, useUnit: true, longUnit: true, spaceBeforeUnit: true }).split(' ')[1]
      }

      row.price = {
        value: row.price,
        num: toRupiah(row.price, { formal: false, floatingPoint: 0 }),
        display: toRupiah(row.price, { symbol: false, useUnit: true, longUnit: true, spaceBeforeUnit: true }).split(' ')[1]
      }
      
      return row
    })

    return newRows
  }
  ,

  validationErrorsHandler: (errors) => {

    let arrErr = {}
      
    errors.forEach(err => {

      if (!arrErr.hasOwnProperty(err.param)) {
        arrErr[err.param] = err.msg
      }

    });

    return arrErr
  }

}