const fs = require("fs"); 
let dt = new Date();
let timestamp = dt.getTime();
let datetime = dt.toDateString();
let head = `
<head>
	<title>coupons</title>
	<meta charset="utf-8"/>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0"/>
	<meta name="description" content="mctavish quilting studio"/>
	<meta name="author" content="mctavish">
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
	<link rel="manifest" href="/manifest.json">
	<script type="application/ld+json">
		{
			"@context": "http://schema.org",
			"@type": "WebPage",
			"name": "mctavish quilting studio coupons",
			"breadcrumb": "core text",
          	"url": "coupons.html",
			"description": "coupons from mctavish quilting studio",
			"datePublished": "${datetime}",
          	"image": "/apple-touch-icon.png",
			"author": "mctavish",
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
	<link rel="stylesheet" media="print" href="css/couponprint.css"/>
	<style>
	@media only screen  {
		body {
			background-color: #ffffff;
		}
	}
	</style
</head>
`;
let html = `<html>${head}<body><main id="top">`;
html = html + `
<header>
	<h1>coupons</h1>
	<h2>mctavish quilting studio & fabrics</h2>
</header>`
html = html + [0,1,2,3].reduce( (str, j) => {
	let couponstr = `
<article>
<figure class="flexbox">
<svg width="4in" height="4in" viewBox="0 0 300 200">
<rect style="fill:yellow; stroke:blue; stroke-width:20"
            width="200" height="100"/>
<rect style="fill:yellow; stroke:blue; stroke-width:20"
            width="200" height="100"/>
</svg>
<div >test ${j}</div>
</figure>
</article>`
	return str + couponstr; 
}, "");
html = html + `
</main>
</body>
</html>`;
let filename = `couponprint.html`;
fs.writeFileSync(filename, html, (err) => {
  if (err)
    console.log(err);
  else {
    console.log(`${filename} written successfully\n`);
  }
});
console.log(`prince ${filename} -o couponprint.pdf`);
console.log(`open couponprint.pdf`);
