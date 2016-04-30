d3.timeseries = function(){

	//declare variables
	//margins and plot
	var w=900,
	h=800,
	m = {t:10,r:10,b:30,l:70},
    chartW = w - m.l - m.r,
    chartH = h - m.t - m.b,
    //color scales
    color10 = d3.scale.category10(),
    color20 = d3.scale.category20(),
	color20c = d3.scale.category20c(),
    color20b = d3.scale.category20b(),
    colorScale= color10,
    //layout
    layout = d3.layout.histogram(),
    maxY = 40000000000,
    //value range
    amountExtent= [1000000,4000000000],
    //time range
    timeRange = [new Date(), new Date()],
    binSize = d3.time.year,
    //scales
    scaleX = d3.time.scale().range([0,chartW]).domain(timeRange),
    scaleY = d3.scale.log().range([chartH-10,0]).domain([0,maxY]),
    //value accessor
    valueAccessor = function(d){ return d;},
    formatNumber = d3.format(".1f");


//write the exports function
function exports(_selection){
        var bins = binSize.range(timeRange[0],timeRange[1]);
        bins.unshift(timeRange[0]);
        bins.push(timeRange[1]);

        layout
            .range(timeRange)
            .bins(bins);

        chartW = w - m.l - m.r,
        chartH = h - m.t - m.b;

        scaleX.range([0,chartW]).domain(timeRange);
        scaleY.range([chartH,0]).domain([0,maxY]);

        _selection.each(draw);
}

//write the draw function
function draw(d){

	console.log("logging variable _d ",d, d.raisedAmount);

        var _d = layout(d);
        var bisect = d3.bisector(function(d){return d.x}).left;

        var line = d3.svg.line()
            .x(function(d){ return scaleX(d.x.getTime() + d.dx/2)})
            .y(function(d){ return scaleY(d.y)})
            .interpolate('basis');
        var area = d3.svg.area()
            .x(function(d){ return scaleX(d.x.getTime() + d.dx/2)})
            .y0(chartH)
            .y1(function(d){ return scaleY(d.y)})
            .interpolate('basis');
        var axisX = d3.svg.axis()
            .orient('bottom')
            .scale(scaleX)
            .ticks(d3.time.year);

        //append and update DOM
        //Step 1: does <svg> element exist? If it does, update width and height; if it doesn't, create <svg>
        var svg = d3.select(this).selectAll('svg')
            .data([d]);

        var svgEnter = svg.enter().append('svg').attr('width',w).attr('height',h);
        svgEnter.append('g').attr('class','area').attr('transform','translate('+m.l+','+m.t+')').append('path');
        svgEnter.append('g').attr('class','line').attr('transform','translate('+m.l+','+m.t+')').append('path');
        svgEnter.append('g').attr('class','axis').attr('transform','translate('+m.l+','+(m.t+chartH)+')');

        svg.select('.line')
            .select('path')
            .datum(_d)
            .transition()
            .attr('d',line);
        //2.2 area
        svg.select('.area')
            .select('path')
            .datum(_d)
            .transition()
            .attr('d',area);
        //2.3 horizontal axis
        svg.select('.axis')
            .transition()
            .call(axisX);


}

//getter and setter
	exports.width = function(_v){
		if(!arguments.length) return w;
		w = _v;
		return this;
	}
	exports.height = function(_v){
		if(!arguments.length) return h;
		h = _v;
		return this;
	}
	exports.timeRange = function(_r){
		if(!arguments.length) return timeRange;
		timeRange = _r;
		return this;
	}
	exports.value = function(_v){
		if(!arguments.length) return value();
		valueAccessor = _v;
		return this;
	}
	    exports.binSize = function(_b){
        //@param _b: d3.time.interval
        if(!arguments.length) return binSize;
        binSize = _b;
        return this;
    }
        exports.colorScale = function(_c){
        if(!arguments.length) return colorScale;
        colorScale = _c;
        return this;
    }

return exports;

}