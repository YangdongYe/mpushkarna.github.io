var n = 16, // number of layers
    m = 20, // number of samples per layer
    stack = d3.layout.stack().offset("zero");
    
var stm = d3.range(n).map(function() { return bumpLayer(m);
    layers0 = stack(stm),
    layers1 = stack(stm);

var width = 960,
    height = 500;

var x = d3.scale.linear()
    .domain([0, m - 1])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, d3.max(layers0.concat(layers1), function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
    .range([height, 0]);

var color = d3.scale.linear()
    .range(["#aad", "#556"]);

var area = d3.svg.area()
    .x(function(d) { 
        console.log(d);
        return x(d.x); })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.y0 + d.y); });

var svg = d3.select(".plot").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.selectAll("path")
    .data(layers0)
  .enter().append("path")
    .attr("d", area)
    .style("fill", function() { return color(Math.random()); });


// Inspired by Lee Byron's test data generator.
function bumpLayer(n) {

  function bump(a) {
    var x = 1 / (.1 + Math.random()),
        y = 2 * Math.random() - .5,
        z = 10 / (.1 + Math.random());
    for (var i = 0; i < n; i++) {
      var w = (i / n - y) * z;
      a[i] += x * Math.exp(-w * w);
    }
  }

  var a = [], i;
  for (i = 0; i < n; ++i) a[i] = 0;
  for (i = 0; i < 5; ++i) bump(a);
  return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
}
