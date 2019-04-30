import React, { Component } from "react";
import * as d3 from "d3v3";
import PropTypes from "prop-types";

class HorizontalStackedBar extends Component {
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
  componentWillReceiveProps(newProps) {
    if (newProps.chartData !== this.props.chartData) {
      this.removeTooltip();
      this.setState({
        id: newProps.id,
        chartData: newProps.chartData,
        chartProperties: newProps.chartProperties
      }, () => {
        d3.select(`#${this.state.id}`).selectAll("*").remove();
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
    const margin = this.state.chartProperties.margin;
    const width = this.state.chartProperties.width - margin.left - margin.right;
    const height = this.state.chartProperties.height - margin.top - margin.bottom;
    const colorArray = this.state.chartProperties.colorArray;
    const showXaxis = this.state.chartProperties.showXaxis;
    const showBorder = this.state.chartProperties.showBorder;
    const showTitle = this.state.chartProperties.showTitle;
    const padding = this.state.chartProperties.padding;
    const fontSize = this.state.chartProperties.fontSize;
    const zoom = this.state.chartProperties.zoom;
    const threshold = this.state.chartProperties.threshold;

    const y = d3.scale.ordinal().rangeRoundBands([0, height], padding); // padding
    const x = d3.scale.linear().rangeRound([0, width]);

    const color = d3.scale.ordinal().range(colorArray);
    
    const svg = d3
      .select(`#${this.state.id}`)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("zoom", zoom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const data = this.state.chartData;
    const rateNames = d3.keys(data[0]).filter(key => (key !== "rows"));


    const rowsNames = data.map(d => d.rows);
    const neutralIndex = Math.floor(rateNames.length / 2);

    color.domain(rateNames);

    data.forEach((paramRow) => {
      const row = paramRow;
      row.total = d3.sum(
        rateNames.map(name => +row[name])
      );
      rateNames.forEach((name) => {
        row[`relative${name}`] = row.total !== 0 ? +row[name] / row.total : 0;
      });

      let x0 = -1 * d3.sum(
        rateNames.map((name, i) => (i < neutralIndex ? +row[`relative${name}`] : 0))
      );

      if (rateNames.length % 2) {
        x0 += (-1 * row[`relative${rateNames[neutralIndex]}`]) / 2;
      }

      row.boxes = rateNames.map(name => ({
        name,
        x0,
        x1: (x0 += row[`relative${name}`]),
        total: row.total,
        absolute: row[name]
      }));
    });

    const min = d3.min(data, d => d.boxes["0"].x0);
    const max = d3.max(data, d => d.boxes[d.boxes.length - 1].x1);

    x.domain([min, max]).nice();
    y.domain(rowsNames);
    if (showXaxis) {
      const xAxis = d3.svg
        .axis()
        .scale(x)
        .tickFormat(d3.format(",%"))
        .orient("top");

      svg
        .append("g")
        .attr("class", "x axis")
        .call(xAxis);
    }

    const yAxis = d3.svg
      .axis()
      .scale(y)
      .tickSize(0)
      .orient("left");

    svg
      .append("g")
      .attr("class", "y axis")
      .style("font-size", fontSize)
      .call(yAxis)
      .call(g => g.select(".domain").remove());
    
    // this.removeTooltip();
    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .attr("id", this.state.id)
      .attr("class", `tc-tooltip ${this.state.id}`);

    svg
      .call(yAxis)
      .selectAll("text")
      .text(d => (d.length >= 20 ? `${d.substring(0, 20)}...` : d))
      .on("mouseover", d => tooltip.text(d).style("visibility", "visible"))
      .on("mousemove", d => tooltip.text(d).style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`))
      .on("mouseout", d => tooltip.text(d).style("visibility", "hidden"));

    const rows = svg
      .selectAll(".row")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "bar")
      .style("font-size", fontSize)
      .attr("transform", d => `translate(0,${y(d.rows)})`);

    const bars = rows
      .selectAll("rect")
      .data(d => d.boxes)
      .enter()
      .append("g");

    bars
      .append("rect")
      .attr("height", y.rangeBand())
      .attr("x", d => (isNaN(x(d.x0)) ? null : x(d.x0)))
      .attr("width", d => (isNaN(x(d.x1) - x(d.x0)) ? null : x(d.x1) - x(d.x0)))
      .style("fill", d => color(d.name))
      .style("stroke", showBorder ? "#fff" : null);

    if (showTitle) {
      bars
        .append("text")
        .attr("x", d => (isNaN(x(d.x0)) ? null : x(d.x0)))
        .attr("y", y.rangeBand() / 3)
        .attr("dy", "0em")
        .attr("dx", d => (isNaN((x(d.x1) - x(d.x0)) / 2) ? null : (x(d.x1) - x(d.x0)) / 2))
        .style("text-anchor", "middle")
        .text((d) => {
          if (d.absolute !== 0) {
            if (d.name.charAt(0) === "0" || d.name.charAt(0) === "1") {
              return d.name.slice(1);
            }
          } else if (threshold && threshold > 0) {
            console.log(d);
          }
          return null;
          // return d.absolute !== 0 ? d.name : null;
        });
    }

    bars
      .append("text")
      .attr("x", d => (isNaN(x(d.x0)) ? null : x(d.x0)))
      .attr("y", y.rangeBand() / 2)
      .attr("dy", "0.5em")
      .attr("dx", d => (isNaN((x(d.x1) - x(d.x0)) / 2) ? null : (x(d.x1) - x(d.x0)) / 2))
      .style("text-anchor", "middle")
      .text(d =>
        // return d.absolute !== 0 && d.x1 - d.x0 > 0.04 ? d.absolute : "";
         (d.absolute !== 0 ? d.absolute : ""));

    svg
      .append("g")
      .attr("class", "y axis")
      .append("line")
      .attr("x1", isNaN(x(0)) ? 0 : (x(0)))
      .attr("x2", isNaN(x(0)) ? 0 : (x(0)))
      .attr("y2", height);

  }
  render() {
    return <svg id={this.state.id} />;
  }
}

HorizontalStackedBar.propTypes = {
  id: PropTypes.string.isRequired,
  chartData: PropTypes.array.isRequired,
  chartProperties: PropTypes.object.isRequired
};

export default HorizontalStackedBar;
