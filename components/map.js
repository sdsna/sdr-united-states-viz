var map_component = Vue.extend({
  template: '#map-vue-template',
  props: {
    sdg: [Number, String],
    iso: String,
    indicator: {
      type: Object,
      default: function(){ return {indicator: 0} },
      required: false
    },
    paint: {
      type: String,
      default: 'global'
    },
    size: {
      type: [String, Number],
      default: 1
    },
    behavior: {
      type: String,
      default: 'goToCountry'
    },
    breakpoint: {
      type: [String, Number]
    },
  },
  data: function () {
    return {
      svg: null,
      width: 1200,
      height: 600,
    }
  },
  replace: false,
  methods: {
    createMap: function(){

      var that = this;

      this.svg = d3.select("#map" + this._uid);

      // Draw the map
      this.svg.append("g")
      .attr("class", "states")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .enter().append("path")
      .attr("class", function (d){
        var id = parseInt(d.id);

        d.iso = states_order[id];

        // Pull data for this country
        d.data = vm.countries[d.iso] || 0;

        return that.setCountryColorClass(d);

      })
      .attr("d", this.path)
      .on("mouseover", d => {

        if(vm.countries.hasOwnProperty(d.iso)) {
          vm.current_iso_hover = d.iso;
          vm.iso_hover = d.iso;

          var width = document.getElementById("d3-tip").clientWidth;
          var height = document.getElementById("d3-tip").clientHeight;

          var index_name = "", index_score = "", display_score = true, extra_class = "";

          if(d.data){
            switch (that.paint) {
              case 'global': case 'landing':
              index_name = "Global Score Index";
              index_score = d.data.global_index_score;
              break;
              case 'sdg':
              index_name = vm.sdg_titles[that.sdg];
              index_score = d.data.score_sdgs[app.current_sdg_index]; // MISSING correct INDEX
              break;
              case 'indicator':
              index_name = 'Index';
              index_score = d.data.sdgs[that.sdg][that.indicator.indicator-1].value; // DECIMAL FILTER missing
              break;
              case 'country':
              if(that.sdg){
                index_name = vm.sdg_titles[that.sdg];
                index_score = d.data.score_sdgs[that.sdg-1]; // MISSING correct INDEX
              }
              else{
                index_name = "Global Score Index";
                index_score = d.data.global_index_score;
              }
              break;
              // default:
              // display_score = true;
              // extra_class = "mt-2";
            }
          }

          if(!index_score || isNaN(index_score)) index_score = "No data available";

          if(display_score) display_score = "<div>"+index_name+": <strong>"+index_score+"</strong></div>";
          else display_score = "";

          div_tooltip.html("<div class='d-flex' onClick='app.goToCountry(\""+d.iso+"\", \""+vm.current_sdg+"\")'><div class='tooltip-flag' style='background: url(\"resources/flags/png/"+d.iso.toLowerCase()+".png\") no-repeat center/cover;' ></div><div class='d3-tip-inner "+extra_class+"'><strong>"+d.data.name+"</strong>"
          + display_score + "</div></div>")
          .style("left", (d3.event.pageX - width/2) + "px")
          .style("top", (d3.event.pageY - height - 15) + "px")
          .style("opacity", 1);

        }
        else{
          //ISO does not exist on list
          div_tooltip.style("opacity", 0);
        }
      })
      .on("mousemove", d => {
        var width = document.getElementById("d3-tip").clientWidth;
        var height = document.getElementById("d3-tip").clientHeight;

        div_tooltip.style("left", (d3.event.pageX - width/2) + "px")
        .style("top", (d3.event.pageY - height - 15) + "px");
      })
      .on('mouseout', function(d) {
        div_tooltip.style("opacity", 0);
        vm.iso_hover = "";
      })
      .on("click", d => {
        if(that.behavior == "goToCountry") {
          if(vm.countries.hasOwnProperty(d.iso)) app.goToCountry(d.iso, that.sdg);
        }
        else {
          if(d.iso == that.iso) app.goToSDG(that.sdg);
          else app.goToSDGCountry(that.sdg, d.iso);
        }

      });

      // STATE BORDERS
      this.svg.append("path")
      .attr("class", "state-borders")
      .attr("d", this.path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));

    },

    updateMap: function() {

      var that = this;

      d3.selectAll("#map" + this._uid + " .country")
      .attr("class", function(d){return that.setCountryColorClass(d);})
    },

    setCountryColorClass: function(d){

      if(d.data){

        var transparent = "";

        if(this.paint == 'country' || this.paint == "indicator"){
          if(this.iso != "" && d.data.iso != this.iso) transparent = " country-transparent";
          else if(d.data.iso == this.iso) transparent = " highlighted";
        }

        switch(this.paint){

          case 'indicator':
          return "country bg-sdg-" + d.data.sdgs[this.sdg][this.indicator.indicator - 1].color + transparent;
          break;
          case 'sdg':
            //since we're missing SDGs 14 and 17...
            var i = this.sdg - 1;
            if(this.sdg == 15 || this.sdg == 16) i = this.sdg - 2;
            return "country bg-sdg-" + d.data.color_sdgs[i] + transparent;
          break;
          case 'country':
          if(this.sdg) {
            var i = this.sdg - 1;
            if(this.sdg == 15 || this.sdg == 16) i = this.sdg - 2;
            return "country bg-sdg-" + d.data.color_sdgs[i] + transparent;
          }
          return "country bg-blue" + (d.data.index_score_group) + transparent;
          break;
          case 'global': default:
          return "country bg-blue" + (d.data.index_score_group) + transparent;
          break;

        }

      }
      return "";
    },
    setWidth: function(){
      this.width = parseInt(d3.select('#regions_div').style('width'));

      if(this.size == "1"){
        switch (this.breakpoint) {
          case 'xl':
            this.width -= 200;
            break;
          case 'lg':
            this.width -= 176;
            break;
          case 'md':
            this.width -= 136;
            break;
          default: this.width = this.breakpoint;

        }

      }
      else this.width = parseInt(d3.select('#small_map_container').style('width'));
    },
    resize: function() {

      var current_width = this.width;
      this.setWidth();
      if(current_width != this.width){
        //console.log('resizing map')
        this.height = this.width * mapRatio;

        if(this.size == "2"){

          projection_small.scale(this.width)
          .translate([this.width / 2, this.height / 2]);

          path_small.projection(projection_small);

          this.svg.selectAll("path.country").attr('d', path_small);
          this.svg.selectAll("path.state-borders").attr('d', path_small(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));

        }
        else{
          projection.scale(this.width)
          .translate([this.width / 2, this.height / 2]);

          path.projection(projection);

          this.svg.selectAll("path").attr('d', path);
          this.svg.selectAll("path.state-borders").attr('d', path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));

        }

      }

    },
    // unselectIso: function(){
    //   vm.iso_hover = ""
    // }
  },
  mounted: function() {

    this.setWidth();

    this.height = this.width * mapRatio;

    if(this.size == "2"){

      if(!projection_small){

        projection_small = d3.geoAlbersUsa()
        .scale(this.width)
        .translate([this.width / 2, this.height / 2]);

        path_small = d3.geoPath()
        .projection(projection_small);

      }

      this.projection = projection_small;
      this.path = path_small;

    }
    else{
      projection = d3.geoAlbersUsa()
      .scale(this.width)
      .translate([this.width / 2, this.height / 2]);

      path = d3.geoPath()
      .projection(projection);

      this.projection = projection;
      this.path = path;

    }

    if(!us) this.loadStates();
    else this.createMap();

  },
  watch: {
    'indicator' (to, from) {
      this.updateMap()
    },
    'sdg' (to, from) {
      this.updateMap()
    },
    'iso' (to, from) {
      this.updateMap()
    },
    'paint' (to, from) {
      this.updateMap()
    },
    'breakpoint' (to, from) {
      this.resize()
    },
  }

});

Vue.component('sdg-map', map_component);
