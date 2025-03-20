const fs = require('fs');
const { Solar, Lunar } = require('lunar-javascript'); // Ensure this package is installed

// Read command-line arguments (excluding node and script name)
const args = process.argv.slice(2);


if (args.length < 5) {
    console.error('Error: Missing arguments!');
    process.exit(1);
  }

  // const [isex, iname, dateType, ibirthdate, ibirthtime, iothermatter] = args;
  const [ isavefilename ,isex, iname, dateType, ibirthdate, ibirthtime, iothermatter] = args;


// Create a solar instance
// const solar = Solar.fromYmdHms(2025, 2, 6, 16, 30, 0);


const dateAry = ibirthdate.split('-');
const iyear= dateAry[0]; //2013;
const imonth = dateAry[1]; //10;
const iday = dateAry[2]; //10;

const timeAry = ibirthtime.split(':');
const ihour = timeAry[0]; //10;
const imin = timeAry[1]; //20;

var lunar = null;
var solar = null;

if (dateType === "lunar") { // Use === for strict equality comparison
  lunar = Lunar.fromYmdHms(iyear, imonth, iday, ihour, imin, 0);
   solar = lunar.getSolar();
} 
else {
   solar = Solar.fromYmdHms(iyear, imonth, iday, ihour, imin, 0);
   lunar = solar.getLunar();
}

var sex = 1; // 男
var sexStr = "男";
var dateTypeStr = "阳历";
// let sex; // Declare the 'sex' variable

if (isex === "male") { // Use === for strict equality comparison
  sex = 1; sexStr="男";
} else {
  sex = 0; sexStr="女"
}

if (dateType === "solar") { // Use === for strict equality comparison
  dateTypeStr =`西曆: ${ibirthdate} 農曆:${lunar.getYear()}-${lunar.getMonth()}-${lunar.getDay()}`; // getDay() .getLunartoString()}` ;  // ${ibirthtime}` ; 
}
 else {
  dateTypeStr =`西曆:${solar.getYear()}-${solar.getMonth()}-${solar.getDay()} 農曆:${ibirthdate}}`;
}

const titleline1 = `姓名：${iname} 性别：${isex} 出生年月日时：${dateType} ${ibirthdate} ${ibirthtime} := ${iothermatter}`;
// const titleline = `${iname} ${sexStr} ：${dateTypeStr} ${ibirthdate} ${ibirthtime}`;
const titleline = `${iname} ${sexStr} ：${dateTypeStr}`;



// const solar = Solar.fromYmdHms(2023, 2, 6, 16, 30, 0);

const d = lunar.getEightChar();

// Function to replace specific words in the last row

  function replaceWords(text) {
      if (typeof text !== 'string') return text;
      const replacements = {
          '正印': '印', '劫财': '劫', '正官': '官', '七杀': '殺',
          '比肩': '比', '伤官': '傷', '正财': '財', '偏财': '才',
          '偏印': '梟', '食神': '食', '日主': '日'
      };
      return text.replace(/正印|劫财|正官|七杀|比肩|伤官|正财|偏财|偏印|食神|日主/g, 
        match => replacements[match]);
  }

  
    // as d.getTimeHideGan() and d.getTimeShiShenZhi() return an array, we need to take each array item to replaceWords()
// 定义一个函数processText，用于处理文本
function processText(input, applyReplacements = false) {
    // 判断输入是否为数组
    if (Array.isArray(input)) {
        // 如果是数组，则遍历数组中的每个元素
        return input.map(item => applyReplacements ? replaceWords(item) : item).join(' ');
    }
    // 如果不是数组，则直接返回处理后的文本
    return applyReplacements ? replaceWords(input) : input;
}


var yun = d.getYun(sex);
var daYunArr = yun.getDaYun();

// Prepare Eight Characters Table
const eightCharactersTable = `
    <h2>八字排算</h2>
    <h3>${titleline}</h3>
    <table class="eight-char-table">
        <tr><td>${replaceWords(d.getTimeShiShenGan())}</td><td>${replaceWords(d.getDayShiShenGan())}</td><td>${replaceWords(d.getMonthShiShenGan())}</td><td>${replaceWords(d.getYearShiShenGan())}</td></tr>
        <tr><td>${d.getTimeGan()}</td><td>${d.getDayGan()}</td><td>${d.getMonthGan()}</td><td>${d.getYearGan()}</td></tr>
        <tr><td>${d.getTimeZhi()}</td><td>${d.getDayZhi()}</td><td>${d.getMonthZhi()}</td><td>${d.getYearZhi()}</td></tr>
        <tr><td>${processText(d.getTimeHideGan())}</td><td>${processText(d.getDayHideGan())}</td><td>${processText(d.getMonthHideGan())}</td><td>${processText(d.getYearHideGan())}</td></tr>
        <tr><td>${processText(d.getTimeShiShenZhi(), true)}</td><td>${processText(d.getDayShiShenZhi(), true)}</td><td>${processText(d.getMonthShiShenZhi(), true)}</td><td>${processText(d.getYearShiShenZhi(), true)}</td></tr>
    </table>
`;

// Prepare Da Yun Table Data with 10 columns and 3 rows
const daYunRows = [[], [], []];
for (let i = 1; i <= 10; i++) {
    if (daYunArr[i]) {
        daYunRows[0].push(`<td>${daYunArr[i].getStartYear()}</td>`);  // 年
        daYunRows[1].push(`<td>${daYunArr[i].getStartAge()}岁</td>`);
        daYunRows[2].push(`<td>${daYunArr[i].getGanZhi()}</td>`);
    }
}
const daYunTable = `
    <h2>大運</h2>
    <table class="dayun-table">
        <tr>${daYunRows[0].join('')}</tr>
        <tr>${daYunRows[1].join('')}</tr>
        <tr>${daYunRows[2].join('')}</tr>
    </table>
`;

// Prepare LiuNian Table Data for 60 years, 10 per row
// daYunArr[i].getLiuNian();  each control 10 years
let tableRows = "";
for (let i = 1; i <= 6; i++) {
    let LiuNianArr = daYunArr[i].getLiuNian();
    for (let j = 0; j < LiuNianArr.length; j += 10) {
        tableRows += `<tr>` + 
            LiuNianArr.slice(j, j + 10).map(liuNian => `<td>${liuNian.getYear()}</td>`).join('') + 
            `</tr><tr>` + 
            LiuNianArr.slice(j, j + 10).map(liuNian => `<td>${liuNian.getGanZhi()}</td>`).join('') + 
            `</tr>`;
    }
}

const liuNianTable = `
    <h2>流年</h2>
    <table class="liunian-table">
        ${tableRows}
    </table>
`;

// Generate HTML content
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eight Characters Table</title>
<style>
  table {
    border-collapse: collapse;
    width: 80%; /* Default width */
    margin: auto;
  }
  th, td {
    border: 1px solid black;
    padding: 8px;
    text-align: center;
  }
  th {
    background-color: #f2f2f2;
  }
  .eight-char-table {
      margin-top: 20px;
      width: 60%;
      table-layout: fixed;
  }
  .eight-char-table tr:nth-child(2),
  .eight-char-table tr:nth-child(3) {
      font-size: 1.5em;
      font-weight: bold;
      color: blue;
  }
  .dayun-table, .liunian-table {
    margin-bottom: 30px;
    width: 80%; /* Other tables remain at 80% */
    table-layout: fixed;
  }
  .dayun-table td, .liunian-table td {
    width: 10%;
  }

  
  liunian-table
    body {
    /* display: flex; */
    justify-content: center;
    align-items: center;
    min-height: 100vh; /* Ensure the body takes up at least the full viewport height */
    max-width: 600px;
    margin: 0; /* Remove default body margin */
  }

  h2 {
    text-align: center; /* Redundant if already centered by flexbox, but good for fallback */
  }

h3 {
  text-align: center;
  font-size: large; /* or use a specific size like 20px, 1.2em, etc. */
  font-weight: bold;
}

</style>
</head>
<body>
    ${eightCharactersTable}
    ${daYunTable}
    ${liuNianTable}
</body>
</html>
`;

const filename = `html/${isavefilename}.html`;

// console.log(`filename : ${filename}`);
// Save to html/c8s.html
fs.mkdirSync('html', { recursive: true });
// write two same file, c8.html for email attachment
// fs.writeFileSync(filename, htmlContent, 'utf8');
fs.writeFileSync(filename, htmlContent, 'utf8');
fs.writeFileSync('html/c8.html', htmlContent, 'utf8');
// console.log('html/c8s.html has been generated. ${filename}');
console.log(`html filename{${filename}+ ${isavefilename}` );
console.log(`args 0-4={${args[0]}+ ${args[1], args[2], args[3], args[4]}` );
