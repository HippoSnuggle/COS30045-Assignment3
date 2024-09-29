function init(){
 // define the position and size of the chart:
    var body = d3.select("#bar_chart");
    var w = 600; //width
    var h = 400; // height
    var svg = body.append("svg")
                .attr("width", w)
                .attr("height", h);
        svg=svg.append('g')
    var padding = 20;

    let sortOption=0  // sort parameter
	

	// data file :
    d3.csv("data/visualisation1.csv").then(data=>{
        //Group the data looking for multi rows
        let dataGroupByYear=d3.groups(data,d=>d.Year) 
        dataGroupByYear.forEach(e => {
            let sum=0
            e[1].forEach(d=>{
                sum+=+d.Value
            })
            e[2]=sum
        });

        console.log(dataGroupByYear)

        // Default output graph
        drawBarFromData(sortDataWithOption(dataGroupByYear,sortOption))
		
        //  event listener - sort button 
        d3.select('.yearsort')
            .on('click',d=>{
                sortOption= 0
                //clear svg
                d3.select('svg').select('g').remove()
                svg=d3.select('svg').append('g')

                //redraw the graph
                drawBarFromData(sortDataWithOption(dataGroupByYear, sortOption))
            })

        d3.select('.ascending')
            .on('click',d=>{
                sortOption= 1
                //clear svg
                d3.select('svg').select('g').remove()
                svg=d3.select('svg').append('g')

                //redraw the graph
                drawBarFromData(sortDataWithOption(dataGroupByYear, sortOption))
            })
        d3.select('.descending')
            .on('click',d=>{
                sortOption= 2
                //clear svg
                d3.select('svg').select('g').remove()
                svg=d3.select('svg').append('g')

                //redraw the graph
                drawBarFromData(sortDataWithOption(dataGroupByYear, sortOption))
            })
    })
	        let drawBarFromData=function(dataSorted){
                
        var xScale = d3.scaleBand() 
                    .domain(dataSorted.map(d=>d[0]))
                    .range([padding, w -padding])
                    .paddingInner(0.1); 
        
        var yScale = d3.scaleLinear()
                    //calculating the range of y-axis
                    .domain(d3.extent(dataSorted,d=>d[2])) 
                    .range([h- padding, padding]);

        // chart
        var rects = svg.selectAll("rect") 
                        .data(dataSorted)
                        .enter()
                        .append("rect")
                        .attr("x", function(d, i) {  
                            return xScale(d[0]);
                        })
                        .attr("y", function(d) {
                            return yScale(d[2]);
                        })
                        .attr("width", xScale.bandwidth())
                        .attr("height", function(d) {
                            return h - yScale(d[2]); 
                        }) 
                        .attr("fill", "lightblue")
						
                         //hover effects, change the colour and add text on mouse over:
                        .on("mouseover", function(event, d) {
                            d3.select(this)
								.transition()
								.duration(700)
                                .attr("fill", "orange");
                            let tooltipid='#tooltip_'+d[0]
                            d3.select(tooltipid).style('display','')
                        })
						//on mouse out  
                        .on("mouseout", function(event,d) {
                            d3.select(this)
                                .transition()
                                .duration(400)
                                .attr("fill", "lightblue")
                            let tooltipid='#tooltip_'+d[0]
                            d3.select(tooltipid).style('display','none')
                        });

        //text x
        var texts = svg.selectAll(".MyText")
                .data(dataSorted)
                .enter()
                .append("text")
                .attr("class","MyText")
                // Use scale directly to calculate the text position
                .attr("x", function(d,i){
                    return xScale(d[0])+xScale.bandwidth()/5;
                })
                .attr("y", function(d){
                    return h-5;
                })
                .style('font-size','.6em')
                .text(function(d){
                    return d[0];
                });
        
        // text y
        var tooltip = svg.selectAll(".tooltip1")
                .data(dataSorted)
                .enter()
                .append("text")
                .attr('class','tooltip1')
                .attr("id",d=>"tooltip_"+d[0])
                .attr("x", function(d,i){
                    return xScale(d[0]);
                })
                .attr("y", function(d){
                    return yScale(d[2]);
                })
                .style('font-size','12px')
                .style('fill', 'Slategrey')
                .style("font-weight", "bold")
                .style('display',"none")
                .text(function(d){
                    return d[2];
                });
        }
	
		//Sort function
		let sortDataWithOption=function(data,option){
			if(option==0)//sort by year
				return d3.sort(data,d=>d[0])

			if(option==1)//ascending sort
				return d3.sort(data,(a,b)=>d3.ascending(a[2],b[2]))

			if(option==2)//descending sort
				return d3.sort(data,(a,b)=>d3.descending(a[2],b[2]))
		}
}
window.onload = init;