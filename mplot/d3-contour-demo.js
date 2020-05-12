var get_data = async (data_url = "https://likev.github.io/test/high-surface-data/surface-p0-20050220.000") => {
    var f = await fetch(data_url);

    var content = await f.text();

    //console.log(content.split(/\s+/))
    content = content.trim().split(/\s+/).map(p => +p);

    return content;

}

const interpolatePathd = d3.line().x(d => +d[0]).y(d => +d[1]).curve(d3.curveBasis);

const smoothPath = (pathd, context) => {


    if (typeof (pathd) !== "string" || pathd.length < 1) return "";

    if (context) interpolatePathd.context(context);
    else interpolatePathd.context(null);

    var lines = pathd.slice(1).split('M');
    if (lines.length === 0) return '';

    let result = '';
    for (let line of lines) {
        var closed = (line[line.length - 1] === 'Z');

        var sp = line.replace(/M|Z/, '').split('L').map((d) => d.split(','));

        if (closed) sp.push(sp[0]);//sp = sp.concat(sp.slice(0,2));

        if (context) interpolatePathd(sp);
        else result += interpolatePathd(sp);

    }

    return result;

};

const projection = d3.geoConicConformal().rotate([-110, -40, 0]);//const projection = d3.geoOrthographic().fitExtent([[1, 1], [width - 1, height - 1]], sphere);

const path = d3.geoPath(projection);

var draw_map = async () => {

    var f = await fetch("https://raw.githubusercontent.com/lizhiqianduan/geojson-of-china-full/master/data/100000_geojson_full.json");

    var chinaGeoJson = await f.text();

    chinaGeoJson = JSON.parse(chinaGeoJson);

    projection.fitExtent([[20, 120], [1200, 1200]], chinaGeoJson);

    const map = d3.select("#map")
    //.attr("viewBox", [80, 0, 140, 70]);

    const g = map.append("g")
        .attr("stroke", "#505050")
        .attr("stroke-width", 1);

    var pathd = path(chinaGeoJson);

    g.append("path")
        .attr("d", smoothPath(pathd))
        .attr("fill", 'none');

    pathd = path(d3.geoGraticule10());

    g.append("path")
        .attr("class", "graticule")
        //.datum(d3.geoGraticule())
        .attr("d", pathd)
        .attr("stroke", "#707070")
        .attr("stroke-width", 0.5)
        .attr("fill", 'none');
}

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

    if (transform) {
        context.translate(transform.x, transform.y);
        context.scale(transform.k, transform.k);
    }


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

    context.fillStyle = fill;
    context.strokeStyle = color;


    for (let threshold of thresholds) {
        var geoJsonOfthreshold = transform(contours.contour(values, threshold));

        context.beginPath();

        if (smooth) {
            var pathd = path(geoJsonOfthreshold);
            smoothPath(pathd, context);
        } else {
            path.context(context);
            path(geoJsonOfthreshold);
            path.context(null);
        }

        if (fill !== 'none') context.fill();
        context.stroke();
    }
}

var draw_demo = async () => {

    await draw_map();

    var content = await get_data("https://likev.github.io/test/high-surface-data/surface-p0-20050220.000");

    content = clip_lonlat(content, 30, 180, 70, 0);
    draw_diamond4_canvas(content, { color: '#333' });

    //draw_diamond4(content, { color: '#CE9178', smooth: true });

    content = await get_data("https://likev.github.io/test/high-surface-data/height-500-20050220.000");

    content = clip_lonlat(content, 30, 180, 70, 0);
    draw_diamond4_canvas(content, { color: 'blue', thresholds: d3.range(500, 600, 4) })

    content = await get_data("https://likev.github.io/test/high-surface-data/temper-500-20050220.000");

    content = clip_lonlat(content, 30, 180, 70, 0);
    draw_diamond4(content, { color: 'red', thresholds: d3.range(-40, 40, 4) })

    $('#weather path').click(function () {

        //console.log($(this).attr('d'))
    });
}

const zoomg = d3.select("#zoom");

d3.select("#plot-svg")
    .call(d3.zoom()
        //.extent([[0, 0], [width, height]])
        .scaleExtent([1, 8])
        .on("zoom", zoomed));

function zoomed() {
    zoomg.attr("transform", d3.event.transform);
}



draw_demo()