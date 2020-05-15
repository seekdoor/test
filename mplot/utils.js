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


const d3contour_to_lonlat = ({ type, value, coordinates }, { lonBegin, lonSpan, latBegin, latSpan } = {}) => {
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

const drawWind = (dc, posX, posY, value, direction) => {
    dc.save();

    dc.scale(1, 1);

    dc.beginPath();

    dc.DrawLine = function (x1, y1, x2, y2) {
        this.moveTo(x1, y1);
        this.lineTo(x2, y2);
    }

    var pi = 3.14159265358979;

    function sind(d) {
        return Math.sin(d * pi / 180);
    }
    function cosd(d) {
        return Math.cos(d * pi / 180);
    }

    if (value > 1000) return;

    var l = 32, s = 10, w = 18;
    var ax = posX + l * sind(direction),
        ay = posY - l * cosd(direction);

    dc.DrawLine(posX, posY, ax, ay);

    var rest = value + 1;
    var n20 = Math.floor(rest / 20);

    //console.log(n20);

    for (var i = 0; i < n20; i++) {
        var bx = ax - i * s * sind(direction),
            by = ay + i * s * cosd(direction),

            cx = bx + w * cosd(direction),
            cy = by + w * sind(direction),

            dx = bx - s * sind(direction),
            dy = by + s * cosd(direction);

        dc.DrawLine(bx, by, cx, cy);
        dc.DrawLine(cx, cy, dx, dy);
    }

    ax -= n20 * s * sind(direction);
    ay += n20 * s * cosd(direction);

    s = 8;
    rest -= n20 * 20;
    var n4 = Math.floor(rest / 4);
    for (var i = 0; i < n4; i++) {
        var bx = ax - i * s * sind(direction),
            by = ay + i * s * cosd(direction),

            cx = bx + w * cosd(direction),
            cy = by + w * sind(direction);

        dc.DrawLine(bx, by, cx, cy);
    }

    rest -= n4 * 4;

    if (rest >= 2) {
        var bx = ax - n4 * s * sind(direction),
            by = ay + n4 * s * cosd(direction),

            cx = bx + w * cosd(direction) / 2,
            cy = by + w * sind(direction) / 2;

        dc.DrawLine(bx, by, cx, cy);
    }

    dc.stroke();
    // Look at the wxDC docs to learn how to draw other stuff

    dc.restore();
}

const position_after_transform = ([x0, y0], { x = 0, y = 0, k = 1 } = {}) => {

    return [k * x0 + x, k * y0 + y];
}

const projection_slope_angle = ([x0, y0], [x1, y1]) => {

    return Math.atan( (x1-x0)/(y0-y1) )*180/Math.PI;
}

const check_threshold_bottom = (v, threshold = -1e6, nullValue = 9999) => {
    return (v != nullValue && v >= threshold)
}

const check_threshold_top = (v, threshold = 1e6, nullValue = 9999) => {
    return (v != nullValue && v <= threshold)
}