module.exports = {
	randominteger: (min, max) => {
		return Math.floor( min + Math.random()*(max-min));
	},
	reifyWeightedArray: arr => {
		return arr.reduce( (acc, item, j) => {
			Array.prototype.push.apply(acc,[...Array(item[1]).keys()].reduce( (acc2,k) => { acc2.push(item[0]); return acc2 },[]) );
			return acc;
		}, []);
	},
	//Fisher-Yates (aka Knuth) Shuffle
	shufflearray: array => {
	  let currentIndex = array.length,  randomIndex;
	  // While there remain elements to shuffle...
	  while (currentIndex != 0) {
	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex--;
	    // And swap it with the current element.
	    [array[currentIndex], array[randomIndex]] = [
	      array[randomIndex], array[currentIndex]];
	  }
	  return array;
	},
	tweenParameters: (p1,p2,nsteps,t) => {
		let m = t/nsteps;
		let pt = Object.keys(p1).reduce( (ptacc,key) => {
			if(isNaN(p1[key])) {
				ptacc[key] = t>nsteps-3 ? [p1[key],p2[key]][Math.floor(Math.random() * 2)] : p1[key];
			}
			else {
				ptacc[key] = p1[key] + (p2[key] - p1[key])*m;
			}
			//console.log(`pt[${key}] = ${ptacc[key]}`);
			return ptacc;
		}, {});
		return pt;
	}
};
