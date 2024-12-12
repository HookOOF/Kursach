import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { windowProperties } from "./window.js";
import { Draggable } from "./draggable.js";

export class WireGuide {
    constructor() {
        this.dashedLine = d3.select("#svg").append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", 0)
            .style("stroke", "black")
            .style("stroke-width", 6)
            .style("stroke-dasharray", "8, 8")
            .style("display", "none")
            .style("pointer-events", "none");

        this.circle = d3.select("#svg").append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 10)
            .style("fill", "black")
            .style("stroke-width", 4)
            .style("display", "none")
            .style("pointer-events", "none");
    }

    show() {
        this.dashedLine.style("display", null);
        this.circle.style("display", null);
        this.dashedLine.raise();
        this.circle.raise();
    }

    hide() {
        this.dashedLine.style("display", "none");
        this.circle.style("display", "none");
    }

    raise() {
        this.dashedLine.raise();
        this.circle.raise();
    }

    moveToMouse(event) {
        this.raise();
        if (windowProperties.selectedElement != null &&
            windowProperties.selectedElement.wireGuidePresent &&
            windowProperties.selectedElement instanceof Draggable) {

            const sourceCenter = windowProperties.selectedElement.getPosition()
                .add(windowProperties.selectedElement.center());

            let endCoords;
            try {
                // Используем d3.pointer вместо устаревшего d3.mouse
                endCoords = d3.pointer(event,d3.select("#svg").node());
            } catch (error) {
                endCoords = [0, 0];
            }

            this.dashedLine.attr("x1", sourceCenter.x)
                .attr("y1", sourceCenter.y)
                .attr("x2", endCoords[0])
                .attr("y2", endCoords[1]);

            this.circle.attr("cx", sourceCenter.x)
                .attr("cy", sourceCenter.y);
        }
    }
}
