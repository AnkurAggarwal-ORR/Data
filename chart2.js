render('All');
const select = document.getElementById('year-select');
select.addEventListener('change', function handleChange(event) {

    render(event.target.value)

});
	
function render(selectedVar) {
	
    console.log('in render...');
    let idx = 0;
    var groupBy = function(xs, key) {
        return xs.reduce(function(rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };
	

    document.querySelector('#chart').innerHTML = '';

    var json;
    console.log('calling data...');
    d3.csv("IPL20.csv", function(data) {
	var groupByYear = groupBy(data, 'year');
	var selectedData;
	if (selectedVar == 'All') {
		selectedData = data;
	} else {
		selectedData = groupByYear[selectedVar];
	}

        console.log(data);
        var groupByTossWinner = groupBy(selectedData, 'Toss_winner');
        var Children = [];
        for (let tossByTeam in groupByTossWinner) {
            var ChildItem = {};
            ChildItem['name'] = tossByTeam;
            ChildItem['value'] = groupByTossWinner[tossByTeam].length;
            console.log(ChildItem);
            Children.push(ChildItem);
        }
        json = {
            'children': Children
        };

        const values = json.children.map(d => d.value);
        const min = Math.min.apply(null, values);
        const max = Math.max.apply(null, values);
        const total = json.children.length;
    
    
        var diameter = 600,
            color = d3.scaleOrdinal(d3.schemeCategory20c);
    
        var bubble = d3.pack()
            .size([diameter, diameter])
            .padding(0);

        var margin = {
            left: 25,
            right: 25,
            top: 25,
            bottom: 25
        }
    
        var svg = d3.select('#chart').append('svg')
            .attr('viewBox', '0 0 ' + (diameter + margin.right) + ' ' + diameter)
            .attr('width', (diameter + margin.right))
            .attr('height', diameter)
            .attr('class', 'chart-svg');
    
        var root = d3.hierarchy(json)
            .sum(function(d) {
                return d.value;
            });
        // .sort(function(a, b) { return b.value - a.value; });
    
        bubble(root);
    
        var node = svg.selectAll('.node')
            .data(root.children)
            .enter()
            .append('g').attr('class', 'node')
            .attr('transform', function(d) {
                return 'translate(' + d.x + ' ' + d.y + ')';
            })
            .append('g').attr('class', 'graph');
    
        node.append("circle")
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", getItemColor)
            .on('mouseover', function(d) {console.log(d) ; const ChartLabel = [
         {
            note: {
               label: d.data.name + 'has won ' + d.data.value + ' tosses',
               title: ""
            },
		 connector: {
      end: "arrow",        // none, or arrow or dot
      type: "curve",       // Line or curve
      points: 3,           // Number of break in the curve
      lineType : "horizontal"
    },
    color: ["black"],
            x: d.x,
            y: d.y,
 	    dx: d.r - 5,
 	    dy: d.r - 5,
            }
      ]
     
     var annotationGLabel = document.getElementById("annotationGLabel")
      if( annotationGLabel != null){
         annotationGLabel.remove();
      }
      const makeAnnotationsLabel = d3.annotation()
      .annotations(ChartLabel)
      svg.append("g").attr("id","annotationGLabel")
      .call(makeAnnotationsLabel);d3.select("#annotationGLabel").attr("stroke-width","3");
	    d3.select("#annotationGLabel").attr("font-size","20");})
            //.on('mouseout', function(d) {});
    
        //node.call(tip);
    
        node.append("text")
            .attr("dy", "0.2em")
            .style("text-anchor", "middle")
            .style('font-family', 'Roboto')
            .style('font-size', 15)
            .text(getLabel)
            .style("fill", "#ffffff")
            .style('pointer-events', 'none');
    
    
    
        function getItemColor(item) {
            return getColor(idx++, json.children.length);
        }
    
        function getColor(idx, total) {
            const colorList = ['F05A24', 'EF4E4A', 'EE3F65', 'EC297B', 'E3236C', 'D91C5C', 'BC1E60', '9E1F63', '992271', '952480', '90278E', '7A2A8F', '652D90', '502980', '3B2671', '262261', '27286D', '292D78', '2A3384', '2B388F', '2A4F9F', '2965AF', '277CC0', '2692D0', '25A9E0'];
            const colorLookup = [
                [0, 4, 10, 18, 24],
                [0, 3, 6, 9, 11, 13, 15, 18, 20, 24],
                [0, 3, 4, 6, 7, 9, 11, 13, 14, 15, 17, 18, 20, 22, 24],
                [0, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 15, 17, 18, 19, 20, 22, 23, 24],
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
            ];
            for (const idxList of colorLookup) {
                if (idxList.length >= total) {
                    return '#' + colorList[idxList[idx]];
                }
            }
        }
    
    
    
        function getLabel(item) {
            /*if (item.data.value < max / 3.3) {
                return '';
            }*/
            return truncate(item.data.name);
        }
    
        function getValueText(item) {
            /*if (item.data.value < max / 3.3) {
                return '';
            }*/
            return item.data.value;
        }
    
        function truncate(label) {
            const max = 11;
            if (label.length > max) {
                label = label.slice(0, max) + '...';
            }
            return label;
        }
    
        function getFontSizeForItem(item) {
            return getFontSize(item.data.value, min, max, total);
        }
    
        function getFontSize(value, min, max, total) {
            const minPx = 6;
            const maxPx = 25;
            const pxRange = maxPx - minPx;
            const dataRange = max - min;
            const ratio = pxRange / dataRange;
            const size = Math.min(maxPx, Math.round(value * ratio) + minPx);
            return `${size}px`;
        }
    })

}
