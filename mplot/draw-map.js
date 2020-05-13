//require('utils.js')

var clipRectangle = [[0, 0], [1400, 800]];
const projection = d3.geoConicEquidistant()
    .parallels([35, 65])
    //.clipExtent(clipRectangle)
    .rotate([-110, -40, 0]);//const projection = d3.geoOrthographic().fitExtent([[1, 1], [width - 1, height - 1]], sphere);

const path = d3.geoPath(projection);

var draw_map = async () => {

    var f = await fetch("https://raw.githubusercontent.com/lizhiqianduan/geojson-of-china-full/master/data/100000_geojson_full.json");

    var chinaGeoJson = await f.text();

    chinaGeoJson = JSON.parse(chinaGeoJson);

    projection.fitExtent([[300, 120], [1200, 800]], chinaGeoJson);

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

var draw_map_canvas = async ({ context = null, transform = null, color = '#505050', fill = 'none', smooth = true, thresholds } = {}) => {

    if (!context) context = $('#map-canvas')[0].getContext('2d');

    context.save();
    if (transform) {
        context.translate(transform.x, transform.y);
        context.scale(transform.k, transform.k);
    }

    var chinaGeoJson = await get_data("https://raw.githubusercontent.com/lizhiqianduan/geojson-of-china-full/master/data/100000_geojson_full.json");

    chinaGeoJson = JSON.parse(chinaGeoJson);

    projection.fitExtent([[20, 120], [1200, 1200]], chinaGeoJson);

    context.fillStyle = fill;
    context.strokeStyle = color;

    context.beginPath();

    if (smooth) {
        var pathd = path(chinaGeoJson);

        smoothPath(pathd, context);
    } else {
        path.context(context);
        path(chinaGeoJson);
        path.context(null);
    }
    if (fill !== 'none') context.fill();
    context.stroke();

    context.beginPath();
    path.context(context);
    path(d3.geoGraticule10());
    path.context(null);

    context.stroke();

    context.restore();

}