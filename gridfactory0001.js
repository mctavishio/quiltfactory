const fs = require("fs");
const alg = "0001";
const prefix = "mct" + alg;
let dt = new Date();
let timestamp = dt.getTime();
let datetime = dt.toDateString();
const nquilts = 16, nrows = 4, ncols = 4;
const pigments = {
	color1: { name: "black", hex: "#120813", cloth: "Moda Black. SKU: 9900-99"},
	color2: { name: "darkgray", hex: "#3D3E40", cloth: "Moda Charcoal. SKU: 9900-284"},
	color3: { name: "white", hex: "#FCFAE1", cloth: "Moda Ivory. SKU: 9900-60"},
	color4: { name: "gray", hex: "#787570", cloth: "Moda Etching Slate. SKU: 9900-170"},
};

let book = {
	title: "grid factory 4x4x4 : series 0001",
	subtitle: "quilt patterns`",
	description: "",
	rooturl: "https://quiltfactory.netlify.app",
	file: "gridfactory",
	bgcolors: ["#556D7F"],
	authorurl: "https://mctavish.io/index.html",
	author: "Kathy McTavish",
	publisher: "mctavish quilting studio",
}

let head = `<head>
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
	<link rel="stylesheet" media="print" href="css/bookprint.css"/>
	<style>
	@media only screen  {
		body {
			background-color: #9a0000;
		}
	}
	</style
	<script src=""></script>
</head>`;

let html = `<html>${head}<body><main id="top">`;

html = html + `
<header>
	<h1>${book.title}</h1>
	<h2>${book.subtitle}</h2>
	<h3 id="author">${book.author}</h3>
	<h4 id="publisher">${book.publisher}</h4>
</header>`
html = html + `<article id="frontmatter" class="moreroom lowertopmargin">
<p>
copyright ©2022 kathy mctavish<br/>
all rights reserved<br/>
</p><p>
</p><p class="address">
<br/>
mctavish quilting studio & fabrics <br/>
p.o. box 3280<br/>
1831 east 8th street, suite g101i<br/>
duluth mn 55812
www.mctavisquilting.com<br/>
</p><p class="noweb">
pattern design & code work by kathy mctavish (www.mctavish.io)<br/>
</p><p>
other work by kathy mctavish: see www.mctavish.io 
</p>
</article>`
html = html + Array.from(Array(nquilts).keys()).reduce( (quiltstr, q) => {
quiltstr = quiltstr + `<article>
	<header>
		<h1>quilt #${q.toString().padStart(2, "0")}</h1>
		<h2>from::: ${prefix}${timestamp}</h2>
		<h3>generated::: ${datetime}</h3>
	</header>
	<figure>
	<svg version="1.1" viewBox="0 0 500 500" preserveAspectRatio="xMinYMin meet" class="">
                    <desc>SVG tutorial using straight lines to make a grid</desc>
                    <g stroke="black">
                        <!-- Draw the horizontal lines -->
                        <line x1="1" y1="1" x2="479" y2="1" stroke-width="1.5" />
                        <line x1="1" y1="120" x2="479" y2="120" stroke-width="1.5" />
                        <line x1="1" y1="240" x2="479" y2="240" stroke-width="1.5" />
                        <line x1="1" y1="360" x2="479" y2="360" stroke-width="1.5" />
                        <line x1="1" y1="479" x2="479" y2="479" stroke-width="1.5" />
                        <!-- Draw the vertical lines -->
                        <line x1="1" y1="1" x2="1" y2="479" stroke-width="1.5" />
                        <line x1="120" y1="1" x2="120" y2="479" stroke-width="1.5" />
                        <line x1="240" y1="1" x2="240" y2="479" stroke-width="1.5" />
                        <line x1="360" y1="1" x2="360" y2="479" stroke-width="1.5" />
                        <line x1="479" y1="1" x2="479" y2="479" stroke-width="1.5" />
                    </g>
                </svg>
	</figure>
</article>`;
	return quiltstr;
}, "");
html = html + `
</main>
</body>
</html>`;
let filename = `${book.file}print.html`;
fs.writeFileSync(filename, html, (err) => {
  if (err)
    console.log(err);
  else {
    console.log(`${filename} written successfully\n`);
  }
});
