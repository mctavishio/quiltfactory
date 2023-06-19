const quiltrun = require("./quiltrun.js");
const fs = require("fs");
module.exports = () => {
let book = {
	title: "grid factory 4x4x4 : series 001",
	subtitle: "quilt patterns`",
	description: "",
	rooturl: "https://quiltfactory.netlify.app",
	file: "quiltfactory",
	//bgcolors: ["#768387", "#556D7F"],
	bgcolors: ["#556D7F"],
	authorurl: "https://mctavish.io/index.html",
	author: "Kathy McTavish",
	publisher: "mctavish quilting studio",
	sections: [
		{ 
			id: "sectionfrontmatter",
			poems: ["frontmatter"],
			cssclasses: ["notoc"]
		},
		{ 
			id: "sectiontoc",
			title: "Table of Contents",
			cssclasses: ["pagenonumbers", "notoc"],
			generatorf: "generateTOC",
		},
		{ 
			id: "sectiongeneralnotes",
			title: "general notes",
			cssclasses: ["pagestartnumbers"],
			poems: [
				"generalnotes",
				"quiltdimensions",
			]
		},
		,
	],
	poemids: [
		"quiltdimensions",
	],
}
quiltrun.quiltsets.filter( set => set.nblocks===4).forEach( (set,nset) => {
	let qsec = { 
		id: `section${set.quiltset}`,
		title:  `quilt set #${nset}`,
		cssclasses: [],
		poems: []
	}
	qsec.poems.push(set.quiltset);
	set.quilts.forEach( q => {
		qsec.poems.push(q.id);
		qsec.poems.push(q.id+"raw");
		qsec.poems.push(q.id+"info");
		[...Array(set.nblocks).keys()].forEach( bk => {
			let b=bk.toString().padStart(2, "0");
			qsec.poems.push(`${q.id}b${b}`);
			qsec.poems.push(`${q.id}b${b}rotations`);
		});
	});
	book.sections.push(qsec);
});
return book;
}
