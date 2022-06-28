const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const millfile = path.basename(__filename);
const tools = require("./tools.js");
const prefix = "grid";
const datetime = new Date();
const timestampnow = datetime.getTime();
const datetimestr = datetime.toDateString();
const datetimeISOstr = datetime.toISOString();
const filmdir = prefix+timestampnow;
const pigments= {
//	black: "#191918",
	white: "#fcfbe3",
	blue: "#006699",
	red: "#9a0000",
	yellow: "#ffcc00",
	gray: "#898988",
//	darkgray: "#4b4b44"
	black: "#4b4b44"
};
const pigmentsets = {
	bwxxxx_041200000000: tools.reifyWeightedArray([ [pigments.black,4, "black"], [pigments.white,12,"white"], [pigments.gray, 0,"gray"], [pigments.red, 0,"red"], [pigments.yellow, 0,"yellow"], [pigments.blue, 0,"blue"]]),
	bwxxxx_120400000000: tools.reifyWeightedArray([ [pigments.black,12, "black"], [pigments.white,4,"white"], [pigments.gray, 0,"gray"], [pigments.red, 0,"red"], [pigments.yellow, 0,"yellow"], [pigments.blue, 0,"blue"]]),
	bwxrxx_021200010000: tools.reifyWeightedArray([ [pigments.black,2, "black"], [pigments.white,12,"white"], [pigments.gray, 0,"gray"], [pigments.red, 1,"red"], [pigments.yellow, 0,"yellow"], [pigments.blue, 0,"blue"]]),
	bwxrxx_120200010000: tools.reifyWeightedArray([ [pigments.black,12, "black"], [pigments.white,2,"white"], [pigments.gray, 0,"gray"], [pigments.red, 1,"red"], [pigments.yellow, 0,"yellow"], [pigments.blue, 0,"blue"]]),
	bwxryx_120200010100: tools.reifyWeightedArray([ [pigments.black,12, "black"], [pigments.white,2,"white"], [pigments.gray, 0,"gray"], [pigments.red, 1,"red"], [pigments.yellow, 1,"yellow"], [pigments.blue, 0,"blue"]]),
};
console.log(`pigmentsets = ${JSON.stringify(pigmentsets)}`);
const blockpigments = [0,1,2,3].map( r => {
	let row = [0,1,2,3].map( c => {
		let f = () => pigmentsets.bwxrxx_120200010000[tools.randominteger(0,pigmentsets.bwxrxx_120200010000.length)]; 
		if( (c===1 || c===2) && (r===1 || r===2) ) { 
			f =  () => pigmentsets.bwxrxx_021200010000[tools.randominteger(0,pigmentsets.bwxrxx_021200010000.length)];  
		}
		else if((c===0 || c===3) && (r===0 || r===3)) {
			f =  () => pigmentsets.bwxryx_120200010100[tools.randominteger(0,pigmentsets.bwxryx_120200010100.length)];  
		}
		return f;
	});
	return row;
});
console.log(`blockpigments[0][0] = ${blockpigments[0][0].toString()}`);
console.log(`blockpigments[1][1] = ${blockpigments[1][1].toString()}`);
let nextsteps = "";
let nextstepsfile = `nextsteps${millfile}.sh`;

let blocks = [0,1,2,3,4].map( b => {
	return block = [0,1,2,3].map( r => [0,1,2,3].map( c => blockpigments[r][c]() ) );
});
let blocksrotations = blocks.map( b => {
	let rot1 = b.map( (row,r) => {
		return row.map( (col,c) => {
			return b[c][(4-r-1)];
		});
	});
	let rot2 = b.map( (row,r) => {
		return row.map( (col,c) => {
			return b[(4-r-1)][(4-c-1)];
		});
	});
	let rot3 = b.map( (row,r) => {
		return row.map( (col,c) => {
			return b[(4-c-1)][r];
		});
	});
	return [b,rot1,rot2,rot3];
});

let fps=24; // frames per second for ffmpeg
let nticks = 10; 
if (!fs.existsSync(filmdir)){
	fs.mkdirSync(filmdir);
}
let p = {
	width: 1080,
	height: 1080,
	min: 1080,
	max: 1080,
};
let count = 0;
[...Array(5).keys()].forEach(tick => {
	[...Array(4).keys()].forEach( (nframe) => {
		file = count.toString().padStart(6, "0") + ".pdf";
		let info = {id:millfile,timestamp: datetimestr,directory:filmdir,npages:nticks,Author:"mctavish",Subject:"generative grid series",Keywords: "net.art, webs, quilts, networks, generative, algorithmic" };
		++count;
		let filmfile = `${filmdir}/frame${file}`;
		let doc = new PDFDocument(
		{ 
			size: [p.width,p.height],
			info: info,
		});
		doc.pipe(fs.createWriteStream(filmfile));
		doc.rect(0, 0, p.width, p.height).fillColor(pigments.white).fill();
		let dx = p.width/4;
		let dy = p.height/4;
//		console.log(`dx=${dx}`);
//		console.log(`dy=${dx}`);
		[0,1,2,3].forEach( r => {
			[0,1,2,3].forEach( c => {
				let color = blocksrotations[tick][nframe][r][c]; 
				// console.log(`r=${r}, c=${c}`);
				// console.log(`color=${color}`);
				let x = r*dx;
				let y = c*dy;
				doc.rect(x,y,dx,dy).strokeOpacity(0).fillColor(color).fill();
			});
		});
	doc.end();
	});
});
	nextsteps = nextsteps + `
	cd ${filmdir}
	for file in *.pdf; do magick convert $file -resize 1920 $file.png; done;
	for file in *pdf.png; do mv "$file" "$\{file/.pdf.png/.png\}"; done;
	pdfunite film*.pdf book.pdf
	ffmpeg -framerate 24 -i film%06d.png -c:v libx264 -r 24 -pix_fmt yuv420p film.mp4
	rm *.png
	cd ..
	echo "file './${filmdir}/film.mp4'" >> filmfiles.txt 
	`;
	nextsteps = nextsteps + `
	cp ${nextstepsfile} ${filmdir}/nextsteps.sh
	cp ${millfile} ${filmdir}/${millfile}
	`;
	//console.log(`gsutil -m cp -r ${scoredir} gs://filmfactory/`);
	//console.log(`cd ${scoredir}`);
	//console.log(`bash ${nextstepsfile}`);
//	fs.writeFileSync(nextstepsfile, nextsteps, (err) => {
//	  if (err)
//		console.log(err);
//	  else {
//		console.log("File written successfully\n");
//	  }
//	});
//});
