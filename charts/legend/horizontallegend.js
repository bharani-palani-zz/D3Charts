import React, { Component } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";

class HorizontalLegend extends Component {
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
    const parentWidth = this.state.chartProperties.width;
    const colorArray = this.state.chartProperties.colorArray;
    const spacing = Math.round((parentWidth / this.state.chartData.length), 0);

    const legend = d3.select(`#${this.state.id}`)
      // .append("svg")
      .attr("class", this.state.chartProperties.labelClass)
      .attr("width", this.state.chartProperties.width)
      .attr("height", this.state.chartProperties.height)
      .selectAll("g")
      .data(this.state.chartData)
      .enter()
      .append("g");
      // .attr("transform", function(d, i) { return "translate(0,0)"; });

    legend.append("rect")
      .attr("width", this.state.chartProperties.iconSize)
      .attr("height", this.state.chartProperties.iconSize)
      .attr("x", (d, i) => i * spacing)
      .attr("y", 9)
      .style("fill", (d, i) => colorArray[i]);

    legend.append("text")
      .attr("x", (d, i) => (i * spacing) + 20)
      .attr("y", 9)
      .attr("dy", "1em")
      .text(d => `${d.label} ${this.state.chartProperties.showPercent ? `(${d.percentage}%)` : ""}`)
      .style("font-size", this.state.chartProperties.fontSize);

  }
  render() {
    // return <div className={this.state.legendProperties.makeCenter ? `text-center` : `null`} id={this.state.id}></div>;
    return <svg id={this.state.id} />;
  }
}

HorizontalLegend.propTypes = {
  id: PropTypes.string.isRequired,
  chartData: PropTypes.array.isRequired,
  chartProperties: PropTypes.object.isRequired
};

export default HorizontalLegend;
