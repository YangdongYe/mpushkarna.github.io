var w = d3.select('.plot').node().clientWidth,
    h = d3.select('.plot').node().clientHeight;

d3.csv('../data/hubway_trips_reduced.csv',parse,dataLoaded);

var timeSeries = d3.timeSeries()
                .width(w)
                .height(h)
                .timeRange([new Date (2011,6,14), new Date (2013,11,13)])
                .value(function(d){return d.startTime})
                .binSize(d3.time.day);

function dataLoaded(err,rows){

//use this function to sort by origin or destination
var sourcePoint = function(rows){return rows.startStation};

//set up for data for small multiples
//define stations
var tripsStation= d3.nest()
                    .key(sourcePoint)
                    // .key(function(d){return d.startStation})
                    .entries(rows);

//add data to each station
var plots= d3.select('.container')
            .selectAll('.plot')
            .data(tripsStation);
//console.log (tripsStation); //successfully returns a nested array of trips by sorting order

//oh wait assign a class so it knows where to go and how to look
plots .enter()
      .append('div')
      .attr('class','plot');

//now draw - WHY IS THIS NOT HAPPENING??!
plots
    .each(function(d){
        d3.select(this)
        .datum(d.values) //get val for nested array of stations in plots
        .call(timeSeries)
        .append('h2') //the absence of this shouldnt matter
        .text(d.key); //the absence of this shouldn't matter
        })


}

function parse(d){
    if(+d.duration<0) return;

    return {
        duration: +d.duration,
        startTime: parseDate(d.start_date),
        endTime: parseDate(d.end_date),
        startStation: d.strt_statn,
        endStation: d.end_statn
    }
}

function parseDate(date){
    var day = date.split(' ')[0].split('/'),
        time = date.split(' ')[1].split(':');

    return new Date(+day[2],+day[0]-1, +day[1], +time[0], +time[1]);
}

