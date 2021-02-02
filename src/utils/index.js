const xlsx = require('node-xlsx')

function parseExcel (path) {
  const sheets = xlsx.parse(path)
  var allSheets = []
  sheets.forEach(sheet => { // { name: 'sheet1', data: [ [第一列,第二列,...], 第二行 ]}
    const rows = []
    const { data } = sheet
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      if (row && row.length && isNumber(row[0])) {
        rows.push({
          number: row[0],
          applyDate: row[1],
          applicationNum: row[2]
        })
      }
    }
    allSheets.push(rows)
  })
  return allSheets
}

function isNumber (value) {
  if (value === '' || value === null) return false // 空字符串,空格,null会按照0处理
  if (typeof +value === 'number') {
    return !isNaN(value)
  }
  return false
}

module.exports = {
  parseExcel,
  isNumber
}
