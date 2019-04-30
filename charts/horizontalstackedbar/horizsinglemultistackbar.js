import React, { Component } from "react";
import * as d3 from "d3v3";
import PropTypes from "prop-types";
import "./horizsinglemultistackbar.sass";

class Horizsinglemultistackbar extends Component {
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
    if (newProps.chartData !== this.props.chartData) {
      this.setState({
        id: newProps.id,
        chartData: newProps.chartData,
        chartProperties: newProps.chartProperties
      }, () => {
        this.drawChart();
      });
    }
  }
  componentWillUnmount() {
    this.removeTooltip();
  }
  removeTooltip = () => {
    d3.select("body").selectAll(`.tc-tooltip.${this.state.id}`).remove();
  }
  drawChart() {
    const data = this.state.chartData;
    const colorArray = this.state.chartProperties.colorArray;
    const margins = this.state.chartProperties.margins;
    const sizes = this.state.chartProperties.sizes;
    const width = sizes.width - margins.left - margins.right;
    const height = sizes.height - margins.bottom;
    const fontSize = this.state.chartProperties.fontSize;
    const showPercent = this.state.chartProperties.showPercent;
    const showLegend = this.state.chartProperties.showLegend;
    const showXscale = this.state.chartProperties.showXscale;
    const padding = this.state.chartProperties.padding;
    const ds = data.map(d => d.data.map(o => ({
      y: o.count,
      x: o.target.name
    })));

    d3.layout.stack()(ds);

    const dataset = ds.map(group => group.map(d =>
        // Invert the x and y values, and y0 becomes x0
         ({
           x: d.y,
           y: d.x,
           x0: d.y0
         })));

    const svg = d3
      .select(`#${this.state.id}`)
      .attr("width", width + margins.left + margins.right)
      .attr("height", height + margins.bottom)
      .append("g")
      .attr("transform", `translate(${margins.left},${this.props.chartProperties.xAxisOrientation === "top" ? 20 : 0})`);

    const units = dataset[0].map(d => d.y);

    const yScale = d3.scale
      .ordinal()
      .domain(units)
      .rangeRoundBands([0, height], padding);

    const yAxis = d3.svg
      .axis()
      .scale(yScale)
      .orient("left");

    const xMax = d3.max(dataset, (group) => {
      const groupMax = d3.max(group, d => d.x + d.x0);
      return groupMax;
    });

    const xScale = d3.scale
      .linear()
      .domain([0, xMax])
      .range([0, width]);

    const xAxis = d3.svg
      .axis()
      .scale(xScale)
      .orient(this.props.chartProperties.xAxisOrientation === "top" ? "top" : "bottom").ticks(this.props.chartProperties.ticks);

    const groups = svg
      .selectAll("g")
      .data(dataset)
      .enter()
      .append("g")
      .style("fill", (d, i) => colorArray[i % data.length]);

    this.removeTooltip();

    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .attr("id", this.state.id)
      .attr("class", `tc-tooltip ${this.state.id}`);

    groups
      .selectAll("rect")
      .data(d => d)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.x0))
      .attr("y", d => yScale(d.y))
      .attr("height", () => yScale.rangeBand())
      .attr("width", d => xScale(d.x))

      .on("mouseover", d => tooltip.text(`${d.x}%`).style("visibility", "visible"))
      .on("mousemove", d => tooltip.text(`${d.x}%`).style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`))
      .on("mouseout", d => tooltip.text(`${d.x}%`).style("visibility", "hidden"));


    if (showLegend) {
      groups
        .selectAll("text")
        .data(d => d)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .attr("x", d => (isNaN(xScale(d.x0)) ? 0 : xScale(d.x0)))
        .attr("y", d => (isNaN(yScale(d.y)) ? 0 : yScale(d.y)))
        .attr("dy", (yScale.rangeBand() / 2) + 4)
        .attr("dx", d => xScale(d.x) / 2)
        .attr("style", `font-size: ${fontSize};`)
        // eslint-disable-next-line no-confusing-arrow
        // eslint-disable-next-line consistent-return
        .text((d) => {
          if (d.x > 0) { return showPercent ? `${d.x}%` : d.x; }
        })

        .on("mouseover", d => tooltip.text(`${d.x}%`).style("visibility", "visible"))
        .on("mousemove", d => tooltip.text(`${d.x}%`).style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`))
        .on("mouseout", d => tooltip.text(`${d.x}%`).style("visibility", "hidden"));
  
    }
    
    if (showXscale) {
      svg
        .append("g")
        .attr("class", "bc-x-axis bc-axis")
        .attr("transform", this.props.chartProperties.xAxisOrientation === "top" ? "translate(0,0)" : `translate(0,${height})`)
        .call(xAxis);
    }
    svg
      .append("g")
      .attr("class", "bc-y-axis bc-axis")
      .call(yAxis)
      .selectAll("text")
      .text(d => (d.length >= 20 ? `${d.substring(0, 20)}...` : d))
      .on("mouseover", d => tooltip.text(d).style("visibility", "visible"))
      .on("mousemove", d => tooltip.text(d).style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`))
      .on("mouseout", d => tooltip.text(d).style("visibility", "hidden"));
  }
  render() {
    return <svg id={this.state.id} />;
  }
}

Horizsinglemultistackbar.propTypes = {
  id: PropTypes.string.isRequired,
  chartData: PropTypes.array.isRequired,
  chartProperties: PropTypes.object.isRequired
};

export default Horizsinglemultistackbar;
