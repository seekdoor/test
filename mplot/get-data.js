const DATA_CACHE = {};

var get_data = async (data_url) => {

    var content = null;

    if (DATA_CACHE[data_url]) {
        content = DATA_CACHE[data_url];
    } else {
        try {
            var f = await fetch(data_url);

            if (!f.ok) {
                console.log('File not find');
                return false;
            }

            content = await f.text();

            DATA_CACHE[data_url] = content;
        } catch (e) {
            alert('NetworkError')
        }
    }

    return content;

}


var get_data_diamond1 = async (data_url = "https://likev.github.io/test/high-surface-data/surface-plot-20050220.000") => {

    var content = await get_data(data_url);
    if (!content) return false;
    /*
    var content = `68352   27.25  -27.66 1300   32 9999  280    5 9999  -27 9999 9999
      0 9999 9999 9999    5.5   9999 9999   27.0 9999 9999    1    2 9999 9999
64500    9.42    0.45   15   32    6  220    3  137 9999    9    3
      0   39    6  300   27.4   10.0    3   31.2   20   10    1    2 9999 9999
 6407    2.87   51.20    5   32    1  290    7  117   22    8    1
   0.01   31    1  300    6.6   30.0    1   12.1   20   10    1    2 9999 9999
 6449    4.45   50.47  192   32    8  320    3  116   17 9999 9999
    1.0 9999 9999  100    6.1   10.0   61    8.9 9999 9999    1    2 9999 9999`
    */

    var re = /^\s*\d{4,5}(\s+[-\d.]+){25}\s*$/mg;

    var records = content.match(re);

    //console.log(records)

    var result = {};

    for (let line of records) {
        var record = line.trim().split(/\s+/).map(p => +p);
        //console.log(record)
        result[record[0]] = record;
    }

    return result;

}

var get_data_diamond2 = async (data_url = "https://likev.github.io/test/high-surface-data/plot-500-20050220.000") => {

    var content = await get_data(data_url)
    if (!content) return false;
    /*
    var content = `  1028   19.02   74.52   14    1  534  -30    9  260    7
  2365   17.45   62.53    6    1  538  -28   14  210   21
  3005   -1.17   60.13   84    1  540  -28    6  295   12
  3354   -1.24   53.00  117    1  547  -26   18  290   13
  3808   -5.31   50.22   88    1  558  -19  4.2  285   30
  3953  -10.24   51.93   14    1  556  -21   16  255   12
  4018  -22.59   63.97   38    1  538  -30   25  340   19`
  */

    var re = /^\s*\d{4,5}(\s+[-\d.]+){9}\s*$/mg;

    var records = content.match(re);

    //console.log(records)

    var result = {};

    for (let line of records) {
        var record = line.trim().split(/\s+/).map(p => +p);
        //console.log(record)
        result[record[0]] = record;
    }

    return result;

}

var get_data_diamond14 = (content) => {

    content = content.trim();

    //console.log(content)

    const re = /LINES:\s+(\d+)([-\d\s.]+)(LINES_SYMBOL|SYMBOLS|CLOSED_CONTOURS|STATION_SITUATION|WEATHER_REGION|FILLAREA|NOTES_SYMBOL|WithProp_LINESYMBOLS)/i;
    const found = content.match(re);

    const lines_count = +found[1];
    const lines_content = found[2].trim().split(/\s+/);

    console.log(lines_content.length)

    let lines = [];

    lines.type = 'diamond14';

    let k = 0;
    for (let i = 0; i < lines_count; i++) {
        let line_width = lines_content[k++], point_count = lines_content[k++];

        let line = {
            points: [],
            label: {
                name: '',
                points: []
            }
        };
        for (let j = 0; j < point_count; j++) {
            let x = lines_content[k++], y = lines_content[k++], z = lines_content[k++];
            line.points.push([x, y]);
        }


        let label_name = lines_content[k++], label_count = +lines_content[k++];

        line.label.name = label_name;
        for (let j = 0; j < label_count; j++) {
            let x = lines_content[k++], y = lines_content[k++], z = lines_content[k++];
            line.label.points.push([x, y]);
        }

        lines.push(line);
    }

    //console.log(JSON.stringify(lines, null, 2) );

    return lines;

}

var get_data_diamond4 = async (data_url = "https://likev.github.io/test/high-surface-data/surface-p0-20050220.000") => {

    var content = await get_data(data_url)
    if (!content) return false;

    var result = [];
    //console.log(content.split(/\s+/))
    result = content.trim().split(/\s+/).map(p => +p);

    if(+result[1] === 14) return get_data_diamond14(content);

    return result;

}