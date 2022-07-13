const fs = require("fs"); 
const bookid = process.argv[2] ? process.argv[2] : "3rivers";
const poemfile = `./${bookid}poems.js`;
const bookfile = `./${bookid}book.js`;
//const poems = require("./3riverspoems.js");
//const poems = require("./nighttrainpoems.js");
const poems = require(poemfile);
let dt = new Date();
let timestamp = dt.getTime();
let datetime = dt.toDateString();
let poemids = poems.map(poem => poem.id); 
fs.writeFileSync("poemids.js", "module.exports = " + JSON.stringify(poemids,null,"\t"), (err) => {
  if (err)
    console.log(err);
  else {
    console.log("File written successfully\n");
  }
});
