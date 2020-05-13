const DATA_CACHE = {};

var get_data = async (data_url) => {

    var content = null;

    if (DATA_CACHE[data_url]) {
        content = DATA_CACHE[data_url];
    } else {
        var f = await fetch(data_url);
        content = await f.text();

        DATA_CACHE[data_url] = content;
    }

    return content;

}


var get_data_diamond4 = async (data_url = "https://likev.github.io/test/high-surface-data/surface-p0-20050220.000") => {

    var content = await get_data(data_url)

    //console.log(content.split(/\s+/))
    content = content.trim().split(/\s+/).map(p => +p);

    return content;

}