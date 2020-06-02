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

var draw_diamond14_canvas = (lines, { context = null, transform = null, color = 'blue', fill = 'none', smooth = true, thresholds } = {}) => {

    if (!context) context = $('#plot-canvas')[0].getContext('2d');

    context.save();
    if (transform) {
        //context.translate(transform.x, transform.y);
        //context.scale(transform.k, transform.k);
    }

    context.fillStyle = fill;
    context.strokeStyle = color;

    let path_canvas = d3.line().context(context);

    console.time("draw_diamond14_canvas");

    context.beginPath();

    for (let line of lines) {
        let line_points = line.points, line_label = line.label;

        line_points = line_after_projection(line_points, path.projection());

        line_points = line_after_transform(line_points, transform);

        path_canvas(line_points);

        const line_label_points = position_line_to_label_points(line_points);

        for (let pos of line_label_points) {

            context.strokeText(line_label.name, pos[0], pos[1]);
        }
    }

    context.stroke();

    console.timeEnd("draw_diamond14_canvas");

    context.restore();
}

var draw_diamond4_canvas = (content, { context = null, transform = null, color = 'blue', fill = 'none', smooth = true, thresholds } = {}) => {


    if (content.type === 'diamond14') return draw_diamond14_canvas(content, { context, transform, color, fill, smooth, thresholds });

    if (!context) context = $('#plot-canvas')[0].getContext('2d');




    var values = content.slice(22);

    //console.log(values)
    //console.log(d3)
    var n = content[15], m = content[16],
        lonBegin = content[11], latBegin = content[13], lonSpan = content[9], latSpan = content[10];


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

    if (smooth) path.context(null);
    else path.context(context);

    for (let geoJson of geoJsonArray) {

        var t1 = +new Date();
        var geoJsonOfthreshold = d3contour_to_lonlat(geoJson, { lonBegin, lonSpan, latBegin, latSpan });
        t[0] += +new Date() - t1;

        context.save();
        if (transform) {
            context.translate(transform.x, transform.y);
            context.scale(transform.k, transform.k);
        }

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

        context.restore();


        var label_points = d3lonlat_contour_to_label_points(geoJsonOfthreshold, path.projection(), transform);
        for (let pos of label_points) {
            context.strokeText(geoJsonOfthreshold.value, pos[0], pos[1]);
        }

    }

    console.log(t)


    console.timeEnd("geoJsonOfthreshold");


}

var draw_diamond2_canvas = (content, { context = null, transform = null, color = '#333', fill = 'none', smooth = true, thresholds, elements } = {}) => {

    if (!context) context = $('#plot-canvas')[0].getContext('2d');

    context.save();


    if (transform) {
        //context.translate(transform.x, transform.y);
        //context.scale(transform.k, transform.k);
    }

    context.fillStyle = fill;
    context.strokeStyle = color;


    console.time("draw_diamond2_canvas");

    var t = [0, 0, 0, 0];

    for (let stationid in content) {
        var station = content[stationid];
        var pos = path.projection()([station[1], station[2]]),
            pos1 = path.projection()([station[1], station[2] + 1]);

        var slope_angle = projection_slope_angle(pos, pos1);

        if (stationid == 57083) console.log(pos);

        if (transform) { pos = position_after_transform(pos, transform) };

        if (stationid == 57083) console.log(pos);

        var t0 = +new Date();

        context.strokeStyle = color;
        var windV = station[9];
        if (elements.wind.show && check_threshold_logic(windV, elements.wind)) drawWind(context, pos[0], pos[1], windV, station[8] + slope_angle);

        context.font = '14px serif';

        context.strokeStyle = 'red';

        var T = station[6];
        if (elements.T.show && check_threshold_logic(T, elements.T)) context.strokeText(T, pos[0] - 20, pos[1] - 20);

        context.strokeStyle = 'green';
        var T_Td = station[7];
        if (elements.T_Td.show && check_threshold_logic(T_Td, elements.T_Td)) context.strokeText(T_Td, pos[0] - 20, pos[1]);

        var Td = station[6] - station[7];
        if (elements.Td.show && check_threshold_logic(Td, elements.Td)) context.strokeText(Td, pos[0] - 20, pos[1] + 20);

        context.strokeStyle = 'brown';
        var H = station[5];
        if (elements.H.show && check_threshold_logic(H, elements.H)) context.strokeText(H, pos[0] + 20, pos[1] - 20);

        t[0] += +new Date() - t0;
    }

    console.log(t)

    console.timeEnd("draw_diamond2_canvas");

    context.restore();
}

var draw_diamond1_canvas = (content, { context = null, transform = null, viewlevel = 16, color = '#333', fill = 'none', smooth = true, thresholds, elements } = {}) => {

    if (!context) context = $('#plot-canvas')[0].getContext('2d');

    context.save();


    if (transform) {
        //context.translate(transform.x, transform.y);
        //context.scale(transform.k, transform.k);
    }

    context.fillStyle = fill;
    context.strokeStyle = color;


    console.time("draw_diamond1_canvas");

    var t = [0, 0, 0, 0];

    for (let stationid in content) {
        var station = content[stationid];

        if (!check_threshold_top(station[4], viewlevel)) continue;

        var pos = path.projection()([station[1], station[2]]),
            pos1 = path.projection()([station[1], station[2] + 1]);

        var slope_angle = projection_slope_angle(pos, pos1);

        if (stationid == 57083) console.log(pos);

        if (transform) {
            pos = position_after_transform(pos, transform);
        };

        if (stationid == 57083) console.log(pos);

        var t0 = +new Date();

        context.strokeStyle = color;

        var windV = station[7];
        if (elements.wind.show && check_threshold_logic(windV, elements.wind)) drawWind(context, pos[0], pos[1], windV, station[6] + slope_angle);
        t[0] += +new Date() - t0;


        var t1 = +new Date();
        context.font = '14px serif';

        context.strokeStyle = 'red';
        var T = station[19];
        if (elements.T.show && check_threshold_logic(T, elements.T)) context.strokeText(T, pos[0] - 20, pos[1] - 20);

        var dT24 = station[24];
        if (elements.dT24.show && check_threshold_logic(dT24, elements.dT24)) context.strokeText(dT24, pos[0] - 20, pos[1] - 40);

        context.strokeStyle = 'brown';
        var P1000 = station[8];
        if (P1000 < 800) P1000 = 1000 + P1000 / 10;
        if (elements.P1000.show && check_threshold_logic(P1000, elements.P1000)) context.strokeText(P1000, pos[0] + 20, pos[1] - 20);

        context.strokeStyle = 'DarkSlateBlue';
        var dP3 = station[9];
        if (elements.dP3.show && check_threshold_logic(dP3, elements.dP3)) context.strokeText(dP3, pos[0] + 20, pos[1] - 40);

        var dP24 = station[25];
        if (elements.dP24.show && check_threshold_logic(dP24, elements.dP24)) context.strokeText(dP24, pos[0] + 20, pos[1] - 60);

        context.strokeStyle = 'green';

        var Td = station[16];
        if (elements.Td.show && check_threshold_logic(Td, elements.Td)) context.strokeText(Td, pos[0] - 20, pos[1]);

        context.strokeStyle = 'coral';
        var V = station[17];
        if (elements.V.show && check_threshold_logic(V, elements.V)) context.strokeText(V, pos[0] - 20, pos[1] + 20);

        context.strokeStyle = 'blue';
        var rainPast6 = station[12];

        if (elements.rainPast6.show && check_threshold_logic(rainPast6, elements.rainPast6)) context.strokeText(rainPast6, pos[0] + 20, pos[1]);

        t[1] += +new Date() - t1;

    }

    console.log(t)

    console.timeEnd("draw_diamond1_canvas");

    context.restore();
}