Vue.component('info-bar', {
    template: `
    <div id="info_bar">
        <div class="container" v-if="selected != null">
            <div class="selectors">
                <a class="selector" v-on:click="select('overall')" v-bind:class="{active: 'overall' == selected_view}">Todos</a>
                <a class="selector" v-for="category in categories" v-on:click="select(category.key)" v-bind:class="{active: category.key == selected_view}">{{category.full}}</a>
            </div>
            <h3>{{number}}</h3>
            
            <h3>Académico</h3>
            <svg id="academic"> </svg>
            <h3>OFOS</h3>
            <svg id="ofos"> </svg>
            <h3>Instituciones</h3>
            <div class="institutions">
                <div class="institution" v-for="inst in institutions">
                    <span>{{inst.amount}} {{inst.institution}} </span>
                </div>
            </div>
        </div>
    </div>
    `,
    props: ['selected', 'ofos'],
    data: function () {
        return {
            width: 300,
            academicheight: 120,
            ofosheight: 180,
            container: null,
            grados: [{
                    key: 'licen',
                    full: 'Licenciatura'
                },
                {
                    key: 'mast',
                    full: 'Master'
                },
                {
                    key: 'doct',
                    full: 'Doctorado'
                },
                {
                    key: 'postdoc',
                    full: 'Post-doc'
                }
            ],
            selected_view: 'overall',
        }
    },
    computed: {
        categories() {
            return this.selected != null ?
                this.grados.filter(g => this.selected[g.key].amount > 0) : [];
        },
        data() {
            return this.selected != null ? this.selected[this.selected_view] : null;
        },
        institutions() {
            return this.data != null ? this.data.institutions.sort((a, b) => b.amount - a.amount) : [];
        },
        number() {
            return this.selected != null ?
                (this.selected_view == 'overall' ? `${this.data.amount}` :
                    `${this.data.amount} / ${this.selected.overall.amount}`) :
                '';
        }
    },
    mounted() {
        this.container = d3.select('#info_bar');
    },
    methods: {
        initialize() {
            this.container.select('#academic')
                .attr('width', this.width)
                .attr('height', this.academicheight);
            this.container.select('#ofos')
                .attr('width', this.width)
                .attr('height', this.ofosheight);
        },
        renderVis() {

            this.renderAcademic();

            this.renderOfos();

        },
        renderAcademic() {
            let total = 0;
            this.grados.forEach(d => {
                d.total = total;
                d.amount = this.selected[d.key].amount;
                total += d.amount;
            });
            const scaleAcademic = d3.scaleLinear()
                .domain([0, total])
                .range([0, 150]);
            const academic = this.container.select("#academic");

            const rect = academic.selectAll('rect')
                .data(this.grados)
                .enter()
                .append('rect');
            rect
                .attr('height', 20)
                .attr('y', (_, i) => 30 * i)
                .attr('fill', (_, i) => d3.schemeSet2[i])
                .attr('width', 0)
                .attr('x', 150)
                .transition()
                .duration(1000)
                .attr('width', d => scaleAcademic(d.amount));

            rect.append('title')
                .text(d => `${d.amount}`);

            academic.selectAll('text')
                .data(this.grados)
                .enter()
                .append('text')
                .attr('x', 10)
                .attr('y', (_, i) => 30 * i + 16)
                .text(d => d.full);
        },
        renderOfos() {
            let total = 0;
            this.data.ofos.forEach(d => {
                d.total = total;
                total += d.amount;
            });
            const scaleOfos = d3.scaleLinear()
                .domain([0, total])
                .range([0, 150]);
            const ofos = this.container.select("#ofos");

            const rect = ofos.selectAll('rect')
                .data(this.data.ofos)
                .enter()
                .append('rect')
            rect
                .attr('height', 20)
                .attr('y', (_, i) => 30 * i)
                .attr('fill', (_, i) => d3.schemeSet3[i])
                .attr('width', 0)
                .attr('x', 150)
                .transition()
                .duration(1000)
                .attr('width', d => scaleOfos(d.amount));

            rect.append('title')
                .text(d => `${d.amount}`);

            ofos.selectAll('text')
                .data(this.data.ofos)
                .enter()
                .append('text')
                .attr('x', 10)
                .attr('y', (_, i) => 30 * i + 16)
                .text(d => this.ofos[d.ofo]);
        },
        updateVis() {
            this.updateAcademic();
            this.updateOfos();
        },
        updateAcademic() {
            let total = 0;
            this.grados.forEach(d => {
                d.total = total;
                if (this.selected_view == 'overall' || d.key == this.selected_view) {
                    d.amount = this.selected[d.key].amount;
                } else {
                    d.amount = 0;
                }
                total += d.amount;
            });
            const scaleAcademic = d3.scaleLinear()
                .domain([0, total])
                .range([0, 150]);
            const ofos = this.container.select("#academic");

            const rect = ofos.selectAll('rect')
                .data(this.grados);
            rect
                .attr('height', 20)
                .attr('y', (_, i) => 30 * i)
                .attr('fill', (_, i) => d3.schemeSet2[i])
                .transition()
                .duration(1000)
                .attr('width', d => scaleAcademic(d.amount));

            rect.select('title')
                .text(d => `${d.amount}`);
        },
        updateOfos() {
            let total = 0;
            this.data.ofos.forEach(d => {
                d.total = total;
                total += d.amount;
            });
            const scaleOfos = d3.scaleLinear()
                .domain([0, total])
                .range([0, 150]);
            const ofos = this.container.select("#ofos");

            const rect = ofos.selectAll('rect')
                .data(this.data.ofos)

            rect
                .transition()
                .duration(1000)
                .attr('width', d => scaleOfos(d.amount));

            rect.select('title')
                .text(d => `${d.amount}`);
        },
        select(category) {
            if (this.selected_view != category) {
                this.selected_view = category;
            } else if (this.selected_view == category) {
                this.selected_view = 'overall';
            }
            this.updateVis();
        }
    },
    watch: {
        selected: function (val, oldVal) {
            this.$nextTick(function () {
                if (val != null && oldVal == null) {
                    this.selected_view = 'overall';
                    this.initialize();
                    this.renderVis();
                } else if (val != null && oldVal != null) {
                    this.selected_view = 'overall';
                    this.updateVis();
                }
            })
        }
    },
    // updated: function () {
    //     this.$nextTick(function () {
    //       if (this.selected != null){
    //         this.initialize();
    //       }
    //     })
    //   }
});