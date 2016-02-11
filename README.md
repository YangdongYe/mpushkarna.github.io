# Specification for d3.timeSeries()

- d3.**timeSeries**()

  Create a new time series module with default configurations

- **timeSeries**(*selection*)

  Apply the time series to a selection. The selection must be a `div` element with an array of time objects bound to it. An example might look like:
  ```
  var selection = d3.append('div')
    .datum(someData);
    
  timeSeries(selection);
  ```
  ...which is exactly the same as
  ```
  d3.append('div')
    .datum(someData)
    .call(timeSeries);
  ```

- **timeSeries**.width([*w*]), **timeSeries**.height([*h*])

  Gets or sets the width/height of the time series chart. *w* and *h* are numbers. If *w* or *h* is not specified, return the current width and height
  
- **timeSeries**.value(*accessor*)

  Gets or sets the current value accessor. The value accessor is invoked for each element in the data array. 
  
- **timeSeries**.timeRange([*start*,*end*])

  Gets or sets the time range of the time series. *start* and *end* are javascript `Date` objects.
  
- **timeSeries**.binSize(*interval*)

  Gets or sets the time interval based on which the time series aggregates records. *interval* is a `d3.time.interval* object.

