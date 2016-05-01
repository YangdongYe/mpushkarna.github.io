var m = {t:50,r:100,b:50,l:100},
    w = d3.select('#plot').node().clientWidth,
    h = d3.select('#plot').node().clientHeight,
    color10 = d3.scale.category10(),
    color20 = d3.scale.category20();

var plot = d3.select('.plot').append('svg')
    .attr('width',w+ m.l+ m.r)
    .attr('height',h+ m.t+ m.b)
    .append('g').attr('class','histogram')
    .attr('transform','translate('+ m.l+','+ m.t+')');

var listname = ["In Native Currency Origin Year",
    "In USD Equivalent Origin Year",
    "In USD Equivalent 2016"];
for (var i=0;i<listname.length;i++) {
        d3.select('.year-list')
            .append('option')
            .html(listname[i])
            .attr('value',i);
     }

var globalDispatcher = d3.dispatch('yearchange');

var canvas = d3.select('#plot')
        .append('canvas')
        .attr('width',w)
        .attr('height',h)
        .node(),
    ctx = canvas.getContext('2d');

var stationLoc = d3.map();

var projection = d3.geo.mercator()
    .translate([w/2,h/2])
    .scale(400000)
    .center([-71.071930,42.351052]);

var queue = d3_queue.queue()
    .defer(d3.csv, "../data/Crunchbase_FundingRounds_Final.csv",parse)
    .defer(d3.csv, "../data/currency_exchange_v2.csv",parseEX)
    .await(function(err, fundingRounds, currencyEx){
        
        console.log(fundingRounds);
        console.log(currencyEx);
        
        var byCompany = d3.nest()
                                .key(function(d){return d.fundingRoundsID})
                                .map(fundingRounds,d3.map)
        
        stationLoc.entries().forEach(function(st){

            var xy = projection(st.value);
            ctx.strokeStyle='rgba(80,80,80,.1)';
            ctx.beginPath();
            ctx.arc(xy[0],xy[1],2,0,Math.PI*2);
            ctx.stroke();

        });

        //Animation
        var cf = crossfilter(trips),
            tripsByStartTime = cf.dimension(function(d){return d.startTime}),
            tripsByEndTime = cf.dimension(function(d){return d.endTime});


        var t = (new Date(2012,6,15)).getTime(),
            speed = 100000,
            scaleOpacity = d3.scale.linear().domain([0,86400000]).range([1,0]).clamp(true),
            scaleSize = d3.scale.sqrt().domain([0,600]).range([0,20]),
            linearGradient;

        draw();

        function draw(){
            ctx.clearRect(0,0,w,h);

            tripsByStartTime.filter([-Infinity,t]);
            tripsByEndTime.filter([t-86400000,Infinity]);


            //Draw stations
            stationLoc.entries().forEach(function(st){

                ctx.globalAlpha = .5;

                var xy = projection(st.value.lngLat);
                ctx.fillStyle='rgba(80,80,80,.5)';
                ctx.beginPath();
                ctx.arc(xy[0],xy[1],2,0,Math.PI*2);
                ctx.fill();

                ctx.strokeStyle='red';
                ctx.beginPath();
                ctx.beginPath();
                ctx.arc(xy[0],xy[1],scaleSize(st.value.origin),0,Math.PI*2);
                ctx.stroke();

                ctx.strokeStyle='blue';
                ctx.beginPath();
                ctx.beginPath();
                ctx.arc(xy[0],xy[1],scaleSize(st.value.dest),0,Math.PI*2);
                ctx.stroke();

            });


            //Draw trips
            tripsByStartTime.top(Infinity).forEach(function(_trip){
                if(!_trip.counted){
                    stationLoc.get(_trip.startStation).origin += 1;
                    stationLoc.get(_trip.endStation).dest += 1;
                }
                _trip.counted = true;

                var loc1 = projection( stationLoc.get(_trip.startStation).lngLat ),
                    loc2 = projection( stationLoc.get(_trip.endStation).lngLat ),
                    pct = (t - _trip.startTime)/(_trip.endTime - _trip.startTime)>1?1:(t - _trip.startTime)/(_trip.endTime - _trip.startTime);

                linearGradient = ctx.createLinearGradient(loc1[0],loc1[1],loc2[0],loc2[1]);
                linearGradient.addColorStop(0,'red');
                linearGradient.addColorStop(.5,'white');
                linearGradient.addColorStop(1,'blue');

                ctx.beginPath();
                ctx.strokeStyle = t>_trip.endTime?'rgba(80,80,80,.2)':linearGradient;
                ctx.globalAlpha = scaleOpacity(t - _trip.endTime);
                ctx.moveTo(loc1[0],loc1[1]);
                ctx.lineTo((loc2[0]-loc1[0])*pct+loc1[0], (loc2[1]-loc1[1])*pct+loc1[1]);
                ctx.stroke();
            });

            t += speed;

            window.requestAnimationFrame(draw);
        }
        
        
    })

function parse(d){
    if(+d.raised_amount<0) return;

    return {
        fundingRoundsID: d.funding_rounds,
        roundCode: d.round_code,
        raisedAmount: +d.raised_amount,
        currencyID: d.raised_currency_code,
        sourceURL: d.source_url,
        sourceDescription: d.source_description,
        fundingYear: +d.funded_year,
        fundingMonth: +d.funded_month,
        fundingDate: parseDate(+d.funded_year, +d.funded_month, +d.funded_day),
        fundCcompanyID: d.companies,
        fundOrganizationID: d.organizations,
        fundPeopleID: d.people,
        serialID: d.serialid
    }
}

function parseEX(d){
    return {
        year: d.YEAR,
        JPYEx: +d.JPY,
        SEKEx: +d.SEK,
        GBPEx: +d.GBP,
        EUREx: +d.EUR,
        NISEx: +d.NIS,
        CADEx: +d.CAD,
        USDEx: +d.USD,
        usdInflationRate: +d.USD_inflation
    }
}

function parseDate(year, month, day){
    return new Date(year, month-1, day);
}



