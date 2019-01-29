dims  = {width:300, height :300, radius:150 }
cent = {x:(dims.width/2+5), y:(dims.height/2+5)}

var svg = d3.select('.canvas')
                .append('svg')
                .attr('width', dims.width+150)
                .attr('height',dims.height+150)

const graph = svg.append('g')
                .attr('transform',`translate(${cent.x},${cent.y})`)

var pie = d3.pie()
            .sort(null)
            .value(d => d.cost)

const angles = pie([])

var arcPath = d3.arc()
            .outerRadius(dims.radius)
            .innerRadius(dims.radius/2)
var data = []

const colour = d3.scaleOrdinal(d3.schemeSet3)

const legendGroup = svg.append('g')
                    .attr('transform',`translate(${dims.width + 40}, 10)` );

const legend = d3.legendColor()
                .shape('circle')
                .shapePadding(10)
                .scale(colour)
            
const update = (data) => {

    legendGroup.selectAll().remove();
   colour.domain(data.map(d => d.name))

   legendGroup.call(legend)
   legendGroup.selectAll('text').attr('fill','white')

   const paths = graph.selectAll('path')
        .data(pie(data))

    
   paths.exit().remove()



   paths.attr('d',arcPath)
        .transition().duration(750)
        .attrTween("d",arcTweenUpdate)

   paths.attr('d',arcPath)
    paths.enter()
        .append('path')
        .attr('class','arc')
        .attr('stroke','#fff')
        .attr('stroke-width',3)
        .attr('fill', d=>colour(d.data.name))
        .transition().duration(750)
        .attrTween("d",arcTweenEnter)
}

db.collection('expenses').onSnapshot((res) => {
    res.docChanges().forEach(change => {
        var doc = {...change.doc.data(),id:change.doc.id}
        switch(change.type) {
            case 'added':
                    data.push(doc)
                    break
            case 'modified':
                    const index = data.findIndex(item => item.id == doc.id )
                    data[index]=doc
                    break
            case 'removed':
                    data.filter(item => doc.id !== item.id)
                    break

        }
       
    })
    update(data)
})

const arcTweenEnter = (d) => {
    var i = d3.interpolate(d.endAngle, d.startAngle)
    return function(t) {
        d.startAngle = i(t)
        return arcPath(d)
    }
}

// const arcTweenEexit = (d) => {
//     var i = d3.interpolate(d.endAngle, d.startAngle)
//     return function(t) {
//         d.startAngle = i(t)
//         return arcPath(d)
//     }
// }

const arcTweenUpdate = (d) => {
    var i = d3.interpolate(this._current,d)
    this._current = i(1)
    return function(t) {
        return arcPath(i(t));
    }
}