const quiltrun = require("./quiltrun.js");
const fs = require("fs");
module.exports = () => { 
let poems = [
{
id: "frontmatter",
title: "",
cssclasses: ["moreroom", "lowertopmargin"],
text: `<p>
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
`
},
{
id: "generalnotes",
title: "general notes",
text: `<p>
<ul>
<li>wof = width of fabric</li>
<li>these instructions assume a usable wof of 40"</li>
<li>all seams are 1/4"</li>
<li>yardage calculations are generous to leave room for some cutting error</li>
<li>yardage estimates are also rounded up to the nearest quarter yard</li>
</ul>
</p>
<p>
This 4x4x4 quilt pattern is composed of:
<ul>
<li>a core set of 4 distinct blocks</li>
<li>each of these core blocks is made up of a 4x4 grid of squares</li>
<li>this pattern provides instructions for 3 sizes of cut squares: 3", 4", and 5"</li>
<li>to construct the final quilt, these 4 distinct blocks are
replicated 4 times</li>
<li>the resulting 16 blocks are used to create the final quilt</li>
<li>each row of the final quilt is made up of quarter-turn rotations of the copies of a given block</li>
</ul>
</p>
<p>To summarize:
<ul>
<li>the final quilt has 4 rows and 4 columns of blocks</li>
<li>each of these blocks is composed of 16 cut squares (in a 4x4 grid)</li>
<li>there are 4 distinct blocks that are replicated 4 times</li>
<li>each row of the final quilt is based on a distinct block and its three, quarter-turn rotations</li>
</ul>
</p>`
},
{
id: "quiltdimensions",
title: "quilt dimensions",
text: `<p>
the following calculations are for building block squares of size 3", 4", and 5":
<ol>
<li>3"x3" squares
<ul>
<li>to include a 1/4" seam allowance: cut squares to 3.5"x3.5"</li>
<li>finished quilt size: 48"x48"</li>
<li># squares per wof=40" strip: 11</li>
<li>finished quilt perimeter: 192"</li>
<li>for the binding: cut five 2.5" strips</li>
<li>this translates to about 0.5yd of binding fabric</li>
</ul>
</li>
<li>4"x4" squares
<ul>
<li>to include a 1/4" seam allowance: cut squares to 4.5"x4.5"</li>
<li>finished quilt size: 64"x64"</li>
<li># squares per wof=40" strip: 8</li>
<li>finished quilt perimeter: 256"</li>
<li>for the binding: cut seven 2.5" strips</li>
<li>this translates to about 0.75yd of binding fabric</li>
</ul>
</li>
<li>5"x5" squares
<ul>
<li>to include a 1/4" seam allowance: cut squares to 5.5"x5.5"</li>
<li>finished quilt size: 80"x80"</li>
<li># squares per wof=40" strip: 7</li>
<li>finished quilt perimeter: 320"</li>
<li>for the binding: cut eight 2.5" strips</li>
<li>this translates to about 0.75yd of binding fabric</li>
</ul>
</li>
</ol>
</p>`,
}
];
quiltrun.quiltsets.forEach( set => {
	console.log(set.quiltset);
	console.log("set.pigmentset= "+JSON.stringify(set.pigmentset));
	console.log("set.pigmentset keys="+ JSON.stringify(Object.keys(set.pigmentset)));
	let pigments = Object.keys(set.pigmentset).map( k => {
		console.log(k=`${k}`);
		let p = set.pigmentset[k];
		console.log(`p.color=${p.color}`);
		let modaname = quiltrun.pigmentdefs.filter(d=>d[2]===p.color)[0][1];
		console.log(modaname=`${modaname}`);
		let modasku = quiltrun.pigmentdefs.filter(d=>d[2]===p.color)[0][0];
		console.log(modasku=`${modasku}`);
		return {key:k,color:p.color,name:p.name,modaname,modasku};
	});
	console.log(JSON.stringify(pigments));
	let text = `<p>
     number of blocks = ${set.nblocks}   
     </p><p>
     colors used:`;
	pigments.forEach( pigment => {
	text = text + 
	`<ul>
		<li><em>${pigment.key}</em></li>
		<li>moda bella solids name: "${pigment.modaname}"</li>
		<li>moda bella solids item number: ${pigment.modasku}</li>
		<li>hex code: ${pigment.color}</li>
	</ul>`
	})
	text = text + `</p>`
	poems.push(
	{
	id: set.quiltset,
	title: "quilt set information",
	text: text,
	});
	set.quilts.forEach( q => {
		let pigmentcount = Object.keys(q.pigmentcount).map( pkey => {
			let name = quiltrun.pigmentdefs.filter(d=>d[2]===pkey)[0][3];
			let modaname = quiltrun.pigmentdefs.filter(d=>d[2]===pkey)[0][1];
			console.log(modaname=`${modaname}`);
			let modasku = quiltrun.pigmentdefs.filter(d=>d[2]===pkey)[0][0];
			console.log(modasku=`${modasku}`);
			let nsquares = q.pigmentcount[pkey]*set.nblocks;
			let nrows3 = Math.ceil(nsquares/Math.floor(39/3.5));
			let nrows4 = Math.ceil(nsquares/Math.floor(39/4.5));
			let nrows5 = Math.ceil(nsquares/Math.floor(39/5.5));
			let yd3 = nrows3*3.75/36;
			let yd4 = nrows4*4.75/36;
			let yd5 = nrows5*5.75/36;
			yd3r = Math.floor(yd3) + Math.ceil((yd3-Math.floor(yd3))/0.25)*.25;
			yd4r = Math.floor(yd4) + Math.ceil((yd4-Math.floor(yd4))/0.25)*.25;
			yd5r = Math.floor(yd5) + Math.ceil((yd5-Math.floor(yd5))/0.25)*.25;
			return {color:pkey,name:name,modaname,modasku,nsquares,nrows3,nrows4,nrows5,yd3,yd4,yd5,yd3r,yd4r,yd5r};
		});
		let pigmenttext = pigmentcount.reduce( (acc,p) => {
			acc = acc + `
<p>measurements for ${p.name} fabric (${p.modaname})
	<ul>
		<li>total # of squares: ${p.nsquares}</li>
		<li>3" squares: yds: ${p.yd3r}</li>
		<li>4" squares: yds: ${p.yd4r}</li>
		<li>5" squares: yds: ${p.yd5r}</li>
	</ul>
</p>`
		/*
		<li>3" squares: #fabric strips (wof=40): ${p.nrows3}</li>
		<li>4" squares: #fabric strips (wof=40): ${p.nrows4}</li>
		<li>5" squares: #fabric strips (wof=40): ${p.nrows5}</li>
		*/
		return acc;		
		}, "");
		poems.push(
			{
			id: q.id,
			title: `quilt ${q.id}`,
			text: `
			<figure>
				<img src="${set.quiltset}/${q.qid}all.png"/>
			</figure>
			`,
		});
		poems.push(
			{
			id: q.id+"raw",
			title: `quilt ${q.id}: block rows marked`,
			cssclasses: ["notoc"],
			text: `
			<figure>
				<img src="${set.quiltset}/${q.qid}allraw.png"/>
			</figure>
			`,
		});
		poems.push(
		{
			id: q.id+"info",
			title: `quilt ${q.id} measurements`,
			cssclasses: ["notoc"],
			text: pigmenttext,
		});
		[...Array(set.nblocks).keys()].forEach( bk => {
			let b=bk.toString().padStart(2, "0");
			poems.push(
			{
				id: `${q.id}b${b}`,
				title: `quilt ${q.qid}, block ${b}`,
				cssclasses: ["notoc"],
				text: `
		<figure>
			<img src="${set.quiltset}/${q.qid}b${b}raw.png"/>
		</figure>
				`,
			})
			text = `<figure class="flexcontainer">`;
			[...Array(4).keys()].forEach( rot => {
				text = text + `
			<img src="${set.quiltset}/${q.qid}b${b}rot${rot}.png"/>`;
			});
			text = text + `
		</figure>
				`,
			poems.push(
			{
				id: `${q.id}b${b}rotations`,
				title: `rotations: quilt ${q.qid}, block ${b}`,
				cssclasses: ["notoc"],
				text: text,
			})
		});
	});
});
fs.writeFileSync("poemstest.js", JSON.stringify(poems,null,'\t'), (err) => {
  if (err)
	console.log(err);
  else {
	console.log("poemstest written successfully\n");
  }
});
return poems;
}
