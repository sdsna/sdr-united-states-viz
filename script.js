var primary_color = "#17a2b8";
var average_color = "#6c757d";
var hover_color = "#cccccc";
var primary_color_semitransparent = "rgba(36, 162, 183, .8)";
var title = "SDG Report of the United States 2018";
var global_colors = ["rgb(220,53,69)", "rgb(233,139,58)", "rgb(242,204,60)", "rgb(40,167,69)", "rgb(216,216,216)"];
var global_colors_transparency = ["rgba(220,53,69,0.3)", "rgba(233,139,58,0.3)", "rgba(242,204,60,0.3)", "rgba(40,167,69,0.3)", "rgba(216,216,216,0.3)"];

var svg, mapData, colorScale, projection, projection_small, path_small, path, mapRatio = .5;

var states_order = {
	1: "AL",// ok
	2: "AK",// ok

	4: "AZ",// ok
	5: "AR",// ok
	6: "CA",// ok

	8: "CO",// ok
	9: "CT",// ok
	10: "DE", // ok
	// 11: "DC", // ok
	12: "FL",// ok
	13: "GA",// ok

	15: "HI",// ok
	16: "ID",// ok
	17: "IL",// ok
	18: "IN",// ok
	19: "IA",// ok
	20: "KS",// ok
	21: "KY",// ok
	22: "LA",// ok
	23: "ME",// ok
	24: "MD",// ok
	25: "MA",// ok
	26: "MI",// ok
	27: "MN",// ok
	28: "MS",// ok
	29: "MO",// ok
	30: "MT",// ok
	31: "NE",// ok
	32: "NV",// ok
	33: "NH",// ok
	34: "NJ",// ok
	35: "NM",// ok
	36: "NY",// ok
	37: "NC",// ok
	38: "ND",// ok
	39: "OH",// ok
	40: "OK",// ok
	41: "OR",// ok
	42: "PA",// ok
	44: "RI",// ok
	45: "SC",// ok
	46: "SD",// ok
	47: "TN",// ok
	48: "TX",// ok
	49: "UT",// ok
	50: "VT",// ok
	51: "VA",// ok

	53: "WA",// ok
	54: "WV",// ok
	55: "WI",// ok
	56: "WY"// ok
};

function getBreakpoint(){

	var width = $(window).width();

	if(width >= 1200){
		return 'xl'
	}
	else if(width >= 992){
		return 'lg'
	}
	else if(width >= 768){
		return 'md'
	}
	else{
		return width;
	}

}

var div_tooltip = d3.select("body").append("div")
.attr("class", "d3-tip")
.attr("id", "d3-tip");

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function scale(x, y){

	var chartDiv = document.getElementById("regions_div");
	var width = chartDiv.clientWidth;
	var height = chartDiv.clientHeight;

	if(width >= 1200){
		//1400 x 600
	}
	else if(width >= 992){
		//1157 x 496
		x = x * 1157 / 1400;
		y = y * 496 / 600;
	}
	else if(width >= 768){
		//896 x 384
		x = x * 896 / 1400;
		y = y * 384 / 600;
	}
	else if(width >= 576){
		//672 x 288
		x = x * 672 / 1400;
		y = y * 288 / 600;
	}

	return {cx: x, cy: y};
}

function colorSDG(value) {
	switch (value) {
		case 'green':
		return 'rgba(40,167,69,.8)';
		break;
		case 'yellow':
		return 'rgba(242,204,60,.8)';
		break;
		case 'orange':
		return 'rgba(233,139,58,.8)';
		break;
		case 'red':
		return 'rgba(220,53,69,.8)';
		break;
		case 'gray': default:
		return 'rgba(216,216,216,.8)';
		break;
	}
};

function change_favicon(iso) {

	var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
	link.type = 'image/x-icon';
	link.rel = 'shortcut icon';
	link.href = 'resources/flags/png/' + iso.toLowerCase() + '.png';
	document.getElementsByTagName('head')[0].appendChild(link);

}

vm.breakpoint = getBreakpoint();

$(window).resize(function() {
	vm.breakpoint = getBreakpoint();
});

$(window).scroll(function() {
  var nav = $('#small-sdgs');
  var body = $('body');
  var top = 56;
  var height = 56;
  var logo_top = 842;

  if ($(window).scrollTop() >= logo_top) {

      nav.addClass('show-sdgs');

  } else {
      nav.removeClass('show-sdgs');
  }
});

/* VUE FILTERS */

Vue.filter('percentage', function (thenumber) {

	thenumber = Math.abs(parseFloat(thenumber) * 100);

	if(isFinite(thenumber)){

		if(thenumber >= 100) thenumber = (thenumber).toFixed(0) ;
		else thenumber = (thenumber).toFixed(1) ;

		return thenumber + "%";
	}
	else{
		return "-";
	}
});

function stringNumberWithThousandSeparator(x, separator) {
	return x.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

Vue.filter('numberOrNull', function (value) {
	if (value == null || isNaN(value)) return "-";
	return value
});

Vue.filter('decimals', function (value, decimals) {
	if(value == "NA") return value;
	if(value == null || isNaN(value)) return "-";
	return parseFloat(value).toFixed(decimals)
	// return value;
});

Vue.filter('indicatorName', function (value) {
	if(value.match(/\(([^)]+)\)/)) return value.replace(value.match(/\(([^)]+)\)/)[0], "");
	return value;
});

Vue.filter('indicatorUnit', function (value) {
	if(value.match(/\(([^)]+)\)/)) return value.match(/\(([^)]+)\)/)[0];
	return "";
});

Vue.filter('units', function (value) {
	return value.replace("CO2", "CO&#8322;").replace("SO2", "SO&#8322;").replace("mi2", "mi&#178;")
});

Vue.filter('flag', function (value) {
	if(value){
		value = value.toLowerCase();
		value = value.replace(" ", "-").replace(",", "").replace(".", "").replace("'", "");
	}
	return value;
});

// Define some routes
var routes = [
	// dynamic segments start with a colon
	{ path: '/', name: 'landing', },
	{ path: '/SDG/:sdg',
		name: 'sdg',
		children: [
      {
        // UserProfile will be rendered inside User's <router-view>
        // when /user/:id/profile is matched
        path: ':iso',
        name: 'sdg-country'
      }
    ]
	},
	{ path: '/:iso',
		name: 'country',
		children: [
			{
				// UserProfile will be rendered inside User's <router-view>
				// when /user/:id/profile is matched
				path: ':sdg',
				name: 'country-sdg'
			}
		]
	},

];

// Create the router instance and pass the `routes` option
var router = new VueRouter({
	routes, // short for `routes: routes`
	linkActiveClass: "active",
	scrollBehavior (to, from, savedPosition) {
		switch (to.name) {
			case "country":
			if(from.name == "landing") return { x: 0, y: 0 }
			break;
			default:
			if (savedPosition) {
				return savedPosition
			}

		}
	}
});

router.beforeEach((to, from, next) => {

	switch (to.name) {
		case 'country': case 'country-sdg':
		if(vm.countries.hasOwnProperty(to.params.iso)) {
			document.title = vm.countries[to.params.iso].name + " - " + title;
			change_favicon(to.params.iso);
		}
		break;
		case 'sdg': case 'sdg-country':
		if(true) {
			document.title = vm.sdg_titles[to.params.sdg] + " - " + title;
			// change_favicon(to.params.iso);
		}
		break;
		default:
		document.title = title;
		change_favicon('');
	}
	next()
});

var app = new Vue({
	el: '#app',
	router,
	data: vm,
	computed: {
		current_sdg_index: function(){
			var i = this.current_sdg;
			if(this.current_sdg == 15 || this.current_sdg == 16) i = this.current_sdg - 1;
			return i - 1;
		},
		country: function(){
			return this.countries[this.current_iso];
		},
		sdg: function(){
			return this.sdgs[this.current_sdg];
		},
		page: function(){
			switch(this.view){
				case 'sdg-country':
				return 'sdg';
				break;
				case 'country-sdg':
				return 'country';
				break;
				default:
				return this.view;
				break;
			}
		},
		filteredCountries: function() {

			var filteredList =  {};

			for(var code in this.countries) {
				if(this.countries[code].name.toLowerCase().startsWith(this.search.toLowerCase())) filteredList[code] = this.countries[code];
			}

			return filteredList;
		},

		orderedCountries: function () {

			var sortable=[];
			for(var code in this.countries){
				if(this.countries.hasOwnProperty(code)){
					if(this.countries[code].name.toLowerCase().startsWith(this.search.toLowerCase())){
						sortable.push(this.countries[code]);
					}
				}
			}

			var sort = this.sort_by;
			var sort_sdg = this.sort_sdg;
			var direction = this.sort_direction;

			//sort items by value
			sortable.sort(function(a, b)
			{
				switch (sort) {
					case 'region': // abc
					if (a.region < b.region)
					return (direction ? 1 : -1);
					if (a.region > b.region)
					return (direction ? -1 : 1);
					//only gets here for result = 0
					if (a.name < b.name)
					return (direction ? 1 : -1);
					if (a.name >= b.name)
					return (direction ? -1 : 1);
					break;
					case 'rank': // rank
					if(!a.global_index_rank){
						return 100;
					}
					if(!b.global_index_rank){
						return -200;
					}
					if (a.global_index_rank < b.global_index_rank)
					return (direction ? 1 : -1);
					if (a.global_index_rank > b.global_index_rank)
					return (direction ? -1 : 1);
					break;
					case 'sdg': // abc
					if (a.score_sdgs[sort_sdg-1] < b.score_sdgs[sort_sdg-1])
					return (direction ? 1 : -1);
					if (a.score_sdgs[sort_sdg-1] >= b.score_sdgs[sort_sdg-1])
					return (direction ? -1 : 1);
					break;
					default: // abc
					if (a.name < b.name)
					return (direction ? 1 : -1);
					if (a.name >= b.name)
					return (direction ? -1 : 1);
				}

			});

			return sortable;
		},

	},
	methods: {

		compute_index: function(n){
			var i = n;
			if(n == 13 || n == 14) i = n + 1;
			return i;
		},

		sdg_average: function(){
			var avg = 0;
			for(var code in this.countries){
				if(this.countries.hasOwnProperty(code)){

					if(this.current_sdg) avg += parseFloat(this.countries[code].score_sdgs[this.current_sdg_index])
					else avg += parseFloat(this.countries[code].global_index_score)

				}
			}

			return (avg / this.total_countries).toFixed(1);
		},

		sortOrder: function(order){
			if(this.sort_by != order) this.sort_by = order;
			else this.sort_direction = !this.sort_direction;
		},
		showValue: function(val){

			if(val == "OECD-ONLY" || val == "NON-OECD"){
				return false;
			}
			return true;
		},
		goToCountry: function(iso, sdg){
			// console.log('goToCountry', iso, sdg)
			if(sdg) this.goToCountrySDG(iso, sdg)
			else router.push({ name: 'country', params: { iso: iso }})
		},
		goToSDG: function(sdg, iso){
			// this.current_sdg = sdg;
			if(iso) this.goToSDGCountry(sdg, iso)
			else router.push({ name: 'sdg', params: { sdg: sdg }})
		},
		goToCountrySDG: function(iso, sdg){
			// this.current_sdg = sdg;
			router.push({ name: 'country-sdg', params: { iso: iso, sdg: sdg }})
		},
		goToSDGCountry: function(sdg, iso){
			// this.current_sdg = sdg;
			router.push({ name: 'sdg-country', params: { iso: iso, sdg: sdg }})
		},
		tooltipSDG: function(event,sdg, n){

			var element = jQuery(event.target);
			var rect = element.offset();

			d3.select("#sdg-tooltip").html("<strong>"+this.sdg_titles[n+1]+"</strong>: " + sdg);

			var tooltip_div = document.getElementById("sdg-tooltip");
			var width = tooltip_div.clientWidth;
			var height = tooltip_div.clientHeight;

			d3.select("#sdg-tooltip")
			.style("left", (rect.left + element.width()/2 - width/2) + "px")
			.style("top", (rect.top - height - 8) + "px")
			.style("opacity", 1);

		},
		hideTooltipSDG: function(){
			d3.select("#icon-tooltip").style("opacity", 0);
		},
		download_indicator(sdg, indicator){

			var separator = ",";

			var values = this.country_column_data_sdg[sdg][indicator].values;
			var labels = this.country_column_data_sdg[sdg][indicator].labels;
			var name = this.sdgs[sdg].indicators[indicator-1].title;

			var data = {labels, values, name};

      var filename = "sdg-"+sdg+"-indicator-"+indicator+"-data.csv";

			var text = "Rank,State,\"" + data.name + "\"\r\n";

			for (var i = 0; i < data.labels.length; i++) {
				text += (i+1) + separator + data.labels[i] + separator + data.values[i] + "\r\n";
			}

      this.download(text, filename);

		},
		download_sdg(sdg){

			var separator = ",";

			var values = this.country_column_data_sdg[sdg].globals.values;
			var labels = this.country_column_data_sdg[sdg].globals.labels;
			var isos = this.country_column_data_sdg[sdg].globals.isos;
			var name = this.sdg_titles[sdg];

			var data = {labels, values, name};

      var filename = "sdg-"+sdg+"-data.csv";

			var text = "";

			var header = "Rank,State,\"" + data.name + "\"";

			for (var i = 0; i < this.sdgs[sdg].indicators.length; i++) {
				header += separator + "\"" + this.sdgs[sdg].indicators[i].title + " (" + this.sdgs[sdg].indicators[i].units + ")\"";

			}

			header += "\r\n";

			text = header;

			for (var i = 0; i < data.labels.length; i++) {
				text += (i+1) + separator + data.labels[i] + separator + data.values[i];

				for (var j = 0; j < this.countries[isos[i]].sdgs[sdg].length; j++) {
					text += separator + this.countries[isos[i]].sdgs[sdg][j].value;
				}

				text += "\r\n";

			}

      this.download(text, filename);

		},
		download: function(text, filename){

			var element = document.createElement('a');

			element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
			element.setAttribute('download', filename);

			element.style.display = 'none';
			document.body.appendChild(element);

			element.click();

			document.body.removeChild(element);
		},
		processRoute: function(){
			this.view = this.$route.name;
			// console.log(this.$route.params)

			switch (this.$route.name) {
				case 'country': case 'country-sdg':

					this.focus = 'map';

					if(this.$route.params.iso){
						if(this.countries.hasOwnProperty(this.$route.params.iso)){

							this.current_iso = this.$route.params.iso;

							if(this.$route.name == 'country-sdg'){
								if(this.$route.params.sdg == 14
									|| this.$route.params.sdg >= 17
								  || this.$route.params.sdg <= 0
								  || isNaN(this.$route.params.sdg)
								) router.push({ name: 'country', iso: this.$route.params.iso})
								else this.current_sdg = this.$route.params.sdg;
							}
							else{
								this.current_sdg = 0;
							}

						}
						else router.push({ name: 'landing' })
					}
				break;
				case 'sdg': case 'sdg-country':

					if(this.$route.params.sdg){
						if(this.$route.params.sdg == 14
							|| this.$route.params.sdg >= 17
							|| this.$route.params.sdg <= 0
							|| isNaN(this.$route.params.sdg)
						) router.push({ name: 'landing' })

							if(this.$route.name == 'sdg') this.focus = 'map';

							this.current_sdg = this.$route.params.sdg;

							if(this.$route.name == 'sdg-country'){
								if(this.countries.hasOwnProperty(this.$route.params.iso)) this.iso_focus = this.$route.params.iso;
								else router.push({ name: 'sdg', sdg: this.$route.params.sdg})
							}
							else{
								this.iso_focus = "";
							}

						}

					break;
					case 'landing':
						this.current_sdg = 0;
					break;
				}

		},
		scrollFix: function(hashbang)
    {
			$('html, body').animate({
			    scrollTop: ($(hashbang).offset().top - 148)
			},500);
    },
		selectScroll: function(event)
    {
			console.log(event.target.value)
			var hashbang = '#indicator-' + event.target.value
			this.scrollFix(hashbang)
			router.push(hashbang)
    }
	},
	watch: {
		'$route' (to, from) {
			if(to.name == "country-sdg" && from.name == "country-sdg" && to.params.sdg == from.params.sdg){}
			else this.current_indicator = 0;
			this.processRoute();
		},
		//this is only so we can change values programmatically...
		'current_iso'(to, from){
			console.log('iso updated to '+ to)
			this.$route.params.iso = to;
			router.push({ name: this.$route.name, iso: to})
		},
		'iso_focus'(to, from){
			console.log('iso_focus updated to '+ to, this.$route.name)
			this.$route.params.iso = to;
			router.push({ name: this.$route.name == 'sdg' ? 'sdg-country' : this.$route.name, iso: to})
		},
		// 'current_sdg'(to, from){
		// 	console.log('current_sdg updated to '+ to, this.$route.name)
		// 	this.$route.params.sdg = to;
		// 	router.push({ name: this.$route.name == 'country' ? 'country-sdg' : this.$route.name, sdg: to})
		// }
	},
	created: function(){
		this.view = this.$route.name;
	},
	mounted: function(){

		this.processRoute();

		if(this.$route.hash) {
			// console.log(this.$route.hash);
			setTimeout(() => this.scrollFix(this.$route.hash), 1);
		}

		vm.loading = false;

	}
});
