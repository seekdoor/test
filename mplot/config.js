//require('get-data.js')
//require('clip-lonlat.js')
//require('ui-event.js')
//require('utils.js')

Vue.component('w-element', {
    props: ['title', 'value'],
    methods: {
        toggle_show: function(){
            this.value.show = !this.value.show;
            this.onchange();
        },

        onchange: function (e) {
            
            console.log('vue-change');
            
            this.$emit('change', this.value)
        }
    },
    template: `<div class='element-config'>
    <span class="check-span" v-on:click="toggle_show"
        v-bind:class="{ select: value.show }">{{value.name}}</span>
    ≥
    <input size=3 v-model.lazy="value.a" v-on:change="onchange">

    <select v-model="value.andor" v-on:change="onchange">
        <option>and</option>
        <option>or</option>
    </select>

    ≤
    <input size=3 v-model.lazy="value.b" v-on:change="onchange">
</div>`
})

var elements = {
    T: { name: 'T', show: true, a: 2, b: `1`, andor: 'and' },
    Td: { name: 'Td', show: false, a: 2, b: `1`, andor: 'and' }
};


var diamond1Config = new Vue({
    el: '#diamond1-config',
    data: {
        elements
    },

    methods: {
        redraw: function (e) {
            console.log('vue-redraw');
            draw_request(transform_current);
        }
    }
})

var diamond2Config = new Vue({
    el: '#diamond2-config',
    data: {
        elements
    },

    methods: {
        redraw: function (e) {
            console.log('vue-redraw');
            draw_request(transform_current);
        }
    }
})

$('#composite-list').on('click', '.panel-body .glyphicon-cog', function () {

    let composite_array_index = $(this).parents('.panel').data('index');
    let plot_index = $(this).parents('.list-group-item').data('index');

    $('#config .panel-body>div').hide();

    let ctype = composite_array[composite_array_index][2];

    let plot_info = ctype[plot_index];

    if(plot_info.filetype === 1){
        
        diamond1Config.elements = plot_info.config.elements;

        $('#config .panel-title').text('地面填图配置');
        $('#config, #diamond1-config').show();
    } 
    else if(plot_info.filetype === 2){
        diamond2Config.elements = plot_info.config.elements;

        $('#config .panel-title').text('高空填图配置');
        $('#config, #diamond2-config').show();
    }else{
        $('#config .panel-title').text('...');
    } 

    $('#plot').removeClass('col-md-12').addClass('col-md-9');

})

$('#config .close').click(function(){
    $('#config').hide();
    $('#plot').removeClass('col-md-9').addClass('col-md-12');
})