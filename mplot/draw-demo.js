//require('get-data.js')
//require('clip-lonlat.js')
//require('draw-map.js')
//require('draw-diamond-file.js')

const compositeType = {
    composite_500_a: [
        { show: true, name: 'height', level: '500', filetype: 4, config: { color: 'blue', thresholds: d3.range(500, 600, 4) } },
        { show: false, name: 'temper', level: '500', filetype: 4, config: { color: 'red', thresholds: d3.range(-40, 40, 4) } },
        { show: true, name: 'plot', level: '500', filetype: 2, config: { color: '#333' } }
    ],
    composite_1000_a: [
        { show: true, name: 'p0', level: 'surface', filetype: 4, config: { color: '#333', smooth: true } },
        { show: true, name: 'plot', level: 'surface', filetype: 1, config: { color: '#333' } }
    ]
}

const composite_array = [];

const generate_plot_item = (composite_type_name, plot_index) => {
    let item = compositeType[composite_type_name];

    let plot = item[plot_index]

    let plot_name = `${plot.level} ${plot.name}`;

    let result = `<a href="#" class="list-group-item" data-index=${plot_index}><span class="glyphicon  ${plot.show ? 'glyphicon-check' : 'glyphicon-unchecked'} "
    aria-hidden="true"></span>${plot_name}<span
    class="glyphicon glyphicon-cog invisible pull-right"
    aria-hidden="true"></span></a>`;

    return result;
}

const generate_composite_item = (composite_array_index) => {
    let [file_datetime_str, composite_type_name] = composite_array[composite_array_index];

    let file_datetime = +moment(file_datetime_str), ctype = compositeType[composite_type_name];

    var listhtml = '';
    for (let i = 0; i < ctype.length; i++) {
        listhtml += generate_plot_item(composite_type_name, i);
    }


    var result = `<div class="panel panel-default" data-index=${composite_array_index} data-filedatetime=${file_datetime}>
                        <div class="panel-heading">
                            <h3 class="panel-title" data-index=${composite_array_index}><span class="glyphicon glyphicon-check"
                                    aria-hidden="true"></span>${file_datetime_str + ' ' + composite_type_name}<span class="glyphicon glyphicon-cog invisible"
                                    aria-hidden="true"></span><span class="glyphicon glyphicon-remove pull-right"
                                    aria-hidden="true"></span></h3>
                        </div>
                        <div class="panel-body">
                            <div class="list-group">` +
        /*
            <a href="#" class="list-group-item active">
                <span class="glyphicon glyphicon-check" aria-hidden="true"></span>500hPa 高空填图<span
                    class="glyphicon glyphicon-cog invisible pull-right" aria-hidden="true"></span>
            </a>
            <a href="#" class="list-group-item"><span class="glyphicon glyphicon-check"
                    aria-hidden="true"></span>500hPa 高度场<span
                    class="glyphicon glyphicon-cog invisible pull-right"
                    aria-hidden="true"></span></a>
            <a href="#" class="list-group-item"><span class="glyphicon glyphicon-unchecked"
                    aria-hidden="true"></span>500hPa 温度场<span
                    class="glyphicon glyphicon-cog invisible pull-right"
                    aria-hidden="true"></span></a>
                    */
        listhtml + `</div>
                        </div>
                    </div>`;

    return result;

}


const draw_request = async (transform) => {

    console.time("draw_request");
    /**/
    //no need to redraw but need when first load
    //await draw_map();

    var map_canvas = $('#map-canvas')[0];
    var map_context = map_canvas.getContext('2d');

    map_context.clearRect(0, 0, map_canvas.width, map_canvas.height);

    console.time("draw_map");
    await draw_map_canvas({ transform });
    console.timeEnd("draw_map");

    var weather_canvas = $('#plot-canvas')[0];
    var weather_context = weather_canvas.getContext('2d');

    weather_context.clearRect(0, 0, weather_canvas.width, weather_canvas.height);//no need to clear

    /*
    var content = await get_data_diamond4("https://likev.github.io/test/high-surface-data/surface-p0-20050220.000");

    console.time("draw_surcace");
    content = clip_lonlat(content, 30, 180, 70, 0);
    draw_diamond4_canvas(content, { transform, color: '#333', smooth: true });
    console.timeEnd("draw_surcace");
    */
    let get_data_diamond = (type) => {
        return window[`get_data_diamond${type}`];
    }

    let draw_diamond_canvas = (type) => {
        return window[`draw_diamond${type}_canvas`];
    }

    for (let c of composite_array) {
        let file_datetime = moment(c[0]), ctype = compositeType[c[1]];
        for (let item of ctype) {
            let filetype = item.filetype;
            var content = await get_data_diamond(filetype)(`https://likev.github.io/test/high-surface-data/${item.name}-${item.level}-${file_datetime.format('YYMMDDHH')}.000`);

            if (item.show) draw_diamond_canvas(filetype)(content, { transform, ...item.config });
        }
    }

    console.timeEnd("draw_request");

}

var transform_current = { x: 0, y: 0, k: 1 };

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
*/
    content = await get_data_diamond4("https://likev.github.io/test/high-surface-data/height-500-20050220.000");

    content = clip_lonlat(content, 30, 180, 70, 0);
    draw_diamond4_canvas(content, { transform, color: 'blue', thresholds: d3.range(500, 600, 4) })
    /*
        content = await get_data_diamond4("https://likev.github.io/test/high-surface-data/temper-500-20050220.000");
    
        content = clip_lonlat(content, 30, 180, 70, 0);
        //draw_diamond4(content, { color: 'red', thresholds: d3.range(-40, 40, 4) })
        draw_diamond4_canvas(content, { transform, color: 'red', thresholds: d3.range(-40, 40, 4) });
    
    */
    content = await get_data_diamond2("https://likev.github.io/test/high-surface-data/plot-500-20050220.000");
    draw_diamond2_canvas(content, { transform, color: '#333' });


    //    content = await get_data_diamond1("https://likev.github.io/test/high-surface-data/surface-plot-20050220.000");
    //    draw_diamond1_canvas(content, { transform, color: '#333' });


    console.timeEnd("draw_demo");
}

const zoomg = d3.select("#zoom");
/**/
d3.select("#plot-svg")//#plot-canvas
    .call(d3.zoom()
        //.extent([[0, 0], [width, height]])
        .scaleExtent([1, 8])
        .on("zoom", zoomed));

function zoomed() {
    //zoomg.attr("transform", d3.event.transform);
    transform_current = d3.event.transform;
    //draw_demo(transform_current)
    draw_request(transform_current);
}

//draw_demo()



$('#request').click(function () {

    let [file_datetime, composite_type] = [$('#file-datetime').val(), $('#composite-type').val()];

    composite_array.push([file_datetime, composite_type]);

    $('#composite-list').prepend(generate_composite_item(composite_array.length - 1));

    draw_request(transform_current);

    location.hash = `/${file_datetime}/${composite_type}/`;//fixedEncodeURIComponent(`/${file_datetime}/${composite_type}/`)
}
)

$('#composite-list').on('click', '.panel-title .glyphicon-remove', function () {

    let composite_array_index = $(this).parents('.panel-title').data('index');

    composite_array.splice(composite_array_index, 1);

    $(this).parents('.panel').remove();

    draw_request(transform_current);

})

$('#composite-list').on('click', '.panel-title .glyphicon-check, .panel-title .glyphicon-unchecked', function () {

    $(this).toggleClass('glyphicon-check');
    $(this).toggleClass('glyphicon-unchecked');

    var is_show = $(this).hasClass('glyphicon-check');

    let panel = $(this).parents('.panel');
    let checkbox = panel.find('.panel-body .glyphicon-check, .panel-body .glyphicon-unchecked');
    if (is_show) {
        checkbox.removeClass('glyphicon-unchecked').addClass('glyphicon-check');
    } else {
        checkbox.removeClass('glyphicon-check').addClass('glyphicon-unchecked');
    }

    let composite_array_index = $(this).parents('.panel').data('index'),
        composite_type_name = composite_array[composite_array_index][1],
        ctype = compositeType[composite_type_name];

    for (let plot of ctype) {
        plot.show = is_show;
    }
    draw_request(transform_current);

})

$('#composite-list').on('click', '.panel-body .glyphicon-check, .panel-body .glyphicon-unchecked', function () {

    let composite_array_index = $(this).parents('.panel').data('index');
    let plot_index = $(this).parents('.list-group-item').data('index');

    $(this).toggleClass('glyphicon-check');
    $(this).toggleClass('glyphicon-unchecked');

    var is_show = $(this).hasClass('glyphicon-check');

    let composite_type_name = composite_array[composite_array_index][1],
        ctype = compositeType[composite_type_name];

    ctype[plot_index].show = is_show;

    draw_request(transform_current);

})

const init = async () => {

    await draw_map_canvas();

    var hash = location.hash.substring(1),
        code = decodeURIComponent(hash);

    if (code) {
        let [file_datetime, composite_type] = code.slice(1, -1).split('/');
        $('#file-datetime').val(file_datetime);
        $('#composite-type').val(composite_type);

        $('#request').click();
    }

}

init();