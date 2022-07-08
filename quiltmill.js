const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const millfile = path.basename(__filename);
const tools = require("./tools.js");
const pigmentinfo = require("./pigmentinfo.js");
const prefix = "quiltset";
const datetime = new Date();
const timestampnow = datetime.getTime();
const [nodepath,codepath,nblocks=4,npigmentset=0,timestamp=timestampnow] = process.argv;
const datetimestr = datetime.toDateString();
const datetimeISOstr = datetime.toISOString();
const quiltset = `n${nblocks.toString().padStart(2,"0")}p${npigmentset.toString().padStart(3,"0")}${prefix}${timestampnow}`;
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
}
let n=parseInt(nblocks);
console.log(`n=${n}`);
let p = {
	width: 1080,
	height: 1080,
	min: 1080,
	max: 1080,
	margin: 12,
	dx: (1080-24)/(n*n), dy: (1080-24)/(n*n),
	blockdx: (1080-24)/n, blockdy: (1080-24)/n,
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
		else if((c===0 || c===(p.ncols-1)) && (r===0 || r===(p.nrows-1))) {
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

		let nfile = count.toString().padStart(6, "0");
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

		let dx = p.blockdx;
		let dy = p.blockdy;
		[...Array(p.nblockrows).keys()].forEach( nblockrow => {
		[...Array(p.nblockcols).keys()].forEach( nblockcol => {
			let blockfile = `${quiltfile}b${nblockrow.toString().padStart(2,"0")}rot${nblockcol}`;
			let doc = new PDFDocument(
			{ 
				size: [p.width,p.height],
				info: info,
			});
			doc.pipe(fs.createWriteStream(blockfile+".pdf"));
			doc.rect(0, 0, p.width, p.height).fillColor(pigments.white).fill();
			[...Array(p.nrows).keys()].forEach( r => {
				[...Array(p.ncols).keys()].forEach( c => {
					let color = blocksrotations[nblockrow][nblockcol][r][c]; 
					let x = c*dx + p.margin;
					let y = r*dy + p.margin;  
					doc.rect(x,y,dx,dy).strokeOpacity(0).fillColor(color).fill();
				});
			});
//			let r=p.height-p.margin;
//			doc.lineWidth(24).strokeOpacity(1).strokeColor(pigments.white);
//			doc.moveTo(0,r*dy+p.margin/2).lineTo(p.width,r*dy+p.margin/2).stroke();
//			doc.lineWidth(4).strokeOpacity(1).strokeColor(pigments.black);
//			doc.moveTo(0,r*dy+p.margin/2).lineTo(p.width,r*dy+p.margin/2).stroke();
			doc.end();
			});
			let nblockcol=0
			blockfile = `${quiltfile}b${nblockrow.toString().padStart(2,"0")}`;
			let doc = new PDFDocument(
			{ 
				size: [p.width,p.height],
				info: info,
			});
			doc.pipe(fs.createWriteStream(blockfile+".pdf"));
			doc.rect(0, 0, p.width, p.height).fillColor(pigments.white).fill();
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
			
//			let r=p.height-p.margin;
//			doc.lineWidth(24).strokeOpacity(1).strokeColor(pigments.white);
//			doc.moveTo(0,r*dy+p.margin/2).lineTo(p.width,r*dy+p.margin/2).stroke();
//			doc.lineWidth(4).strokeOpacity(1).strokeColor(pigments.black);
//			doc.moveTo(0,r*dy+p.margin/2).lineTo(p.width,r*dy+p.margin/2).stroke();
			doc.end();
		});

		doc = new PDFDocument(
		{ 
			size: [p.width,p.height],
			info: info,
		});
		doc.pipe(fs.createWriteStream(quiltfile+"all.pdf"));
		doc.rect(0, 0, p.width, p.height).fillColor(pigments.white).fill();

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
fs.writeFileSync(quiltsetinfofile, `module.exports = JSON.stringify(quiltsetinfo)`, (err) => {
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
	ffmpeg -framerate 24 -i q%06d.png -c:v libx264 -r 24 -pix_fmt yuv420p film.mp4
	rm *.png
	cd ..
	echo "file './${quiltset}/film.mp4'" >> quiltfiles.txt 
	`;
	nextsteps = nextsteps + `
	cp ${millfile} ${quiltset}/${millfile}
	`;
	console.log(`gsutil -m cp -r ${quiltset} gs://gridfactory/`);
	console.log(`cd ${quiltset}`);
	console.log(`bash ${nextstepsfile}`);
	fs.writeFileSync(nextstepsfile, nextsteps, (err) => {
	  if (err)
		console.log(err);
	  else {
		console.log("nextstepsfile written successfully\n");
	  }
	});
//});
