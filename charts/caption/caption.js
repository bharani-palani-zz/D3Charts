import React, { Component } from "react";
import * as d3 from "d3v3";
import PropTypes from "prop-types";

class Caption extends Component {
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
    const id = this.state.id;
    const data = this.state.chartData;
    const width = this.state.chartProperties.width;
    const height = this.state.chartProperties.height;
    const top = this.state.chartProperties.top;
    const hspacing = this.state.chartProperties.hspacing;
    const background = this.state.chartProperties.background;
    const vSpacing = this.state.chartProperties.vSpacing;
    const labelFontSize = this.state.chartProperties.labelFontSize;
    const captionFontSize = this.state.chartProperties.captionFontSize;
    const fontFamily = this.state.chartProperties.fontFamily;
    const subFontSize = this.state.chartProperties.subFontSize;
    const colorArray = this.state.chartProperties.colorArray;

    const svg = d3
        .select(`#${id}`)
        .style("background", background)
        .attr("width", width)
        .attr("height", height);

    svg.append("g").selectAll("svg")
            .data(data)
            .enter()
            .append("text")
            .attr("dx", (d, i) => (i * hspacing) + hspacing)
            .attr("dy", 40)
            .attr("text-anchor", "middle")
            .attr("style", `font-size: ${labelFontSize}px; font-family: ${fontFamily}; fill: #666;`)
            .text(d => d.label)
            .attr("transform", `translate(0, ${top})`);
            
    svg.append("g").selectAll("svg")
            .data(data)
            .enter()
            .append("text")
            .attr("dx", (d, i) => (i * hspacing) + hspacing)
            .attr("dy", vSpacing)
            .attr("text-anchor", "middle")
            .attr("fill", (d, i) => colorArray[i])
            .attr("style", `font-size: ${captionFontSize}px; font-family: ${fontFamily};`)
            .text(d => d.value)
            .attr("transform", `translate(0, ${top})`)
            // append children tsapn for subscripts
            .append("tspan")
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("fill", (d, i) => colorArray[i])
            .attr("style", `font-size: ${subFontSize}px; font-family: ${fontFamily}`)
            .text(d => d.sub);
            // .attr("transform", `translate(0, ${top})`)
  }
  render() {
    return (
      <svg id={this.props.id} />
    );
  }

}
Caption.propTypes = {
  id: PropTypes.string.isRequired,
  chartData: PropTypes.array.isRequired,
  chartProperties: PropTypes.object.isRequired,
};
  
export default Caption;

