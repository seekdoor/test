//var content = await get_data("https://likev.github.io/test/high-surface-data/height-500-20050220.000");

var clip_lonlat = (content, lon1 = 30, lon2 = 180, lat1 = 70, lat2 = 0) => {
    var header = content.slice(0, 22);
    var values = content.slice(22);

    //console.log(values)
    //console.log(d3)
    var n = content[15], m = content[16],
        lonBegin = content[11], latBegin = content[13], lonSpan = content[9], latSpan = content[10];


    var n1 = -1, n2 = -1, m1 = -1, m2 = -1;

    var result = [];

    for (var y = 0; y < m; y++) {
        var lat = latBegin + latSpan * y;

        if (lat > lat1) continue;
        if (lat < lat2) break;

        if (m1 < 0) m1 = y;

        m2 = y;

        for (var x = 0; x < n; x++) {
            var lon = lonBegin + lonSpan * x;

            if (lon < lon1) continue;
            if (lon > lon2) break;

            if (n1 < 0) n1 = x;

            n2 = x;

            result.push(values[y * n + x])

        }
    }

    //console.log(`${n1} ${n2} ${m1} ${m2}`)
    //console.log(result)

    header[15] = n2 - n1 + 1;
    header[16] = m2 - m1 + 1;

    header[11] = lonBegin + lonSpan * n1;
    header[12] = lonBegin + lonSpan * n2;
    header[13] = latBegin + latSpan * m1;
    header[14] = latBegin + latSpan * m2;

    //console.log(header.concat(result))
    
    return header.concat(result);
}


//draw_diamond4(clip_lonlat(content), { color: 'yellow', thresholds: d3.range(500, 600, 4) })