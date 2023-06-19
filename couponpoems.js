const fs = require("fs");
module.exports = () => { 
let poems = [
{
id: "frontmatter",
title: "",
cssclasses: ["moreroom", "lowertopmargin"],
text: `<p>
2022.07.20
</p><p class="address">
<br/>
mctavish quilting studio & fabrics <br/>
p.o. box 3280<br/>
1831 east 8th street, suite g101i<br/>
duluth mn 55812
www.mctavisquilting.com<br/>
</p><p class="noweb">
code work by kathy mctavish (www.mctavish.io)<br/>
</p><p>
other work by kathy mctavish: see www.mctavish.io 
</p>
`
},
{
id: "10percentoffcompqblue",
title: "10% off computerized quilting",
text: `<figure>
<svg>
<rect x=0 y=0 width="200" height="200" fill="#9a0000"/> 
<rect x=200 y=0 width="200" height="200" fill="i#ffcc00"/> 
</svg>
</figure>`
},
];
/*
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
*/
fs.writeFileSync("couponstest.js", JSON.stringify(poems,null,'\t'), (err) => {
  if (err)
	console.log(err);
  else {
	console.log("poemstest written successfully\n");
  }
});
return poems;
}
