import { windowProperties } from "./window.js";
import { ActivationLayer } from "./activationlayer.js";
import { Draggable } from "./draggable.js";
import { Point } from "./shape.js";

export class Activation extends Draggable {
    static defaultLocation = new Point(50, 150);

    constructor(color, defaultLocation) {
        super(defaultLocation);

        this.layer = null;

        this.body = this.svgComponent
            .append("path")
            .attr("d", "M0 0 h10 v10 h8 v20 h-26 v-20 h8 v-10 Z")
            .style("fill", color)
            .style("cursor", "pointer");

        this.makeDraggable();
    }

    select() {
        super.select();
        this.body.style("stroke", "yellow").style("stroke-width", "2");
    }

    unselect() {
        super.unselect();
        this.body.style("stroke", null).style("stroke-width", null);
    }

    delete() {
        if (this.layer != null) {
            this.layer.removeActivation();
            this.layer = null;
        }
        super.delete();
    }

    moveAction() {
        let closestLayer;
        let minDist = Infinity;

        if (this.layer == null) {
            for (const activationLayer of windowProperties.activationLayers) {
                const dist = activationLayer.getPosition().distance(this.getPosition());
                if (dist < minDist) {
                    minDist = dist;
                    closestLayer = activationLayer;
                }
            }
        } else {
            closestLayer = this.layer;
            minDist = this.layer.getPosition().distance(this.getPosition());
        }

        const snappingDistance = 20;

        if (minDist < snappingDistance) {
            if (this.layer != null) {
                this.layer.removeActivation();
                this.layer = null;
            }
            closestLayer.addActivation(this);
            this.layer = closestLayer;
            this.draggedX = this.layer.draggedX;
            this.draggedY = this.layer.draggedY;
        } else if (this.layer != null) {
            this.layer.removeActivation();
            this.layer = null;
        }
    }
}

export class Relu extends Activation {
    activationType =  "relu";
    constructor(defaultLocation = Point.randomPoint(50, 50, Activation.defaultLocation)) {
        super("#B29F9C", defaultLocation);

        this.svgComponent.append("path")
            .attr("d", "M-5 20 l10 0 l7 -7")
            .style("stroke", "black")
            .style("stroke-width", 3)
            .style("fill", "none")
            .style("cursor", "pointer");
    }

    getHoverText() {
        return "relu";
    }
}

export class Sigmoid extends Activation {
    activationType =  "sigmoid";
    constructor(defaultLocation = Point.randomPoint(50, 50, Activation.defaultLocation)) {
        super("#F2A878", defaultLocation);

        this.svgComponent.append("path")
            .attr("d", "M -3 20 Q 5 20 5 17 Q 5 14 13 14 ")
            .style("stroke", "black")
            .style("stroke-width", 3)
            .style("fill", "none")
            .style("cursor", "pointer");
    }

    getHoverText() {
        return "sigmoid";
    }
}

export class Tanh extends Activation {
    activationType =  "tanh";
    constructor(defaultLocation = Point.randomPoint(50, 50, Activation.defaultLocation)) {
        super("#A3A66D", defaultLocation);

        this.svgComponent.append("path")
            .attr("d", "M -4 26 Q 5 26 5 20 Q 5 14 14 14 ")
            .style("stroke", "black")
            .style("stroke-width", 3)
            .style("fill", "none")
            .style("cursor", "pointer");
    }

    getHoverText() {
        return "tanh";
    }
}

export class Softmax extends Activation {
    activationType = "softmax"
    constructor(defaultLocation = Point.randomPoint(50, 50, Activation.defaultLocation)) {
        super("#FFFFFF", defaultLocation);

        this.svgComponent.append("path")
            .attr("d", "M -4 26 Q 5 26 5 20 Q 5 14 14 14 ")
            .style("stroke", "black")
            .style("stroke-width", 3)
            .style("fill", "none")
            .style("cursor", "pointer");
    }

    getHoverText() {
        return "softmax";
    }
}
