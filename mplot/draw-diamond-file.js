//require('draw-map.js')
//require('utils.js')

var draw_diamond4 = (content, { context = null, color = 'blue', fill = 'none', smooth = true, thresholds } = {}) => {
    var values = content.slice(22);

    console.log(values)
    //console.log(d3)
    var n = content[15], m = content[16],
        lonBegin = content[11], latBegin = content[13], lonSpan = content[9], latSpan = content[10],


        // Converts from grid coordinates (indexes) to map coordinates (lat lon).
        transform = ({ type, value, coordinates }) => {
            return {
                type,
                value,

                coordinates: coordinates.map(rings => {
                    return rings.map(points => {
                        return points.map(([x, y]) => ([
                            lonBegin + lonSpan * x,
                            latBegin + latSpan * y
                        ]));
                    });
                })
            };
        }


    var width = n, height = m;

    var extent = d3.extent(values);
    //var thresholds = d3.range(0, 10).map(p => extent[0] + (extent[1] - extent[0]) * p / 10);

    thresholds = thresholds || d3.ticks(extent[0], extent[1], 10);

    var wide = true;

    console.log(thresholds)
    var contours = d3.contours()
        .size([n, m])
        .thresholds(thresholds);

    var colorScale = d3.scaleSequential(d3.interpolateOranges).domain(d3.extent(values))

    //const svg = d3.select("#weather")
    //.attr("viewBox", wide ? [0, 0, width, height] : [0, 0, height, width])
    //.style("display", "block")
    //.style("margin", "0 -14px");

    const weather = d3.select("#weather")

    const g = weather.append("g")
        .attr("transform", wide ? null : `
            rotate(90 ${width / 2},${height / 2})
            translate(${(width - height) / 2},${(width - height) / 2})
          `)
        .attr("stroke", color)
        .attr("stroke-width", 1);


    /*
        var i = 0;
        setInterval(_ => {
            if (i === thresholds.length) return;
            threshold = thresholds[i++];
    
            var geoJsonOfthreshold = transform(contours.contour(values, threshold));
    
            var pathd = path(geoJsonOfthreshold);
    
            g.append("path")
                .attr("d", pathd)//
                .attr("fill", fill);//.attr("fill", colorScale(threshold));
    
        }, 3000)
        */
    for (let threshold of thresholds) {
        var geoJsonOfthreshold = transform(contours.contour(values, threshold));

        var pathd = path(geoJsonOfthreshold);

        if (smooth) pathd = smoothPath(pathd);

        g.append("path")
            .attr("d", pathd)//
            .attr("fill", fill);//.attr("fill", colorScale(threshold));

        //window.alert(threshold)
    }
}

var draw_diamond4_canvas = (content, { context = null, transform = null, color = 'blue', fill = 'none', smooth = true, thresholds } = {}) => {

    if (!context) context = $('#plot-canvas')[0].getContext('2d');

    context.save();
    if (transform) {
        context.translate(transform.x, transform.y);
        context.scale(transform.k, transform.k);
    }


    var values = content.slice(22);

    //console.log(values)
    //console.log(d3)
    var n = content[15], m = content[16],
        lonBegin = content[11], latBegin = content[13], lonSpan = content[9], latSpan = content[10],


        // Converts from grid coordinates (indexes) to map coordinates (lat lon).
        transform = ({ type, value, coordinates }) => {
            return {
                type,
                value,

                coordinates: coordinates.map(rings => {
                    return rings.map(points => {
                        var line = [];

                        for (let [x, y] of points) {

                            var newLon = lonBegin + lonSpan * x,
                                newLat = latBegin + latSpan * y;

                            //!!! wrong will delete some point !!! //if (newLon < 0 || newLon > 180 || newLat < 0 || newLat > 80) continue;
                            line.push([newLon, newLat]);
                        }
                        return line;
                    })


                })

            };
        };


    var width = n, height = m;

    var extent = d3.extent(values);
    //var thresholds = d3.range(0, 10).map(p => extent[0] + (extent[1] - extent[0]) * p / 10);

    thresholds = thresholds || d3.ticks(extent[0], extent[1], 10);

    var wide = true;

    //console.log(thresholds)
    var contours = d3.contours()
        .size([n, m])
        .thresholds(thresholds);

    console.time("contours_values");
    var geoJsonArray = contours(values);
    console.timeEnd("contours_values");

    var colorScale = d3.scaleSequential(d3.interpolateOranges).domain(d3.extent(values))

    context.fillStyle = fill;
    context.strokeStyle = color;


    console.time("geoJsonOfthreshold");



    var t = [0, 0, 0, 0];

    if (!smooth) path.context(context);
    for (let geoJson of geoJsonArray) {

        var t1 = +new Date();
        var geoJsonOfthreshold = transform(geoJson);
        t[0] += +new Date() - t1;

        context.beginPath();
        if (smooth) {

            t1 = +new Date();
            var pathd = path(geoJsonOfthreshold);
            t[1] += +new Date() - t1;

            t1 = +new Date();
            smoothPath(pathd, context);
            t[2] += +new Date() - t1;

        } else {
            t1 = +new Date();

            path(geoJsonOfthreshold);
            //d3.geoPath().context(context)(geoJsonOfthreshold)

            t[3] += +new Date() - t1;
        }
        if (fill !== 'none') context.fill();
        context.stroke();

    }

    console.log(t)


    console.timeEnd("geoJsonOfthreshold");

    context.restore();
}