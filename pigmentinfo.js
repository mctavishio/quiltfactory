const tools = require("./tools.js");
module.exports = (() => {
	const pigments = {
		darkgray: "#3D3E40",
		//gray: "#424142",
		gray: "#B3B0AB",
		black: "#120813",
		white: "#FAF7E6",
		red: "#AF1E25", //moda bella country red
		//yellow: "#FBED80",
		//yellow: "#FAEE68",
		yellow: "#FAEC33",
		blue2: "#2E4770",
		blue3: "#446898",
		blue: "#5084AC",
		orange: "#CA3B2B",
		bluegreen: "#82ABA5"
	};
	const pigmentdefs = [
		[ "9900-433", "Flint", "#424142", "gray" ],
		[ "9900-307", "Imperial Blue", "#0F518E", "blue" ],
		[ "9900-402", "Storm", "#9FB8BF", "blue" ],
		[ "9900-96", "Super Black", "#12070F", "black" ],
		[ "9900-6098", "White", "#F3F3F1", "white" ],
		[ "9900-283", "Lead", "#574A51", "gray" ],
		[ "9900-256", "Cayenne", "#DF2027", "red" ],
		[ "9900-284", "Charcoal", "#3D3E40", "darkgray" ],
		[ "9900-281", "Eggshell", "#F7F2DE", "white" ],
		[ "9900-280", "Espresso", "#2B1716", "darkgray" ],
		[ "9900-261", "Sapphire", "#2F3D7C", "blue" ],
		[ "9900-227", "Cobalt", "#3F5A9D", "blue" ],
		[ "9900-250", "Daffodil", "#FAEE68", "yellow" ],
		[ "9900-231", "Longhorn", "#C94F28", "red" ],
		[ "9900-17", "Country Red", "#AF1E25", "red" ],
		[ "9900-221", "Sunflower", "#FAEC33", "yellow" ],
		[ "9900-236", "Nautical Blue", "#252654", "blue" ],
		[ "9900-218", "Indigo", "#484965", "blue" ],
		[ "9900-182", "Porcelain", "#FAF7E6", "white" ],
		[ "9900-138", "Sea", "#446898", "blue" ],
		[ "9900-137", "Coastal", "#468AB9", "blue" ],
		[ "9900-130", "Sunshine", "#F9F182", "yellow" ],
		[ "9900-122", "Bettys Blue", "#677DAE", "blue" ],
		[ "9900-126", "Bettys Teal", "#4D9A88", "bluegreen" ],
		[ "9900-124", "Bettys Orange", "#CA3B2B", "orange" ],
		[ "9900-116", "Dusk", "#2A4E98", "blue" ],
		[ "9900-109", "Pond", "#57817F", "blue" ],
		[ "9900-60", "Ivory", "#FCFAE1", "white" ],
		[ "9900-51", "Buttercup", "#FDDE5F", "yellow" ],
		[ "9900-49", "French Blue", "#5084AC", "blue" ],
		[ "9900-48", "Admiral Blue", "#2E4770", "blue" ],
		[ "9900-38", "Dusty Jade", "#82ABA5", "bluegreen" ],
		[ "9900-31", "Baby Yellow", "#FBE79E", "yellow" ],
		[ "9900-42", "Tomato Soup", "#9F3132", "red" ],
		[ "9900-11", "Snow", "#FDFADB", "white" ],
		[ "9900-19", "Royal", "#142B5F", "blue" ],
		[ "9900-24", "Yellow", "#FDDF4B", "yellow" ],
		[ "9900-23", "30s Yellow", "#FBED80", "yellow" ],
		[ "9900-17", "Country Red", "#A81D24", "red" ],
		[ "9900-99", "Black", "#120813", "black" ],
	//	[ "11082-99", "Quilt Back Black", "#120813", "black" ],
		[ "9900-16", "Christmas Red", "#C92027", "red" ],
	//	[ "11082-16", "Quilt Back Red", "#C92027", "red" ],
	//	[ "11082-98", "Quilt Back White", "#FFFFFF", "white" ],
		[ "11082-83", "Quilt Back Gray", "#B3B0AB", "gray" ],
	//	[ "11082-12", "Quilt Back Natural", "#F5E8C8", "white" ],
	//	[ "11082-20", "Quilt Back Navy", "#281B35", "blue" ],
	];
	const pigmenttypes = { 
		white: pigmentdefs.filter(p=>p[3]==="white"),
		black: pigmentdefs.filter(p=>p[3]==="black"),
		dark: pigmentdefs.filter(p=>p[3]==="black"||p[3]==="darkgray"),
		light: pigmentdefs.filter(p=>p[3]==="white"||p[3]==="gray"),
		blue: pigmentdefs.filter(p=>p[3]==="blue"),
		bluegreen: pigmentdefs.filter(p=>p[3]==="bluegreen"),
		bluegreengray: pigmentdefs.filter(p=>p[3]==="bluegreen"||p[3]==="gray"),
		yellow: pigmentdefs.filter(p=>p[3]==="yellow"),
		gray: pigmentdefs.filter(p=>p[3]==="gray"),
		darkgray: pigmentdefs.filter(p=>p[3]==="darkgray"),
		red: pigmentdefs.filter(p=>p[3]==="red"),
		orange: pigmentdefs.filter(p=>p[3]==="orange"),
		sun: pigmentdefs.filter(p=>p[3]==="red"||p[3]==="yellow"||p[3]==="orange"),
	};

	let wdarkcore = [6,1,2,2];
	let wlightcore = [1,11,0,1];
	let wgraycore = [2,2,2,2];
	let wcolorcore = [2,1,4,2];

	let pigmentsets = [
			{
				color1: { color: pigments.darkgray, name: "darkgray", weights: wdarkcore, },
				color2: { color: pigments.white, name: "white", weights: wlightcore, },
				color3: { color: pigments.gray, name: "gray", weights: wgraycore, },
				color4: { color: pigments.red, name: "red", weights: wcolorcore, },
			},
			{
				color1: { color: pigments.black, name: "black", weights: [4,0,1,1], },
				color2: { color: pigments.white, name: "white", weights: wlightcore, },
				color3: { color: pigments.gray, name: "gray", weights: wgraycore, },
				color4: { color: pigments.red, name: "red", weights: wcolorcore, },
			},
			{
				color1: { color: pigments.darkgray, name: "darkgray", weights: [4,0,4,4], },
				color2: { color: pigments.white, name: "white", weights: wlightcore, },
				color3: { color: pigments.gray, name: "gray", weights: wgraycore, },
				color4: { color: pigments.red, name: "red", weights: wcolorcore, },
			},
			{
				color1: { color: pigments.darkgray, name: "darkgray", weights: wdarkcore, },
				color2: { color: pigments.white, name: "white", weights: wlightcore, },
				color3: { color: pigments.gray, name: "gray", weights: wgraycore, },
				color4: { color: pigments.black, name: "black", weights: wcolorcore, },
			},
		/*
			{
				color1: { color: pigments.darkgray, name: "darkgray", weights: wdarkcore, },
				color2: { color: pigments.white, name: "white", weights: wlightcore, },
				color3: { color: pigments.gray, name: "gray", weights: wgraycore, },
				color4: { color: pigments.yellow, name: "yellow", weights: wcolorcore, },
			},
			{
				color1: { color: pigments.black, name: "black", weights: wdarkcore, },
				color2: { color: pigments.white, name: "white", weights: wlightcore, },
				color3: { color: pigments.gray, name: "gray", weights: wgraycore, },
				color4: { color: pigments.yellow, name: "yellow", weights: wcolorcore, },
			},
			*/
			{
				color1: { color: pigments.darkgray, name: "darkgray", weights: wdarkcore, },
				color2: { color: pigments.white, name: "white", weights: wlightcore, },
				color3: { color: pigments.gray, name: "gray", weights: wgraycore, },
				color4: { color: pigments.blue, name: "blue", weights: [2,2,4,2], },
			},
			{
				color1: { color: pigments.darkgray, name: "darkgray", weights: wdarkcore, },
				color2: { color: pigments.white, name: "white", weights: wlightcore, },
				color3: { color: pigments.gray, name: "gray", weights: wgraycore, },
				color4: { color: pigments.blue3, name: "blue3", weights: wcolorcore, },
			},
			{
				color1: { color: pigments.darkgray, name: "darkgray", weights: wdarkcore, },
				color2: { color: pigments.white, name: "white", weights: wlightcore, },
				color3: { color: pigments.blue3, name: "black", weights: wgraycore, },
				color4: { color: pigments.blue2, name: "blue2", weights: wcolorcore, },
			},
			{
				color1: { color: pigments.gray, name: "gray", weights: wdarkcore, },
				color2: { color: pigments.white, name: "white", weights: wlightcore, },
				color3: { color: pigments.bluegreen, name: "bluegreen", weights: wgraycore, },
				color4: { color: pigments.blue, name: "blue", weights: wcolorcore, },
			},
	]
	let checkers = pigmenttypes.red.map( red => {
			let darkgray = pigmenttypes.darkgray[tools.randominteger(0,pigmenttypes.darkgray.length)][3];
			let white = pigmenttypes.white[tools.randominteger(0,pigmenttypes.white.length)][3];
			let gray = pigmenttypes.gray[tools.randominteger(0,pigmenttypes.gray.length)][3];
			return {
				color1: { color: darkgray, name: "darkgray", weights: wdarkcore, },
				color2: { color: white, name: "white", weights: wlightcore, },
				color3: { color: gray, name: "gray", weights: wgraycore, },
				color4: { color: red[2], name: "red", weights: wcolorcore, },
			}
	});
//	pigmentsets.push(...checkers);
	let sea = pigmenttypes.blue.map( blue => {
			let darkgray = pigmenttypes.darkgray[tools.randominteger(0,pigmenttypes.darkgray.length)][3];
			let white = pigmenttypes.white[tools.randominteger(0,pigmenttypes.white.length)][3];
			let gray = pigmenttypes.gray[tools.randominteger(0,pigmenttypes.gray.length)][3];
			return {
				color1: { color: darkgray, name: "darkgray", weights: wdarkcore, },
				color2: { color: white, name: "white", weights: wlightcore, },
				color3: { color: gray, name: "gray", weights: wgraycore, },
				color4: { color: blue[2], name: "blue", weights: wcolorcore, },
			}
	});
//	pigmentsets.push(...sea);

	wdarkcore = [6,1,2,2];
	wlightcore = [1,11,0,1];
	wgraycore = [2,2,2,2];
	wcolorcore = [2,1,4,2];

	let bw = pigmenttypes.dark.map( dark => {
			let darkgray = pigmenttypes.darkgray[tools.randominteger(0,pigmenttypes.darkgray.length)][3];
			let white = pigmenttypes.white[tools.randominteger(0,pigmenttypes.white.length)][3];
			let gray = pigmenttypes.gray[tools.randominteger(0,pigmenttypes.gray.length)][3];
			return {
				color1: { color: darkgray, name: "darkgray", weights: wdarkcore, },
				color2: { color: white, name: "white", weights: wlightcore, },
				color3: { color: gray, name: "gray", weights: wgraycore, },
				color4: { color: dark[2], name: "dark", weights: wcolorcore, },
			}
	});
//	pigmentsets.push(...bw);

	return {
		pigments,
		pigmentdefs,
		pigmenttypes,
		pigmentsets, 
	}
})();
