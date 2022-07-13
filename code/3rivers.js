let width = window.innerWidth, height = window.innerHeight;
let min = Math.min(width, height), max = Math.max(width, height);
let version = (min < 680 && max < 840) ? "small" : "large";
let v = version === "small" ? 0 : 1;
let z = {};
z.tools = {
	randominteger: (min, max) => {
		return Math.floor( min + Math.random()*(max-min));
	},
	logmsg: function(msg) {
		try { 
			console.log("### ::: " + msg); 
		}
		catch(err) { z.tools.logerror(err) }
	},
	logerror: function(error) {
		try { console.log("rusty error ... " + error); }
		catch(err) {}
	},
	randomhighharmonic: () => {
		let multipliers = [10.0, 12.5, 13.33, 15, 20];
		return multipliers[ z.tools.randominteger( 0, multipliers.length) ];
	},
	randomharmonic: () => {
		let multipliers = [5, 7.5, 10.0, 12.5, 13.33, 15, 20];
		return multipliers[ z.tools.randominteger( 0, multipliers.length) ];
	},
	randomlowharmonic: () => {
		let multipliers = [5, 7.5, 10.0, 12.5, 13.33, 15, 20];
		return multipliers[ z.tools.randominteger( 0, multipliers.length) ]/2;
	},
	randomkey: (object) => {
		let keys = Object.keys(object);
		let key = keys[z.tools.randominteger(0,keys.length)];
		// z.tools.logmsg("key = " + key);
		return key;
	},
	datestr: (date, options) => {
		if(options===undefined) options = {year: "numeric", month: "2-digit", day: "numeric", hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit"};
		return date.toLocaleTimeString("en-US", options);
		//new Date().toLocaleTimeString("en-US", {year: "numeric", month: "2-digit", day: "numeric", hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit"});
	},
	togrid: (min=1, max=1, x=1, ndivisions=1) => {
		let dx = Math.floor( (max-min) / ndivisions );
		return Math.floor( ( x-min+dx/2)/dx )*dx + min;
	},
	search: e => {
		let searched = document.getElementById("search").value.trim();
		if (searched !== "") { z.tools.mark(searched); }
	}
	mark: search => {
	  if (search !== "") {
	  	let text = document.getElementById("text").innerHTML;
	  	let re = new RegExp(search,"g"); // search for all instances
		let newText = text.replace(re, `<mark>${searched}</mark>`);
		document.getElementById("text").innerHTML = newText;
	  }
	}
};
//core elements
z.elements = ( () => {
	return {
		body: { el: document.querySelector("body") },
		main: { el: document.querySelector("main") },
		// clock: { el: document.querySelector("#clock") },
		// telegraph: { el: document.querySelector("#telegraph") },
		svg:  { el: document.querySelector("#svg") },
		frames: ["subtextframe", "svgframe", "wordframe", "contentframe"].reduce( (acc, id) => {
			// z.tools.logmsg("create frame element ::: " + id);
			acc[id] = { el: document.querySelector("#"+id) };
			return acc;
		}, {}),
	}
})()
	
z.streams = {
	clock: ( () => {
	let dt = 1;
	let date0 = new Date();
	let t0 = Math.floor(date0.getTime()/1000);
	let state0 = { dt: dt, count: 0, date: date0, t: t0, t0: t0 };
	return Kefir.withInterval( dt*1000, emitter => { emitter.emit( { date: new Date() } ) })
			.scan( (state, e) => { 
				state.date = e.date;
				state.t = Math.floor(e.date.getTime()/1000);
				state.count = state.count + 1;
				return state;
			}, state0  )
	})( ),
	dimensions: ( () => {
		let dt = .4;
		const ngrids=[2,2], npasts=[0,0];
		let state0 = { dt: dt, count: 0,
			grid: { nrows: ngrids[v], ncols: ngrids[v], dx: Math.floor(width/ngrids[v]), dy: Math.floor(height/ngrids[v]), sw: 12, pastn: npasts[v] },
			width: width, height: height, 
			max: max, min: min, 
		};
		return Kefir.fromEvents(window, "resize").throttle(dt*1000)
			.scan( (state,e) => {
				state.width = window.innerWidth;
				state.height = window.innerHeight;
				state.max = Math.max(state.width, state.height);
				state.min = Math.min(state.width, state.height);
				state.grid.dx = Math.floor(state.width/state.grid.ncols);
				state.grid.dy = Math.floor(state.height/state.grid.nrows);
				state.grid.sw = Math.floor(Math.max(state.grid.dx*.03, state.grid.dy*.03, 4));
				return state
			}, state0) 
	})( )
};

z.draw = z => {
	const timings = [ [380,600], [400,580], [480,500], [500,480], [580,400], [600,380], [640,340], [680,300], [700,280], [740,240], [780,200], [800,180], [840,140], [880,100]];
	// const timings = [ [180,800], [200,780], [280,700], [300,680], [380,600], [400,580], [480,500], [500,480], [580,400], [600,380], [640,340], [680,300], [700,280], [740,240], [780,200], [800,180], [840,140], [880,100]];
	// z.streams["clock"].onValue( e => {
	// 	z.elements["clock"].el.innerHTML = z.tools.datestr(new Date(e.t*1000));
	// });

	const playlist = [
		["#fcfbe3", "#191918"], //"warmbw",
		["#9a0000", "#fcfbe3", "#191918"], //"warmbwred",
		["#fcfbe3", "#191918"], //"warmbw",
		["#ffcc00", "#fcfbe3", "#191918"], //"warmbwyellow",
		["#fcfbe3", "#191918"], //"warmbw",
		// ["#006699", "#fcfbe3", "#191918"], //"warmbwblue",
	];
	z.streams["color"] = ( dt => {
		let date0 = new Date();
		let t0 = Math.floor(date0.getTime()/1000);
		let state0 = { 
			dt: dt, count: 0,
			choices: playlist[ Math.floor(t0/dt)%playlist.length ]
		};
		return z.streams["clock"].filter( e => e.t%dt===0 )
			.scan( (state, e) => { 
				state.choices = playlist[ Math.floor(e.t/dt)%playlist.length ];
				state.count = state.count + 1;
				return state;
			}, state0  )
	})( 48 );
	
	z.streams["draw"] = Kefir.combine([z.streams["clock"]], [z.streams["dimensions"], z.streams["color"]], (clock, dimensions, color) => { return {clock:clock, dimensions:dimensions, color:color} })
		.scan( (state, e) => { 
			state.clock = e.clock;
			state.dimensions = e.dimensions;
			state.color = e.color;
			state.count = state.count + 1;
			// z.tools.logmsg("color.choices = " + e.color.choices);
			return state;
	}, {clock:{t:0}, dt:1}  );

	//box
	( dt => {
		const element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		element.setAttributeNS(null, "id", "box");
		element.setAttributeNS(null, "class", "shape square");
		z.elements["svg"].el.appendChild(element);
			
		z.streams["draw"].filter(e => e.clock.t%dt===0).onValue( e => {
			try {
				let color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
				Velocity({	
					elements: element, 
					properties: { fillOpacity: 1.0, strokeOpacity: 0.0, fill: color, width: e.dimensions.width, height: e.dimensions.height },
					options: { duration: 2000,  delay: 0, easing: "easeInOutQuad" },
				});
			} catch(err) { z.tools.logerror("box animation ::: " + err ) }
		})
	})(5);

	//poems
	( dt => {
		const afterclassnames1 = ["after0", "after1", "after2", "after3", "after4", "after5", "after6", "after7", "after8", "after9", "after10", "after11", "after12", "after13"];
		const afterclassnames2 = ["afterblackwhite", "afterwhiteblack"];
		const warmblacktints = ["#191918", "#2f2f2f", "#464646", "#5e5e5d", "#757574", "#8c8c8b", "#a3a3a2", "#babab9", "#d1d1d0", "#e8e8e7", "#ffffff", "#fcfbe3", "#e2e1cc", "#c9c8b5", "#b0af9e", "#979688", "#7e7d71", "#64645a", "#4b4b44", "#32322d", "#191916", "#000000"];
		const elements = ( () => {
			return Array.from(document.querySelectorAll(".poem")).reduce( (acc,el,j)=> {
				// z.tools.logmsg("create poem element ::: " + j);
				// el.setAttribute("id", "poem"+j);
				acc[j]={ el:el, id:"poem"+j, stanzas: Array.from(el.querySelectorAll(".stanza")).reduce( (acc,el,j)=> {
					// z.tools.logmsg("el.className ::: " + el.className);
					el.setAttribute("id", "stanza"+j);
					el.className= "stanza " + afterclassnames1[j%afterclassnames1.length] + " " + afterclassnames2[0];

					acc[j]={ el:el, lines:Array.from(el.querySelectorAll("li")).reduce( (acc,el,j)=> {
						// z.tools.logmsg("create line element ::: " + j);
						// el.setAttribute("id", "line"+j);
						acc[j]={ el:el };
						return acc;
						}, []) }; 
					return acc;
				}, []) };
				return acc;
			}, []);
		})();
		z.streams["draw"].filter(e => e.clock.t%dt===0).onValue( e => {
			try {
				let count = e.clock.t/dt;
				let color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
				elements.forEach((poem,p) => {
					poem["stanzas"].forEach((stanza,s) => {
						if(count%2===0) {
							stanza.el.className= "stanza " + afterclassnames2[count/2%afterclassnames2.length] + " " + afterclassnames1[z.tools.randominteger(0,afterclassnames1.length)];
						}
						else {
							stanza["lines"].forEach( (line,l) => {
								// line.el.style["color"] = warmblacktints[z.tools.randominteger(0,warmblacktints.length)];
								// line.el.style["color"] = e.clock.t%15<4 ? "#ffffff" : warmblacktints[z.tools.randominteger(0,warmblacktints.length)];
								line.el.style["color"] = e.clock.t%48<4 ? "#fcfbe3" : e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
							})
						}
					})
				});
			} catch(err) { z.tools.logerror("poem animation ::: " + err ) }
		})
	})(7);


//main
	( dt => {
		const element = document.querySelector("main");
		const isreadabletext = element.classList.contains("readabletext");
		
		// const bgcolors = ["rgba(25, 25, 24, 0.4)", "rgba(25, 25, 24, 0.6)", "rgba(25, 25, 24, 0.9)", "rgba(252, 251, 227, 0.4)", "rgba(252, 251, 227, 0.9)", , "rgba(252, 251, 227, 0.6)"]
			
		// const warmblacktints = ["#191918", "#2f2f2f", "#464646", "#5e5e5d", "#757574", "#8c8c8b", "#a3a3a2", "#babab9", "#d1d1d0", "#e8e8e7", "#ffffff", "#fcfbe3", "#e2e1cc", "#c9c8b5", "#b0af9e", "#979688", "#7e7d71", "#64645a", "#4b4b44", "#32322d", "#191916", "#000000"];
		const warmblacktints = ["#191918", "#fcfbe3", "#000000"];

		z.streams["draw"].filter(e => e.clock.t%dt===0).onValue( e => {
			try {
				let count = e.clock.t/dt;
				let color = isreadabletext ? "#191918"  : e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
				bgAlpha = isreadabletext ? 0.8 : (e.clock.t%48<4 ? 0.6 : z.tools.randominteger(0.1,5)/10);
				Velocity({	
					elements: element, 
					properties: { backgroundColor:  e.clock.t%48<4 ? "#191918" : color, backgroundColorAlpha: bgAlpha},
					options: { duration: 1200,  delay: 0, easing: "easeInOutQuad" },
				});
				if(count%48===0) { 
					if(main.getAttribute("data-state") === "expanded") { 
						main.classList.remove("expand"); main.classList.add("compress");
						main.setAttribute("data-state", "compressed"); 
					} 
					else { 
						main.classList.remove("compress"); main.classList.add("expand");
						main.setAttribute("data-state", "expanded");
					};
				}

			} catch(err) { z.tools.logerror("main animation ::: " + err ) }
		})
	})(9);


	//words
	( dt => {
		const nwords = [[0,1],[0,1,2,3]][v];
		const words = ["_.._._+ . < +=_.._._+ . < +=_.._._+ . < +=: :  . < > '",
		". . . . . .& | | | + & + . . ::: x ",
		// "it was like this every morning", ".. - / .-- .- ... / .-.. .. -.- . / - .... .. ... / . ...- . .-. -.-- / -- --- .-. -. .. -. --.", //it was like this every morning
		// "aXQgd2FzIGxpa2UgdGhpcyBldmVyeSBtb3JuaW5n", //it was like this every morning
		"01101000 01100101 01101100 01101100 01101111 00100000 01110111 01101111 01110010 01101100 01100100", //hello world
		// "aGVsbG8gd29ybGQ=", //hello world
		"i0i000i0000iiii0i000i0000iii", //i
		"_.._._+ . < +=_.._._+ . < +=_.._._+ . < +=: :  . < > '",". . . . . .& |  . . ::: x",
		// "#thecount ‰ 0 1 2 3 4 5 6 7 8 9 iº #aftercount #aftertime", //
		// "høly h0L¥ hølY H0ly ® Å",
		"Ö x x x ø 0 Ø x X x ø 0 Ø xº3",
		// "forEach Å øn t0uch Ž",
		".. - / .-- .- ... / .-.. .. -.- . / - .... .. ... / . ...- . .-. -.-- / -- --- .-. -. .. -. --."];
		const elements = nwords.reduce( (acc, id, j) => {
			// z.tools.logmsg("create word element ::: " + id);
			let el = document.createElement("div");
			el.setAttribute("id", "word_" + id);
			el.setAttribute("class", "absolute monospace_zerodot");
			// el.setAttribute("style", "font-size:"+Math.max(20,100/nwords.length)+"vh, opacity:0");
			el.innerHTML = words[j%words.length];
			z.elements["frames"]["wordframe"].el.appendChild(el);
			el.style[ "fontSize" ] = Math.max(20,100/nwords.length)+"vh";
			el.style[ "opacity" ] = 0.0;
			el.style[ "whiteSpace" ] = "nowrap";
			acc[id] = { el: el };
			return acc;
		}, []);
		const drawings = [
			e => {
				try {
					let dy = Math.floor(e.dimensions.height/elements.length);
					let count = e.clock.t/dt;
					let color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
					elements.forEach( (element, j) => {
						element.el.innerText = words[(count+j)%words.length];
						let textwidth = element.el.clientWidth;
						let direction=(j+count)%2===0 ? -1.0 : 1.0;
						let startleft = (j+count)%2===0 ? e.dimensions.width : -2.0*textwidth;
						let endleft = (j+count)%2===1 ? e.dimensions.width : -2.0*textwidth;
						element.el.style[ "left" ] = startleft;
						element.el.style[ "top" ] = (j*dy-dy/3) + "px";
						Velocity({	
							elements: element.el,
							properties: { opacity:0.4 },
							options: { duration: dt*100,  delay: 0 },
						});
						Velocity({	
							elements: element.el,
							properties: { opacity:1.0, left: endleft, color: color },
							options: { duration: z.tools.randominteger(dt*200,dt*400),  delay: z.tools.randominteger(0, dt*220), easing: "linear" },
						});
						Velocity({	
							elements: element.el,
							properties: { opacity:0.0 },
							options: { duration: dt*280,  delay: 0 },
						});
					})
				} catch(err) { z.tools.logerror("word 1 animation ::: " + err ) }
			},
		]
		// z.tools.logmsg("#circ elements = " + elements.length);
		z.streams["draw"].filter(e => e.clock.t%dt===0).onValue( e => {
			drawings[Math.floor(e.clock.t/(dt*elements.length))%drawings.length](e);
		})
	})(18);

	//lines
	( dt => {
		const nlines=[[0,1,2,3],[0,1,2,3,4,5,6,7]][v];
		const elements = nlines.reduce( (acc, id) => {
			// z.tools.logmsg("create line element ::: " + id);
			let el = document.createElementNS("http://www.w3.org/2000/svg", "line");
			el.setAttributeNS(null, "id", "line_"+ id);
			el.setAttributeNS(null, "class", "shape line");
			z.elements["svg"].el.appendChild(el);
			acc[id] = { el: el };
		return acc;
		}, []);
		const drawings = [
			e => {
				try {
					let dx = e.dimensions.grid.dx, dy = e.dimensions.grid.dy;
					let timing = timings[z.tools.randominteger(0,timings.length)];
					elements.filter((element,j) => j%2===0).forEach( (element, j) => {
						let cy = e.dimensions.height/2;
						let color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
						Velocity({	
							elements: elements[2*j].el,
							properties: { strokeOpacity: 1.0, stroke: color, strokeWidth: z.tools.randominteger(12, e.dimensions.max), strokeDasharray: z.tools.randominteger(8, e.dimensions.min), x1: 0, x2: e.dimensions.width, y1: cy, y2: cy },
							options: { duration: z.tools.randominteger(e.dt*timing[0], e.dt*timing[0]*3),  delay: 200 },
						});
						color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];

						Velocity({	
							elements: elements[2*j+1].el,
							properties: { strokeOpacity: 1.0, stroke: color, strokeWidth: z.tools.randominteger(10, e.dimensions.min), strokeDasharray: z.tools.randominteger(4, e.dimensions.min/4), x1: 0, x2: e.dimensions.width, y1: cy, y2: cy },
							options: { duration: z.tools.randominteger(e.dt*timing[0], e.dt*timing[0]*3),  delay: 300 },
						});
					})
				} catch(err) { z.tools.logerror("line animation 1 ::: " + err ) }
			},
			e => {
				try {
					let dx = e.dimensions.grid.dx, dy = e.dimensions.grid.dy;
					let timing = timings[z.tools.randominteger(0,timings.length)];
					elements.filter((element,j) => j%2===0).forEach( (element, j) => {
						let cx = (j%e.dimensions.grid.ncols)*dx + dx/2;
						let color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
						Velocity({	
							elements: elements[2*j].el,
							properties: { strokeOpacity: 1.0, stroke: color, strokeWidth: z.tools.randominteger(12, e.dimensions.max), strokeDasharray: z.tools.randominteger(8, e.dimensions.min), y1: 0, y2: e.dimensions.height, x1: cx, x2: cx },
							options: { duration: z.tools.randominteger(e.dt*timing[0], e.dt*timing[0]*3),  delay: 0 },
						});
						color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
						timing = timings[z.tools.randominteger(0,timings.length)];
						Velocity({	
							elements: elements[2*j+1].el,
							properties: { strokeOpacity: 1.0, stroke: color, strokeWidth: z.tools.randominteger(10, e.dimensions.min), strokeDasharray: z.tools.randominteger(4, e.dimensions.min/4), y1: 0, y2: e.dimensions.height, x1: cx, x2: cx },
							options: { duration: z.tools.randominteger(e.dt*timing[0], e.dt*timing[0]*3),  delay: 500 },
						});
					})
				} catch(err) { z.tools.logerror("line animation 2 ::: " + err ) }
			},
			e => {
				try {
					let dx = e.dimensions.grid.dx, dy = e.dimensions.grid.dy;
					let timing = timings[z.tools.randominteger(0,timings.length)];
					elements.filter((element,j) => j%2===0).forEach( (element, j) => {
						// let cx = (j%e.dimensions.grid.ncols)*dx + dx/2;
						let cx = e.dimensions.width/2;
						let color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
						Velocity({	
							elements: elements[2*j].el,
							properties: { strokeOpacity: 1.0, stroke: color, strokeWidth: z.tools.randominteger(e.dimensions.max/2, e.dimensions.max), strokeDasharray: z.tools.randominteger(8, e.dimensions.min), y1: 0, y2: e.dimensions.height, x1: cx, x2: cx },
							options: { duration: z.tools.randominteger(e.dt*timing[0], e.dt*timing[0]*3),  delay: 0 },
						});
						color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
						timing = timings[z.tools.randominteger(0,timings.length)];
						Velocity({	
							elements: elements[2*j+1].el,
							properties: { strokeOpacity: 1.0, stroke: color, strokeWidth: z.tools.randominteger(e.dimensions.min/2, e.dimensions.min), strokeDasharray: z.tools.randominteger(4, e.dimensions.min/4), y1: 0, y2: e.dimensions.height, x1: cx, x2: cx },
							options: { duration: z.tools.randominteger(e.dt*timing[0], e.dt*timing[0]*3),  delay: 500 },
						});
					})
				} catch(err) { z.tools.logerror("line animation 2 ::: " + err ) }
			},
			e => {
				try {
					let dx = e.dimensions.grid.dx, dy = e.dimensions.grid.dy;
					let timing = timings[z.tools.randominteger(0,timings.length)];
					elements.filter((element,j) => j%2===0).forEach( (element, j) => {
						// let cx = (j%e.dimensions.grid.ncols)*dx + dx/2;
						let cx = e.dimensions.width/2;
						let color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
						Velocity({	
							elements: elements[2*j].el,
							properties: { strokeOpacity: 1.0, stroke: color, strokeWidth: z.tools.randominteger(e.dimensions.max/2, e.dimensions.max), strokeDasharray: z.tools.randominteger(8, e.dimensions.min), y1: 0, y2: e.dimensions.height, x1: cx, x2: cx },
							options: { duration: z.tools.randominteger(e.dt*timing[0], e.dt*timing[0]*3),  delay: 0 },
						});
						color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
						timing = timings[z.tools.randominteger(0,timings.length)];
						Velocity({	
							elements: elements[2*j+1].el,
							properties: { strokeOpacity: 1.0, stroke: color, strokeWidth: z.tools.randominteger(e.dimensions.min/2, e.dimensions.min), strokeDasharray: z.tools.randominteger(4, e.dimensions.min/4), y1: 0, y2: e.dimensions.height, x1: cx, x2: cx },
							options: { duration: z.tools.randominteger(e.dt*timing[0], e.dt*timing[0]*3),  delay: 500 },
						});
					})
				} catch(err) { z.tools.logerror("line animation 2 ::: " + err ) }
			},
			e => {
				try {
					let dx = e.dimensions.grid.dx, dy = e.dimensions.grid.dy;
					let timing = timings[z.tools.randominteger(0,timings.length)];
					elements.filter((element,j) => j%2===0).forEach( (element, j) => {
						let cy = j%2===0 ? 0 : e.dimensions.height/2;
						let color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
						Velocity({	
							elements: elements[2*j].el,
							properties: { strokeOpacity: 1.0, stroke: color, strokeWidth: z.tools.randominteger(12, e.dimensions.max), strokeDasharray: z.tools.randominteger(8, e.dimensions.min), y1: cy, y2: cy, x1: 0, x2: e.dimensions.width },
							options: { duration: z.tools.randominteger(e.dt*timing[0], e.dt*timing[0]*3),  delay: 0 },
						});
						color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
						timing = timings[z.tools.randominteger(0,timings.length)];
						Velocity({	
							elements: elements[2*j+1].el,
							properties: { strokeOpacity: 1.0, stroke: color, strokeWidth: z.tools.randominteger(10, e.dimensions.min*2), strokeDasharray: z.tools.randominteger(4, e.dimensions.min/2), y1: cy, y2: cy, x1: 0, x2: e.dimensions.width },
							options: { duration: z.tools.randominteger(e.dt*timing[0], e.dt*timing[0]*3),  delay: 300 },
						});
					})
				} catch(err) { z.tools.logerror("line animation 3 ::: " + err ) }
			}
		];
		z.streams["draw"].filter(e => e.clock.t%dt===0).onValue( e => {
			drawings[Math.floor(e.clock.t/(dt*elements.length))%drawings.length](e);
		})
	})(3);

	//circles
	( dt => {
		const ncircles=[[0,1,2,3,4,5,6,7],[0,1,2,3,4,5,6,7,8,9,10,12,13,14,15]][v];
		const elements = ncircles.reduce( (acc, id) => {
			// z.tools.logmsg("create circle element ::: " + id);
			let el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			el.setAttributeNS(null, "id", "circle_"+ id);
			el.setAttributeNS(null, "class", "shape circle");
			z.elements["svg"].el.appendChild(el);
			acc[id] = { el: el };
			return acc;
		}, []);
		// const elements = z.elements["circles"];
		const drawings = [
			e => {
				try {
					let count = e.clock.t/dt;
					let l = elements.length;
					let minradius = e.dimensions.min/l*z.tools.randominteger(3,14)/10;
					elements.forEach( (element, j) => {
						if(z.tools.randominteger(0,10)<8) {
							let cy = Math.floor(e.dimensions.height/2);
							let cx = Math.floor(e.dimensions.width/2);
							let radius = (l-j)*minradius;
							// z.tools.logmsg("circle 1 cx= "+cx+" cy= " + cy + " radius = " + radius);
							let color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
							Velocity({	
								elements: element.el,
								properties: { fillOpacity: (j+count)%3===0 ? 1.0 : 0.0, strokeOpacity: (j+count)%2===0 ? 0.0 : 1.0, stroke: color, strokeWidth: z.tools.randominteger(4,radius/2), strokeDasharray: z.tools.randominteger(4, radius*2), fill: color, cx: cx, cy: cy, r: radius },
								options: { duration: z.tools.randominteger(e.dt*400, e.dt*400*4), delay: j*60 },
							});
						}
						
					})
				} catch(err) { z.tools.logerror("circles 1 animation ::: " + err ) }
			},
			e => {
				try {
					let count = e.clock.t/dt;
					let l = elements.length;
					let minradius = e.dimensions.min/l*z.tools.randominteger(3,20)/10;
					elements.forEach( (element, j) => {
						if(z.tools.randominteger(0,10)<8) {
							let cy = Math.floor(e.dimensions.height/2);
							let cx = Math.floor(e.dimensions.width/2);
							let radius = (l-j)*minradius;
							// z.tools.logmsg("circle 2 cx= "+cx+" cy= " + cy + " radius = " + radius);
							let color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
							Velocity({	
								elements: element.el,
								properties: { fillOpacity: (j+count)%5===0 ? 1.0 : 0.0, strokeOpacity: (j+count)%5===0 ? 0.0 : 1.0, stroke: color, strokeWidth: z.tools.randominteger(4,radius/8), strokeDasharray: z.tools.randominteger(4, radius*2), fill: color, cx: cx, cy: cy, r: radius },
								options: { duration: z.tools.randominteger(e.dt*400, e.dt*400*4), delay: j*60 },
							});
						}
						
					})
				} catch(err) { z.tools.logerror("circles 1 animation ::: " + err ) }
			},
			e => {
				try {
					let count = e.clock.t/dt;
					let l = elements.length;
					let minradius = e.dimensions.min/l*z.tools.randominteger(4,20)/10;
					elements.forEach( (element, j) => {
						if(z.tools.randominteger(0,10)<8) {
							let cy = Math.floor(e.dimensions.height/2);
							let cx = Math.floor(e.dimensions.width/2);
							let radius = (l-j)*minradius;
							// z.tools.logmsg("circle 3 cx= "+cx+" cy= " + cy + " radius = " + radius);
							let color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
							Velocity({	
								elements: element.el,
								properties: { fillOpacity: (j+count)%2===0 ? 1.0 : 0.0, strokeOpacity: (j+count)%2===0 ? 0.0 : 1.0, stroke: color, strokeWidth: z.tools.randominteger(4,radius/8), strokeDasharray: z.tools.randominteger(4, radius*2), fill: color, cx: cx, cy: cy, r: radius },
								options: { duration: z.tools.randominteger(e.dt*400, e.dt*400*4), delay: j*60 },
							});
						}
						
					})
				} catch(err) { z.tools.logerror("circles 1 animation ::: " + err ) }
			},
			e => {
				try {
					let dx = e.dimensions.grid.dx, dy = e.dimensions.grid.dy;
					let min = Math.min(dx,dy);
					let count = e.clock.t/dt;
					elements.forEach( (element, j) => {
						if(z.tools.randominteger(0,10)<8) {
							let cy = e.dimensions.height/2;
							let cx = j%3===0 ? 0 : (j%2===0 ? e.dimensions.width/2 : e.dimensions.width);
							let radius = min*z.tools.randominteger(1,20)/10;
							// z.tools.logmsg("circle 3 cx= "+cx+" cy= " + cy + " radius = " + radius); 
							// if(Math.floor(count)%3!==0 && j%e.dimensions.grid.ncols===0) { color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];}
							// if(Math.floor(count)%4!==0 && j%e.dimensions.grid.nrows===0) { color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];}
							let color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
							Velocity({	
								elements: element.el,
								properties: { fillOpacity: (j+count)%3===0 ? 1.0 : 0.0, strokeOpacity: (j+count)%2===0 ? 0.0 : 1.0, stroke: color, strokeWidth: z.tools.randominteger(10,radius*2), strokeDasharray: z.tools.randominteger(4, radius*4), fill: color, cx: cx, cy: cy, r: radius },
								options: { duration: z.tools.randominteger(e.dt*400, e.dt*400*4), delay: j*60 },
							});
						}
					})
				} catch(err) { z.tools.logerror("circles 3 animation ::: " + err ) }
			},
			e => {
				try {
					let dx = e.dimensions.grid.dx, dy = e.dimensions.grid.dy;
					let min = Math.min(dx,dy);
					let count = e.clock.t/dt;
					
					elements.forEach( (element, j) => {
						if(z.tools.randominteger(0,10)<8) {
							let cy = e.dimensions.height/2;
							let cx = j%2===0 ? e.dimensions.width/2 -dx : e.dimensions.width/2 + dx;
							let radius = min*z.tools.randominteger(1,20)/10;
							// z.tools.logmsg("circle 4 cx= "+cx+" cy= " + cy + " radius = " + radius); 
							let color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
							Velocity({	
								elements: element.el,
								properties: { fillOpacity: (j+count)%5===0 ? 1.0 : 0.0, strokeOpacity: (j+count)%2===0 ? 0.0 : 1.0, stroke: color, strokeWidth: z.tools.randominteger(10,radius*2), strokeDasharray: z.tools.randominteger(4, radius*4), fill: color, cx: cx, cy: cy, r: radius },
								options: { duration: z.tools.randominteger(e.dt*400, e.dt*400*3), delay: j*60 },
							});
						}

					})
				} catch(err) { z.tools.logerror("circles 4 animation ::: " + err ) }
			},
			e => {
				try {
					let dx = e.dimensions.grid.dx, dy = e.dimensions.grid.dy;
					let min = Math.min(dx,dy);
					let count = e.clock.t/dt;
					
					elements.forEach( (element, j) => {
						if(z.tools.randominteger(0,10)<6) {
							let cy = e.dimensions.height/2;
							let cx = j%2===0 ? e.dimensions.width/2 -dx : e.dimensions.width/2 + dx;
							let radius = min*z.tools.randominteger(1,30)/10;
							// z.tools.logmsg("circle 4 cx= "+cx+" cy= " + cy + " radius = " + radius); 
							let color = e.color.choices[z.tools.randominteger(0, e.color.choices.length)];
							Velocity({	
								elements: element.el,
								properties: { fillOpacity: (j+count)%5===0 ? 1.0 : 0.0, strokeOpacity: (j+count)%5===0 ? 0.0 : 1.0, stroke: color, strokeWidth: z.tools.randominteger(10,radius*2), strokeDasharray: z.tools.randominteger(4, radius*4), fill: color, cx: cx, cy: cy, r: radius },
								options: { duration: z.tools.randominteger(e.dt*400, e.dt*400*3), delay: j*60 },
							});
						}

					})
				} catch(err) { z.tools.logerror("circles 4 animation ::: " + err ) }
			}
		]
		// z.tools.logmsg("#circ elements = " + elements.length);
		z.streams["draw"].filter(e => e.clock.t%dt===0).onValue( e => {
			drawings[Math.floor(e.clock.t/(dt*elements.length))%drawings.length](e);
		})
	})(2);

};
z.radio = ( () => { 
	const soundcorepath = "/data/sound/";
	const instruments = [{
		bagpipe1g: {clip: "bagpipe1g", minvolume: 0.9, maxvolume: 1.0, playbackRate: () => { return z.tools.randominteger(6,18)/10 } },//1.888
		bagpipe1h: {clip: "bagpipe1h", minvolume: 0.9, maxvolume: 1.0, playbackRate: () => { return z.tools.randominteger(6,18)/10 } },//0.78366
		celloknockcanyon: {clip: "celloknockcanyon", minvolume: 0.8, maxvolume: 1.0, playbackRate: () => { return z.tools.randominteger(6,48)/10 } }, //10.37
		thunk: {clip: "thunk", minvolume: 0.6, maxvolume: 0.9, playbackRate: () => { return z.tools.randomharmonic()/10 } },
		thunkhighharmonic: {clip: "thunk", minvolume: 0.6, maxvolume: 0.9, playbackRate: () => { return z.tools.randomhighharmonic()/10 } },
		// voxmct0: {clip: "voxmct0", minvolume: 0.8, maxvolume: 1.0, playbackRate: () => { return z.tools.randomharmonic()/10 } }, //1.70
		// voxmct0_b: {clip: "voxmct0", minvolume: 0.8, maxvolume: 1.0, playbackRate: () => { return z.tools.randominteger(8,12)/10 } }, //1.70
		birdcry: {clip: "birdcry", minvolume: 0.6, maxvolume: 0.8, playbackRate: () => { return z.tools.randomharmonic()/15 } } , //12.146 
		birdcryrandom: {clip: "birdcry", minvolume: 0.6, maxvolume: 0.8, playbackRate: () => { return z.tools.randominteger(8,12)/12 } } , //12.146 
		birdcryharmonic: {clip: "birdcry", minvolume: 0.6, maxvolume: 0.8, playbackRate: () => { return z.tools.randomharmonic()/10} } , //12.146 
		birdcryhigh: {clip: "birdcry", minvolume: 0.5, maxvolume: 0.8, playbackRate: () => { return z.tools.randomhighharmonic()/10} },
		birdcrylow: {clip: "birdcry", minvolume: 0.7, maxvolume: 1.0, playbackRate: () => { return z.tools.randomlowharmonic()/10} },

		mctbreathingharmonic: {clip: "mctbreathing0", minvolume: 0.4, maxvolume: 0.9, playbackRate: () => { return z.tools.randomharmonic()/10} },
	},
	{
		bagpipe1g: {clip: "bagpipe1g", minvolume: 0.9, maxvolume: 1.0, playbackRate: () => { return z.tools.randominteger(6,18)/10 } },//1.888
		bagpipe1h: {clip: "bagpipe1h", minvolume: 0.9, maxvolume: 1.0, playbackRate: () => { return z.tools.randominteger(6,18)/10 } },//0.78366
		celloknockcanyon: {clip: "celloknockcanyon", minvolume: 0.8, maxvolume: 1.0, playbackRate: () => { return z.tools.randominteger(6,48)/10 } }, //10.37

		thunk: {clip: "thunk", minvolume: 0.6, maxvolume: 0.9, playbackRate: () => { return z.tools.randomharmonic()/10 } },
		thunkhighharmonic: {clip: "thunk", minvolume: 0.7, maxvolume: 0.9, playbackRate: () => { return z.tools.randomhighharmonic()/10 } },

		// voxmct0: {clip: "voxmct0", minvolume: 0.8, maxvolume: 1.0, playbackRate: () => { return z.tools.randomharmonic()/10 } }, //1.70
		// voxmct0_b: {clip: "voxmct0", minvolume: 0.8, maxvolume: 1.0, playbackRate: () => { return z.tools.randominteger(8,12)/10 } }, //1.70
		birdcry: {clip: "birdcry", minvolume: 0.6, maxvolume: 0.8, playbackRate: () => { return z.tools.randomharmonic()/15 } } , //12.146 
		birdcryrandom: {clip: "birdcry", minvolume: 0.6, maxvolume: 0.8, playbackRate: () => { return z.tools.randominteger(8,12)/12 } } , //12.146 
		birdcryharmonic: {clip: "birdcry", minvolume: 0.6, maxvolume: 0.8, playbackRate: () => { return z.tools.randomharmonic()/10} } , //12.146 
		birdcryhigh: {clip: "birdcry", minvolume: 0.5, maxvolume: 0.8, playbackRate: () => { return z.tools.randomhighharmonic()/10} },
		birdcrylow: {clip: "birdcry", minvolume: 0.7, maxvolume: 1.0, playbackRate: () => { return z.tools.randomlowharmonic()/10} },
		
		mctbreathingharmonic: {clip: "mctbreathing0", minvolume: 0.4, maxvolume: 0.9, playbackRate: () => { return z.tools.randomharmonic()/10} },
		rubbedpianoharp0: {clip: "rubbedpianoharp0", minvolume: 0.5, maxvolume: 0.9, playbackRate: () => { return z.tools.randominteger(8,28)/10 } },//52.92
		rubbedpianoharp0_b: {clip: "rubbedpianoharp0", minvolume: 0.5, maxvolume: 0.9, playbackRate: () => { return z.tools.randominteger(5,48)/10 } },//52.92
		// weatherradio1: {clip: "weatherradio1", minvolume: 0.6, maxvolume: 1.0,  playbackRate: () => { return z.tools.randominteger(6,12)/10 } },//12
	}][v];
	let clips = {};
	Object.entries(instruments).forEach( instrument => {
		clips[instrument[1].clip] = { url: soundcorepath + instrument[1].clip + ".mp3", loaded:false, duration:0, buffer:{} };
	});
	let radio = {
		player: {}, loading: [], loaded: false,
		soundplaying:false,
		instruments: instruments, clips: clips,
		clipduration: { min:0, max:0 },
		nbuffersplaying: 0, maxbuffersplaying: [12,18][v],
		intervals: {
			lowi: function(basetone){ return Math.floor(basetone/4) },
			i: function(basetone){ return Math.floor(basetone/2) },
			I: function(basetone){ return Math.floor(basetone/1) },
			II: function(basetone){ return Math.floor(basetone*9/8) },
			III: function(basetone){ return Math.floor(basetone*5/4) },
			iii: function(basetone){ return Math.floor(basetone*6/5) },
			IV: function(basetone){ return Math.floor(basetone*4/3) },
			V: function(basetone){ return Math.floor(basetone*3/2) },
			VI: function(basetone){ return Math.floor(basetone*5/3) },
			VII: function(basetone){ return Math.floor(basetone*15/8) },
			vii: function(basetone){ return Math.floor(basetone*9/5) },
			VIII: function(basetone){ return Math.floor(basetone*2) },
		},
		loadclips: z => {
			Object.keys(z.radio.clips).forEach( key => {
				let clip = z.radio.clips[key];
				if(!z.radio.loading.includes(clip.url)) {
					z.radio.loading.push(clip.url);
					let request = new XMLHttpRequest();
					//for localhost testing
					request.open("GET", window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/" + clip.url, true);
					// z.tools.logmsg("url = " + window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/web/" + clip.url);
					// for deploy
					// request.open("GET", window.location.protocol + "//" + window.location.hostname + "/" + clip.url, true);
					// z.tools.logmsg("url = " + window.location.protocol + "//" + window.location.hostname + "/"  + clip.url);
					request.responseType = "arraybuffer";
					request.onload = () =>  {
						// z.tools.logmsg("loaded" + clip.url);
						z.radio.player.context.decodeAudioData(request.response, buffer => {
							clip.loaded = true;
							clip.buffer = buffer;
							clip.duration = clip.buffer.duration;
							if( clip.duration > z.radio.clipduration.max) {z.radio.clipduration.max = clip.duration}
							else if( clip.duration < z.radio.clipduration.min) {z.radio.clipduration.min  = clip.duration}
							// z.tools.logmsg("decoded" + clip.url);
						}, e => {
							z.tools.logerror("audio error! clip = " + clip.url + ", err = " + e);
						});
						
					};
					request.send();
				}
			});
			z.radio.loaded = true;
		},
		start: z => {
			/* set up player*/
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			z.radio.player.context = new AudioContext();
			/* experimental parameters */
			let parameters = [
				{ gain: 0.4, threshold: -24, knee: 30, ratio: 12, attack: 0.003, release: 0.25 }, //default
				{ gain: 0.3, threshold: -18, knee: 30, ratio: 18, attack: 0.0003, release: 0.28 },
				{ gain: 0.5, threshold: -8, knee: 30, ratio: 18, attack: 0.003, release: 0.28 },
				{ gain: 0.8, threshold: -8, knee: 30, ratio: 18, attack: 0.003, release: 0.28 },
				];
			let n = 0;

			//with compressor
			z.radio.player.compressor = z.radio.player.context.createDynamicsCompressor();
			z.radio.player.compressor.threshold.value = parameters[n].threshold;
			z.radio.player.compressor.knee.value = parameters[n].knee;
			z.radio.player.compressor.ratio.value = parameters[n].ratio;
			
			z.radio.player.compressor.attack.value = parameters[n].attack;
			z.radio.player.compressor.release.value = parameters[n].release;
			z.radio.player.gain = z.radio.player.context.createGain();
			z.radio.player.gain.value = parameters[n].gain;
			z.radio.player.compressor.connect(z.radio.player.gain);
			z.radio.player.gain.connect(z.radio.player.context.destination);
			// //with no compressor
			// z.radio.player.gain = z.radio.player.context.createGain();
			// z.radio.player.gain.value = parameters[n].gain;
			// z.radio.player.gain.connect(z.radio.player.context.destination);
		},
		playtone: ({ volume=0.4, delay=0, fadetime=0.1, duration=1.0, frequency=380 } = {}) => { 
			let vco = z.radio.player.context.createOscillator();
			vco.frequency.value = frequency;
			vco.type = "sine";
			let vca = z.radio.player.context.createGain();
			
			vco.connect(vca);
			vca.connect(z.radio.player.gain);
			let now = z.radio.player.context.currentTime;
			//fade in
			vca.gain.exponentialRampToValueAtTime(0.001, now + delay);
			vca.gain.exponentialRampToValueAtTime(volume, now + fadetime + delay);
			//fade out
			vca.gain.exponentialRampToValueAtTime(volume, now + duration + delay - fadetime);
			vca.gain.exponentialRampToValueAtTime(0.001, now + duration + delay);
			vco.start(now + delay);
			vco.stop(now + delay + duration + fadetime);
			vco.onended = function() {
			  	vco.disconnect(); vca.disconnect();
			}
		},
		playbuffer: ( { volume=0.8, delay=0, fadetime=0.4, duration=8, instrument=z.radio.instruments["bagpipe1g"] } = {} ) =>  {
			try {
				// let instrument = z.radio.instruments[zinstrument];
				let clip = z.radio.clips[instrument.clip];
				// z.tools.logmsg("***buffer requested = " + instrument.clip + " z.radio.nbuffersplaying = " + z.radio.nbuffersplaying);
				if(clip.loaded && (z.radio.nbuffersplaying<z.radio.maxbuffersplaying-1 || z.radio.nbuffersplaying>z.radio.maxbuffersplaying+2)) {
					let rate = instrument.playbackRate ? instrument.playbackRate() : 1.0;
					try {
						// z.tools.logmsg("clip = " + clip.url + " fadetime = " + fadetime  + " rate = " + rate + " ::: volume = " + volume + " ::: orig duration = " + clip.duration + " ::: duration = " + clip.duration*rate + " || " + duration*rate);
						let vca = z.radio.player.context.createGain(); 
						let source = z.radio.player.context.createBufferSource();
						source.buffer = clip.buffer;
						source["playbackRate"].value = rate;
						source.connect(vca);
						vca.connect(z.radio.player.gain);
						source.loop = false;
						source.onended = e =>  { 
							z.radio.nbuffersplaying=z.radio.nbuffersplaying-1;
						};
						++z.radio.nbuffersplaying;
						let now = z.radio.player.context.currentTime;
						let dur = clip.duration < duration ? rate*clip.duration : rate*duration;
						dur = Math.min(dur, clip.duration);
						let dt = Math.min(fadetime, dur*.25);
						let offset = z.tools.randominteger(0, (dur-4*dt)*10)/10;
						// source.start(now, offset, dt*4); //parameters (when,offset,duration)
						vca.gain.setValueAtTime(0.001, now);
						vca.gain.exponentialRampToValueAtTime(volume, now + dt);
						vca.gain.setValueAtTime(volume, dur - 2*dt);
						vca.gain.exponentialRampToValueAtTime(0.001, now + dur-dt*0.5 );
						source.start(now, offset, dur); //parameters (when,offset,duration)
						// z.tools.logmsg("playing = " + clip.url);
					} catch(e) { z.tools.logerror("error applying params to audio buffer e::: " + e) }
				}
				else {	
					z.tools.logmsg("NOT playing = " + clip.url);
				}
			}
			catch(err) { z.tools.logerror("line playbuffer" + err) }
		},
		play: z => {
			const defaultduration = (dt,n,graintdt,clip) => dt/(graindt*2);
			const defaultfadetime = (dt,n,graintdt,clip) => dt/(graindt*20);
			const defaultpart = (dt=4000, n=4, graindt=400, filter= e=>{return z.tools.randominteger(0,10)<8}, duration=defaultduration, fadetime=defaultfadetime, instruments=["celloknockcanyon"]) => { return {dt:dt, filter:e=>true, graindt: graindt, n: 5, duration: duration(dt,n,graintdt), fadetime: fadetime(dt,n,graintdt), instruments: ["celloknockcanyon"] } };
			const score = [[
				{dt:9000, graindt:240, n: 4, duration: 2, fadetime: .2, filter: e=>{return z.tools.randominteger(0,10)<10}, instruments: ["bagpipe1g"] },
				{dt:9200, graindt:200, n: 4, duration: 1, fadetime: .2, filter: e=>{return z.tools.randominteger(0,10)<10}, instruments: ["bagpipe1h"] },
				{dt:10801, graindt:840, n: 3, duration: 6, fadetime: .2, filter: e=>{return z.tools.randominteger(0,10)<10}, instruments: ["celloknockcanyon"] },
				
				{dt:19711, graindt:900, n: 3, duration: 5, fadetime: .4, filter: e=>{return z.tools.randominteger(0,10)<10}, instruments: ["thunk"] },
				{dt:11704, graindt:910, n: 3, duration: 8, fadetime: .4, filter: e=>{return z.tools.randominteger(0,10)<10}, instruments: ["thunkhighharmonic"] },

				// {dt:53906, graindt:320, n: 4, duration: 3, fadetime: .2, filter: e=>{return z.tools.randominteger(0,10)<9}, instruments: ["voxmct0"] },
				// {dt:55909, graindt:420, n: 4, duration: 3, fadetime: .2, filter: e=>{return z.tools.randominteger(0,10)<9}, instruments: ["voxmct0_b"] },
				// {dt:112040, graindt:500, n: 4, duration: 4, fadetime: .2, filter: e=>{return z.tools.randominteger(0,10)<9}, instruments: ["voxmct0"] },
				
				{dt:61005, graindt:2040, n: 3, duration: 13, fadetime: 1, filter: e=>{return z.tools.randominteger(0,10)<10}, instruments: ["birdcrylow", "birdcry"] },
				{dt:61904, graindt:3400, n: 3, duration: 13, fadetime: 1, filter: e=>{return z.tools.randominteger(0,10)<10}, instruments: ["birdcrylow"] },
			], 
			[
				{dt:9000, graindt:240, n: 5, duration: 2, fadetime: .2, filter: e=>{return z.tools.randominteger(0,10)<10}, instruments: ["bagpipe1g"] },
				{dt:9200, graindt:200, n: 6, duration: 1, fadetime: .2, filter: e=>{return z.tools.randominteger(0,10)<10}, instruments: ["bagpipe1h"] },
				{dt:10801, graindt:840, n: 4, duration: 6, fadetime: .2, filter: e=>{return z.tools.randominteger(0,10)<10}, instruments: ["celloknockcanyon"] },

				{dt:19711, graindt:900, n: 3, duration: 5, fadetime: .4, filter: e=>{return z.tools.randominteger(0,10)<10}, instruments: ["thunk", "mctbreathingharmonic"] },
				{dt:11704, graindt:900, n: 3, duration: 8, fadetime: .4, filter: e=>{return z.tools.randominteger(0,10)<10}, instruments: ["thunkhighharmonic"] },

				// {dt:53906, graindt:320, n: 5, duration: 3, fadetime: .2, filter: e=>{return z.tools.randominteger(0,10)<9}, instruments: ["voxmct0"] },
				// {dt:55909, graindt:420, n: 5, duration: 3, fadetime: .2, filter: e=>{return z.tools.randominteger(0,10)<9}, instruments: ["voxmct0_b"] },
				// {dt:112040, graindt:505, n: 8, duration: 4, fadetime: .2, filter: e=>{return z.tools.randominteger(0,10)<9}, instruments: ["voxmct0"] },

				{dt:61005, graindt:1040, n: 4, duration: 13, fadetime: 1, filter: e=>{return z.tools.randominteger(0,10)<10}, instruments: ["birdcrylow",  "birdcry", "birdcryharmonic"] },
				{dt:61904, graindt:1630, n: 5, duration: 13, fadetime: 1, filter: e=>{return z.tools.randominteger(0,10)<10}, instruments: ["birdcrylow", "birdcryrandom"] },

				{dt:18000, graindt:400, n: 5, duration: 5.4, fadetime: 1, filter: e=>{return z.tools.randominteger(0,10)<9}, instruments: ["mctbreathingharmonic"] },
				{dt:18040, graindt:904, n: 2, duration: 6.8, fadetime: 1, filter: e=>{return z.tools.randominteger(0,10)<6}, instruments: ["mctbreathingharmonic","rubbedpianoharp0_b"] },
				{dt:35003, graindt:4640, n: 2, duration: 12.2, fadetime: 1, filter: e=>{return z.tools.randominteger(0,10)<10}, instruments: ["rubbedpianoharp0_b"] },
				{dt:40403, graindt:3900, n: 2, duration: 9, fadetime: 1, filter: e=>{return z.tools.randominteger(0,10)<8}, instruments: ["rubbedpianoharp0"] },

			]][v];
			console.log("v = " + v + ", width="+width+ ", height="+height);
//https://storage.googleapis.com/www.blueboatfilms.com/sound/20100603tuningforkhYmn_v3.mp3
//https://storage.googleapis.com/www.blueboatfilms.com/sound/uniondepotcistern.mp3
//
			score.forEach( (part,j) => {
				z.streams["clock"].filter( e => e.t%Math.floor(part.dt/1000)===0 && part.filter(e) && z.radio.soundplaying)
					.onValue( e=> {
						let clip = part.instruments[z.tools.randominteger(0,part.instruments.length)];
						Kefir.sequentially(part.graindt, [...Array(part.n).keys()]).onValue( x => { 
							z.radio.playbuffer({duration:part.duration, fadetime:part.fadetime, instrument:z.radio.instruments[clip], volume: z.tools.randominteger(z.radio.instruments[clip].minvolume*10, z.radio.instruments[clip].maxvolume*10)/10});
						});
					})
			});


		}
	};
	
	let soundlink = document.querySelector("#soundlink");
	let telegraph = document.querySelector("#telegraph");

	Kefir.fromEvents(soundlink, "click").onValue( e => {
		z.tools.logmsg("play sound !");
		if(!radio.soundplaying) { 
			try {
				radio.player.context.resume().then(() => {
					z.tools.logmsg("playback resumed");
					// telegraph.innerHTML =  "(sound on)";
					radio.soundplaying = true;
					// soundlink.classList.add("active");
					soundlink.innerText = "turn off sound";
					radio.playtone({volume:0.2, delay:0, fadetime:0.3, duration:2.0, frequency:380 });
					radio.playtone({volume:0.16, delay:280, fadetime:0.3, duration:2.0, frequency:380*3/2 });
					radio.playtone({volume:0.2, delay:480, fadetime:0.3, duration:2.0, frequency:380*2 });
					radio.playbuffer();
				});
			} catch(e) { z.tools.logerror("dashboard ::: resumeaudio " + e) } 
		}
		else { 
			try {
				radio.player.context.suspend().then(() => {
					// telegraph.innerHTML =  "(sound off)";
					radio.soundplaying = false;
					// soundlink.classList.remove("active");
					soundlink.innerText = "turn on sound";
				});
			} catch(e) { z.tools.logerror("dashboard ::: suspendaudio " + e) }
		}
	});

	return radio;
})();
//controls
( () => { 
	const hidetextlink = document.querySelector("#hidetextlink");
	let texthidden = false;
	Kefir.fromEvents(hidetextlink, "click").onValue( e => {
		if(texthidden) {
			z.elements["main"].el.style["opacity"] = 1.0;
			hidetextlink.innerText = "-";
			hidetextlink.title = "hide text";
			texthidden = false;
		}
		else {
			z.elements["main"].el.style["opacity"] = 0.0;
			hidetextlink.innerText = "+";
			hidetextlink.title = "show text";
			texthidden = true;
		}
	});
})();
z.radio.start(z);
z.radio.loadclips(z);
// z.radio.playtone();
window.addEventListener('load', e => {
  z.radio.play(z);
  z.draw(z);
  window.scroll(0,0);
  // window.setTimeout(() => { document.querySelector("#contentframe").style.opacity = 1.0 }, 1800);
  // window.setTimeout(() => { document.querySelector("#controls").style.backgroundColor = "rgba(0,0,0,0.0)" }, 6800);
});
// window.addEventListener('beforeunload', e => {
// 	window.scroll(0,0);
// });