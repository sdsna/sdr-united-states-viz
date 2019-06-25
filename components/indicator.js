var indicator_component = Vue.extend({
  template: '#indicator-vue-template',
  props: {
    sdg: [Number, String],
    iso: String,
    indicator: {
      type: Object,
      default: function(){ return {indicator: 0} },
      required: false
    },
    behavior: {
      type: String,
      default: 'goToCountry'
    },
  },
  data: function () {
    return {
    }
  },
  replace: false,
  methods: {

  },
  mounted: function() {

  },
  watch: {
  }

});

Vue.component('indicator', indicator_component);
