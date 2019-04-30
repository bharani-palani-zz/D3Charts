import React, { Component } from "react";
import * as d3 from "d3v3";
import PropTypes from "prop-types";
import "./verticalbarlinechart.sass";

class VerticalBarLineChart extends Component {
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
    d3.select(`#${this.state.id}`)
      .selectAll("*")
      .remove();
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

  getTextWidth = (text, fontSize, fontName) => {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    ctx.font = `${fontSize} ${fontName}`;
    return ctx.measureText(text).width;
  }

  DataSegregator = (array, on) => {
    d3.OrdinalPositionHolder = {
      valueOf() {
        const thisObject = this;
        const keys = Object.keys(thisObject);
        keys.splice(keys.indexOf("valueOf"), 1);
        keys.splice(keys.indexOf("keys"), 1);
        return keys.length === 0 ? -1 : d3.max(keys, d => thisObject[d]);
      },
      keys() {
        const thisObject = this;
        const keys = Object.keys(thisObject);
        keys.splice(keys.indexOf("valueOf"), 1);
        keys.splice(keys.indexOf("keys"), 1);
        return keys;
      }
    };
    array[0]
      .map(d => d[on])
      .forEach((b) => {
        const value = d3.OrdinalPositionHolder.valueOf();
        d3.OrdinalPositionHolder[b] =
          d3.OrdinalPositionHolder > -1 ? value + 1 : 0;
      });

    const SegData = d3.OrdinalPositionHolder.keys().map(() => []);

    array.forEach((d) => {
      d.forEach((b) => {
        SegData[d3.OrdinalPositionHolder[b[on]]].push(b);
      });
    });

    return SegData;
  }

  makeVertical = (obj, type) => {
    if (type === "v") {
      return obj.selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.5em")
      .attr("transform", () => "rotate(-90)");
    }
    return null;
  }
  drawChart() {
    const Data = this.state.chartData;
    const margin = this.state.chartProperties.margin;
    const width = this.state.chartProperties.width - margin.left - margin.right;
    const height = this.state.chartProperties.height - margin.top - margin.bottom;
    const barColorCode = this.state.chartProperties.barColorCode;
    const yAxisFontSize = this.state.chartProperties.yAxisFontSize;
    const xAxisFontSize = this.state.chartProperties.xAxisFontSize;
    const lineColorCodes = this.state.chartProperties.lineColorCodes;
    const leftYaxisColor = this.state.chartProperties.leftYaxisColor;
    const rightYaxisColor = this.state.chartProperties.rightYaxisColor;
    const xAxisColor = this.state.chartProperties.xAxisColor;
    const padding = this.state.chartProperties.padding;
    const yAxisString = this.state.chartProperties.yAxisString;
    const dotRadius = this.state.chartProperties.dotRadius;
    const dotStroke = this.state.chartProperties.dotStroke;
    const lineWidth = this.state.chartProperties.lineWidth;
    const rotateXAxisString = this.state.chartProperties.rotateXAxisString;

    // var textWidthHolder = 0;
    // / Adding Label in LineCategory
    Data.forEach((d) => {
      d.LineCategory.forEach((b) => {
        const bb = b;
        bb.Label = d.Label;
      });
    });

    const Categories = [];
    // Extension method declaration
    const x0 = d3.scale.ordinal().rangeRoundBands([0, width], padding);
    const XLine = d3.scale.ordinal().rangeRoundPoints([0, width], padding);
    const x1 = d3.scale.ordinal();
    const y = d3.scale.linear().domain([0, 100]).range([height, 0]);

    const YLine = d3.scale
      .linear()
      .range([height, 0])
      .domain([
        0,
        d3.max(Data, d => d3.max(d.LineCategory, b => b.Value))
      ]);

    const color = d3.scale
      .ordinal()
      .range(barColorCode);

    const bLine = d3.svg
      .line()
      .x(d => x0(d.Label) + (x0.rangeBand() / 2))
      .y(d => YLine(d.Value));

    const oLine = d3.svg
      .line()
      .x(d => x0(d.Label) + (x0.rangeBand() / 2))
      .y(d => y(d.Value));

    const xAxis = d3.svg
      .axis()
      .scale(x0)
      .orient("bottom");

    const yAxisRight = d3.svg
      .axis()
      .scale(YLine)
      .orient("right")
      // .tickFormat(d3.format(".2s"))
      .tickFormat(d => `${d}`);

    const YLeftAxis = d3.svg
      .axis()
      .scale(y)
      .orient("left")
      // .tickFormat(d3.format(".2s"))
      .tickFormat(d => `${d}%`);

    const svg = d3
      .select(`#${this.state.id}`)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Bar Data categories
    Data.forEach((d) => {
      d.Categories.forEach((b) => {
        if (Categories.findIndex(c => c.Name === b.Name) === -1) {
          const bb = b;
          bb.Type = "bar";
          Categories.push(b);
        }
      });
    });

    // Line Data categories
    Data.forEach((d) => {
      d.LineCategory.forEach((b) => {
        if (Categories.findIndex(c => c.Name === b.Name) === -1) {
          const bb = b;
          bb.Type = "line";
          Categories.push(b);
        }
      });
    });

    // Processing Line data
    const lineData = this.DataSegregator(
      Data.map(d => d.LineCategory),
      "Name"
    );

    // Line Coloring
    const LineColor = d3.scale.ordinal();
    LineColor.domain(
      Categories.filter(d => d.Type === "line").map(d => d.Name)
    );

    LineColor.range(lineColorCodes);
    x0.domain(
      Data.map(d => d.Label)
    );

    XLine.domain(
      Data.map(d => d.Label)
    );

    x1.domain(Categories.filter(d => d.Type === "bar").map(d => d.Name)).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(Data, d => d3.max(d.Categories, dd => dd.Value))]);

    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .attr("fill", xAxisColor)
      .style("font-size", xAxisFontSize);

    this.makeVertical(svg, rotateXAxisString);

    svg
      .append("g")
      .attr("class", "y axis")
      .style("font-size", yAxisFontSize)
      .attr("fill", rightYaxisColor)
      .attr("transform", `translate(${width},0)`)
      .call(yAxisRight)
      .append("text")
      .attr("transform", "rotate(90)")
      .attr("y", -10)
      .attr("dy", "-3em")
      .attr("x", height / 2)
      .style("text-anchor", "end")
      .text(yAxisString);

    svg
      .append("g")
      .attr("class", "y axis")
      .call(YLeftAxis)
      .style("font-size", yAxisFontSize)
      .attr("fill", leftYaxisColor);

    const state = svg
      .selectAll(".state")
      .data(Data)
      .enter()
      .append("g")
      .attr("class", "state")
      .attr("transform", d => `translate(${x0(d.Label)},0)`);

    state
      .selectAll("rect")
      .data(d => d.Categories)
      .enter()
      .append("rect")
      .attr("width", x1.rangeBand())
      .attr("x", d => x1(d.Name))
      .attr("y", d => y(d.Value))
      // .attr("height", function (d) { return height - y(d.Value); })
      .attr("fill", d => color(d.Name))
      .transition()
      // .delay(500)
      .attrTween("height", (d) => {
        const i = d3.interpolate(0, height - y(d.Value));
        return function (t) {
          return i(t);
        };
      });
      
    // drawaing lines
    svg
      .selectAll(".lines")
      .data(lineData)
      .enter()
      .append("g")
      .attr("class", "line")
      .each(function (d, i) {
        d3.select(this)
        .append("path")
        .attr("d", i === 1 ? bLine(lineData[i]) : oLine(lineData[i]))
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .transition()
        // .delay(700)
        .attr("stroke", i === 1 ? lineColorCodes[1] : lineColorCodes[0])
        .attr("stroke-width", lineWidth);
      });

    const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .attr("class", `tc-tooltip ${this.state.id}`);
  
   // drawing dots
    lineData.forEach((obj, j) => {
      let coors = j === 1 ? bLine(lineData[j]) : oLine(lineData[j]);
      coors = coors.split("M").join("");
      coors = coors.split("L");
      svg
      .selectAll(".bar")
      .data(lineData[j])
      .enter()
      .append("circle")
      .style("opacity", 0)
      .attr("r", dotRadius)
      .attr("fill", lineColorCodes[j])
      .attr("stroke", dotStroke)
      .attr("transform", (d, i) => {
        const axis = coors[i].split(",");
        return `translate(${axis[0]},${axis[1]})`;
      })
      .on("mouseover", d => tooltip.text(d.Value).style("visibility", "visible"))
      .on("mousemove", d => tooltip.text(d.Value).style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`))
      .on("mouseout", d => tooltip.text(d.Value).style("visibility", "hidden"))
      .transition()
      // .delay(600)
      .style("opacity", 1);
    });


  }
  render() {
    return <svg id={this.state.id} />;
  }
}

VerticalBarLineChart.propTypes = {
  id: PropTypes.string.isRequired,
  chartData: PropTypes.array.isRequired,
  chartProperties: PropTypes.object.isRequired
};

export default VerticalBarLineChart;
