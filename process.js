var settings = {
  country_start_index: 0,
  iso_index: 1,
  global_index_rank_column: 2,
  global_index_score_column: 3,
  index_score_group_column: 4,

  sdgs_column_start: 5,

  sdg_avg_column_start: 26,
  sdg_color_column_start: 9,
  indicators_column_start: 50,
}

var exportdata = [];
var thecountries = {};
var thecountry_column_data = {};
var thecountry_column_data_sdg = {};
var theheaders = {};
var thesdgs = {};
var num_decimals = 1;

var sdg_data = [];
var sdg_details = {};

function exportJSON(){

  Papa.parse("data/sdg_details.csv", {
		download: true,
		complete: function(results) {
			sdg_data = results.data;

      sdg_details = export_sdg_details();

      // console.log(sdg_data[1]);
      // console.log(sdg_details);

      process_and_download_data();

		}
	});

}

function process_and_download_data(){

  Papa.parse("data/data.csv", {
		download: true,
		complete: function(results) {
			exportdata = results.data;

      theheaders = export_headers();
      thesdgs = export_sdgs();

      thecountries = export_countries();
      thecountry_column_data = export_country_column_data();
      thecountry_column_data_sdg = export_country_column_data_sdg();

      var filename = "processed-data.js";
    	var element = document.createElement('a');

      console.log(thecountry_column_data_sdg);
      // console.log(sdg_details);

    	var text = "vm.countries=" + JSON.stringify(thecountries) + ";" ;
    	text += "vm.country_column_data=" + JSON.stringify(thecountry_column_data) + ";" ;
      text += "vm.country_column_data_sdg=" + JSON.stringify(thecountry_column_data_sdg) + ";" ;
      text += "vm.sdgs=" + JSON.stringify(thesdgs) + ";" ;

      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);

		}
	});

}

function export_sdg_details(){

  // console.log(sdg_data)

  var sdg_titles = {};

  for (var i = 1; i < sdg_data.length; i++) {

    var sdg_line = sdg_data[i];

    var sdg_indicator = sdg_line[0];
    // console.log(sdg_indicator)
    sdg_indicator = sdg_indicator.split(".");
    var sdg = parseInt(sdg_indicator[0]);
    var indicator = parseInt(sdg_indicator[1]);

    //sdg does not exist yet
    if(!sdg_titles.hasOwnProperty(sdg)){
      sdg_titles[sdg] = {
        num: sdg,
        indicators: {}
      };
    }

    //indicator does not exist yet
    sdg_titles[sdg].indicators[indicator] = {
      num: indicator,
      title: sdg_line[4],
      decimals: parseInt(sdg_line[6].substr(0,1)),
      source: sdg_line[7],
      year: sdg_line[8],
      ordering: sdg_line[9],
      units: sdg_line[5],
      description: sdg_line[10],
    };

  }

  // console.log(sdg_titles)

  return sdg_titles;
};

function export_countries(){
  var countries = {};
  var sdgs = {};
  var trend;

  for (var i = settings.country_start_index + 1; i < exportdata.length; i++) {

    sdgs = {};

    for(var sdg in thesdgs){

        sdgs[sdg] = [];
        for (var j = 0; j < thesdgs[sdg].indicators.length; j++) {

          sdgs[sdg].push({
            value: exportdata[i][settings.indicators_column_start + thesdgs[sdg].indicators[j].column_index],
            color: exportdata[i][settings.indicators_column_start + thesdgs[sdg].indicators[j].color_index]
          });
        }
    }

    index_score_group = 0;

    index_score_group = parseInt(exportdata[i][settings.index_score_group_column]);

    var color_sdgs = [];
    var score_sdgs = [];
    var rank_sdgs = [];
    // 15 SDGS x 3 columns each = 45 columns
    for (var j = settings.sdgs_column_start; j < settings.sdgs_column_start + 45; j+=3) {

      score_sdgs.push(parseFloat(exportdata[i][j].replace(',', '.')).toFixed(num_decimals))
      color_sdgs.push(parseInt(exportdata[i][j + 1]))
      rank_sdgs.push(parseInt(exportdata[i][j + 2]))

    }

    countries[exportdata[i][settings.iso_index]] = {
      index: i,
      name: exportdata[i][0],
      iso: exportdata[i][settings.iso_index],
      global_index_rank: parseInt(exportdata[i][settings.global_index_rank_column]),
      global_index_score: parseFloat(exportdata[i][settings.global_index_score_column].replace(',', '.')).toFixed(num_decimals),
      index_score_group: index_score_group,
      color_sdgs: color_sdgs,
      score_sdgs: score_sdgs,
      rank_sdgs: rank_sdgs,
      sdgs: sdgs
    };

  }

  return countries;
};

function export_country_column_data(){
  var data = [];
  var labels = [];
  var values = [];
  var isos = [];

  for (var i = settings.country_start_index + 1; i < exportdata.length; i++) {

    data.push({
      value: parseFloat(exportdata[i][settings.global_index_score_column].replace(',', '.')).toFixed(num_decimals),
      label: exportdata[i][0],
      index: i,
      iso: exportdata[i][settings.iso_index]
    });

  }
  data = data.sort(function(a, b){return b.value-a.value});
  for (var i = 0; i < data.length; i++) {

    if(!isNaN(data[i].value)){
      labels.push(data[i].label);
      values.push(data[i].value);
      isos.push(data[i].iso);
    }

  }

  return {labels, values, isos};
};


function export_country_column_data_sdg(){

  var sdgs_bars = {};

  var indicators_labels = []
  var indicators_values = []
  var indicators_isos = []
  var indicators_data = []
  var sdgs_data = []
  var ordered_indicators_data = []

  var sdgs_labels = []
  var sdgs_values = []
  var sdgs_isos = []

  for(var i in thesdgs) {

     indicators_labels[i] = []
     indicators_values[i] = []
     indicators_isos[i] = []
     indicators_data[i] = []
     ordered_indicators_data[i] = []
     ordered_sdgs_data = []
     sdgs_data[i] = []
     sdgs_labels[i] = []
     sdgs_values[i] = []
     sdgs_isos[i] = []

    sdgs_bars[i] = {};

    //the global tanks for this SDG
    for (var k = settings.country_start_index + 1; k < exportdata.length; k++) {

      sdgs_data[i].push({
        value: parseFloat(exportdata[k][thesdgs[i].column_index].replace(',', '.')).toFixed(num_decimals),
        label: exportdata[k][0],
        index: k,
        rank: parseInt(exportdata[k][thesdgs[i].rank_index]),
        iso: exportdata[k][settings.iso_index]
      });

    }

    ordered_sdgs_data[i] = sdgs_data[i].sort(function(a, b){return a.rank-b.rank});

    for (var m = 0; m < ordered_sdgs_data[i].length; m++) {

      if(!isNaN(ordered_sdgs_data[i][m].value)){
        sdgs_labels[i].push(ordered_sdgs_data[i][m].label);
        sdgs_values[i].push(ordered_sdgs_data[i][m].value);
        sdgs_isos[i].push(ordered_sdgs_data[i][m].iso);
      }

    }

    sdgs_bars[i].globals = {
      labels: sdgs_labels[i],
      values: sdgs_values[i],
      isos: sdgs_isos[i]
    }

    //for each indicator
    for(var j in thesdgs[i].indicators) {

      // console.log(sdg_details[i].indicators[parseInt(j) + 1].decimals)

       indicators_labels[i][j] = []
       indicators_values[i][j] = []
       indicators_isos[i][j] = []
       indicators_data[i][j] = []
       ordered_indicators_data[i][j] = []

      for (var k = settings.country_start_index + 1; k < exportdata.length; k++) {

        indicators_data[i][j].push({
          //we don't use toFixed(decimals) here, we want to import the whole thing!
          value: exportdata[k][settings.indicators_column_start + thesdgs[i].indicators[j].column_index].replace(',', '.'), //).toFixed(sdg_details[i].indicators[parseInt(j) + 1].decimals),
          label: exportdata[k][0],
          index: k,
          iso: exportdata[k][settings.iso_index]
        });

      }

      // console.log('SDG ' + i , 'Indicator ' + j , indicators_data[i][j][0])
      //sorting depends on ordering of that indicator
      var ordering = thesdgs[i].indicators[j].ordering;
      ordered_indicators_data[i][j] = indicators_data[i][j].sort(function(a, b){
        if(ordering == 'ascending') return b.value-a.value
        else return a.value-b.value
      });

      for (var m = 0; m < ordered_indicators_data[i][j].length; m++) {

        if(!isNaN(ordered_indicators_data[i][j][m].value)){
          indicators_labels[i][j].push(ordered_indicators_data[i][j][m].label);
          indicators_values[i][j].push(ordered_indicators_data[i][j][m].value);
          indicators_isos[i][j].push(ordered_indicators_data[i][j][m].iso);
        }

      }

      sdgs_bars[i][thesdgs[i].indicators[j].indicator] = {
        labels: indicators_labels[i][j],
        values: indicators_values[i][j],
        isos: indicators_isos[i][j]
      }

    }
  }

  return sdgs_bars;

}

function export_headers() {
  var headers = exportdata[settings.country_start_index];
  var return_headers = [];
  for (var i = settings.indicators_column_start; i < headers.length; i++) {

    return_headers.push({
      name: headers[i],
      column_index: i,
      goal: parseInt(headers[i].substring(0, 2)),
      indicator: parseInt(headers[i].substring(3, 5))
    });
  }
  return return_headers;
};

function export_sdgs(){
  var sdgs = {};
  var name="";
  for (var i = 0; i < theheaders.length; i+=2) {
    if(theheaders[i].goal) {

      var goal_index = theheaders[i].goal;
      if(theheaders[i].goal == 15 || theheaders[i].goal == 16){
        goal_index = theheaders[i].goal - 1;
      }

      var is_indicator = true;
      var color_index = null;
      var ranking_index = null;

      if(is_indicator){

        name = theheaders[i].name.substring(6);

        if(theheaders[i].goal in sdgs){
          sdgs[theheaders[i].goal].indicators.push({
            column_index: i,
            color_index: i+1,
            // ranking_index: i+2,
            indicator: theheaders[i].indicator,
            name: subindex(name),
            title: subindex(sdg_details[theheaders[i].goal].indicators[theheaders[i].indicator].title),
            decimals: sdg_details[theheaders[i].goal].indicators[theheaders[i].indicator].decimals,
            year: sdg_details[theheaders[i].goal].indicators[theheaders[i].indicator].year,
            source: sdg_details[theheaders[i].goal].indicators[theheaders[i].indicator].source,
            ordering: sdg_details[theheaders[i].goal].indicators[theheaders[i].indicator].ordering,
            description: subindex(sdg_details[theheaders[i].goal].indicators[theheaders[i].indicator].description),
            units: sdg_details[theheaders[i].goal].indicators[theheaders[i].indicator].units,
          });
        }
        else {
          sdgs[theheaders[i].goal] = {
            indicators: [{
              column_index: i,
              color_index: i+1,
              indicator: theheaders[i].indicator,
              name: subindex(name),
              title: subindex(sdg_details[theheaders[i].goal].indicators[theheaders[i].indicator].title),
              decimals: sdg_details[theheaders[i].goal].indicators[theheaders[i].indicator].decimals,
              year: sdg_details[theheaders[i].goal].indicators[theheaders[i].indicator].year,
              source: sdg_details[theheaders[i].goal].indicators[theheaders[i].indicator].source,
              ordering: sdg_details[theheaders[i].goal].indicators[theheaders[i].indicator].ordering,
              description: subindex(sdg_details[theheaders[i].goal].indicators[theheaders[i].indicator].description),
              units: sdg_details[theheaders[i].goal].indicators[theheaders[i].indicator].units,
            }],
            num: theheaders[i].goal,
            column_index: settings.sdgs_column_start + ((goal_index-1) * 3),
            color_index: settings.sdgs_column_start + ((goal_index-1) * 3)+1,
            rank_index: settings.sdgs_column_start + ((goal_index-1) * 3)+2
          };
        }

      }
    }
  }

  return sdgs;
};

function subindex(phrase){
  return phrase.replace("CO2", "CO&#8322;").replace("SO2", "SO&#8322;")
}
