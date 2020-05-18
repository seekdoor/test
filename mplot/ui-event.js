//require('get-data.js')
//require('clip-lonlat.js')
//require('draw-map.js')
//require('draw-diamond-file.js')
//require('utils.js')

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

const get_top_bottom_level = (level, top_or_bottom) => {
    let levels_all = ['925', '850', '700', '500', '400', '300', '200', '100'];
    let index = levels_all.indexOf(level);

    let result = false;

    if (index === -1);
    else if (top_or_bottom === 'top' && index < levels_all.length - 1) result = levels_all[index + 1];
    else if (top_or_bottom === 'bottom' && index > 0) result = levels_all[index - 1];

    return result;

}

const get_top_bottom_plot = (plot, top_or_bottom) => {
    let newplot = clone_object(plot);
    newplot.level = get_top_bottom_level(newplot.level, top_or_bottom);

    newplot.config.thresholds = d3.range(-2000, 2000, 4);//need optimize


    return newplot;

}

const composite_array = [];

const generate_plot_item = (item, plot_index) => {
    //let item = compositeType[composite_type_name];

    let plot = item[plot_index]

    let plot_name = `${plot.level} ${plot.name}`;

    let result = `<a href="#" class="list-group-item" data-index=${plot_index}><span class="glyphicon  ${plot.show ? 'glyphicon-check' : 'glyphicon-unchecked'} "
    aria-hidden="true"></span>${plot_name}<span
    class="glyphicon glyphicon-cog invisible pull-right"
    aria-hidden="true"></span></a>`;

    return result;
}

const generate_composite_item = (composite_array_index) => {
    let [file_datetime_str, composite_type_name, ctype] = composite_array[composite_array_index];

    let file_datetime = +moment(file_datetime_str);

    var listhtml = '';
    for (let i = 0; i < ctype.length; i++) {
        listhtml += generate_plot_item(ctype, i);
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

var transform_current = { x: 0, y: 0, k: 1 };//need when draw new data or ui caused redraw

let data_api = 'http://localhost:2020/data';
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
        let file_datetime = moment(c[0]), ctype = c[2];
        for (let item of ctype) {
            let filetype = item.filetype;
            //var content = await get_data_diamond(filetype)(`https://likev.github.io/test/high-surface-data/${item.name}-${item.level}-${file_datetime.format('YYMMDDHH')}.000`);

            var content = await get_data_diamond(filetype)(`${data_api}/${file_datetime.format('YYYY-MM-DD HH:mm')}/${item.name}/${item.level}`);

            if (transform === transform_current && content && item.show) draw_diamond_canvas(filetype)(content, { transform, ...item.config });
        }
    }

    console.timeEnd("draw_request");

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

    draw_request(transform_current);
}



$('#request').click(function () {

    let [file_datetime, composite_type_name] = [$('#file-datetime').val(), $('#composite-type').val()];

    composite_array.push([file_datetime, composite_type_name, clone_object(compositeType[composite_type_name])]);

    $('#composite-list').prepend(generate_composite_item(composite_array.length - 1));

    $($('#composite-list .panel')[0]).click();

    draw_request(transform_current);

    location.hash = `/${file_datetime}/${composite_type_name}/`;//fixedEncodeURIComponent(`/${file_datetime}/${composite_type_name}/`)
}
)

$('#composite-list').on('click', '.panel', function () {
    $('#composite-list .panel-primary').removeClass('panel-primary').addClass('panel-default');
    $(this).removeClass('panel-default').addClass('panel-primary');
})

let request_top_bottom = (top_or_bottom) => {
    let this_panel = $('.panel-primary');
    let composite_array_index = this_panel.data('index');

    let ctype = composite_array[composite_array_index][2];

    composite_array[composite_array_index][1] = 'composite';

    for (let i = 0; i < ctype.length; i++) {
        ctype[i] = get_top_bottom_plot(ctype[i], top_or_bottom);
    }

    let newpanel = $(generate_composite_item(composite_array_index));
    this_panel.before(newpanel);
    $(newpanel).click()

    this_panel.remove();

    draw_request(transform_current);
}

$(document).keyup(function (e) {
    let top_or_bottom = '';
    console.log(e.which)
    switch (e.which) {
        case 37://left
            //time left
            break;
        case 38://top
            top_or_bottom = 'top';

            request_top_bottom(top_or_bottom);

            break;
        case 39://right
            //time right
            break;
        case 40://bottom
            //bottom level
            top_or_bottom = 'bottom';

            request_top_bottom(top_or_bottom);
            break;
        default: break;
    }
})

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
        ctype = composite_array[composite_array_index][2];

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

    let ctype = composite_array[composite_array_index][2];

    ctype[plot_index].show = is_show;

    draw_request(transform_current);

})

$(window).resize(function () {
    var top = $('#plot').position().top;
    var width = $(window).width(), height = $(window).height() - top;

    $('#plot').width(width).height(height);
    $('#plot-svg, #map-canvas, #plot-canvas').each(function () {
        $(this).attr({ 'width': width, height: height });
    })

    draw_request(transform_current);
})

$(window).resize();

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