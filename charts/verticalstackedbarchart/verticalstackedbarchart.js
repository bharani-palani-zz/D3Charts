import React, { Component } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";
import "./verticalstackedbarchart.sass";

class VertStackedBarChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.id,
      chartData: this.props.chartData,
      chartProperties: this.props.chartProperties,
      isPercent: this.props.isPercent
    };
  }
  componentDidMount() {
    this.drawChart();
  }
  componentWillReceiveProps(newProps) {
    
    this.setState({
      id: newProps.id,
      chartData: newProps.chartData,
      chartProperties: newProps.chartProperties,
      isPercent: this.props.isPercent
    });
  }
  componentDidUpdate() {
    d3.select(`#${this.state.id}`).selectAll("*").remove();
    this.drawChart();
  }
  stackMin = serie => d3.min(serie, d => d[0])
  
  stackMax = serie => d3.max(serie, d => d[1])

  drawChart() {
   
    const data = this.state.chartData;
    const colorArray = this.state.chartProperties.colorArray;
    
    const series = d3.stack()
        .keys(this.state.chartProperties.labels)
        .offset(d3.stackOffsetDiverging)(data);
    // d3.select(`#${this.state.id}`).remove();

    const svg = d3.select(`#${this.state.id}`)
    .attr("width", this.state.chartProperties.width)
    .attr("height", this.state.chartProperties.height);

    const margin = this.state.chartProperties.margin;
    const isPercent = this.state.isPercent;
    
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const x = d3.scaleBand()
        .domain(data.map(d => d.label))
        .rangeRound([margin.left, width - margin.right])
        .padding(this.state.chartProperties.padding);
    
    const y = d3.scaleLinear()
        .domain([d3.min(series, this.stackMin), d3.max(series, this.stackMax)])
        .rangeRound([height - margin.bottom, margin.top]);
    
    // var z = d3.scaleOrdinal(d3.schemeCategory10);
    // const colors = this.state.chartData.fill;
    svg.append("g")
      .selectAll("g")
      .data(series)
      .enter()
      .append("g")
      .attr("fill", (d, i) => colorArray[i])
      .selectAll("rect")
      .data(d => d)
      .enter()
      .append("rect")
      .attr("width", (x.bandwidth))
      .attr("x", d => x(d.data.label))
      .attr("y", d => (y(d[1]) ? y(d[1]) : 0))
      .attr("height", d => (!isNaN(y(d[0]) - y(d[1])) ? (y(d[0]) - y(d[1])) : 0));
    
    if (data.length > 0) {
      svg.append("g")
          .attr("transform", `translate(0,${y(0) ? y(0) : 0})`)
          .attr("class", "axisGrey")
          .call(d3.axisBottom(x));
    }

    const yAxis = d3.axisLeft(y).tickFormat(d => (isPercent ? `${d}%` : d));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("class", "axisGrey")
        .call(yAxis);
          
  }
  render() {
    return <svg id={this.state.id} />;
  }
}

VertStackedBarChart.propTypes = {
  id: PropTypes.string.isRequired,
  chartData: PropTypes.array.isRequired,
  chartProperties: PropTypes.object.isRequired,
  isPercent: PropTypes.bool.isRequired,
};

export default VertStackedBarChart;
