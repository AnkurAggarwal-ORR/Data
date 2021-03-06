const select = document.getElementById('year-select');

select.addEventListener('change', function handleChange(event) {

    update(event.target.value)

});

// set the dimensions and margins of the graph
var margin = {
        top: 30,
        right: 30,
        bottom: 70,
        left: 60
    },
    width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Initialize the X axis
var x = d3.scaleBand()
    .range([0, width])
    .padding(0.2);
var xAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")

// Initialize the Y axis
var y = d3.scaleLinear()
    .range([height, 0]);
var yAxis = svg.append("g")
    .attr("class", "myYaxis")


// A function that create / update the plot for a given variable:
function update(selectedVar) {

  var maxWinnings = 0;
  var minWinnings = 0;
  var addKeys = false;

  var groupBy = function(xs, key) {
      return xs.reduce(function(rv, x) {
          (rv[x[key]] = rv[x[key]] || []).push(x);
          return rv;
      }, {});
  };

  d3.csv("IPL20.csv", function(data) {
      var groupByYear = groupBy(data, 'year');
      var selectedData;
      if (selectedVar == 'All') {
          selectedData = data;
      } else {
          selectedData = groupByYear[selectedVar];
      }

      var filteredData = selectedData.filter((d) => {
          var winTeam = d['Winning_team'].toLowerCase().trim();
          var discard = winTeam.includes('match cancelled') || winTeam.includes('match tied') || winTeam.includes('no result');
          return !discard;
      })

      var grouped = groupBy(filteredData, 'Winning_team');



      if (keys.length == 0)
          addKeys = true;
      for (let key in teamWinningCount) {
          teamWinningCount[key] = 0;
      }

      for (let key in grouped) {
          if (addKeys)
              keys.push(teamAbb[key]);
          teamWinningCount[teamAbb[key]] = grouped[key].length;
          if (grouped[key].length > maxWinnings)
              maxWinnings = grouped[key].length
          if(minWinnings == 0)
             minWinnings = grouped[key].length
         else if(grouped[key].length < minWinnings && grouped[key].length != 0){
             minWinnings = grouped[key].length
         }
      }

      console.log(minWinnings);
      x.domain(keys);
      xAxis.transition().duration(1000).call(d3.axisBottom(x))
      y.domain([0, maxWinnings]);
      yAxis.transition().duration(1000).call(d3.axisLeft(y));
      var u = svg.selectAll("rect")
          .data(keys)
      var maxwinningX = 0;
      var maxwinningY = 0;
      var minwinningX = 0;
      var minwinningY = 0;
      // update bars
      u
          .enter()
          .append("rect")
          .merge(u)
          .transition()
          .duration(1000)
          .attr("x", function(d) {
              if(teamWinningCount[d] == maxWinnings){
                 maxwinningX = x(d);}
         if(teamWinningCount[d] == minWinnings){
                 minwinningX = x(d);}
              return x(d);
          })
          .attr("y", function(d) {
              return y(teamWinningCount[d]);
          })
          .attr("width", x.bandwidth())
          .attr("height", function(d) {
              if(teamWinningCount[d] == maxWinnings){
                 maxwinningY = y(teamWinningCount[d]);}
         if(teamWinningCount[d] == minWinnings){
                 minwinningY = y(teamWinningCount[d]);}
              return height - y(teamWinningCount[d]);
          })
          .attr("fill", "#69b3a2")
      console.log(minwinningX);
      console.log(minwinningY);
      const annotations = [
         {
            note: {
               label: "" + (selectedVar == 'All' ? 'Most wins' : 'Most wins (' + selectedVar +  ')' ) ,
               title: ""
            },
            x: maxwinningX + 25,
            y: maxwinningY,
            dy: -10,
            dx: 10
         }
      ]

      // Add annotation to the chart

     var annotationG = document.getElementById("annotationG")
      if( annotationG != null){
         annotationG.remove();
      }
      const makeAnnotations = d3.annotation()
      .annotations(annotations)
      svg.append("g").attr("id","annotationG")
      .call(makeAnnotations);
     
     const Minannotations = [
         {
            note: {
               label: "" + (selectedVar == 'All' ? 'Least wins' : 'Least wins (' + selectedVar +  ')' ) ,
               title: ""
            },
            x: minwinningX + 25,
            y: minwinningY,
            dy: -10,
            dx: 10
         }
      ]

      // Add annotation to the chart

     var annotationGMin = document.getElementById("annotationGMin")
      if( annotationGMin != null){
         annotationGMin.remove();
      }
      const makeAnnotationsMin = d3.annotation()
      .annotations(Minannotations)
      svg.append("g").attr("id","annotationGMin")
      .call(makeAnnotationsMin);
     const ChartLabel = [
         {
            note: {
               label: "# win By Team" ,
               title: ""
            },
            x: 740,
            y: 0
            }
      ]
     
     var annotationGLabel = document.getElementById("annotationGLabel")
      if( annotationGLabel != null){
         annotationGLabel.remove();
      }
      const makeAnnotationsLabel = d3.annotation()
      .annotations(ChartLabel)
      svg.append("g").attr("id","annotationGLabel")
      .call(makeAnnotationsLabel);
     
  })
}

// Initialize plot
var keys = [];
var teamWinningCount = {};
const teamAbb = {
  'Sunrisers Hyderabad': 'S. Hyderabad',
  'Royal Challengers Bangalore': 'RC Bangalore',
  'Rajasthan Royals': 'Rajashthan R.',
  'Pune Warriors': 'Pune W.',
  'Mumbai Indians': 'Mumbai Ind.',
  'Kings XI Punjab': 'KXI Punjab',
  'Kochi Tuskers Kerala': 'Kochi T.K.',
  'Kolkata Knight Riders': 'Kolkata K.R.',
  'Gujarat Lions': 'Gujrat L.',
  'Delhi Daredevils': 'Delhi D.',
  'Deccan Chargers': 'Deccan C.',
  'Chennai Super Kings': 'Chennai S.K.'
};
update('All');
   // Features of the annotation

