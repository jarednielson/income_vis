/**
 * Class for drawing line chart of income through the years
 */
class IncomeTimePlot {
    constructor(data, colorScales) {
        this.margin = { top: 20, right: 120, bottom: 60, left: 80 };
        this.width = 950 - this.margin.left - this.margin.right;
        this.height = 550 - this.margin.top - this.margin.bottom;
        this.data = data;

        this.colorScales = colorScales;

        this.drawPlot();
    }

    drawPlot() { 
        this.svg = d3.select('#incomeLineDiv')
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        let svgGroup = this.svg.append('g').classed('wrapper-group', true);

        //Text and axes skeleton
        svgGroup.append('g')
            .attr('id', 'x-axis-incomechart')
            .attr('transform', 'translate(' + this.margin.left + ',' + (this.height + this.margin.top) +')')
            .classed('axis', true);
        svgGroup.append('g')
            .attr('id', 'y-axis-incomechart')
            .attr('transform', 'translate(' + this.margin.left + ', ' + this.margin.top + ')')
            .classed('axis', true);
        svgGroup.append('text')
            .text('year'.toUpperCase())
            .attr('id', 'x-axis-label-incomechart')
            .classed('axis-label', true)
            .classed('text', true)
            .attr('transform', 'translate(' + (this.width/2 + this.margin.left) + ', ' + (this.height + this.margin.bottom) + ')');
        svgGroup.append('text')
            .text('USD (2017)'.toUpperCase())
            .attr('id', 'y-axis-label-incomechart')
            .classed('axis-label', true)
            .attr('transform', 'translate(20, ' + (this.height/2 + this.margin.bottom) + ') ' +
                               'rotate(-90)');
        
        this.setupScales(1967, 2017, 0, 500000);
        
        this.lineGroup = this.svg.append('g')
                    .attr('id', 'line-group-incomechart');

        this.legendGroup = this.svg.append('g')
                            .attr('id', 'legend-group')
                            .attr('transform', `translate(${this.margin.left + this.width - 15}, 5)`);

        this.updatePlot();

    }

    updatePlot() {
        let that = this;
        let checked = document.querySelectorAll('input.sub-button:checked');

        let nextData = [];

        checked.forEach((elem) => {
            let arr = elem.id.split('-');

            let d = {};
            d.data = that.data[arr[0]].map(elem => {
                return { 
                            'value': parseInt(elem[arr[1]]),
                            'year' : parseInt(elem.year)
                        };
            });
            d.category = arr[0];
            d.pentile = arr[1];
            nextData.push(d);
        });

        //Get min/max x and y values
        let minX = d3.min(nextData, (d) => {
            return d.data.last().year;
        });
        let minY = d3.min(nextData, (d) => {
            return d3.min(d.data, (d) => {
                return d.value;
            });
        });
        let maxY = d3.max(nextData, (d) => {
            return d3.max(d.data, (d) => {
                return d.value;
            });
        });

        //Set up new scales
        this.setupScales(minX, 2017, minY, maxY);

        let paths = this.lineGroup.selectAll('path')
                            .data(nextData);

        let pathsEnter = paths.enter().append('path');
        paths.exit().remove();
        paths = paths.merge(pathsEnter);

        let lineFn = d3.line()
                        .x((d) => that.xScale(new Date(d.year, 0, 1, 0)) + that.margin.left)
                        .y((d) => that.yScale(d.value) + that.margin.top)
                        .curve(d3.curveStep);
        paths.attr('d', (d) => lineFn(d.data))
            .attr('stroke', (d) => {
                return that.colorScales[d.category](that.colorScales[d.pentile])}) //TODO add color scales
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('id', (d) => `${d.category}-${d.pentile}-line`);

        //construct the legend
        let legendGroups = this.legendGroup.selectAll('g')
            .data(nextData);
        let legendGroupsEnter = legendGroups.enter().append('g');
        legendGroups.exit().remove();
        legendGroups = legendGroups.merge(legendGroupsEnter);
        legendGroups.selectAll('*').remove();

        legendGroups.append('circle')
                .attr('r', 5)
                .attr('fill', (d) => that.colorScales[d.category](that.colorScales[d.pentile]));
        legendGroups.attr('transform', (d, i) => {
            return `translate(5, ${i * 15 + 10})`;
        });

        legendGroups.append('text')
            .attr('transform', 'translate(15, 5)')
            .text(d => `${d.category.toUpperCase()} ${d.pentile.toUpperCase()}`)
            .classed('text', true)
            .classed('legend-text', true);
        
        legendGroups.on('mouseenter', d => {
            d3.select(`#${d.category}-${d.pentile}-line`)
                .classed('highlighted', true);
        }).on('mouseleave', d => {
            d3.select(`#${d.category}-${d.pentile}-line`)
                .classed('highlighted', false);
        });

        this.legendGroup.attr('transform', `translate(${this.margin.left + this.width - 15}, ${this.height/2 - 7.5 * nextData.length})`);

    }

    setupScales(minX, maxX, minY, maxY) {
        this.xScale = d3.scaleTime()
            .domain([new Date(minX, 0, 1, 0), new Date(maxX, 0, 1, 0)])
            .range([0, this.width])
            .nice();
        this.yScale = d3.scaleLinear()
            .domain([minY, maxY])
            .range([this.height, 0])
            .nice();

        this.xAxis = d3.axisBottom();
        this.yAxis = d3.axisLeft();
        this.xAxis.scale(this.xScale);
        this.yAxis.scale(this.yScale)
                .ticks(10);
        d3.select('#x-axis-incomechart').call(this.xAxis);
        d3.select('#y-axis-incomechart').call(this.yAxis);
    }
}