const xlsx = require('node-xlsx')
var Excel = require('exceljs')
var workbook = new Excel.Workbook()

function isNumber (value) {
  if (value === '' || value === null) return false // 空字符串,空格,null会按照0处理
  if (typeof +value === 'number') {
    return !isNaN(value)
  }
  return false
}

// 将表格数据提取出来
function parseExcel (path) {
  const sheets = xlsx.parse(path)
  var allSheets = []
  sheets.forEach(sheet => {
    // { name: 'sheet1', data: [ [第一列,第二列,...], 第二行 ]}
    const rows = []
    const { data } = sheet
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      if (row && row.length && isNumber(row[0])) {
        rows.push({
          number: row[0],
          applyDate: row[1],
          applyNum: row[2]
        })
        // 每次上传文件的时候,检查应该从哪一行开始操作,即startRow
        if (row[9] && row[10]) {
          global.startRow = row
        }
      }
    }
    allSheets.push(rows)
  })
  return allSheets
}

// 改写表格,增加内容
//   { row: 5, cell: 9, data: '第五行第九列' },
//   { row: 5, cell: 10, data: '第五行第10列' },
//   { row: 6, cell: 10, data: '第六行第10列' }
function insertDataFromExcel (path, sheet = 1, cellData = []) {
  return new Promise((resolve, reject) => {
    workbook.xlsx.readFile(path).then(function () {
      var worksheet = workbook.getWorksheet(sheet)
      cellData.forEach(function (val) {
        const { row, cell, data } = val
        var editRow = worksheet.getRow(row)
        editRow.getCell(cell).value = data
        editRow.commit()
      })
      resolve()
      workbook.xlsx.writeFile('new.xlsx')
    }).catch(error => {
      reject(error)
    })
  })
}

module.exports = {
  parseExcel,
  isNumber,
  insertDataFromExcel
}
