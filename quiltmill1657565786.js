const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const millfile = path.basename(__filename);
const tools = require("./tools.js");
const pigmentinfo = require("./pigmentinfo.js");
const prefix = "qset";
const datetime = new Date();
const timestampnow = datetime.getTime();
const [nodepath,codepath,nblocks=4,npigmentset=0,nalgo=001,timestamp=timestampnow] = process.argv;
const datetimestr = datetime.toDateString();
const datetimeISOstr = datetime.toISOString();
const quiltset = `a${nalgo.toString().padStart(3,"0")}n${nblocks.toString().padStart(2,"0")}p${npigmentset.toString().padStart(3,"0")}${prefix}${timestampnow}`;
const quiltsetinfofile = `${quiltset}/quiltsetinfo.js`;
const nextstepsfile = `${quiltset}/nextsteps.sh`;
const pigmentset = pigmentinfo.pigmentsets[npigmentset];
let quiltsetinfo = { 
	id: quiltset, datetime: datetimestr, timestamp: timestampnow,
	pigmentset: pigmentset,
	nblocks: nblocks,
	pigmentsquareinfo: {}
};
/*
form of pigmentset
{
			color1: { color: pigments.darkgray, name: "darkgray", weights: [6,1,2], blockn: [] },
			color2: { color: pigments.white, name: "white", weights: [1,12,1], blockn: [] },
			color3: { color: pigments.gray, name: "gray", weights: [4,2,2], blockn: [] },
			color4: { color: pigments.yellow, name: "yellow", weights: [2,2,4], blockn: [] },
}
*/
console.log(`pigmentset = ${JSON.stringify(pigmentset)}`);
const pigments = pigmentinfo.pigments;

const pigmentsets = {
	p1: tools.reifyWeightedArray([[pigmentset.color1.color,pigmentset.color1.weights[0]],[pigmentset.color2.color,pigmentset.color2.weights[0]],[pigmentset.color3.color,pigmentset.color3.weights[0]],[pigmentset.color4.color,pigmentset.color4.weights[0]]]),
	p2: tools.reifyWeightedArray([[pigmentset.color1.color,pigmentset.color1.weights[1]],[pigmentset.color2.color,pigmentset.color2.weights[1]],[pigmentset.color3.color,pigmentset.color3.weights[1]],[pigmentset.color4.color,pigmentset.color4.weights[1]]]),
	p3: tools.reifyWeightedArray([[pigmentset.color1.color,pigmentset.color1.weights[2]],[pigmentset.color2.color,pigmentset.color2.weights[2]],[pigmentset.color3.color,pigmentset.color3.weights[2]],[pigmentset.color4.color,pigmentset.color4.weights[2]]]),
	p4: tools.reifyWeightedArray([[pigmentset.color1.color,pigmentset.color1.weights[3]],[pigmentset.color2.color,pigmentset.color2.weights[3]],[pigmentset.color3.color,pigmentset.color3.weights[3]],[pigmentset.color4.color,pigmentset.color4.weights[3]]]),
}
let n=parseInt(nblocks);
console.log(`n=${n}`);
let pageinches = 8.5, margininches = 0.6, pdfdpi = 72;
let dim = pageinches*pdfdpi, margin = margininches*pdfdpi;
let diminner = dim-2*margin;
let p = {
	pagewidth: dim,
	pageheight: dim,
	width: dim-2*margin,
	height: dim-2*margin,
	min: dim-2*margin,
	max: dim-2*margin,
	margin: margin,
	dx: (dim-2*margin)/(n*n), dy: (dim-2*margin)/(n*n),
	blockdx: (dim-margin*2)/n, blockdy: (dim-margin*2)/n,
	nblocks: n,
	nblockcols: n,
	nblockrows: n,
	nrows: n, ncols: n
};
let pigmentcount = Object.keys(pigmentset).reduce( (acc,x,j) => {
	color = pigmentset[x].color;
	acc[color] = 0;
	return acc;
}, {});
const blockpigments = [...Array(p.nblocks).keys()].map( r => {
	let row = [...Array(p.ncols).keys()].map( c => {
		let x = "p1";
		if( (c > 0 && c < (p.ncols-1)) && (r > 0 && r < (p.nrows-1)) ) { 
			x = "p2";
		}
		else if(c===0 && r===0) {
			x = "p4";
		}
		else if(c===p.ncols-1 && r===p.nrows-1) {
			x = "p3";
		}
		else if((c===0||c===p.ncols-1) && (r===0||r===p.nrows)) {
			x = "p3";
		}
		let f = () => {
			let color = pigmentsets[x][tools.randominteger(0,pigmentsets[x].length)]; 
			++pigmentcount[color];
			return color;
		}
		return f;
	});
	return row;
});

let nextsteps = "";

let fps=24; // frames per second for ffmpeg
let nticks = 1; 
if (!fs.existsSync(quiltset)){
	fs.mkdirSync(quiltset);
}
let count = 0;
const nrotations = 4;
[...Array(nticks).keys()].forEach(tick => {
	[...Array(fps).keys()].forEach( (nframe) => {
		let nfile = count.toString().padStart(4, "0");
		let quiltfile = `${quiltset}/q${nfile}`;
		nextsteps = nextsteps + `pdfunite q${nfile}*.pdf book${nfile}.pdf
		`;
		pigmentcount = Object.keys(pigmentset).reduce( (acc,x,j) => {
			color = pigmentset[x].color;
			acc[color] = 0;
			return acc;
		}, {});

		let info = {id:millfile, timestamp: datetimestr,directory:quiltset,npages:nticks,Author:"mctavish",Subject:"generative grid series",Keywords: "net.art, webs, quilts, networks, generative, algorithmic" };
		++count;

		let blocks = [...Array(p.nblocks).keys()].map( b => {
			return block = [...Array(p.nrows).keys()].map( r => [...Array(p.ncols).keys()].map( c => blockpigments[r][c]() ) );
		});
		console.log(`pigmentcount* = ${JSON.stringify(pigmentcount)}`);
		quiltsetinfo.pigmentsquareinfo[nfile] = pigmentcount;
		//console.log(`blocks = ${JSON.stringify(blocks)}`);
		let blocksrotations = blocks.map( b => {
			let rot1 = b.map( (row,r) => {
				return row.map( (col,c) => {
					return b[c][(p.nrows-r-1)];
				});
			});
			let rot2 = b.map( (row,r) => {
				return row.map( (col,c) => {
					return b[(p.nrows-r-1)][(p.ncols-c-1)];
				});
			});
			let rot3 = b.map( (row,r) => {
				return row.map( (col,c) => {
					return b[(p.ncols-c-1)][r];
				});
			});
			return [b,rot3,rot2,rot1,b];
		});
		// draw block rotation files
		let dx = p.blockdx;
		let dy = p.blockdy;
		[...Array(p.nblockrows).keys()].forEach( nblockrow => {
		[...Array(p.nblockcols).keys()].forEach( nblockcol => {
			let blockfile = `${quiltfile}b${nblockrow.toString().padStart(2,"0")}rot${nblockcol}`;
			let doc = new PDFDocument(
			{ 
				size: [p.pagewidth, p.pageheight],
				margin: p.margin,
				info: info,
			});
			doc.pipe(fs.createWriteStream(blockfile+".pdf"));
			//doc.rect(0, 0, p.width, p.height).fillColor(pigments.white).fill();
			[...Array(p.nrows).keys()].forEach( r => {
				[...Array(p.ncols).keys()].forEach( c => {
					let color = blocksrotations[nblockrow][nblockcol][r][c]; 
					let x = c*dx + p.margin;
					let y = r*dy + p.margin;  
					doc.rect(x,y,dx,dy).strokeOpacity(0).fillColor(color).fill();
				});
			});
			doc.end();
			});
			// draw block file 
			blockfile_ = `${quiltfile}b${nblockrow.toString().padStart(2,"0")}_`;
			let doc = new PDFDocument(
			{ 
				size: [p.pagewidth, p.pageheight],
				margins: margin,
				info: info,
			});
			console.log(`blockfile=${blockfile_}`);
			doc.pipe(fs.createWriteStream(blockfile_+".pdf"));
			//doc.rect(0, 0, p.width, p.height).fillColor(pigments.white).fill();
			doc.fillColor(pigments.darkgray).font("Courier-Bold");
			doc.fontSize(38);
			let txt = `quilt ${nfile} block ${nblockrow}`;
			console.log(`txt=${txt}`);
			doc.text(txt);
			doc.moveDown();
			doc.moveDown();
			doc.fillColor(pigments.black).fontSize(18);
			doc.text(`block grid followed by rotations`);
			doc.end();
			let nblockcol=0
			blockfile = `${quiltfile}b${nblockrow.toString().padStart(2,"0")}raw`;
			doc = new PDFDocument(
			{ 
				size: [p.pagewidth, p.pageheight],
				margins: margin,
				info: info,
			});
			doc.pipe(fs.createWriteStream(blockfile+".pdf"));
			//doc.rect(0, 0, p.width, p.height).fillColor(pigments.white).fill();
			[...Array(p.nrows).keys()].forEach( r => {
				[...Array(p.ncols).keys()].forEach( c => {
					let color = blocksrotations[nblockrow][nblockcol][r][c]; 
					let x = c*dx + p.margin;
					let y = r*dy + p.margin;  
					doc.rect(x,y,dx,dy).strokeOpacity(0).fillColor(color).fill();
				});
			});
			[...Array(p.ncols).keys()].filter( c => c>0 ).forEach( c => {
				doc.lineWidth(14).strokeOpacity(1).strokeColor(pigments.white);
				doc.moveTo(c*dx+p.margin/2,0).lineTo(c*dx+p.margin/2,p.height).stroke();
				doc.lineWidth(4).strokeOpacity(1).strokeColor(pigments.gray);
				doc.moveTo(c*dx+p.margin/2,0).lineTo(c*dx+p.margin/2,p.height).stroke();
			});
			[...Array(p.nrows).keys()].filter((r,j,arr) => r>0 ).forEach( r => {
				doc.lineWidth(24).strokeOpacity(1).strokeColor(pigments.white);
				doc.moveTo(0,r*dy+p.margin/2).lineTo(p.width,r*dy+p.margin/2).stroke();
				doc.lineWidth(4).strokeOpacity(1).strokeColor(pigments.black);
				doc.moveTo(0,r*dy+p.margin/2).lineTo(p.width,r*dy+p.margin/2).stroke();
			});
			doc.end();
		});
		// draw whole quilt info doc
		// quiltsetinfo.pigmentsquareinfo[nfile]
		doc = new PDFDocument(
		{ 
			size: [p.pagewidth, p.pageheight],
			margins: margin,
			info: info,
		});
		doc.pipe(fs.createWriteStream(quiltfile+"_.pdf"));
			doc.fillColor(pigments.darkgray).font("Courier-Bold");
			doc.fontSize(38);
			doc.text(`quilt #${nfile}`);
			doc.fillColor(pigments.black).fontSize(18);
			doc.text(`color information`);
		 	Object.keys(quiltsetinfo.pigmentsquareinfo[nfile]).forEach( k => {
				let nsquares = 4*4*quiltsetinfo.pigmentsquareinfo[nfile][k];
				let yd3in = Math.ceil(nsquares/Math.floor(39/3.5)/36);
				let yd4in = Math.ceil(nsquares/Math.floor(39/4.5)/36);
				let yd5in = Math.ceil(nsquares/Math.floor(39/5.5)/36);
				let pigmentdef = pigmentinfo.pigmentdefs.filter(x=>x[2]===k)[0]; 
				doc.moveDown();
				doc.fillColor(pigments.black).fontSize(12);
				doc.moveDown();
				doc.text(`moda color: ${pigmentdef[2]} `);
				doc.fillColor(pigments.drakgray).fontSize(12);
				doc.moveDown();
				doc.text(`moda sku: ${pigmentdef[0]} `);
				doc.moveDown();
				doc.text(`total number of squares: ${nsquares} `);
				doc.moveDown();
				doc.text(`total yardage (3" squares): ${yd3in} `);
				doc.moveDown();
				doc.text(`total yardage (4" squares): ${yd4in} `);
				doc.moveDown();
				doc.text(`total yardage (5" squares): ${yd5in} `);
				doc.moveDown();
			});
		doc.end();
		// draw whole quilt doc
		// quiltsetinfo.pigmentsquareinfo[nfile]
		doc = new PDFDocument(
		{ 
			size: [p.pagewidth, p.pageheight],
			margins: margin,
			info: info,
		});
		doc.pipe(fs.createWriteStream(quiltfile+"all.pdf"));
		//doc.rect(0, 0, p.width, p.height).fillColor(pigments.white).fill();

		dx = p.dx;
		dy = p.dy;
		[...Array(p.nblockrows).keys()].forEach( nblockrow => {
			[...Array(p.nblockcols).keys()].forEach( nblockcol => {
				[...Array(p.nrows).keys()].forEach( r => {
					[...Array(p.ncols).keys()].forEach( c => {
						let color = blocksrotations[nblockrow][nblockcol][r][c]; 
						let x = c*dx + nblockcol*p.ncols*dx + p.margin;
						let y = r*dy + nblockrow*p.nrows*dy + p.margin;  
						doc.rect(x,y,dx,dy).strokeOpacity(0).fillColor(color).fill();
					});
				});
			});
		});
		doc.end();
	});
});
console.log(`quiltsetinfo=${JSON.stringify(quiltsetinfo)}`);
fs.writeFileSync(quiltsetinfofile, `module.exports = ${JSON.stringify(quiltsetinfo, null, '\t')}`, (err) => {
  if (err)
	console.log(err);
  else {
	console.log("quiltsetinfo file written successfully\n");
}
});
	nextsteps = nextsteps + `
cd ${quiltset}
for file in q*.pdf; do magick convert $file -resize 1920 $file.png; done;
for file in *pdf.png; do mv "$file" "$\{file/.pdf.png/.png\}"; done;
pdfunite q([0-9])*all.pdf book.pdf
ffmpeg -framerate 24 -pattern_type glob -i 'q*all.png'  -c:v libx264 -r 24 -pix_fmt yuv420p film.mp4
ffmpeg -framerate 24 -pattern_type glob -i 'q*b*.png'  -c:v libx264 -r 24 -pix_fmt yuv420p filmblocks.mp4
cd ..
echo "file './${quiltset}/film.mp4'" >> quiltfiles.txt 
`;
	nextsteps = nextsteps + `
cp ${millfile} ${quiltset}/${millfile}
`;
	console.log(`gsutil -m cp -r ${quiltset} gs://gridfactory/`);
	console.log(`cd ${quiltset}`);
	console.log(`bash ${nextstepsfile}`);
	console.log(`open ${quiltset}/q0008all.pdf`);
	console.log(`open ${quiltset}/q0008b02.pdf`);
	fs.writeFileSync(nextstepsfile, nextsteps, (err) => {
	  if (err)
		console.log(err);
	  else {
		console.log("nextstepsfile written successfully\n");
	  }
	});
//});
