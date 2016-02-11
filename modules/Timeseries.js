/*Created By Mahima on 2/4/16 */
d3.timeSeries = function(){

/*Internal Variables (defaults)*/
	var w = 800,
		h = 600,
		m = {t:25, r:50, b:25, l:50}, 
		chartW = w - m.l - m.r, 
		chartH = h - m.t - m.b,
		layout = d3.layout.histogram(),
		maxT=80;

	var	timeRange = [new Date(),new Date()], //time range
		binSize=d3.time.day, //number of bins --> .day specifies every day / stick to week for simplicity
	valueAccessor = function(d){return d;};//used by d3.layout.histogram

	//scales
	var scaleX = d3.time.scale()
			.range([0, chartW])
			.domain(timeRange);
	var scaleY = d3.scale.linear()
			.range([chartH,0])
			.domain([0,maxT]);

/*CUSTOM CHART*/
function exports(selection){ //_selection signifies user input

	var layBins = binSize.range(timeRange[0],timeRange[1]);
		layBins.unshift(timeRange[0]); //adds starting value/timeRange to the start of the array for consideration
		layBins.push(timeRange[1]);//adds ending value/timeRange to the end of the array for consideration

	// var layout = d3.layout.histogram()
	layout.range(timeRange)
		.bins(layBins);
		//	console.log(layBins); //successfully returns the first and last entry in the array
		//	console.log(binSize.range(timeRange[0],timeRange[1])); //successfully returns all the selected values in the range

/* use a histogram layout  to transform into a series of (x,y)*/
//set size
	chartW = w - m.l - m.r, 
	chartH = h - m.t - m.b;

//set scales
	scaleX.range([0,chartW]).domain(timeRange); 
	scaleY.range([chartH,0]).domain([0,maxT]); 

selection.each(draw);
// console.log("Running Man");
}


function draw(d){
		var _data = layout(d); //d3.layout.histogram(d)
		// console.log(_data);

		var line = d3.svg.line()
					.x(function(d){return scaleX(d.x.getTime() + d.dx/2)})
					.y(function(d){return scaleY(d.y)})
					.interpolate('basis'); //refers to a linear interpolation

		var area = d3.svg.area()
					.x(function(d) {return scaleX(d.x.getTime() + d.dx/2)})
   					.y0(chartH)
    				.y1(function(d) {return scaleY(d.y);})
    				.interpolate('basis');
		var axisX = d3.svg.axis() //axisX
					.orient('bottom')
					.scale(scaleX)
					.ticks(d3.time.year);
		
		var svg = d3.select(this)
					.selectAll('svg')
					.data([d]);

	console.log("I SEE YOU");
		
		var svg2 = svg.enter().append('svg');//svgEnter



		//moved up //insert shape generators to draw //ref old notes
// append DOM and draw the (x,y) as a line, and an area
//same thing, just draw twice, change class and style in CSS
// var areaAppend = 
svg2.append('g')
			.attr('class','area')
			.attr('transform','translate('+m.l+','+m.t+')')
			.append('path');
// var lineAppend = 
svg2.append('g')
			.attr('class','line')
			.attr('transform','translate('+m.l+','+m.t+')')
			.append('path');
// var axisAppend = 
svg2.append('g')
			.attr('class','axis')
			.attr('transform','translate('+m.l+','+(m.t+chartH)+')');

svg.attr('width',w).attr('height',h);


svg.select('.line')//select all svgs with class area
	.select('path')//select the appended paths in the class area
	.datum(_data)//join in many-to-one relationship to _data
	.attr('d',line); //d is the datum from the this selection joined to the DOM - create d3.svg.area

svg.select('.area')//select all svgs with class area
	.select('path')//select the appended paths in the class area
	.datum(_data)//join in many-to-one relationship to _data
	.attr('d',area); //d is the datum from the this selection joined to the DOM - create d3.svg.area

//append DOM and draw axis - DRAW ONLY X-AXIS NOT Y-
svg.select('.axis')
	.call(axisX);//axisX
}



/*Getter and Setter functions*/
//modify and access the internal variables
exports.width = function(_x){
	if(!arguments.length) return w;
	w =_x;
	return this; //returns exports
}

exports.height = function(_x){
	if(!arguments.length) return h;
	h =_x;
	return this; //returns exports
}

exports.timeRange=function(_r){
	if(!arguments.length) return timeRange;
	timeRange = _r;
	return this;
}

exports.binSize = function (interval){
	if(!arguments.length) return binSize;
	binSize = interval;
	return this;
}

exports.value = function (accessor){
	if(!arguments.length) return valueAccessor;
	valueAccessor = accessor;
	return this;
}
exports.maxT = function(_y){
		if(!arguments.length) return maxY;
		maxY = _y;
		return this;
	}

return exports;
}