let getz = (score) => {
	let width = window.innerWidth, height = window.innerHeight;
	let min = Math.min(width, height), max = Math.max(width, height);
	let version = (min < 680 || max < 980) ? "small" : "large";
	let v = version === "small" ? 0 : 1;
	let z = { 
		dimensions: {
			width, height, version, v, min, max,
		},
		highcontrast: false,
		texthidden: false,
		animate: true,
		dt:1000,
		dts:[500,1000,1500,2000,3000,4000],
	};
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
		calculategridpts: (min=0,max=1,multipliers=[0,0.25,0.5,0.75.1]) => {
			let span = max-min;
			return multipliers.map( mpt => {
				return min + mpt*span;
			});
		},
		flatten: (arr) => {
			return arr.reduce(function (flat, item) {
				return flat.concat(Array.isArray(item) ? z.tools.flatten(item) : item);
			}, []);
		},
		createElement: ({parentel=document.querySelector("body"), tag="div", attributes=[], cssclasses=[], cssstyles=[], ns="none"}) => {
			let el;
			if(ns!=="none") {
				el = document.createElementNS(ns, tag);
				attributes.forEach( entry => {
					el.setAttributeNS(null, entry[0], entry[1]);
				});
			}
			else {
				el = document.createElement(tag);
				attributes.forEach( entry => {
					el.setAttribute(entry[0], entry[1]);
				});
			}
			cssstyles.forEach( entry => {
				z.tools.logmsg("entry = " + entry)
				el.style[entry[0]] = entry[1];
			});
			cssclasses.forEach( entry => {
				el.classList.add(entry);
			});
			parentel.appendChild(el);
			return el;
		},
	};
	z.draw = (elements,B,t) => {
		let tn = t%nticks;
 		B[tn][fps][groups][els]
 * elements[groupj][elementn] = {
 * 	id,
 * 	drawf:(canvas,p)=>f,
 * 	tag:"circ",cssclasses:[],
 * 	tweenf:(p1,p2)=>f
 		B[tn][fps].forEach(i(group,g)=>{
			group.forEach((element,e)=> {
				elements[g][e].drawf
			}
		});
		if(z.animate) {
			window.setTimeout(()=>{z.draw(elements,B,tn+1)},z.dt);
		}
	};
/*
 * form of input: canvas => return
 * {
 * title,subtitle,abstract,text:[],
 * root,indexurl,pictureurl,inputurl,
 * codeurl,cssurl,
 * elements:[groups][elements]
 * elements[groupj][elementn] = {
 * 	id,
 * 	drawf:(canvas,p)=>f,
 * 	tag:"circ",cssclasses:[],
 * 	tweenf:(p1,p2)=>f
 * },
 * createB: (canvas,t) => {
 * return B:[nticks][fps][groups][els]
 * B:[t][frame][group][el]=p object
 *
 * }
 */

	//core elements
	z.elements = ( () => {
		return {
			body: { el: document.querySelector("body") },
			main: { el: document.querySelector("main") },
			// clock: { el: document.querySelector("#clock") },
			// telegraph: { el: document.querySelector("#telegraph") },
			// svg:  { el: document.querySelector("#svg") },
			frames: ["svgframe", "divframe", "wordframe", "subtextframe", "contentframe"].reduce( (acc, id) => {
				z.tools.logmsg("create frame element ::: " + id);
				acc[id] = { el: document.querySelector("#"+id) };
				return acc;
			}, {}),
			poems: Array.from(document.querySelectorAll(".poem")).reduce( (acc,el,j)=> {
				z.tools.logmsg("create poem element ::: " + j);
				// el.setAttribute("id", "poem"+j);
				acc[j]={ el:el, id:"poem"+j, stanzas: Array.from(el.querySelectorAll(".stanza")).reduce( (acc,el,j)=> {
					// z.tools.logmsg("el.className ::: " + el.className);
					el.setAttribute("id", "stanza"+j);
					// el.className= "stanza " + afterclassnames1[j%afterclassnames1.length] + " " + afterclassnames2[0];

					acc[j]={ el:el, lines:Array.from(el.querySelectorAll("li")).reduce( (acc,el,j)=> {
						// z.tools.logmsg("create line element ::: " + j);
						// el.setAttribute("id", "line"+j);
						acc[j]={ el:el };
						return acc;
						}, []) }; 
					return acc;
				}, []) };
				return acc;
			}, []),
		}
	})();

	

		//set controls
	( () => {

		let sound = document.querySelector("#sound");
		if(sound!==null) {
			sound.addEventListener("change", () => {
				if(sound.checked) {
					try {
						z.radio.player.context.resume().then(() => {
							z.tools.logmsg("playback resumed");
							z.radio.soundplaying = true;
							z.radio.play();
						});
					} catch(e) { z.tools.logerror("dashboard ::: resumeaudio " + e) } 
				}
				else {
					try {
						z.radio.player.context.suspend().then(() => {
							z.radio.soundplaying = false;
							z.radio.pause();
						});
					} catch(e) { z.tools.logerror("dashboard ::: suspendaudio " + e) }
				}			
			});
		}

		let animationonly = document.querySelector("#animationonly");
		if(animationonly==null) {
			animationonly = z.tools.createElement({
				parentel: z.elements.frames["contentframe"].el, tag: "input",
				attributes: [ ["id", "animationonly"], ["type", "checkbox"] ]
			});
			z.tools.createElement({
				parentel: z.elements.frames["contentframe"].el, tag: "label",
				attributes: [ ["for", "animationonly"] ]
			});
		}
		animationonly.addEventListener("change", () => {
			if(animationonly.checked) {
				z.elements["main"].el.style["opacity"] = 0.0;
				z.elements.frames["contentframe"].el.classList.add("hidebg");
			}
			else {
				z.elements["main"].el.style["opacity"] = 1.0;
				z.elements.frames["contentframe"].el.classList.remove("hidebg");
			}
		});

		let largetext = document.querySelector("#largetext");
		if(largetext==null) {
			largetext = z.tools.createElement({
				parentel: z.elements["main"].el, tag: "input",
				attributes: [ ["id", "largetext"], ["type", "checkbox"] ]
			});
			let label = z.tools.createElement({
				parentel: z.elements["main"].el, tag: "label",
				attributes: [ ["for", "largetext"] ]
			});
			label.innerText = "large text";
		}
		largetext.addEventListener("change", () => {
			if(largetext.checked) {
				// z.elements["main"].el.classList.add("highcontrast");
				z.elements.frames["contentframe"].el.classList.add("largetext");
				z.largetext = true;
			}
			else {
				// z.elements["main"].el.classList.remove("highcontrast");
				z.elements.frames["contentframe"].el.classList.remove("largetext");
				z.largetext = false;
			}
			// highcontrast.checked ? z.elements["main"].el.classList.add("highcontrast") : z.elements["main"].el.classList.remove("highcontrast");
		});

		let highcontrast = document.querySelector("#highcontrast");
		if(highcontrast==null) {
			highcontrast = z.tools.createElement({
				parentel: z.elements["main"].el, tag: "input",
				attributes: [ ["id", "highcontrast"], ["type", "checkbox"] ]
			});
			let label = z.tools.createElement({
				parentel: z.elements["main"].el, tag: "label",
				attributes: [ ["for", "highcontrast"] ]
			});
			label.innerText = "high contrast";
		}
		highcontrast.addEventListener("change", () => {
			if(highcontrast.checked) {
				// z.elements["main"].el.classList.add("highcontrast");
				z.elements.frames["contentframe"].el.classList.add("highcontrast");
				z.highcontrast = true;
			}
			else {
				// z.elements["main"].el.classList.remove("highcontrast");
				z.elements.frames["contentframe"].el.classList.remove("highcontrast");
				z.highcontrast = false;
			}
			// highcontrast.checked ? z.elements["main"].el.classList.add("highcontrast") : z.elements["main"].el.classList.remove("highcontrast");
		});
		let darklight = document.querySelector("#darklight");
		if(darklight==null) {
			darklight = z.tools.createElement({
				parentel: z.elements["main"].el, tag: "input",
				attributes: [ ["id", "darklight"], ["type", "checkbox"] ]
			});
			z.tools.createElement({
				parentel: z.elements["main"].el, tag: "label",
				attributes: [ ["for", "darklight"] ]
			});
		}
		darklight.addEventListener("change", () => {
			if(!darklight.checked) {
				z.elements.frames["contentframe"].el.classList.add("day");
				document.documentElement.style.setProperty("--corecolor", "var(--daycolor)");
				document.documentElement.style.setProperty("--corebg", "var(--daybg)");
				document.documentElement.style.setProperty("--coreveilbg", "var(--dayveilbg)");
				z.day = true;
			}
			else {
				z.elements.frames["contentframe"].el.classList.remove("day");
				document.documentElement.style.setProperty("--corecolor", "var(--nightcolor)");
				document.documentElement.style.setProperty("--corebg", "var(--nightbg)");
				document.documentElement.style.setProperty("--coreveilbg", "var(--nightveilbg)");
				z.day = false;
			}
			// highcontrast.checked ? z.elements["main"].el.classList.add("highcontrast") : z.elements["main"].el.classList.remove("highcontrast");
		});
		
	})();
	return z;
};
