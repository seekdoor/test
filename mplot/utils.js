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