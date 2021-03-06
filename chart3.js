// set the dimensions and margins of the graph
var margin = {top: 60, right: 100, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;



//Read the data
const select = document.getElementById('year-select');
select.addEventListener('change', function handleChange(event) {
    render(event.target.value)
});
    
function render(selectedVar) {
    var groupBy = function(xs, key) {
        return xs.reduce(function(rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };
    d3.csv("IPL20.csv", function(data) {
    	// append the svg object to the body of the page
	d3.select("svg").remove();
	var svg = d3.select("#my_dataviz")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform",
		"translate(" + margin.left + "," + margin.top + ")");
	var groupByYear = groupBy(data, 'year');
	var selectedData;
	if (selectedVar == 'All') {
		selectedData = data;
	} else {
		selectedData = groupByYear[selectedVar];
	}
	
	
	const tossWinners = new Set();
	const MatchWinners = new Set();
	var filteredData = selectedData.filter((d) => {
		var winTeam = d['Winning_team'].toLowerCase().trim();
		var discard = winTeam.includes('match cancelled') || winTeam.includes('match tied') || winTeam.includes('no result');
		return !discard;
	})	    
   	for(let temp of filteredData){
		temp.Toss_Match_Winner = (temp.Toss_winner == temp.Winning_team);
		tossWinners.add(temp.Toss_winner);
		MatchWinners.add(temp.Winning_team);
    	}
	var grpBytossWinners = groupBy(filteredData, 'Toss_winner');
	var grpByMatchWinners = groupBy(filteredData, 'Winning_team');
	var finalData = [];
	var maxMatchWins = 0;
	var maxTosswins = 0;
	console.log(grpBytossWinners);
	for(let currentTossWinner in grpBytossWinners){
		var currentData = {};
		let grpByWins = groupBy(grpBytossWinners[currentTossWinner], 'Toss_Match_Winner');
		
		currentData.tossWon = grpBytossWinners[currentTossWinner].length;
		currentData.TeamName = currentTossWinner;
		currentData.MatchesWon = grpByMatchWinners[currentTossWinner].length;
		
		currentData.MatchesWonTosswin = grpByWins.true != undefined && grpByWins.true != null && grpByWins.true.length > 0 ? grpByWins.true.length :0;
		currentData.MatchesLostTosswin = grpByWins.false != undefined && grpByWins.false != null && grpByWins.false.length > 0 ? grpByWins.false.length :0;
		if(maxTosswins < currentData.tossWon)
			maxTosswins = currentData.tossWon ;
		
		if(maxMatchWins < currentData.MatchesWonTosswin)
			maxMatchWins = currentData.MatchesWonTosswin ;
		finalData.push(currentData);
	}
	console.log(maxMatchWins);
	console.log(maxTosswins);
	console.log(finalData);
	    
	
	var x = d3.scaleLinear()
		.domain([0, maxTosswins])
		.range([ 0, width ]);
	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	// Add Y axis
	var y = d3.scaleLinear()
		.domain([0, maxMatchWins])
		.range([ height, 0]);
	svg.append("g")
		.call(d3.axisLeft(y));

	// Add dots
	svg.append('g')
		.selectAll("dot")
		.data(finalData)
		.enter()
		.append("circle")
		.attr("cx", function (d) { return x(d.tossWon); } )
		.attr("cy", function (d) { return y(d.MatchesWonTosswin); } )
		.attr("r", 15)
		.style("fill", "#69b3a2")
		.on('mouseover', function(d) {
			console.log(d);
			const ChartLabel = [{
				note: {
					label: `${d.TeamName} has won ${d.MatchesWonTosswin} matches when it won a toss. Overall it has Won ${d.MatchesWon} matches and ${d.tossWon} tosses` ,
					title: ""
				},
				connector: {
					end: "arrow", // none, or arrow or dot
					type: "curve", // Line or curve
					points: 3, // Number of break in the curve
					lineType: "horizontal"
				},
				color: ["black"],
				x: x(d.tossWon) ,
				y: y(d.MatchesWonTosswin),
				dx: 20,
				dy: 20,
			}]

			var annotationGLabel = document.getElementById('annotationGLabel')
			if (annotationGLabel != null) {
				annotationGLabel.remove();
			}
			console.log('her annotationGLabel ' + annotationGLabel);
			const makeAnnotationsLabel = d3.annotation()
				.annotations(ChartLabel)
			console.log(makeAnnotationsLabel);
				svg.append("g").attr("id", "annotationGLabel")
				.call(makeAnnotationsLabel);
			d3.select("#annotationGLabel").attr("stroke-width", "3");
			d3.select("#annotationGLabel").attr("font-size", "12");
		})
    })
    
    //var groupByTossWinner = groupBy(selectedData, 'Toss_winner');
}

render('All');
