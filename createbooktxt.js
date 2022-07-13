const fs = require("fs"); 
console.log(process.argv);
const bookid = process.argv[2] ? process.argv[2] : "3rivers";
const poemfile = `./${bookid}poems.js`;
const bookfile = `./${bookid}book.js`;
const poems = require(poemfile);
const book = require(bookfile);
let dt = new Date();
let timestamp = dt.getTime();
let datetime = dt.toDateString();
let text = `
${book.title}
${book.author}
${book.publisher}
`;
text = text + book.sections.reduce( (sectionstr,section,s) => {
sectionstr = sectionstr + `
section ::: ${section.title}

`;
if(section.inscription) {
sectionstr = sectionstr + `
	${section.inscription}

`;
}
if(section.generatorf) {
//	sectionstr = sectionstr + generatefunctions[section.generatorf]();
}
else if(section.poems) {
sectionstr = sectionstr + section.poems.reduce( (poemstr,poemid,p) => {
	console.log(`poemid=${poemid}`);
	let poem = poems.filter(poem=>poem.id===poemid)[0];
	if(poem.title) {
	poemstr = poemstr + `
${poem.title}

`;
}
if(poem.inscription) {
	poemstr = poemstr + `${poem.inscription}

`;
}
poemstr = poemstr + `${poem.text}

`;
	return poemstr;
}, "");
}
sectionstr = sectionstr+`

_________ end of section _______
________________________________
`;
return sectionstr;
}, "");
let poemids = poems.map(poem => poem.id); 
let filename = `${book.file}.txt`;
fs.writeFileSync(filename, text, (err) => {
  if (err)
    console.log(err);
  else {
    console.log(`${filename} written successfully\n`);
  }
});
console.log(`done with ${book.file}.txt`);
