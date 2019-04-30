import React, { Component } from "react";
import PropTypes from "prop-types";
import "./nochart.sass";

class NoChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      icon: this.props.icon,
      iconSize: this.props.iconSize,
      label: this.props.label,
      style: this.props.style
    };
  }
  render() {
    return (
      <div className="NoChart" style={this.state.style}>
        <h1>
          <i className={`fa fa-${this.state.icon} ${this.state.iconSize}`} />
        </h1>
        <p>{this.state.label}</p>
      </div>
    );
  }
}

NoChart.propTypes = {
  icon: PropTypes.string.isRequired,
  iconSize: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  style: PropTypes.object.isRequired
};
  
NoChart.defaultProps = {
  icon: "pie-chart",
  iconSize: "fa-5x",
  label: "No chart data",
  style: {}
};
  
export default NoChart;
