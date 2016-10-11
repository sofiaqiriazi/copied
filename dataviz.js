// wider scope for these charts so that we can reference them from the reset and filter utility functions
var yearRowChart;
var monthRowChart;
var dayRowChart;
var bubbleChart;
var countByDateBarChart;
var dataTable;

// load the data file
d3.csv("data/ppr-hans.csv", function(unhcrstats) {

	// associate the charts with their html elements
	yearRowChart = dc.rowChart("#chart-ring-years");
	monthRowChart = dc.rowChart("#chart-row-months");
	dayRowChart = dc.rowChart("#chart-row-days");
	bubbleChart = dc.bubbleChart("#chart-bubble-counties");

	// we'll need to display month names rather than 0-based index values

	// normalise the data

	// use cross filter to create the dimensions and grouping
	var ppr = crossfilter(unhcrstats);
	
	var yearDim = ppr.dimension(function(d) {
			return d.access;
		});
	
	var countPerYear = yearDim.group().reduceCount();

	var	dayDim = ppr.dimension(function(d) {
			return d.ccenter;
		});
		
	var countPerDay = dayDim.group().reduceCount();

	var	monthDim = ppr.dimension(function(d) {
			return d.budget;
		});
		
	var	countPerMonth = monthDim.group().reduceCount();

	var	countyDim = ppr.dimension(function(d) {
			return d.x;
		});

		
	var	countyDimGroup = countyDim.group().reduce(
    function(p, v) {
        ++p.count;
        p.label = v.location;
        p.bubble = v.bubble;
        p.x = v.x;
        p.y = v.y;
        
        return p;
    },
    function(p, v) {
        --p.count;
        p.bubble = 0;
        p.label = "";
        p.x = 0;
        p.y = 0;
        
        return p;
    }, function() {
        return { count: 0, x: 0, y:0, label: "" };
    });
var minDate = countyDim.bottom(1)[0];
var maxDate = countyDim.top(1)[0];
var xRange = [0, 100],
    yRange = [0, 300];


	// configure the charts
	yearRowChart
		.width(300)
		.height(250)
		.dimension(yearDim)
		.group(countPerYear)
		.colors(d3.scale.category10())
		.label(function(d) {
			return d.key;
		})
		.title(function(d) {
			return d.key + ' / ' + d.value;
		})
		.elasticX(true)
		.xAxis().ticks(0);

	dayRowChart
		.width(300)
		.height(250)
		.dimension(dayDim)
		.group(countPerDay)
		.colors(d3.scale.category10())
		.label(function(d) {
			return d.key;
		})
		.title(function(d) {
			return d.key + ' / ' + d.value;
		})
		.elasticX(true)
		.xAxis().ticks(0);

	monthRowChart
		.width(300)
		.height(350)
		.dimension(monthDim)
		.group(countPerMonth)
		.colors(d3.scale.category10())
		.label(function(d) {
			return d.key;
		})
		.title(function(d) {
			return d.key + ' / ' + d.value;
		})
		.elasticX(true)
		.xAxis().ticks(0);

bubbleChart
	.dimension(countyDim)
	.group(countyDimGroup)
 //             .x(d3.time.scale()
 //                   .domain([minDate, maxDate])
  //                  .nice(d3.time.day)
                    //.range(xRange))
  //                  )
	.x(d3.scale.linear().domain(xRange))
	.y(d3.scale.linear().domain(yRange))
	
	.width(1000)
    .height(500)
    .margins({
			top: 50,
			right: 0,
			bottom: 40,
			left: 40
		})
    .yAxisPadding(50)
    .xAxisPadding(50)
    .xAxisLabel('')
    .yAxisLabel('')
    .label(function (p) {
        return p.value.label;
    })
    .renderLabel(true)
    .title(function (p) {
        
        return [
               "x: " + p.value.x,
               "y: " + p.value.y,
               "Bubble: " + p.value.bubble,
               ]
               .join("\n");
    })
    .renderTitle(false)
    .renderHorizontalGridLines(false) // (optional) render horizontal grid lines, :default=false
    .renderVerticalGridLines(false)
    .maxBubbleRelativeSize(0.3)
    .keyAccessor(function (p) {

        return p.value.x;
    })
    .valueAccessor(function (p) {
        return p.value.y;
    })
    .radiusValueAccessor(function (p) {
        return p.value.bubble;
    });


		// create a counter and bind it to the named element  
		var all = ppr.groupAll();
		dc.dataCount("#info-data-count")
			.dimension(ppr)
			.group(all);

		// number display for Euro amounts 
		Number.prototype.toEuroAmount = function() {
			var decPlaces = 2;
			var thouSeparator = ',';
			var decSeparator = '.';
			var currencySymbol = '\u20AC';

			var n = this,
				sign = n < 0 ? "-" : "",
				i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
				j = (j = i.length) > 3 ? j % 3 : 0;

			return sign + currencySymbol + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
		};
	
	// hit it!	
	dc.renderAll();
	
});

// reset all charts
function reset() {
	bubbleChart.filterAll();
	yearRowChart.filterAll();
	monthRowChart.filterAll();
	dayRowChart.filterAll();
	dc.redrawAll();
};

// ---------------------------------------------------------
// some (deliberately) noddy functions to showcase filtering
// ---------------------------------------------------------

function filterDays(filters) {
	reset();
	for (var i = 0; i < filters.length; i++) {
		dayRowChart.filter(filters[i]);	
	}
	dc.redrawAll();
}

function filterMonths(filters) {
	reset();
	for (var i = 0; i < filters.length; i++) {
		monthRowChart.filter(filters[i]);	
	}
	dc.redrawAll();
}

function filterYears(filters) {
	reset();
	for (var i = 0; i < filters.length; i++) {
		yearRowChart.filter(filters[i]);	
	}
	dc.redrawAll();
}

function filterBubble(filters) {
	reset();
	for (var i = 0; i < filters.length; i++) {
		bubbleChart.filter(filters[i]);	
	}
	dc.redrawAll();
}

function filterCountyByYear(county, year) {
	reset();
	bubbleChart.filter(county);
	yearRowChart.filter(year);
	dc.redrawAll();	
}