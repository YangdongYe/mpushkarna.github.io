/*ORIGINAL SCRIPT*/

/*ORIGINAL SCRIPT*/
var w = d3.select('#currencyNative.plot ').node().clientWidth,
     h = d3.select('#currencyNative.plot ').node().clientHeight;

var m = {t:10,r:10,b:30,l:10},
    // w = 500,
    // h = 300,
    chartW = w - m.l - m.r,
    chartH = h - m.t - m.b,
    timeRange = [new Date(), new Date()],
    scaleX = d3.time.scale().range([0,chartW]),
    scaleY = d3.scale.log().range([0,chartH]),
    color10 = d3.scale.category10(),
    color20 = d3.scale.category20();
    var color20c = d3.scale.category20c(),
        color20b = d3.scale.category20b();

var plot = d3.select('.plot')
    .append('svg')
    .attr('width',chartW)
    .attr('height',chartH)
    .append('g').attr('class','histogram')
    .attr('transform','translate('+m.l+','+m.t+')');

var queue = d3_queue.queue()
    .defer(d3.csv, "../00_PlainCode/data/Crunchbase_FundingRounds_Final_V2.csv",parse)
    .defer(d3.csv, "../00_PlainCode/data/currency_exchange_v2.csv",parseEX)
    .await(dataLoaded);


function parse(d){
    if(+d.raised_amount<0) return;

    return {
        fundingRoundsID: d.funding_rounds,
        roundCode: d.round_code,
        raisedAmount: +d.raised_amount,
        currencyCode: d.raised_currency_code,
        sourceURL: d.source_url,
        sourceDescription: d.source_description,
        fundingDate: parseDate(+d.funded_year, +d.funded_month),
        fundingYear: d.funded_year,
        fundingMonth: d.funded_month,
        fundCompany: d.companies,
        fundOrganization: d.organizations,
        fundPeople: d.people,
        serialID: d.serialid,
        nativeCurrencyOrgYear: +d.NC_OriginalYear,
        usdThisYear: +d.USD_2016
    }
}

function parseEX(d){
    return {
        year: d.YEAR,
        jpyEx: +d.JPY,
        sekEx: +d.SEK,
        gbpEx: +d.GBP,
        eurEx: +d.EUR,
        nisEx: +d.NIS,
        cadEx: +d.CAD,
        usdEx: +d.USD,
        usdInflationRate: +d.USD_inflation
    }
}

function parseDate(year, month){
    return new Date(year, month-1);
}

function dataLoaded(err, fundingRounds, currencyEx){
    console.log(fundingRounds);
    console.log(currencyEx);
//nest by CurrencyCode
    var byCurrencyCode = d3.nest()
        .key(function(d){return d.currencyCode})
        .entries(fundingRounds);

console.log(byCurrencyCode);
        
    var amountExtent = d3.extent(fundingRounds,function(d){return d.raisedAmount}),
        timeRange = [new Date(1993,0,1),new Date(2013,11,31)];
        scaleX.domain(timeRange);
        scaleY.domain(amountExtent);

        var axisX = d3.svg.axis()
            .orient('bottom')
            .scale(scaleX)
            .ticks(d3.time.year)
            .tickFormat(function(v){
                return v.getFullYear();
            });

        var axisY= d3.svg
                        .axis() 
                        .orient('left') 
                        .scale(scaleY)  
                        .ticks(4)   
                        .tickFormat(d3.format("g"));

        plot.append('g')
            .attr('class','axis axis-x')
            .attr('transform','translate('+m.l+','+(chartH-40)+')')
            .call(axisX);

        plot.append('g')
            .attr('class','axis axis-y')
            .attr('transform','translate('+m.l+',40)')
            .call(axisY);
        
        var dot = plot.selectAll('.dot')
                    .data(fundingRounds)
                    .enter()
                    .append('circle')
                    .attr('class','dot')
                    .attr('cx',function(d){ return scaleX(d.fundingDate)})
                    .attr('cy',function(d){ return chartH-40-scaleY(d.nativeCurrencyOrgYear)})
                    .attr('r',2)
                    .attr('transform','translate(0,0)')
                    .style('fill',function(d){return color20c(d.roundCode);})
                    .style('fill-opacity',.7);
    
}








