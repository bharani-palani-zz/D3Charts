export default class ChartConfig {
  // errorMsg(property, type) {
  //   return `Please pass ${property} type as ${type}`;
  // }
  name(t) {
    if (
      t !== undefined &&
      t !== null &&
      t !== "" &&
      (typeof t === "string" || typeof t === "number")
    ) {
      this.name = t;
    } else {
      // console.error("ChartConfig Error:", this.errorMsg("name", "string"));
      this.name = undefined; // no defaults set
    }
    return this;
  }
  width(px) {
    if (typeof px === "number") {
      this.width = px;
    } else {
      // console.error("ChartConfig Error:", this.errorMsg("width", "number"));
      this.width = 200; // default width set as 200
    }
    return this;
  }
  height(px) {
    if (typeof px === "number") {
      this.height = px;
    } else {
      // console.error("ChartConfig Error:", this.errorMsg("height", "number"));
      this.height = 200; // default height set as 200
    }
    return this;
  }
  margin(t, r, b, l) {
    if (
      typeof t === "number" &&
      typeof r === "number" &&
      typeof b === "number" &&
      typeof l === "number"
    ) {
      this.margin = { top: t, right: r, bottom: b, left: l };
    } else {
      // console.error("ChartConfig Error:", this.errorMsg("margin", "number"));
      this.margin = { top: 0, right: 0, bottom: 0, left: 0 }; // default margin set as 0
    }
    return this;
  }
  fontSize(fs) {
    if (typeof fs === "number") {
      this.fontSize = fs;
    } else {
      // console.error("ChartConfig Error:", this.errorMsg("fontSize", "number"));
      this.fontSize = 12; // default fontsize defined as 12 in case or errors
    }
    return this;
  }
  customProperty(array) {
    array.forEach((a) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const property in a) {
        if (typeof a[property] === "object") {
          const keyName = Object.getOwnPropertyNames(a)[0];
          this[keyName] = a[property];
        } else {
          this[property] = a[property];
        }
      }
    });
    return this;
  }
  CustomOrderedSort = (jsonArray, orderFormat, key) => {
    const ordering = {};
    if (jsonArray.length && orderFormat.length && key !== undefined) {
      for (let i = 0; i < orderFormat.length; i++) {
        ordering[orderFormat[i]] = i;
      }
      return jsonArray.sort((a, b) => (ordering[a[key]] - ordering[b[key]]) || a[key].localeCompare(b[key]));
    }
    return jsonArray;
  }
}
