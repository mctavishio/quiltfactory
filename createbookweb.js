const fs = require("fs"); 
console.log(process.argv);
const bookid = process.argv[2] ? process.argv[2] : "pattern4x4x4";
const poemfile = `./${bookid}poems.js`;
const bookfile = `./${bookid}book.js`;
const poems = require(poemfile)();
const book = require(bookfile)();
let dt = new Date();
let timestamp = dt.getTime();
let datetime = dt.toDateString();
let bgcolors = book.bgcolors ? book.bgcolors : 	["#0D0F0E", "#767577", "#656863", "#3C3E3C", "#5F5B50", "#38301B", "#636E76", "#4C5A5C", "#302D26","#3B3735", "#405D68", "#606F6D", "#26383F", "#2F4D58", "#2F4652", "#657678", "#5A5858", "#19323D", "#837C75", "#7086A6", "#6E7C78","#424639", "#4A6B99", "#4B607F", "#4F688A", "#263040", "#283247", "#3D536F", "#222126", "#948F84", "#093F68", "#005A98", "#538096", "#45758A", "#234E64", "#0A4761", "#00132A", "#095A74", "#033A56", "#0C6180"];
console.log(bgcolors);
const generatefunctions = {
	generateTOC: () => {
	let divstr = `
	<div id="toc"><nav>`;
	divstr = divstr + book.sections.filter(section=>{
		let b=true;
		if(section.cssclasses) {
			if(section.cssclasses.includes("notoc")) b=false;
		}
		return b
	}).reduce( (sectionstr,section,s) => {
	if(section.title) {
		//<div class="sectionlink">${section.title}</div>`;
		sectionstr = sectionstr + `
		<div class="sectionlink"><a id="link_${section.id}" href="#${section.id}">${section.title}</a></div>`;
	}
		
	if(section.poems) {
		sectionstr = sectionstr + `
		<ul id="list_${section.id}">`
		sectionstr = sectionstr + section.poems.reduce( (poemstr,poemid,p) => {
			console.log(`poemid=${poemid}`);
			let poem = poems.filter(poem=>poem.id===poemid)[0];
			if(poem.hasOwnProperty("cssclasses") && !poem["cssclasses"].includes("notoc") ) {
				poemstr = poemstr + `<li><a id="link_${poem.id}" href="#${poem.id}">${poem.title}</a></li>`;
			}
			return poemstr;
		}, "");
		sectionstr = sectionstr + `
		</ul>`
	}
	
	return sectionstr;
}, "");

	divstr = divstr + `
	</nav></div>`;
	return divstr;
}
}
let head = `
<head>
	<title>${book.title}</title>
	<meta charset="utf-8"/>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0"/>
	<meta name="description" content="${book.description}"/>
	<meta name="author" content="${book.author}">
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
	<link rel="manifest" href="/manifest.json">
	<script type="application/ld+json">
		{
			"@context": "http://schema.org",
			"@type": "WebPage",
			"name": "${book.title}",
			"breadcrumb": "core text",
          	"url": "${book.rooturl}/${book.file}.html",
			"description": "${book.description}",
			"datePublished": "${datetime}",
          	"image": "/apple-touch-icon.png",
			"author": "${book.authorurl}",
			"license": "http://creativecommons.org/licenses/by-nc-sa/3.0/us/deed.en_US"
		}
	</script>

	<!-- Global site tag (gtag.js) - Google Analytics -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=G-0989MECNZV"></script>
	<script>
	  window.dataLayer = window.dataLayer || [];
	  function gtag(){dataLayer.push(arguments);}
	  gtag('js', new Date());
	  gtag('config', 'G-0989MECNZV');
	</script>
	<link rel="stylesheet" media="screen" href="css/bookweb.css"/>
	<link rel="stylesheet" media="print" href="css/ebook.css"/>
	<style>
	@media only screen  {
		body {
			background-color: ${bgcolors[0]};
		}
	}
	</style>
	<script>
	 let bgcolors = ${JSON.stringify(bgcolors)}; 
	</script>
</head>
`;
let html = `<html>${head}<body><main id="top">`;
html = html + `
<header>
	<h1>${book.title}</h1>
	<h2>${book.subtitle}</h2>
	<h3 id="author">${book.author}</h3>
	<h4 id="publisher">${book.publisher}</h4>
</header>
<!--
<nav>
<ul>
	<li><a href="#sectiontoc" id="toclink" class="corelink">Table of Contents</a></li>
	<li><a href="${book.file}ebook.pdf" id="ebooklink" class="corelink">ebook (pdf)</a></li>
	<li><a href="indexebooks.html" id="ebookslink" class="corelink">Other Online Books</a></li>
	<li><a href="${book.authorurl}" id="homelink" class="corelink">${book.author} website</a></li>
</ul>
</nav>-->`;
html = html + book.sections.reduce( (sectionstr,section,s) => {
	//console.log(`section = ${JSON.stringify(section)}`);
//<div class="blank"></div>
	let cssstr = section.cssclasses ? section.cssclasses.join(" ") : "";
	if(section.id!=="sectiontoc") {
	sectionstr = sectionstr + `
<section class="interior num${s} ${cssstr}" id="${section.id}">`;
	}
	else {
	sectionstr = sectionstr + `
<section class="interior num${s} ${cssstr}" id="${section.id}">`;
	}
if(section.title) {
sectionstr = sectionstr + `
<header>
	<h1>${section.title}</h1>
</header>`;
}
if(section.inscription) {
sectionstr = sectionstr + `
	<div class="inscription">
	${section.inscription}
	</div>`
}
if(section.generatorf) {
	sectionstr = sectionstr + generatefunctions[section.generatorf]();
}
else if(section.poems) {
sectionstr = sectionstr + section.poems.reduce( (poemstr,poemid,p) => {
	console.log(`poemid=${poemid}`);
	let poem = poems.filter(poem=>poem.id===poemid)[0];
	let cssstr = poem.cssclasses ? poem.cssclasses.join(" ") : "";
	poemstr = poemstr + `
<article id="${poem.id}" class="${cssstr}">`;
	if(poem.title) {
		poemstr = poemstr + `
<header>
	<h1>${poem.title} <span class="top"><a href="#sectiontoc" title="back to contents" alt="back to table of contents">&uarr;</a></span></h1>
</header>`;
	}
	if(poem.inscription) {
		poemstr = poemstr + `
		<div class="inscription">
		${poem.inscription}
		</div>`
	}
	if(poem.subtitle) {
		poemstr = poemstr + `
		<div class="inscription">
		${poem.subtitle}
		</div>`
	}
	poemstr = poemstr + `${poem.text}
</article>`;
	return poemstr;
}, "");
}
sectionstr = sectionstr+`
</section>`;
//<div class="blank"></div>

return sectionstr;
}, "");
html = html + `
</main>
</body>
</html>`;
let poemids = poems.map(poem => poem.id); 
let filename = `${book.file}web${timestamp}.html`;
fs.writeFileSync(filename, html, (err) => {
  if (err)
    console.log(err);
  else {
    console.log(`${filename} written successfully\n`);
	console.log(`${book.file}ebook${timestamp}.pdf make next`);
  }
});
console.log(`prince ${book.file}web${timestamp}.html -o ${book.file}ebook${timestamp}.pdf`);
