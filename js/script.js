const vis = new Vue({
  el: "#vis_map",
  data: function () {
    return {
      WIDTH: 1200,
      HEIGHT: 6000,
      MARGIN: {
        TOP: 0,
        BOTTOM: 0,
        LEFT: 00,
        RIGHT: 0
      },
      FILEPATH: 'data/datos_agregados.json',
    }
  },
  computed: {
    width() {
      return this.WIDTH - this.MARGIN.RIGHT - this.MARGIN.LEFT;
    },
    height() {
      return this.HEIGHT - this.MARGIN.TOP - this.MARGIN.BOTTOM;
    },
  },
  mounted() {
    this.getWindowWidth();
    this.getWindowHeight();
    this.$nextTick(function () {
      window.addEventListener('resize', this.getWindowWidth);
      window.addEventListener('resize', this.getWindowHeight);
      this.getWindowWidth();
      this.getWindowHeight();
    })
    this.initialize();
    this.getData();
  },
  methods: {
    initialize() {},
    getWindowWidth(event) {
      this.windowWidth = document.documentElement.clientWidth;
    },
    getWindowHeight(event) {
      this.windowHeight = document.documentElement.clientHeight;
    },
    getData() {
      d3.json(this.FILEPATH, (error, data) => {});
    },

    resize() {},
  },
  watch: {
    windowWidth: function (val) {
      this.resize();
    },
    windowHeight: function (val) {
      this.resize();
    }
  }
});