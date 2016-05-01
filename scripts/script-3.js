var m = {t:50,r:100,b:50,l:100},
    w = d3.select('#plot').node().clientWidth,
    h = d3.select('#plot').node().clientHeight,
    color10 = d3.scale.category10(),
    color20 = d3.scale.category20();

var nn = 16, // number of layers
    mm = 20, // number of samples per layer
    stack = d3.layout.stack().offset("zero"),
    layers0,
    layers1,
    layer;

var dataFlowRound = [], dM=[];
var a = {x:0,y:0};

for (var j=0;j<20;j++){
    dM.push(a);
}
        
for (var i=0;i<16;i++) {
    dataFlowRound.push(dM);
}

console.log('111111111;',dataFlowRound)
        

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
        
        //Flow Diagram                  
               
//        for (var i=0;i<byYear.length;i++){
//            var _d = byYear[i].values;
//            var valueY;
//            
//            if (_d.roundCode == 'a') {
//                return layer.map(function(d,_i) { return {x: 0, y: y+_d}; })
//            }
//        }
        
//        dataFlow = stack(d3.range(nn).map(function() { return roundLayer(mm); }))
        
                      
        for (var i=0;i<fundingRounds.length;i++) {
            
            if (fundingRounds[i].roundCode == 'a') {
                dataFlowRound[0][fundingRounds[i].fundingYear-1994].y += fundingRounds[i].raisedAmount
            } else if (fundingRounds[i].roundCode == 'angel') {
                dataFlowRound[1][fundingRounds[i].fundingYear-1994].y += fundingRounds[i].raisedAmount
            } else if (fundingRounds[i].roundCode == 'b') {
                dataFlowRound[2][fundingRounds[i].fundingYear-1994].y += fundingRounds[i].raisedAmount
            } else if (fundingRounds[i].roundCode == 'c') {
                dataFlowRound[3][fundingRounds[i].fundingYear-1994].y += fundingRounds[i].raisedAmount
            } else if (fundingRounds[i].roundCode == 'd') {
                dataFlowRound[4][fundingRounds[i].fundingYear-1994].y += fundingRounds[i].raisedAmount
            } else if (fundingRounds[i].roundCode == 'debt_round') {
                dataFlowRound[5][fundingRounds[i].fundingYear-1994].y += fundingRounds[i].raisedAmount
            } else if (fundingRounds[i].roundCode == 'e') {
                dataFlowRound[6][fundingRounds[i].fundingYear-1994].y += fundingRounds[i].raisedAmount
            } else if (fundingRounds[i].roundCode == 'f') {
                dataFlowRound[7][fundingRounds[i].fundingYear-1994].y += fundingRounds[i].raisedAmount
            } else if (fundingRounds[i].roundCode == 'g') {
                dataFlowRound[8][fundingRounds[i].fundingYear-1994].y += fundingRounds[i].raisedAmount
            } else if (fundingRounds[i].roundCode == 'grant') {
                dataFlowRound[9][fundingRounds[i].fundingYear-1994].y += fundingRounds[i].raisedAmount
            } else if (fundingRounds[i].roundCode == 'post_ipo_debt') {
                dataFlowRound[10][fundingRounds[i].fundingYear-1994].y += fundingRounds[i].raisedAmount
            } else if (fundingRounds[i].roundCode == 'post_ipo_equity') {
                dataFlowRound[11][fundingRounds[i].fundingYear-1994].y += fundingRounds[i].raisedAmount
            } else if (fundingRounds[i].roundCode == 'private_equity') {
                dataFlowRound[12][fundingRounds[i].fundingYear-1994].y += fundingRounds[i].raisedAmount
            } else if (fundingRounds[i].roundCode == 'seed') {
                dataFlowRound[13][fundingRounds[i].fundingYear-1994].y += fundingRounds[i].raisedAmount
            } else if (fundingRounds[i].roundCode == 'unattributed') {
                dataFlowRound[14][fundingRounds[i].fundingYear-1994].y += fundingRounds[i].raisedAmount
            } else {
                dataFlowRound[15][fundingRounds[i].fundingYear-1994].y += fundingRounds[i].raisedAmount
            }
        }
//        
//        console.log('hisdata',layers1);
//
        console.log('mydata',dataFlowRound)
//        
        layers0 = stack(dataFlowRound);
        layers1 = stack(dataFlowRound);
        
//        layers0 = stack(d3.range(nn).map(function() { return bumpLayer(mm,fundingRounds); })),
//        layers1 = stack(d3.range(nn).map(function() { return bumpLayer(mm,fundingRounds); }));
        
        console.log(layers0)
        
        var x = d3.scale.linear()
                .domain([0, mm])
                .range([0, w]);
        var y = d3.scale.linear()
                .domain([0, d3.max(layers0.concat(layers1), function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
                .range([h, 0]);

        var color = d3.scale.linear()
            .range(["#aad", "#556"]);

        var area = d3.svg.area()
            .x(function(d) { 
                return x(d.x); })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); });

        var svg = d3.select(".plot").append("svg")
            .attr("width", w)
            .attr("height", h);

        svg.selectAll("path")
            .data(layers0)
            .enter().append("path")
            .attr("d", area)
            .style("fill", function() { return color(Math.random()); });
    
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

function bumpLayer(n,_dd) {
 
  function bump(a,dd) {
    var x = 1 / (.1 + Math.random()),
        y = 2 * Math.random() - .5,
        z = 10 / (.1 + Math.random());
    for (var i = 0; i < nn; i++) {
      var w = (i / nn - y) * z;
      a[i] += x * Math.exp(-w * w);
    }
      
//        for (var j=0;j<dd.length;j++) {
//            
//            if (dd[j].roundCode == 'a') {
//                a[0] += dd[j].raisedAmount
//            } else if (dd[j].roundCode == 'angel') {
//                a[1] += dd[j].raisedAmount
//            } else if (dd[j].roundCode == 'b') {
//                a[2] += dd[j].raisedAmount
//            } else if (dd[j].roundCode == 'c') {
//                a[3] += dd[j].raisedAmount
//            } else if (dd[j].roundCode == 'd') {
//                a[4] += dd[j].raisedAmount
//            } else if (dd[j].roundCode == 'debt_round') {
//                a[5] += dd[j].raisedAmount
//            } else if (dd[j].roundCode == 'e') {
//                a[6] += dd[j].raisedAmount
//            } else if (dd[j].roundCode == 'f') {
//                a[7] += dd[j].raisedAmount
//            } else if (dd[j].roundCode == 'g') {
//                a[8] += dd[j].raisedAmount
//            } else if (dd[j].roundCode == 'grant') {
//                a[9] += dd[j].raisedAmount
//            } else if (dd[j].roundCode == 'post_ipo_debt') {
//                a[10] += dd[j].raisedAmount
//            } else if (dd[j].roundCode == 'post_ipo_equity') {
//                a[11] += dd[j].raisedAmount
//            } else if (dd[j].roundCode == 'private_equity') {
//                a[12] += dd[j].raisedAmount
//            } else if (dd[j].roundCode == 'seed') {
//                a[13] += dd[j].raisedAmount
//            } else if (dd[j].roundCode == 'unattributed') {
//                a[14] += dd[j].raisedAmount
//            } else {
//                a[15] += dd[j].raisedAmount
//            }
//        }
//      
//      for (var j=1;j<length.a;j++) {
//          for (var k=0;k<j;k++) {
//              a[j] = a[j] + a[k];
//          }
//      }
//      console.log('1111',a)
  }

  var a = [], i;
  for (i = 0; i < n; ++i) a[i] = 0;
  for (i = 0; i < 5; ++i)bump(a,_dd);
    console.log(a);
  return a.map(function(d, i) { 
      return {x: i, y: a[i]};})
}


