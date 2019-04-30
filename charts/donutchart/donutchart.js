import React, { Component } from "react";
import * as d3 from "d3v4";
import PropTypes from "prop-types";

class DonutChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.id,
      chartData: this.props.chartData,
      chartProperties: this.props.chartProperties
    };
  }

  componentDidMount() {
    this.drawChart();
  }
  componentDidUpdate() {
    d3.select(`#${this.state.id}`).selectAll("*").remove();
    this.drawChart();
  }
  componentWillReceiveProps(newProps) {
    this.removeTooltip();
    this.setState({
      id: newProps.id,
      chartData: newProps.chartData,
      chartProperties: newProps.chartProperties
    });
  }
  componentWillUnmount() {
    this.removeTooltip();
  }
  removeTooltip = () => {
    d3.select("body").selectAll(`.tc-tooltip.${this.state.id}`).remove();
  }
  drawChart() {
    const width = this.state.chartProperties.width;
    const data = this.state.chartData;
    const height = this.state.chartProperties.height;
    const legendFontSize = this.state.chartProperties.legendFontSize;
    const legendSpacing = this.state.chartProperties.legendSpacing;
    const labelFontSize = this.state.chartProperties.labelFontSize;
    const label = this.state.chartProperties.label;
    const thickness = this.state.chartProperties.thickness;
    const showLegend = this.state.chartProperties.showLegend;
    const zoom = this.state.chartProperties.zoom;
    const radius = this.state.chartProperties.radius;
    const id = this.state.id;
    const colorArray = this.state.chartProperties.colorArray;

    const arc = d3
      .arc()
      .outerRadius(radius + thickness)
      .innerRadius(100);
    
    const pie = d3
      .pie()
      .sort(null)
      .value(d => d.count);
    this.removeTooltip();

    const svg = d3
      .select(`#${id}`)
      // .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("zoom", zoom)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const g = svg
      .selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g");

    g.append("path")
      .attr("d", arc)
      .style("fill", (d, i) => colorArray[i]);

    if (showLegend) {
      g.append("text")
        .attr("transform", (d) => {
          const dd = arc.centroid(d);
          dd[0] *= legendSpacing; // multiply by a constant factor
          dd[1] *= legendSpacing; // multiply by a constant factor
          return `translate(${dd})`;
        })
        .attr("dy", ".50em")
        .style("text-anchor", "middle")
        .style("font-size", legendFontSize)
        .text((d) => {
          if (d.data.percentage <= 0) {
            return "";
          }
          return `${d.data.percentage}%`;
        });
    }
    const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .attr("class", `tc-tooltip ${this.state.id}`);

    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", labelFontSize)
      .attr("y", 20)
      .text(label.length <= 10 ? label : `${label.substring(0, 8)}...`)
      .on("mouseover", () => tooltip.text(label).style("visibility", "visible"))
      .on("mousemove", () => tooltip.text(label).style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`))
      .on("mouseout", () => tooltip.text(label).style("visibility", "hidden"));

  }
  render() {
    return <svg id={this.props.id} />;
  }
}

DonutChart.propTypes = {
  id: PropTypes.string.isRequired,
  chartData: PropTypes.array.isRequired,
  chartProperties: PropTypes.object.isRequired,
};

export default DonutChart;
