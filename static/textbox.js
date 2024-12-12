import * as d3 from "https://cdn.jsdelivr.net/npm/d3@6/+esm";
import { Point } from "./shape.js";

export class TextBox {
    constructor() {
        this.offset = new Point(0, 0);

        this.group = d3.select("#svg").append("g")
            .attr("transform", "translate(5, 50)")
            .style("display", "none");

        this.group.append("rect")
            .attr("x", -50)
            .attr("y", -15)
            .attr("width", 100)
            .attr("height", 30)
            .attr("rx", 3)
            .attr("fill", "rgb(0,0,0,0.8)");

        this.textElement = this.group.append("text")
            .attr("font-family", "Helvetica")
            .attr("alignment-baseline", "middle")
            .attr("text-anchor", "middle")
            .attr("font-size", 16)
            .attr("fill", "#eeeeee");
    }

    show() {
        this.group.style("display", null);
        this.group.raise();
    }

    hide() {
        this.group.style("display", "none");
    }

    raise() {
        this.group.raise();
    }

    setText(text) {
        this.textElement.text(text);
        // TODO: вычислить ширину текста и задать размеры прямоугольника
    }

    setOffset(offset) {
        this.offset = offset;
    }

    setPosition(position) {
        this.raise();
        this.group.attr("transform", `translate(${position.x + this.offset.x}, ${position.y + this.offset.y})`);
    }
}
