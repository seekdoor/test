var get_data = async (data_url = "https://likev.github.io/test/high-surface-data/surface-p0-20050220.000") => {
    var f = await fetch(data_url);

    var content = await f.text();

    //console.log(content.split(/\s+/))
    content = content.trim().split(/\s+/).map(p => +p);

    return content;

}

const projection = d3.geoConicConformal().rotate([-120, -40, 0]);//const projection = d3.geoOrthographic().fitExtent([[1, 1], [width - 1, height - 1]], sphere);

const path = d3.geoPath(projection);

var draw_map = async () => {

    var f = await fetch("https://raw.githubusercontent.com/lizhiqianduan/geojson-of-china-full/master/data/100000_geojson_full.json");

    var chinaGeoJson = await f.text();

    chinaGeoJson = JSON.parse(chinaGeoJson);

    projection.fitExtent([[20, 120], [940, 940]], chinaGeoJson);

    const svg = d3.select("#map")
    //.attr("viewBox", [80, 0, 140, 70]);

    const g = svg.append("g")
        .attr("stroke", "gray")
        .attr("stroke-width", 2);

    g.append("path")
        .attr("d", path(chinaGeoJson))
        .attr("fill", 'none')
}

var draw_diamond4 = (content, { color = 'blue', fill = 'none', thresholds } = {}) => {
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

    const svg = d3.select("#weather")
    //.attr("viewBox", wide ? [0, 0, width, height] : [0, 0, height, width])
    //.style("display", "block")
    //.style("margin", "0 -14px");

    const g = svg.append("g")
        .attr("transform", wide ? null : `
            rotate(90 ${width / 2},${height / 2})
            translate(${(width - height) / 2},${(width - height) / 2})
          `)
        .attr("stroke", color)
        .attr("stroke-width", 1);



    var i = 0;
    setInterval(_ => {
        if (i === thresholds.length) return;
        threshold = thresholds[i++];

        var geoJsonOfthreshold = transform(contours.contour(values, threshold));
        g.append("path")
            .attr("d", path(geoJsonOfthreshold))
            .attr("fill", fill);//.attr("fill", colorScale(threshold));

    }, 3000)
    //console.log(svg.node())
    //d3.select('#plot').append(svg.node())
}

var draw_demo = async () => {

    await draw_map();

    var content = await get_data("https://likev.github.io/test/high-surface-data/surface-p0-20050220.000");

    draw_diamond4(content, { color: '#333' });

    content = await get_data("https://likev.github.io/test/high-surface-data/height-500-20050220.000");

    draw_diamond4(content, { color: 'blue', thresholds: d3.range(500, 600, 4)  })

    content = await get_data("https://likev.github.io/test/high-surface-data/temper-500-20050220.000");

    draw_diamond4(content, { color: 'red', thresholds: d3.range(-40, 40, 4) })

}

draw_demo()