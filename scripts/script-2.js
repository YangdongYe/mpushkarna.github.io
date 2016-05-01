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

var queue = d3_queue.queue()
    .defer(d3.csv, "../data/Crunchbase_FundingRounds_Final.csv",parse)
    .defer(d3.csv, "../data/currency_exchange_v2.csv",parseEX)
    .await(function(err, fundingRounds, currencyEx){
        
        console.log(fundingRounds);
        console.log(currencyEx);
        
        var scaleX = d3.time.scale().domain([new Date(1993,0,1),new Date(2013,11,31)]).range([0,w]),
            scaleY = d3.scale.log().domain(d3.extent(fundingRounds,function(d){return d.raisedAmount})).range([h,0]);
        
        //Exchange
        var valueUSDOY = [],
            valueUSD2016 = [],
            valueNative2016 = [];
        for (var i=0;i<fundingRounds.length;i++){
            
            var di = fundingRounds[i],
                diKey = fundingRounds[i].fundingYear-1993;
            
            if (di.currencyID == 'USD') {valueUSDOY[i] = di.raisedAmount;};
            if (di.currencyID == 'JPY') {valueUSDOY[i] = di.raisedAmount / (currencyEx[diKey].JPYEx);};
            if (di.currencyID == 'SEK') {valueUSDOY[i] = di.raisedAmount / (currencyEx[diKey].SEKEx);};
            if (di.currencyID == 'GBP') {valueUSDOY[i] = di.raisedAmount / (currencyEx[diKey].GBPEx);};
            if (di.currencyID == 'EUR') {valueUSDOY[i] = di.raisedAmount / (currencyEx[diKey].EUREx);};
            if (di.currencyID == 'NIS') {valueUSDOY[i] = di.raisedAmount / (currencyEx[diKey].NISEx);};
            if (di.currencyID == 'CAD') {valueUSDOY[i] = di.raisedAmount / (currencyEx[diKey].CADEx);};
            
            valueUSD2016[i] = valueUSDOY[i] / (currencyEx[diKey].usdInflationRate)
        }
        
        var min = d3.min(fundingRounds,function(d){return d.raisedAmount}),
            max = d3.max(fundingRounds,function(d){return d.raisedAmount});
        
        var axisX = d3.svg.axis()
            .orient('bottom')
            .scale(scaleX)
            .ticks(d3.time.year)
            .tickFormat(function(v){
                return v.getFullYear();
            });
        
        var axisY= d3.svg.axis() 
            .orient('left') 
            .scale(scaleY)  
            .ticks(4)   
            .tickFormat(d3.format("s"));
        
        plot.append('g')
            .attr('class','axis axis-x')
            .attr('transform','translate(0,'+h+')')
            .call(axisX);
        
        plot.append('g')
            .attr('class','axis axis-y')
            .attr('transform','translate(0,0)')
            .call(axisY);
        
        //Default: native currency in origin year
        var points = plot.selectAll('.point')
            .data(fundingRounds)
            .enter()
            .append('circle').attr('class','point')
            .attr('cx',function(d){return scaleX(d.fundingDate);})
            .attr('cy',function(d){return scaleY(d.raisedAmount);})
            .attr('r',2)
            .style('fill',function(d){return color10(d.currencyID);})
            .style('fill-opacity',.5)
            .on('mouseenter', onMouseEnter)
            .on('mouseleave', onMouseLeave);
        
        //Set Year       
        d3.select('.year-list').on('change',function(){
            globalDispatcher.yearchange(this.value);
        });
        globalDispatcher.on('yearchange',function(id){
            
            var _d = [];
            
            if (id == 0) {
                for (var i=0;i<fundingRounds.length;i++) {
                    _d[i] = fundingRounds[i].raisedAmount;
                }
            };
            if (id == 1) {_d = valueUSDOY};
            if (id == 2) {_d = valueUSD2016};
 
            points.transition().duration(250)
                .attr('cy', function(d,i){
                    return scaleY(_d[i]);
                })
                .style('fill-opacity',function(d,i){
                    if (_d[i] >= min) {
                        return 0.5;
                    }else{
                        return 0;
                    }
                });
        });
        
        //Set Color
        
        //Curreny
        d3.select('#currency').on('click',function(){
            points.transition().duration(250)
                .style('fill',function(d){return color10(d.currencyID);})
        })
        
        //Rounds
        d3.select('#round').on('click',function(){
            points.transition().duration(250)
                .style('fill',function(d){return color20(d.roundCode);})
        })
    
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

function onMouseEnter(d){
  
    var xy = d3.mouse(d3.select('.plot').node());
    
    var id = '', //string spacer
        idHeight = 0,
        gapTooltips = 0;
    
    if (d.fundCcompanyID != ''){ id = id + d.fundCcompanyID + ' ';} //initial '' is empty, ' ' represents spacer
    if (d.fundOrganizationID != ''){ id = id + d.fundOrganizationID + ' ';}
    if (d.fundPeopleID != ''){ id = id + d.fundPeopleID + ' ';}
    
    if (d.fundingRoundsID != ''){
        d3.select('.custom-tooltip-fundingRoundsID')
            .style('visibility','visible')
            .style('left',(xy[0]+10)+'px')
            .style('top',(xy[1]+10)+'px');
        d3.select('.custom-tooltip-fundingRoundsID')
            .select('h2')
            .html(d.fundingRoundsID);
        
        gapTooltips += 1;
    }
    
    if (id != ''){
        console.log("1 "+d.fundCcompanyID+" 2 "+d.fundOrganizationID+" 3 "+d.fundPeopleID);
        
        d3.select('.custom-tooltip-id')
            .attr('id','idTooltip')
            .style('visibility','visible')
            .style('left',(xy[0]+10)+'px')
            .style('top',(xy[1]+10+(gapTooltips*20))+'px');
        d3.select('.custom-tooltip-id')
            .select('h2')
            .html(id);
        
        idHeight = document.getElementById('idTooltip').offsetHeight - 8;
    }
    
    d3.select('.custom-tooltip-raisedAmount')
        .style('visibility','visible')
        .style('left',(xy[0]+10)+'px')
        .style('top',(xy[1]+10+(gapTooltips*20)+idHeight)+'px');
    d3.select('.custom-tooltip-raisedAmount')
        .select('h2')
        .html(d.currencyID + " " + d.raisedAmount);
    gapTooltips += 1;
    
    if (d.roundCode != ''){
        d3.select('.custom-tooltip-round')
            .style('visibility','visible')
            .style('left',(xy[0]+10)+'px')
            .style('top',(xy[1]+10+(gapTooltips*20)+idHeight)+'px');
        d3.select('.custom-tooltip-round')
            .select('h2')
            .html("Round " + d.roundCode);
        
        gapTooltips += 1;
    }
    
//    d3.select('.custom-tooltip-raisedAmountUSD')
//        .style('visibility','visible')
//        .style('left',(xy[0]+10)+'px')
//        .style('top',(xy[1]+10+(gapTooltips*20)+idHeight)+'px');
//    d3.select('.custom-tooltip-raisedAmount')
//        .select('h2')
//        .html("USD " + d.raisedAmount);
//    gapTooltips += 1;
    
    d3.select('.custom-tooltip-date')
        .style('visibility','visible')
        .style('left',(xy[0]+10)+'px')
        .style('top',(xy[1]+10+(gapTooltips*20)+idHeight)+'px');
    d3.select('.custom-tooltip-date')
        .select('h2')
        .html(d.fundingYear + "-" + d.fundingMonth);
    gapTooltips += 1;
}

function onMouseLeave(d){
    d3.select('.custom-tooltip-fundingRoundsID')
        .style('visibility','hidden');
    d3.select('.custom-tooltip-id')
        .style('visibility','hidden');
    d3.select('.custom-tooltip-raisedAmount')
        .style('visibility','hidden');
    d3.select('.custom-tooltip-round')
        .style('visibility','hidden');
    d3.select('.custom-tooltip-raisedAmountUSD')
        .style('visibility','hidden');
    d3.select('.custom-tooltip-date')
        .style('visibility','hidden');
//    d3.select('.custom-tooltip-sourceURL')
//        .style('visibility','hidden');
}

