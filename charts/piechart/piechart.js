import React, { Component } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";
import "./piechart.sass";

class PieChart extends Component {
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

    const radius = Math.min(this.state.chartProperties.svgWidth, this.state.chartProperties.svgHeight) / 2;
    const colorArray = this.state.chartProperties.colorArray;
    const svg = d3
      .select(`#${this.state.id}`)
      .style("background", this.state.chartProperties.background)
      .attr("width", this.state.chartProperties.svgWidth)
      .attr("height", this.state.chartProperties.svgHeight);

    // Create group element to hold pie chart
    const g = svg
      .append("g")
      .attr("transform", isNaN(radius) ? "translate(0,0)" : `translate(${radius},${radius})`);

    // used for dynamic colors, according to percent
    // var color = d3.scaleOrdinal(d3.schemeCategory10);
    const pie = d3.pie().value(d => d.percentage);
    this.removeTooltip();
    const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .attr("class", `tc-tooltip ${this.state.id}`);

    const path = d3
      .arc()
      .outerRadius(radius)
      .innerRadius(0);

    const arc = g
      .selectAll("arc")
      .data(pie(this.state.chartData))
      .enter()
      .append("g")
      .on("mouseover", d => tooltip.text(`${d.value}%`).style("visibility", "visible"))
      .on("mousemove", d => tooltip.text(`${d.value}%`).style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`))
      .on("mouseout", d => tooltip.text(`${d.value}%`).style("visibility", "hidden"));

    arc
      .append("path")
      .attr("d", path)
      .attr("class", "portion")
      .attr("fill", (d, i) => colorArray[i]);


    const label = d3
      .arc()
      .outerRadius(radius)
      .innerRadius(0);

    /* arc
      .append("text")
      .attr("dy", "0em")
      .attr("transform", d => `translate(${label.centroid(d)})`)
      .attr("font-size", this.state.chartProperties.fontSize)
      .attr("font-weight", "bold")
      .attr("fill", this.state.chartProperties.fontColor)
      .attr("text-anchor", "middle")
      .text(d => d.data.label);*/

    if (this.state.chartProperties.showValue) {
      arc
      .append("text")
      .attr("dy", "1em")
      .attr("transform", d => `translate(${label.centroid(d)})`)
      .attr("font-weight", "bold")
      .attr("font-size", this.state.chartProperties.fontSize)
      .attr("fill", this.state.chartProperties.fontColor)
      .attr("text-anchor", "middle")
      .text(d => (d.data.percentage === 0 ? null : `${d.data.percentage}%`));
    }
  }
  render() {
    return (
      <svg id={this.state.id} />
    );
  }
}

PieChart.propTypes = {
  id: PropTypes.string.isRequired,
  chartData: PropTypes.array.isRequired,
  chartProperties: PropTypes.object.isRequired
};

export default PieChart;
