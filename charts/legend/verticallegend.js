import React, { Component } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";

class VerticalLegend extends Component {
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
    this.setState({
      id: newProps.id,
      chartData: newProps.chartData,
      chartProperties: newProps.chartProperties
    });
  }
  drawChart() {
    const colorArray = this.state.chartProperties.colorArray;
    const legend = d3
      .select(`#${this.state.id}`)
      .attr("width", this.state.chartProperties.width)
      .attr("height", this.state.chartProperties.height)
      .style("background", "transparent");

    legend
      .selectAll("rect")
      .data(this.state.chartData)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => (i * this.state.chartProperties.spacing) + 10)
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", (d, i) => colorArray[i]);

    legend
      .selectAll("text")
      .data(this.state.chartData)
      .enter()
      .append("text")
      .attr("x", 25)
      .attr("y", (d, i) => (i * this.state.chartProperties.spacing) + 22.5)
      .text(d => `${d.label} ${this.state.chartProperties.showPercent ? `(${d.percentage}%)` : ""}`)
      .attr("class", this.state.chartProperties.labelClass)
      .style("text-anchor", "start")
      .style("font-size", this.state.chartProperties.fontSize);
  }
  render() {
    return <svg id={this.state.id} />;
  }
}

VerticalLegend.propTypes = {
  id: PropTypes.string.isRequired,
  chartData: PropTypes.array.isRequired,
  chartProperties: PropTypes.object.isRequired
};

export default VerticalLegend;
