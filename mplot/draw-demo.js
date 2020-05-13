//require('get-data.js')
//require('clip-lonlat.js')
//require('draw-map.js')
//require('draw-diamond-file.js')

var draw_demo = async (transform) => {

    console.time("draw_demo");





    //await draw_map();

    var map_canvas = $('#map-canvas')[0];
    var map_context = map_canvas.getContext('2d');

    map_context.clearRect(0, 0, map_canvas.width, map_canvas.height);

    console.time("draw_map");
    await draw_map_canvas({ transform });
    console.timeEnd("draw_map");

    var weather_canvas = $('#plot-canvas')[0];
    var weather_context = weather_canvas.getContext('2d');

    weather_context.clearRect(0, 0, weather_canvas.width, weather_canvas.height);

    /*
    var content = await get_data_diamond4("https://likev.github.io/test/high-surface-data/surface-p0-20050220.000");

    console.time("draw_surcace");
    content = clip_lonlat(content, 30, 180, 70, 0);
    draw_diamond4_canvas(content, { transform, color: '#333', smooth: true });
    console.timeEnd("draw_surcace");

    //draw_diamond4(content, { color: '#CE9178', smooth: true });

    content = await get_data_diamond4("https://likev.github.io/test/high-surface-data/height-500-20050220.000");

    content = clip_lonlat(content, 30, 180, 70, 0);
    draw_diamond4_canvas(content, { transform, color: 'blue', thresholds: d3.range(500, 600, 4) })

    content = await get_data_diamond4("https://likev.github.io/test/high-surface-data/temper-500-20050220.000");

    content = clip_lonlat(content, 30, 180, 70, 0);
    //draw_diamond4(content, { color: 'red', thresholds: d3.range(-40, 40, 4) })
    draw_diamond4_canvas(content, { transform, color: 'red', thresholds: d3.range(-40, 40, 4) });
*/

    content = await get_data_diamond2("https://likev.github.io/test/high-surface-data/plot-500-20050220.000");
    draw_diamond2_canvas(content, { transform, color: '#333' });

    
    console.timeEnd("draw_demo");
}

const zoomg = d3.select("#zoom");
/**/
d3.select("#plot-canvas")//#plot-svg
    .call(d3.zoom()
        //.extent([[0, 0], [width, height]])
        .scaleExtent([1, 8])
        .on("zoom", zoomed));

function zoomed() {
    //zoomg.attr("transform", d3.event.transform);

    draw_demo(d3.event.transform)
}

draw_demo()