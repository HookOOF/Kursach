import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { windowProperties } from "./window.js";
import { saveDraggable } from "./appscriptmenu.js";
//import { Layer } from "./layer";

export class Wire {
    constructor(source, dest) {
        this.wireGuidePresent = false;

        this.source = source;
        this.dest = dest;

        const sourceCenter = this.source.getPosition().add(this.source.center());
        const destCenter = this.dest.getPosition().add(this.dest.center());

        this.group = d3.select("#svg").append("g");

        this.line = this.group.append("line")
            .attr("x1", sourceCenter.x)
            .attr("y1", sourceCenter.y)
            .attr("x2", destCenter.x)
            .attr("y2", destCenter.y)
            .style("stroke", "black")
            .style("stroke-width", 6)
            .style("cursor", "pointer");

        this.triangle = this.group.append("polygon")
            .attr("points", "0,16, 20,0, 0,-16")
            .style("cursor", "pointer");

        this.updatePosition();
        this.source.raise();
        this.dest.raise();

        this.line.on("click", () => { this.select(); });
        this.triangle.on("click", () => { this.select(); });
        saveDraggable(source);
        saveDraggable(dest);
    }

    raise() {
        this.group.raise();
        this.source.raiseGroup();
        this.dest.raiseGroup();
    }

    raiseGroup() {
        this.group.raise();
    }

    select() {
        if (windowProperties.selectedElement != null) {
            if (windowProperties.selectedElement === this) {
                return;
            }
            windowProperties.selectedElement.unselect();
        }
        windowProperties.selectedElement = this;
        this.raise();
        this.line.style("stroke", "yellow");
        this.triangle.style("fill", "yellow");
    }

    unselect() {
        this.line.style("stroke", "black");
        this.triangle.style("fill", "black");
    }

    delete() {
        this.line.remove();
        this.triangle.remove();
        this.source.children.delete(this.dest);
        this.dest.parents.delete(this.source);
        this.source.wires.delete(this);
        this.dest.wires.delete(this);
    }

    updatePosition() {
        const sourceCenter = this.source.getPosition().add(this.source.center());
        const destCenter = this.dest.getPosition().add(this.dest.center());
        const midPoint = sourceCenter.midpoint(destCenter);
        this.line.attr("x1", sourceCenter.x)
            .attr("y1", sourceCenter.y)
            .attr("x2", destCenter.x)
            .attr("y2", destCenter.y);

        this.triangle.attr("transform", "translate(" + midPoint.x + ","
            + midPoint.y + ")rotate(" + sourceCenter.angleTo(destCenter) + ")");
    }
}
