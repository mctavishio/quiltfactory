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
	black: "#191918",
	white: "#fcfbe3",
	blue: "#006699",
	red: "#9a0000",
	yellow: "#ffcc00",
	gray: "#898988",
	darkgray: "#4b4b44"
};
const pigmentset = {
	color1: pigments.black,
	color2: pigments.white,
	color3: pigments.gray,
	color4: pigments.blue,
}
const pigmentsets = {
	p1: tools.reifyWeightedArray([[pigmentset.color1,6],[pigmentset.color2,2],[pigmentset.color3,2],[pigmentset.color4,1]]),
	p2: tools.reifyWeightedArray([[pigmentset.color1,0],[pigmentset.color2,12],[pigmentset.color3,1],[pigmentset.color4,1]]),
	p3: tools.reifyWeightedArray([[pigmentset.color1,2],[pigmentset.color2,2],[pigmentset.color3,2],[pigmentset.color4,4]]),
}
const blockpigments = [0,1,2,3].map( r => {
	let row = [0,1,2,3].map( c => {
		let f = () => pigmentsets.p1[tools.randominteger(0,pigmentsets.p1.length)]; 
		if( (c===1 || c===2) && (r===1 || r===2) ) { 
			f =  () => pigmentsets.p2[tools.randominteger(0,pigmentsets.p2.length)];  
		}
		else if((c===0 || c===3) && (r===0 || r===3)) {
			f =  () => pigmentsets.p3[tools.randominteger(0,pigmentsets.p3.length)];  
		}
		return f;
	});
	return row;
});
console.log(`blockpigments[0][0] = ${blockpigments[0][0].toString()}`);
console.log(`blockpigments[1][1] = ${blockpigments[1][1].toString()}`);
let nextsteps = "";
let nextstepsfile = `nextsteps${millfile}.sh`;


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
	dx: 54, dy: 54,
	blockdx: 1080/4, blockdy: 1080/4,
	nblocks: 5,
	nblockcols: 5,
	nblockrows: 5,
	nrows: 4, ncols: 4
};
let count = 0;
const nrotations = 4;
[...Array(nticks).keys()].forEach(tick => {
	[...Array(fps).keys()].forEach( (nframe) => {
		file = count.toString().padStart(6, "0") + ".pdf";
		let info = {id:millfile,timestamp: datetimestr,directory:filmdir,npages:nticks,Author:"mctavish",Subject:"generative grid series",Keywords: "net.art, webs, quilts, networks, generative, algorithmic" };
		++count;

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
			return [b,rot1,rot2,rot3,b];
		});

		let dx = p.blockdx;
		let dy = p.blockdy;
		[...Array(p.nblockrows).keys()].forEach( nblockrow => {
			let blockfile = `${filmdir}/block${file}_${nblockrow}`;
			let doc = new PDFDocument(
			{ 
				size: [p.width,p.height],
				info: info,
			});
			doc.pipe(fs.createWriteStream(blockfile));
			doc.rect(0, 0, p.width, p.height).fillColor(pigments.white).fill();
				[0,1,2,3].forEach( r => {
				[0,1,2,3].forEach( c => {
					let color = blocksrotations[nblockrow][0][r][c]; 
					let x = r*dx + c*dx;
					let y = c*dy + r*dy;  
					doc.rect(x,y,dx,dy).strokeOpacity(0).fillColor(color).fill();
				});
			});
			doc.end();
		});

		let filmfile = `${filmdir}/frame${file}`;
		doc = new PDFDocument(
		{ 
			size: [p.width,p.height],
			info: info,
		});
		doc.pipe(fs.createWriteStream(filmfile));
		doc.rect(0, 0, p.width, p.height).fillColor(pigments.white).fill();

		dx = p.dx;
		dy = p.dy;
		[...Array(p.nblockrows).keys()].forEach( nblockrow => {
		[...Array(p.nblockcols).keys()].forEach( nblockcol => {
			[0,1,2,3].forEach( r => {
				[0,1,2,3].forEach( c => {
					let color = blocksrotations[nblockrow][nblockcol][r][c]; 
					let x = r*dx + nblockcol*p.ncols*dx;
					let y = c*dy + nblockrow*p.ncols*dy;  
					doc.rect(x,y,dx,dy).strokeOpacity(0).fillColor(color).fill();
				});
			});
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
