module.exports = (() => {
	const pigments = {
		darkgray: "#3D3E40",
		//gray: "#424142",
		gray: "#B3B0AB",
		black: "#120813",
		white: "#FAF7E6",
		red: "#AF1E25", //moda bella country red
		yellow: "#FDDF4B",
		blue: "#2E4770",
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
		[ "9900-126", "Bettys Teal", "#4D9A88", "blue" ],
		[ "9900-124", "Bettys Orange", "#CA3B2B", "orange" ],
		[ "9900-116", "Dusk", "#2A4E98", "blue" ],
		[ "9900-109", "Pond", "#57817F", "blue" ],
		[ "9900-60", "Ivory", "#FCFAE1", "white" ],
		[ "9900-51", "Buttercup", "#FDDE5F", "yellow" ],
		[ "9900-49", "French Blue", "#5084AC", "blue" ],
		[ "9900-48", "Admiral Blue", "#2E4770", "blue" ],
		[ "9900-38", "Dusty Jade", "#82ABA5", "blue" ],
		[ "9900-31", "Baby Yellow", "#FBE79E", "yellow" ],
		[ "9900-42", "Tomato Soup", "#9F3132", "red" ],
		[ "9900-11", "Snow", "#FDFADB", "white" ],
		[ "9900-19", "Royal", "#142B5F", "blue" ],
		[ "9900-24", "Yellow", "#FDDF4B", "yellow" ],
		[ "9900-23", "30s Yellow", "#FBED80", "yellow" ],
		[ "9900-17", "Country Red", "#A81D24", "red" ],
		[ "9900-99", "Black", "#120813", "black" ],
		[ "11082-99", "Quilt Back Black", "#120813", "black" ],
		[ "9900-16", "Christmas Red", "#C92027", "red" ],
		[ "11082-16", "Quilt Back Red", "#C92027", "red" ],
		[ "11082-98", "Quilt Back White", "#FFFFFF", "white" ],
		[ "11082-83", "Quilt Back Gray", "#B3B0AB", "gray" ],
		[ "11082-12", "Quilt Back Natural", "#F5E8C8", "white" ],
		[ "11082-20", "Quilt Back Navy", "#281B35", "blue" ],
	];
	const pigmenttypes = { 
		white: pigmentdefs.filter(p=>p[0]==="white"),
		black: pigmentdefs.filter(p=>p[0]==="black"),
		dark: pigmentdefs.filter(p=>p[0]==="black"||p[0]==="darkgray"),
		light: pigmentdefs.filter(p=>p[0]==="white"||p[0]==="gray"),
		blue: pigmentdefs.filter(p=>p[0]==="blue"),
		yellow: pigmentdefs.filter(p=>p[0]==="yellow"),
		gray: pigmentdefs.filter(p=>p[0]==="gray"),
		red: pigmentdefs.filter(p=>p[0]==="red"),
		orange: pigmentdefs.filter(p=>p[0]==="orange"),
		sun: pigmentdefs.filter(p=>p[0]==="red"||p[0]==="yellow"||p[0]==="orange"),
	};
	/*
	const pigmentsettypes = {
		checkers: () => {
			return pigmenttypes.red.map(c=> {
				{
					tone: "checkers",
					color1: { color: pigments.darkgray, name: "darkgray", weights: [6,1,2,1], blockn: [] },
					color2: { color: pigments.white, name: "white", weights: [1,12,1,1], blockn: [] },
					color3: { color: pigments.gray, name: "gray", weights: [4,2,2,1], blockn: [] },
					color4: { color: pigments.red, name: "red", weights: [2,2,4,1], blockn: [] },
				}
			});
		}
	}
	*/
	return {
		pigments: pigments,
		pigmentdefs: pigmentdefs,
		pigmentsets: [
		{
			color1: { color: pigments.darkgray, name: "darkgray", weights: [6,1,2,1], blockn: [] },
			color2: { color: pigments.white, name: "white", weights: [1,12,1,1], blockn: [] },
			color3: { color: pigments.gray, name: "gray", weights: [4,2,2,1], blockn: [] },
			color4: { color: pigments.red, name: "red", weights: [2,2,4,1], blockn: [] },
		},
		{
			color1: { color: pigments.darkgray, name: "darkgray", weights: [6,1,2,1], blockn: [] },
			color2: { color: pigments.white, name: "white", weights: [1,12,1,1], blockn: [] },
			color3: { color: pigments.gray, name: "gray", weights: [4,2,2,1], blockn: [] },
			color4: { color: pigments.blue, name: "blue", weights: [2,2,4,1], blockn: [] },
		},
		{
			color1: { color: pigments.darkgray, name: "darkgray", weights: [6,1,2,1], blockn: [] },
			color2: { color: pigments.white, name: "white", weights: [1,12,1,1], blockn: [] },
			color3: { color: pigments.gray, name: "gray", weights: [4,2,2,1], blockn: [] },
			color4: { color: pigments.yellow, name: "yellow", weights: [2,2,4,1], blockn: [] },
		}
	]
	}
})();
