import React, { Component } from "react";
import * as d3 from "d3v3";
import PropTypes from "prop-types";
import "./horizontalgroupedchart.sass";

class HorizontalGroupedChart extends Component {
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
  // componentDidUpdate() {
  //   d3.select(`#${this.state.id}`).selectAll("*").remove();
  //   this.drawChart();
  // }
  componentWillReceiveProps(newProps) {
    if (newProps.chartData !== this.props.chartData) {
      this.setState({
        id: newProps.id,
        chartData: newProps.chartData,
        chartProperties: newProps.chartProperties
      }, () => {
        d3.select(`#${this.state.id}`)
          .selectAll("*")
          .remove();
        this.drawChart();
      });
    }
  }

  drawChart() {
    const data = this.state.chartData;
    const chartWidth = this.state.chartProperties.width;
    const barHeight = this.state.chartProperties.height;
    const groupHeight = barHeight * data.series.length;
    const gapBetweenGroups = this.state.chartProperties.gapBetweenGroups;
    const spaceForLabels = this.state.chartProperties.spaceForLabels;
    const spaceForLegend = this.state.chartProperties.spaceForLegend;
    const showPercent = this.state.chartProperties.showPercent;
    const showLegend = this.state.chartProperties.showLegend;
    const fontSize = this.state.chartProperties.fontSize;
    const legendRightIndent = this.state.chartProperties.legendRightIndent;
    const labels = this.state.chartData.labels;
    const colorArray = this.state.chartProperties.colorArray;

    // Zip the series data together (first values, second values, etc.)
    const zippedData = [];
    for (let i = 0; i < labels.length; i++) {
      for (let j = 0; j < data.series.length; j++) {
        zippedData.push(data.series[j][i]);
      }
    }

    // Color scale
    // var color = d3.scale.category20();
    const chartHeight = (barHeight * zippedData.length) + (gapBetweenGroups * labels.length);
    const x = d3.scale.linear().domain([0, d3.max(zippedData)]).range([0, chartWidth]);
    const y = d3.scale.linear().range([chartHeight + gapBetweenGroups, 0]);

    const yAxis = d3.svg
      .axis()
      .scale(y)
      .tickFormat("")
      .tickSize(0)
      .orient("left");

    // Specify the chart area and dimensions
    const chart = d3
      .select(`#${this.state.id}`)
      .attr("width", spaceForLabels + chartWidth + spaceForLegend)
      .attr("height", chartHeight);

    // Create bars
    const bar = chart
      .selectAll("g")
      .data(zippedData)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(${spaceForLabels},${(i * barHeight) + ((gapBetweenGroups) * ((0.5 + Math.floor(i / data.series.length))))})`);

    // Create rectangles of the correct width
    bar
      .append("rect")
      .attr("fill", (d, i) =>
        // return color(i % data.series.length);
         colorArray[i % data.series.length])
      .attr("class", "bar")
      .attr("width", x)
      .attr("height", barHeight - 1);

    // Add text label in bar
    if (showLegend) {
      bar
        .append("text")
        .attr("x", d => x(d) + 15)
        .attr("y", barHeight / 2)
        .attr("fill", "red")
        .attr("dy", 3)
        .attr("dx", () => legendRightIndent)
        .attr("style", `font-size: ${fontSize};`)
        // eslint-disable-next-line no-confusing-arrow
        .text(d => showPercent ? `${d.toLocaleString()}%` : d.toLocaleString());
    }
    // Draw labels
    bar
      .append("text")
      .attr("class", "label")
      .attr("x", () => -10)
      .attr("y", groupHeight / 2)
      .attr("dy", ".35em")
      .attr("style", `font-size: ${fontSize};`)
      .text((d, i) => {
        if (i % data.series.length === 0) {
          return labels[Math.floor(i / data.series.length)];
        }
        return "";
        
      });

    chart
      .append("g")
      .attr("class", "y axis")
      .attr(
        "transform",
        `translate(${spaceForLabels}, ${-gapBetweenGroups / 2})`
      )
      .call(yAxis);
  }
  render() {
    return <svg className="chart" id={this.state.id} />;
  }
}

HorizontalGroupedChart.propTypes = {
  id: PropTypes.string.isRequired,
  chartData: PropTypes.object.isRequired,
  chartProperties: PropTypes.object.isRequired
};

export default HorizontalGroupedChart;
