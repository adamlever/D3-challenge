// Set up SVG and chart areas
// ==================================

// Set width and height of SVG
var svgWidth = 750;
var svgHeight = 500;

// Set margins for the chart
var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

// Set chart width and height
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, 
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append a group to the svg for the chart and shift it by left and top margins.
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Set initial x and y axis paramameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";


// Set up functions
// ==================================

// Scale functions used for updating x and y axis var upon click on axis label
function xScale(censusData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
      
    return xLinearScale;
}

function yScale(censusData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenYAxis]) - 1,
        d3.max(censusData, d => d[chosenYAxis]) + 1
      ])
      .range([height, 0]);

    return yLinearScale;
}

// Render functions used for updating x and y axis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
      xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
  
    return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale); 
      yAxis.transition()
        .duration(1000)
        .call(leftAxis);
  
    return yAxis;
}

// Render functions used for updating circles with transition to new x and y coordinates
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
  
    return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// Render functions used for updating circles text with transition to new x and y coordinates
function renderXText(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderYText(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("dy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// Function used for updating ToolTip and displaying on 'mouseon' and dissappering on 'mouseout'
function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {

    var xlabel = "";
    var xpercentsign = ""
  
    if (chosenXAxis === "poverty") {
        xlabel = "Poverty";
        xpercentsign = "%";
    }
    else if (chosenXAxis === "age") {
        xlabel = "Age";
        xpercentsign = "";
    }
    else {
        xlabel = "Income";
        xpercentsign = "";
      }
    
    var ylabel = "";
    var ypercentsign = ""

    if (chosenYAxis === "healthcare") {
        ylabel = "Healthcare";
        ypercentsign = "%";
    }
    else if (chosenYAxis === "smokes") {
        ylabel = "Smokes";
        ypercentsign = "%";
    }
    else {
        ylabel = "Obesity";
        ypercentsign = "%";
    }
  
    var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([45, -65])
      .html(function(d) {
          return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}${xpercentsign}
          <br>${ylabel}: ${d[chosenYAxis]}${ypercentsign}`);
      });
   
    circlesGroup.call(toolTip);
    
    // Create on mouseover event
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
    // Create on mouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data, this);
    });

    return circlesGroup;
}


// Loading data and running functions
// ==================================

// Load data from data.csv
d3.csv("D3_data_journalism/assets/data/data.csv").then(function(censusData) {

    // // Console log the censusData
    console.log(censusData);

    // Parse Data/Cast as numbers
    censusData.forEach(function(data) {
      data.poverty    = +data.poverty;
      data.age        = +data.age;
      data.income     = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity    = +data.obesity;    
      data.smokes     = +data.smokes;
    });

    // Initialise scale functions
    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = yScale(censusData, chosenYAxis);
    
    // Create axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x and y axes to the chart in a group
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
    
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);
    
    // Create initial Circles
    var circlesGroup = chartGroup.selectAll("g circle")
      .data(censusData)
      .enter()
      .append("g")

    var circlesXY = circlesGroup.append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", "10")
      .attr("class", "stateCircle")
      .attr("opacity", "0.5");

    // Create circle labels
    var circleLabels = chartGroup.selectAll(null)
      .data(censusData)
      .enter() 
      .append("text")
      .text(d => d.abbr)
      .attr("dx", d => xLinearScale(d[chosenXAxis]))
      .attr("dy", d => yLinearScale(d[chosenYAxis]))
      .attr("class", "stateText")
      .attr("font-size", "10px");
      
    // Create group for x-axis labels and append the labels to it
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "poverty") // Value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "age") // Value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median):");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 80)
        .attr("value", "income") // Value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");
    
    // Create group for y-axis labels and append the labels to it
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

    var healthcareLabel = ylabelsGroup.append("text")
        .attr("y", 40 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare") // Value to grab for event listener
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("y", 20 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "smokes") // Value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

    var obesityLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity") // Value to grab for event listener
        .classed("inactive", true)
        .text("Obesity (%)");
    
    // UpdateToolTip function above csv import
    var circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

    // Sets X axis labels event listener on mouse click
    xlabelsGroup.selectAll("text")
      .on("click", function() {

        // Get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

        // Console log chosen value
        console.log(value)

        // Set chosenXAxis with value
        chosenXAxis = value;

        // Updates x scale with new chosenXaxis data
        xLinearScale = xScale(censusData, chosenXAxis);

        // Updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // Updates circles with new x axis values
        circlesXY = renderXCircles(circlesXY, xLinearScale, chosenXAxis);

        // Updates circles text with new x values
        circleLabels = renderXText(circleLabels, xLinearScale, chosenXAxis);

        // Updates tooltips with new x values
        circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

        // Changes classes to show only the chosen X axis label in bold text
        if (chosenXAxis === "poverty") {
            povertyLabel
            .classed("active", true)
            .classed("inactive", false);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", true)
            .classed("inactive", false);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

    // Sets Y axis labels event listener on mouse click
    ylabelsGroup.selectAll("text")
      .on("click", function() {

        // Get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

        // Console log chosen value
        console.log(value)

        // Set chosenYAxis with value
        chosenYAxis = value;

        // Updates y scale with new chosenYaxis data
        yLinearScale = yScale(censusData, chosenYAxis);

        // Updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // Updates circles with new y axis values
        circlesXY = renderYCircles(circlesXY, yLinearScale, chosenYAxis);
        
        // Updates circles text with new y axis values
        circleLabels = renderYText(circleLabels, yLinearScale, chosenYAxis);

        // Updates tooltips with new y axis values
        circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

        // Changes classes to show only the chosen Y axis label in bold text
        if (chosenYAxis === "healthcare") {
            healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
            smokesLabel
            .classed("active", false)
            .classed("inactive", true);
            obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
            healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", true)
            .classed("inactive", false);
            obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
            healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", false)
            .classed("inactive", true);
            obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) { // Catch and log any errors
    console.log(error);
});

