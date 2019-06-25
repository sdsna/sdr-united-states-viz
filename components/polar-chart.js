var polar_chart_component = Vue.extend({
  template: '#polar-chart-vue-template',
  props: {
    indicator: [Number, String],
    country_column_data: Object,
    country: Object,
    label: String,
    iso_focus: String,
    iso_hover: String,
    behavior: {
      type: String,
      default: 'goToCountry'
    },
    sdg: {
      type: [String, Number],
      default: 0
    },
    breakpoint: {
      type: [String, Number]
    },
  },
  data: function () {
    return {
      gchart: null,
      chartOptions: {},
    }
  },
  replace: false,
  computed: {

    backgroundColor: function(){
			var colors = new Array(17).fill('#eee');

			if(typeof this.country !== 'undefined') {
        for (var i = 0; i < 17; i++) {
          if(this.sdg == i+1 || !this.sdg){
            //highlight an SDG
            if(this.country.color_sdgs[i] == "NA" || i == 13 || i == 16){}
            else if(i == 14 || i == 15) colors[i] = global_colors[this.country.color_sdgs[i-1]];
  					else colors[i] = global_colors[this.country.color_sdgs[i]] ;
          }
          else{
  					if(this.country.color_sdgs[i] == "NA" || i == 13 || i == 16){}
            else if(i == 14 || i == 15) colors[i] = global_colors_transparency[this.country.color_sdgs[i-1]];
  					else colors[i] = global_colors_transparency[this.country.color_sdgs[i]] ;
          }
				}
      }

			return colors;
		},

  },
  methods: {

    createChart: function(){

      var that = this;

      if(!this.gchart){

				var labels = [];

				for(var sdg in vm.sdg_titles) {
				  labels.push(vm.sdg_titles[sdg]);
				}

				var data = [];

				for (var i = 0; i < 17; i++) {
					if(this.country.score_sdgs[i] == "NA" || i == 13 || i == 16) data.push(0);
          else if(i == 14 || i == 15) data.push(this.country.score_sdgs[i-1]);
					else data.push(this.country.score_sdgs[i]);
				}

				var chartOptions = {
					type: 'polarArea',
					data: {
						labels: labels,
						datasets: [{
							data: data,
							backgroundColor: this.backgroundColor,
						}]
					},
					options: {
						scale: {
							ticks: {
								max: 100,
								min: 0,
								stepSize: 20,
							},
						},
						layout: {
							padding: 30
						},
						responsive: true,
						maintainAspectRatio: false,
						legend:{
							display: false
						},
						onClick: function(e, elements){
							if(typeof elements[0] !== 'undefined') {
                // vm.current_sdg = elements[0]._index + 1;
                app.goToCountrySDG(vm.current_iso, elements[0]._index + 1);
              }
						}
					},
				};

				var canvas = document.getElementById('polar-chart-' + this._uid);
				this.gchart = new Chart(canvas, chartOptions);

				this.addLabels();

			}
		},

    addLabels: function(){
    	var canvas = document.getElementById('polar-chart-labels-' + this._uid);
    	var chart_canvas = document.getElementById('polar-chart-' + this._uid);

    	var radius = 140, radians = 0;

    	var ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);

    	ctx.font = '12px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"';
    	ctx.fillStyle = "#ccc";
    	ctx.textAlign="center";

    	var width = chart_canvas.clientWidth;
    	var height = chart_canvas.clientHeight;

    	ctx.canvas.width = width;
    	ctx.canvas.height = height;

    	if(window.devicePixelRatio) {

    		ctx.canvas.width = width * window.devicePixelRatio;
    		ctx.canvas.height = height * window.devicePixelRatio;

    		canvas.style.width = width + "px";
    		canvas.style.height = height + "px";

    		ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    	}

    	var min = Math.min(width, height);

      min = min - 30;

    	radius = min / 2 - 10;

      var extra = 0;

    	for (var i = 0; i < 17; i++) {
    		radians = Math.PI - Math.PI / 17 - 2 * Math.PI * i / 17;
        if(i == 11 || i == 12 || i == 13) extra = -16;
        else if(i == 10 || i == 9) extra = -10;
        else if(i == 8) extra = -6;
    		ctx.fillText("SDG" + (i+1),Math.sin(radians) * radius + width/2 - 6 + extra,Math.cos(radians) * radius + height/2 + 4);

    	}

    },

    updateChart: function(){
      if(this.gchart){
				//the chart exists
				this.gchart.data.datasets[0].backgroundColor = this.backgroundColor;

				var data = [], labels = [], isos = [];

        for (var i = 0; i < 17; i++) {
					if(this.country.score_sdgs[i] == "NA" || i == 13 || i == 16) data.push(0);
          else if(i == 14 || i == 15) data.push(this.country.score_sdgs[i-1]);
					else data.push(this.country.score_sdgs[i]);
				}

        this.gchart.data.datasets[0].data = data;

        this.gchart.update();

			}
			else this.createChart();
    },

    updateChartFocus: function(){
      if(this.gchart){
				//the chart exists
				this.gchart.data.datasets[0].backgroundColor = this.backgroundColor;

        this.gchart.update();

			}
			else this.createChart();
    },

    resize: function() {

      var that = this;

      setTimeout(function(){ that.addLabels(); }, 100);

      // console.log('resizing polar')
    }

  },
  mounted: function() {
    this.createChart();
  },
  watch: {
    'country' (to, from) {
      this.updateChart()
    },
    'sdg' (to, from) {
      this.updateChart()
    },
    'breakpoint' (to, from) {
      this.resize()
    },
  }

});

Vue.component('polar-chart', polar_chart_component);
