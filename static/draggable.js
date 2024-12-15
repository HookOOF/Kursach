import {getSvgOriginalBoundingBox} from './utils.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@6/+esm";
import { windowProperties } from "./window.js";
import { Point } from "./shape.js";
import { saveDraggable } from './appscriptmenu.js';

export class Draggable {
    constructor(defaultLocation = new Point(50, 100)) {
        if (new.target === Draggable) {
            throw new Error("Cannot instantiate abstract class Draggable directly");
        }
        this.wireGuidePresent = false;
        this.draggedX = null; // Use these to let draggables return to user dragged position after cropping
        this.draggedY = null;

        this.moveTimeout = null;
        this.hoverText = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("font-weight", "bold")
            .style("padding", "6px")
            .style("background", "rgba(0, 0, 0, 0.8)")
            .style("color", "#eee")
            .style("border-radius", "2px")
            .style("display", "none")
            .style("font-family", "Helvetica")
            .style("user-select", "none")
            .text(this.getHoverText());

            this.svgComponent = d3.select("#svg")
            .append("g")
            .attr("transform", `translate(${defaultLocation.x},${defaultLocation.y})`)
            .on("click", () => {
                this.select();
                window.clearTimeout(this.moveTimeout);
                this.hoverText.style("visibility", "hidden");
            })
            .on("contextmenu", () => {
                window.clearTimeout(this.moveTimeout);
                this.hoverText.style("visibility", "hidden");
            })
            .on("mousemove", (event) => {
                this.hoverText.style("visibility", "hidden");
                clearTimeout(this.moveTimeout);
                this.moveTimeout = setTimeout(() => {
                    this.hoverText.style("display", "");
                    this.hoverText.style("visibility", "visible");
                }, 280);
                this.hoverText.style("top", `${event.pageY - 40}px`)
                    .style("left", `${event.pageX - 30}px`);
            })
            .on("mouseout", () => {
                clearTimeout(this.moveTimeout);
                this.hoverText.style("visibility", "hidden");
            });

        this.makeDraggable();
        this.draggedX = defaultLocation.x;
        this.draggedY = defaultLocation.y;
    }

    static nodeBoundingBox(node) {
        const nodeBbox = node.getBBox();
        return {
            bottom: nodeBbox.y + nodeBbox.height,
            left: nodeBbox.x,
            right: nodeBbox.x + nodeBbox.width,
            top: nodeBbox.y
        };
    }

    makeDraggable() {
        let firstDrag = true;
        let mousePosRelativeToCenter;

        this.svgComponent.on("mousedown", (event) => {
            const coords = d3.pointer(event);
            mousePosRelativeToCenter = new Point(coords[0], coords[1]);
        });
        const dragThings = (event) => {
            clearTimeout(this.moveTimeout);
            this.hoverText.style("visibility", "hidden");
            if (firstDrag) {
                if (!mousePosRelativeToCenter) {
                    const coords = d3.mouse(this);
                    mousePosRelativeToCenter = new Point(coords[0], coords[1]);
                }
                this.raise();
                firstDrag = false;
            }

            this.draggedX = event.x - mousePosRelativeToCenter.x;
            this.draggedY = event.y - mousePosRelativeToCenter.y;
            this.setPosition(new Point(this.draggedX, this.draggedY));
            this.cropPosition();
            this.moveAction();

            windowProperties.wireGuide.moveToMouse();
        };
        
        const dragHandler = d3.drag().touchable(true).clickDistance(4)
            .on("drag", dragThings)
            .on("end", () => { firstDrag = true; mousePosRelativeToCenter = null; saveDraggable(this);});

        this.svgComponent.call(dragHandler);
    }

    moveAction() {
        // This should be implemented in subclasses
    }

    raise() {
        this.svgComponent.raise();
    }

    raiseGroup() {
        this.svgComponent.raise();
    }

    getHoverText() {
        // Should be implemented in subclasses
        return "";
    }

    select() {
        if (windowProperties.selectedElement) {
            if (windowProperties.selectedElement === this) {
                return;
            }
            windowProperties.selectedElement.unselect();
        }
        windowProperties.selectedElement = this;
        this.raise();
        this.svgComponent.selectAll("rect").style("stroke", "yellow").style("stroke-width", "2");
        if (this.wireGuidePresent) {
            windowProperties.wireGuide.moveToMouse();
            windowProperties.wireGuide.show();
        }
    }

    unselect() {
        if (windowProperties.selectedElement === this) {
            windowProperties.selectedElement = null;
            windowProperties.wireGuide.hide();
        }
        this.svgComponent.selectAll("rect").style("stroke", null).style("stroke-width", null);
    }

    delete_from_db() {
        const elementId = this.uid;
        let arrParents = []
        let arrChildren = []
        this.parents.forEach((parent) => {
            arrParents.push(parent);
          });
        this.children.forEach((child) => {
            arrChildren.push(child);
          });
        fetch('/clear-db-row', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: elementId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Error deleting record:", data.error);
            } else {
                console.log("Record deleted successfully:", data.message);
                arrParents.forEach((parent) => {
                console.log('kek');
                saveDraggable(parent);
            });
                arrChildren.forEach((child) => {
                saveDraggable(child);
              });
            }
        })
        .catch(error => console.error("Error:", error));
    }
    delete(){
            this.unselect();
            this.svgComponent.remove();
            this.hoverText.remove();
        }


    center() {
        const bbox = this.svgComponent.node().getBBox();
        return new Point(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);
    }

    outerBoundingBox() {
        const bbox = Draggable.nodeBoundingBox(this.svgComponent.nodes()[0]);

        for (const node of this.svgComponent.nodes().slice(1)) {
            const nodeBbox = Draggable.nodeBoundingBox(node);

            bbox.top = Math.min(nodeBbox.top, bbox.top);
            bbox.bottom = Math.max(nodeBbox.bottom, bbox.bottom);
            bbox.left = Math.min(nodeBbox.left, bbox.left);
            bbox.right = Math.max(nodeBbox.right, nodeBbox.right);
        }
        return bbox;
    }

    getPosition() {
        const transformation = this.svgComponent.attr("transform");
        const numArr = transformation.substring(
            transformation.indexOf("(") + 1, transformation.indexOf(")")
        ).split(",").map(value => Number(value));
        return new Point(numArr[0], numArr[1]);
    }

    cropPosition() {
        const canvasBoundingBox = getSvgOriginalBoundingBox(document.getElementById("svg"));
        const componentBBox = this.outerBoundingBox();

        const bottomBoundary = (canvasBoundingBox.height - componentBBox.bottom) - windowProperties.svgYOffset;

        this.setPosition(new Point(
            Math.min(Math.max(-componentBBox.left, this.draggedX), canvasBoundingBox.width - componentBBox.right),
            Math.min(Math.max(-componentBBox.top + windowProperties.svgYOffset, this.draggedY), bottomBoundary)
        ));
    }

    setPosition(position) {
        this.svgComponent.attr("transform", `translate(${position.x},${position.y})`);
    }
}
