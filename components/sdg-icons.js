var sdg_icons_component = Vue.extend({
  template: '#sdg-icons-vue-template',
  props: {
    sdg: [Number, String],
  },
  data: function () {
    return {
    }
  },
  replace: false,
  computed: {

  },
  methods: {
    link: function(n){
      if(this.$root.iso_focus && this.$root.page == 'sdg'){
        return '/SDG/' + n + '/' + this.$root.iso_focus
      }
      else if (this.$root.page == 'country'){
        //click on current sdg "unselects"
        if(this.sdg == n) return '/' + this.$root.current_iso
        else return '/' + this.$root.current_iso + '/' + n
      }
      else return '/SDG/' + n
    },
    tooltipIcon: function(event, n){

			var element = jQuery(event.target);
			var rect = element.offset();

			d3.select("#icon-tooltip").html("<strong>"+this.$root.sdg_titles[n]+"</strong>");

			var tooltip_div = document.getElementById("icon-tooltip");
			var width = tooltip_div.clientWidth;
			var height = tooltip_div.clientHeight;

			d3.select("#icon-tooltip")
			.style("left", (rect.left + element.width()/2 - width/2) + "px")
			.style("top", (rect.top - height - 8) + "px")
			.style("opacity", 1);

		},
		hideTooltipIcon: function(){
			d3.select("#icon-tooltip").style("opacity", 0);
		},
  },
  mounted: function() {

  },
  watch: {
  }

});

Vue.component('sdg-icons', sdg_icons_component);
