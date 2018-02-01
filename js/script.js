const vis = new Vue({
  el: "#vis_map",
  data: function () {
    return {
      MARGIN: {
        TOP: 0,
        BOTTOM: 0,
        LEFT: 0,
        RIGHT: 0
      },
      FILEPATH: 'data/datos_agregados.json',
      windowWidth: 0,
      windowHeight: 0
    }
  },
  computed: {
    height() {
      return this.windowHeight * 0.9;
    },
    width() {
      return this.windowWidth * 0.65;
    },
  },
  mounted() {
    this.$nextTick(function () {
      window.addEventListener('resize', this.getWindowWidth);
      window.addEventListener('resize', this.getWindowHeight);
      this.getWindowWidth();
      this.getWindowHeight();
      this.initialize();
      this.getData();
    })

  },
  methods: {
    initialize() {

      d3.json("data/datos_agregados.json",
        (error, json) => {
          const countries = json.countries;
          const data = json.summary;

          // var routes = data.map(d => {
          //     console.log(d)
          //     return {
          //         type: "LineString",
          //         coordinates: [
          //             [countries[d.origen].long, countries[d.origen].lat],
          //             [countries[d.destino].long, countries[d.destino].lat]
          //         ]
          //     }
          // });

          var routes = [{
            type: "LineString",
            coordinates: [
              [-70, -30],
              [70, 30]
            ]
          }];

          var projection = d3.geoMercator()
            .scale(this.width / 2 / Math.PI)
            //.scale(100)
            .translate([this.width / 2, this.height / 2])
            .rotate([50, 0])
            .precision(.1);


          var path = d3.geoPath().projection(projection);

          var graticule = d3.geoGraticule();

          var svg = d3.select("#container");

          const pathGenerator = pathGeneratorConst(projection, path, countries);
          const gradientGenerator = gradientGeneratorConst(projection, path, countries);

          var defs = svg.append("defs");

          //Append a linear horizontal gradient

          defs.selectAll('linearGradient')
            .data(routes)
            .enter()
            .append('linearGradient')
            .attr("id", (_, i) => `animate-gradient-${i}`)


          const linearGradients = data.map((d, i) => gradientGenerator(defs, d, i));

          // var linearGradient = defs.append("linearGradient")
          //   .attr("id", "animate-gradient") //unique id to reference the gradient by
          //   .attr("x1", "0%")
          //   .attr("y1", "0%")
          //   .attr("x2", "100%")
          //   .attr("y2", "0%")
          //   .attr("spreadMethod", "reflect");

          //A color palette that is 4 colors (the last 3 colors are the reverse of the start)
          // var colours = ["#0F4F99", "#326299", "#2989D8", "#99C4E5", "#2989D8", "#326299", "#0F4F99"];
          var colours = ["#FDA860", "#FC8669", "#E36172", "#C64277", "#E36172", "#FC8669", "#FDA860"];


          linearGradients.forEach(gradient => {
            gradient.selectAll(".stop")
              .data(colours)
              .enter().append("stop")
              .attr("offset", (_, i) => i / (colours.length - 1))
              .attr("stop-color", d => d);
          });
          //Append the colors evenly along the gradient
          // linearGradient.selectAll(".stop")
          //   .data(colours)
          //   .enter().append("stop")
          //   .attr("offset", function (d, i) {
          //     return i / (colours.length - 1);
          //   })
          //   .attr("stop-color", function (d) {
          //     return d;
          //   });

          // linearGradient.append("animate")
          //     .attr("attributeName", "y1")
          //     .attr("values", "0%;100%")
          //     .attr("dur", "3s")
          //     .attr("repeatCount", "indefinite");

          // linearGradient.append("animate")
          //     .attr("attributeName", "y2")
          //     .attr("values", "100%;200%")
          //     .attr("dur", "3s")
          //     .attr("repeatCount", "indefinite");



          svg.append("defs").append("path")
            .datum({
              type: "Sphere"
            })
            .attr("id", "sphere")
            .attr("d", path);

          svg.append("use")
            .attr("class", "stroke")
            .attr("xlink:href", "#sphere");

          svg.append("use")
            .attr("class", "fill")
            .attr("xlink:href", "#sphere");

          svg.append("path")
            .datum(graticule)
            .attr("class", "graticule")
            .attr("d", path);

          const line = d3.line()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveBundle.beta(1));

          const strokeScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.overall.amount))
            .range([0.5, 4]);

          console.log(d3.extent(data, d => d.overall.amount))

          svg.selectAll(".route")
            .data(data)
            .enter()
            .append("path")
            .attr("class", "route")
            .attr("id", (d, i) => `route-${i}`)
            .attr("d", d => line(pathGenerator(d)))
            // .attr("stroke-width", d => strokeScale(d.overall.amount));
            .attr("stroke-width", 0.5);

          svg.selectAll(".route")
            .attr('stroke', (_, i) => `url(#animate-gradient-${i})`);



          svg.selectAll('circle')
            .data(Object.values(countries))
            .enter()
            .append('circle')
            .attr('r', 3)
            .attr('fill', "#f2f2f2")
            .attr('stroke', "#2989D8")
            .attr('cx', d => projection([d.long, d.lat])[0])
            .attr('cy', d => projection([d.long, d.lat])[1])
          // routes.forEach((r, i) => {

          //     const d = d3.select(`#route-${i}`)
          //         .attr('d');
          //     const index1 = d.indexOf('L');
          //     const index2 = d.lastIndexOf('L');

          //     // console.log(d.substring(1, index1).split(',').map(s => parseFloat(s)));
          //     // console.log(d.substring(index2 + 1, d.length).split(',').map(s => parseFloat(s)));

          //     const p1 = d.substring(1, index1).split(',').map(s => parseFloat(s));
          //     const p2 = d.substring(index2 + 1, d.length).split(',').map(s => parseFloat(s));
          //     const diff = [p2[0] - p1[0], p2[1] - p2[0]];
          //     const length = Math.sqrt(Math.pow(diff[0], 2) + Math.pow(diff[1], 2));
          //     const direction = [100 * diff[0] / length, 100 * diff[1] / length];
          //     let vector = [
          //         [0, 0], direction
          //     ];
          //     if (direction[0] < 0) {
          //         vector[0][0] += -direction[0];
          //         vector[1][0] += -direction[0];
          //     }
          //     if (direction[1] < 0) {
          //         vector[0][1] += -direction[1];
          //         vector[1][1] += -direction[1];
          //     }
          //     r.direction = vector;
          //     //console.log(r.direction);
          // })

          // var point = svg.append("g")
          //     .attr("class", "points")
          //     .selectAll("g")
          //     .data(d3.entries(places))
          //     .enter().append("g")
          //     .attr("transform", function (d) {
          //         return "translate(" + projection(d.value) + ")";
          //     });

          // point.append("circle")
          //     .attr("r", 4.5);

          // point.append("text")
          //     .attr("y", 10)
          //     .attr("dy", ".71em")
          //     .text(function (d) {
          //         return d.key;
          //     });



          // svg.append("rect")
          //     .attr("x", 0)
          //     .attr("y", 0)
          //     .attr("width", width)
          //     .attr("height", height)
          //     .style("fill", "url(#animate-gradient)");

          d3.json("data/map.json",
            function (error, world) {
              if (error) throw error;

              svg.insert("path", ".graticule")
                .datum(topojson.feature(world, world.objects.land))
                .attr("class", "land")
                .attr("d", path);

              svg.insert("path", ".graticule")
                .datum(topojson.mesh(world, world.objects.countries, function (a, b) {
                  return a !== b;
                }))
                .attr("class", "boundary")
                .attr("d", path);
            });

          // d3.select(self.frameElement).style("height", this.height + "px");

        })

    },
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