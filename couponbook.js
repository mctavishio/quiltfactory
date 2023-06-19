const fs = require("fs");
module.exports = () => {
let book = {
	title: "coupons",
	subtitle: "",
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
			id: "sectioncoupons",
			title: "coupons",
			cssclasses: ["pagestartnumbers"],
			poems: [
				"10percentoffcompqblue"
			]
		},
		,
	],
	poemids: [
	],
}
return book;
}
