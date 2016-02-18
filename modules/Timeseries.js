d3.timeSeries = function(){
	var w = 800,
		h = 600,
		m = {t:25, r:50, b:25, l:50}, 
		chartW = w - m.l - m.r, 
		chartH = h - m.t - m.b,
		layout = d3.layout.histogram(),
		maxT=50;

	var	timeRange = [new Date(),new Date()],
		binSize,
		valueAccessor = function(d){
			return d;
		};

		//scales
	var scaleX = d3.time.scale()
					.range([0, chartW])
					.domain(timeRange);
	var scaleY = d3.scale.linear()
					.range([chartH,0])
					.domain([0,maxT]);

	/*CUSTOM CHART*/
	function exports(selection){ 

		var layBins = binSize.range(timeRange[0],timeRange[1]);
			layBins.unshift(timeRange[0]); 
			layBins.push(timeRange[1]);

		//layout = d3.layout.histogram();
		layout
		.range(timeRange)
		.bins(layBins);
		
		chartW = w - m.l - m.r, 
		chartH = h - m.t - m.b;
		scaleX.range([0,chartW]).domain(timeRange); 
		scaleY.range([chartH,0]).domain([0,maxT]); 

	
	selection.each(draw(selection));

	}


	function draw(d){
			var _data = layout(d); 
			console.log(d);

			// var line = d3.svg.line()
			// 			.x(function(d){return scaleX(d.x.getTime() + d.dx/2)})
			// 			.y(function(d){return scaleY(d.y)})
			// 			.interpolate('basis');
			// var area = d3.svg.area()
			// 			.x(function(d) {return scaleX(d.x.getTime() + d.dx/2)})
	  //  				.y0(chartH)
	  //   				.y1(function(d) {return scaleY(d.y);})
	  //   				.interpolate('basis');
			// var axisX = d3.svg.axis()
			// 			.orient('bottom')
			// 			.scale(scaleX)
			// 			.ticks(d3.time.year);	
			var svg = d3.select(this)
						.selectAll('svg')
						.data([d]);
			var svgEnter = svg
							.enter()
							.append('svg');//svgEnter
	 
			svgEnter.append('g')
				.attr('class','area')
				.attr('transform','translate('+m.l+','+m.t+')')
				.append('path');

			svgEnter.append('g')
				.attr('class','line')
				.attr('transform','translate('+m.l+','+m.t+')')
				.append('path');

			svgEnter.append('g')
				.attr('class','axis')
				.attr('transform','translate('+m.l+','+(m.t+chartH)+')');

			svg.attr('width',w).attr('height',h);

	var line = d3.svg.line()
						.x(function(d){return scaleX(d.x.getTime() + d.dx/2)})
						.y(function(d){return scaleY(d.y);})
						.interpolate('basis');
	svg.select('.line')
		.select('path')
		.datum(_data)
		.attr('d',line);
		/*line = d3.svg.line()
						.x(function(d){return scaleX(d.x.getTime() + d.dx/2)})
						.y(function(d){return scaleY(d.y)})
						.interpolate('basis');*/
	var area = d3.svg.area()
						.x(function(d) {return scaleX(d.x.getTime() + d.dx/2)})
	   					.y0(chartH)
	    				.y1(function(d) {return scaleY(d.y);})
	    				.interpolate('basis');

	svg.select('.area')
		.select('path')
		.datum(_data)
		.attr('d',area);
		/*var area = d3.svg.area()
						.x(function(d) {return scaleX(d.x.getTime() + d.dx/2)})
	   					.y0(chartH)
	    				.y1(function(d) {return scaleY(d.y);})
	    				.interpolate('basis');*/
	var axisX = d3.svg.axis()
						.orient('bottom')
						.scale(scaleX)
						.ticks(d3.time.year);
	svg.select('.axis')
		.call(axisX);
		/*var axisX = d3.svg.axis()
						.orient('bottom')
						.scale(scaleX)
						.ticks(d3.time.year);*/
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
			if(!arguments.length) return maxT;
			maxT = _y;
			return this;
		}

return exports;
}