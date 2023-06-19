const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const millfile = path.basename(__filename);
const tools = require("./tools.js");
const pigmentinfo = require("./pigmentinfo.js");
const pigments = pigmentinfo.pigments;
const pigmentdefs = pigmentinfo.pigmentdefs;
const pigmentypes = pigmentinfo.pigmentypes;
const prefix = "qset";
const datetime = new Date();
const timestampnow = datetime.getTime();
const [nodepath,codepath,nalgo=001,timestamp=timestampnow] = process.argv;
const datetimestr = datetime.toDateString();
const datetimeISOstr = datetime.toISOString();
const pageinches = 8, margininches = 0.0, pdfdpi = 72;
const dim = pageinches*pdfdpi, margin = margininches*pdfdpi;
const diminner = dim-2*margin;
let quiltrunfile = `quiltrun${timestamp}.js`;
let quiltrun = { 
	id: `quiltrun${timestamp}`, datetime: datetimestr, timestamp: timestampnow,
	pigments: pigments,
	pigmentsets: pigmentinfo.pigmentsets,
	pigmentdefs: pigmentdefs,
	pigmenttypes: pigmentypes,
	dim, margin,pageinches,margininches,
	quiltsets: [] 
}

let nextstepsallfile = `nextsteps${timestamp}.sh`;
let nextstepsall = "";

[4].forEach( nblocks => {
pigmentinfo.pigmentsets.forEach( (pigmentset,npigmentset) => {

let quiltset = `a${nalgo.toString().padStart(3,"0")}n${nblocks.toString().padStart(2,"0")}p${npigmentset.toString().padStart(3,"0")}${prefix}${timestampnow}`;
nextstepsall = nextstepsall + `cd ${quiltset}
echo start ${quiltset}
bash nextsteps.sh
echo finished ${quiltset}
cd ..
pwd
`;

let quiltsetinfofile = `${quiltset}/quiltsetinfo.js`;
let nextstepsfile = `${quiltset}/nextsteps.sh`;
if (!fs.existsSync(quiltset)){
	fs.mkdirSync(quiltset);
}

//console.log(`pigmentset = ${JSON.stringify(pigmentset)}`);

let pigmentsets = {
	p1: tools.reifyWeightedArray([[pigmentset.color1.color,pigmentset.color1.weights[0]],[pigmentset.color2.color,pigmentset.color2.weights[0]],[pigmentset.color3.color,pigmentset.color3.weights[0]],[pigmentset.color4.color,pigmentset.color4.weights[0]]]),
	p2: tools.reifyWeightedArray([[pigmentset.color1.color,pigmentset.color1.weights[1]],[pigmentset.color2.color,pigmentset.color2.weights[1]],[pigmentset.color3.color,pigmentset.color3.weights[1]],[pigmentset.color4.color,pigmentset.color4.weights[1]]]),
	p3: tools.reifyWeightedArray([[pigmentset.color1.color,pigmentset.color1.weights[2]],[pigmentset.color2.color,pigmentset.color2.weights[2]],[pigmentset.color3.color,pigmentset.color3.weights[2]],[pigmentset.color4.color,pigmentset.color4.weights[2]]]),
	p4: tools.reifyWeightedArray([[pigmentset.color1.color,pigmentset.color1.weights[3]],[pigmentset.color2.color,pigmentset.color2.weights[3]],[pigmentset.color3.color,pigmentset.color3.weights[3]],[pigmentset.color4.color,pigmentset.color4.weights[3]]]),
}
let n=parseInt(nblocks);
console.log(`n=${n}`);
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

let quiltsetinfo = { 
	id: quiltset, datetime: datetimestr, timestamp: timestampnow,
	pigments: pigments,
	pigmentset: pigmentset,
	pigmentdefs: pigmentdefs,
	pigmenttypes: pigmentypes,
	nblocks: nblocks,
	p: p,
	quilts:[] 
};
let pigmentcount = Object.keys(pigmentset).reduce( (acc,x,j) => {
	color = pigmentset[x].color;
	acc[color] = 0;
	return acc;
}, {});
let blockpigments = [...Array(p.nblocks).keys()].map( r => {
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

let nextsteps = "pdfunite q*.pdf bookwhole.pdf";

let ntrials = 8; 
let count = 0;

const nrotations = 4;
[...Array(ntrials).keys()].forEach( (ntrial) => {
	let nfile = count.toString().padStart(4, "0");
	let quiltfile = `${quiltset}/q${nfile}`;
	nextsteps = nextsteps + `
pdfunite q${nfile}*.pdf book${nfile}.pdf
	`;
	pigmentcount = Object.keys(pigmentset).reduce( (acc,x,j) => {
		color = pigmentset[x].color;
		acc[color] = 0;
		return acc;
	}, {});

	let info = {id:millfile, timestamp: datetimestr,directory:quiltset,Author:"mctavish",Subject:"generative grid series",Keywords: "net.art, webs, quilts, networks, generative, algorithmic" };
	++count;

	let blocks = [...Array(p.nblocks).keys()].map( b => {
		return block = [...Array(p.nrows).keys()].map( r => [...Array(p.ncols).keys()].map( c => blockpigments[r][c]() ) );
	});
	console.log(`pigmentcount* = ${JSON.stringify(pigmentcount)}`);
	//quiltsetinfo.pigmentsquareinfo[nfile] = pigmentcount;
	quiltsetinfo.quilts.push({
		nfile, pigmentcount, id:`${quiltset}q${nfile}`, qid:`q${nfile}`,
	});
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
		[...Array(p.ncols+1).keys()].filter( c => c>=0 ).forEach( c => {
			doc.lineWidth(14).strokeOpacity(1).strokeColor(pigments.white);
			doc.moveTo(c*dx+p.margin/2,0).lineTo(c*dx+p.margin/2,p.height).stroke();
			doc.lineWidth(4).strokeOpacity(1).strokeColor(pigments.gray);
			doc.moveTo(c*dx+p.margin/2,0).lineTo(c*dx+p.margin/2,p.height).stroke();
		});
		[...Array(p.nrows+1).keys()].filter((r,j,arr) => r>=0 ).forEach( r => {
			doc.lineWidth(24).strokeOpacity(1).strokeColor(pigments.white);
			doc.moveTo(0,r*dy+p.margin/2).lineTo(p.width,r*dy+p.margin/2).stroke();
			doc.lineWidth(4).strokeOpacity(1).strokeColor(pigments.black);
			doc.moveTo(0,r*dy+p.margin/2).lineTo(p.width,r*dy+p.margin/2).stroke();
		});
		doc.end();
	});
	// draw whole quilt doc
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

	// draw whole quilt doc with gridlines
	doc = new PDFDocument(
	{ 
		size: [p.pagewidth, p.pageheight],
		margins: margin,
		info: info,
	});
	doc.pipe(fs.createWriteStream(quiltfile+"allraw.pdf"));
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
	[...Array(p.nblockcols+1).keys()].filter( c => c>=0 ).forEach( c => {
		doc.lineWidth(14).strokeOpacity(1).strokeColor(pigments.white);
		doc.moveTo(c*p.blockdx+p.margin/2,0).lineTo(c*p.blockdx+p.margin/2,p.height).stroke();
		doc.lineWidth(4).strokeOpacity(1).strokeColor(pigments.gray);
		doc.moveTo(c*p.blockdx+p.margin/2,0).lineTo(c*p.blockdx+p.margin/2,p.height).stroke();
	});
	[...Array(p.nblockrows+1).keys()].filter((r,j,arr) => r>=0 ).forEach( r => {
		doc.lineWidth(24).strokeOpacity(1).strokeColor(pigments.white);
		doc.moveTo(0,r*p.blockdy+p.margin/2).lineTo(p.width,r*p.blockdy+p.margin/2).stroke();
		doc.lineWidth(4).strokeOpacity(1).strokeColor(pigments.black);
		doc.moveTo(0,r*p.blockdy+p.margin/2).lineTo(p.width,r*p.blockdy+p.margin/2).stroke();
	});
	doc.end();
});
//console.log(`quiltsetinfo=${JSON.stringify(quiltsetinfo)}`);
fs.writeFileSync(quiltsetinfofile, `module.exports = ${JSON.stringify(quiltsetinfo, null, '\t')}`, (err) => {
  if (err)
	console.log(err);
  else {
	console.log("quiltsetinfo file written successfully\n");
	}
});	
quiltrun.quiltsets.push({ quilts:quiltsetinfo.quilts,quiltset, nblocks, npigmentset, pigmentset});

nextsteps = nextsteps + `
for file in q*.pdf; do magick convert $file -resize 1920 $file.png; done;
for file in *pdf.png; do mv "$file" "$\{file/.pdf.png/.png\}"; done;
pdfunite q*all.pdf book.pdf
ffmpeg -framerate 24 -pattern_type glob -i 'q*all.png'  -c:v libx264 -r 24 -pix_fmt yuv420p film.mp4
ffmpeg -framerate 24 -pattern_type glob -i 'q*b*.png'  -c:v libx264 -r 24 -pix_fmt yuv420p filmblocks.mp4
ffmpeg -framerate 24 -pattern_type glob -i 'q*.png'  -c:v libx264 -r 24 -pix_fmt yuv420p filmall.mp4
cd ..
echo "file './${quiltset}/film.mp4'" >> quiltfiles.txt 
`;
nextsteps = nextsteps + `
cp ${millfile} ${quiltset}/${millfile}
`;
console.log(`gsutil -m cp -r ${quiltset} gs://gridfactory/`);
console.log(`cd ${quiltset}`);
console.log(`bash ${nextstepsfile}`);
console.log(`open ${quiltset}/q0004all.pdf`);
console.log(`open ${quiltset}/q0004b02raw.pdf`);
fs.writeFileSync(nextstepsfile, nextsteps, (err) => {
  if (err)
	console.log(err);
  else {
	console.log("nextstepsfile written successfully\n");
  }
});	
});
});
fs.writeFileSync(quiltrunfile, JSON.stringify(quiltrun, null, '\t'), (err) => {
  if (err)
	console.log(err);
  else {
	console.log("quiltrunfile written successfully\n");
  }
});
fs.writeFileSync(nextstepsallfile, nextstepsall, (err) => {
  if (err)
	console.log(err);
  else {
	console.log("nextstepsallfile written successfully\n");
  }
});
