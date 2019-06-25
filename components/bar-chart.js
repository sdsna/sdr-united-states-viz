var bar_chart_component = Vue.extend({
  template: '#bar-chart-vue-template',
  props: {
    indicator: [Number, String],
    rank: [Number, String],
    country_column_data: Object,
    country: Object,
    label: String,
    iso_focus: String,
    iso_hover: String,
    behavior: {
      type: String,
      default: 'goToCountry'
    },
    height: {
      type: [String, Number],
      default: 150
    },
    average: {
      type: String,
      default: ''
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
			var colors = new Array(this.$root.total_countries).fill('#eee');

			if(typeof this.country !== 'undefined') colors[this.rank - 1] = primary_color;

      if(typeof this.iso_hover !== 'undefined'){

        var index = this.country_column_data.isos.indexOf(this.iso_hover)
        colors[index] = hover_color;
      }

      if(typeof this.iso_focus !== 'undefined'){

        var index = this.country_column_data.isos.indexOf(this.iso_focus)
        colors[index] = primary_color;
      }

			return colors;
		},

    annotation: function(){
      //https://github.com/chartjs/chartjs-plugin-annotation
      return [{
        type: 'line',
        mode: 'horizontal',
        scaleID: 'y-axis-0',
        value: this.average,
        borderColor: average_color,
        borderWidth: 1,
        borderDash: [2, 2],
        label: {
          enabled: true,
          position: "right",
          backgroundColor: average_color,
          xAdjust: 3,
          yAdjust: -15,
          content: 'Average: ' + this.average
        }
      }];

    }

  },
  methods: {

    createChart: function(){

      var that = this;

			if(!this.gchart){

				this.chartOptions = {
					type: 'bar',
					data: {
						labels: this.country_column_data.labels,
						datasets: [{
							label: this.label.replace("&#8322;", "₂").replace("&#178;", "²"),
							data: this.country_column_data.values,
							backgroundColor: this.backgroundColor,
						 }
            ]
					},
					options: {
						scales: {
							yAxes: [{
								display: false,
                ticks: {
                  beginAtZero: true
                }
							}],
							xAxes: [{
								display: false,
								categoryPercentage: 1,
								barPercentage: .9
							}]
						},
						responsive: true,
						maintainAspectRatio: false,
						legend:{
							display: false
						},
            annotation: {
              annotations: this.annotation
            },
						onClick: function(e, elements){
              if(typeof elements[0] !== 'undefined') {
                var iso = that.country_column_data.isos[elements[0]._index]

  							if(that.behavior == "goToCountry") app.goToCountry(iso, vm.current_sdg)
                else {
                  if(vm.iso_focus == iso) app.goToSDG(vm.current_sdg);
                  else app.goToSDGCountry(vm.current_sdg, iso);
                }
              }
						},
            onHover: function(e, elements){
              if(typeof elements[0] !== 'undefined') {
                var iso = that.country_column_data.isos[elements[0]._index]
                vm.iso_hover = iso;
              }
              else{
                vm.iso_hover = "";
              }
						},
					},
				};

				var ctx = document.getElementById('bar-chart-' + this._uid);

				this.gchart = new Chart(ctx, this.chartOptions);
			}
		},

    updateChart: function(){
      if(this.gchart){
				//the chart exists
				this.gchart.data.datasets[0].backgroundColor = this.backgroundColor;

				var data = [], labels = [], isos = [];

				for (var i = 0; i < this.country_column_data.values.length; i++) {
					if(this.country_column_data.values[i] == "NA") data.push(0);
					else data.push(this.country_column_data.values[i]);

          labels.push(this.country_column_data.labels[i]);
				}

        this.gchart.data.labels = labels;
        this.gchart.data.datasets[0].data = data;
        this.gchart.data.datasets[0].label = this.label.replace("&#8322;", "₂").replace("&#178;", "²");

        this.gchart.options.annotation.annotations = this.annotation

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

  },
  mounted: function() {
    this.createChart();
  },
  watch: {
    'country' (to, from) {
      this.updateChart()
    },
    'country_column_data' (to, from) {
      this.updateChart()
    },
    'iso_focus' (to, from) {
      this.updateChartFocus()
    },
    'iso_hover' (to, from) {
      this.updateChartFocus()
    },
  }

});

Vue.component('bar-chart', bar_chart_component);
