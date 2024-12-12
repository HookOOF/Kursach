//import * as tf from "@tensorflow/tfjs";
//import { generateTfjsModel, topologicalSort } from "../../model/build_network";
//import { changeDataset } from "../../model/data";
import { svgData } from "./appscriptmenu.js";
import { displayError } from "./error.js";
import { parseString } from "./utils.js";
import { windowProperties } from "./window.js";
import { Draggable } from "./draggable.js";
import { Point, Shape } from "./shape.js";
import { Wire } from "./wire.js";

export class Layer extends Draggable {
    static nextID = 0; // Глобальный счётчик ID

    constructor(block, defaultLocation) {
        super(defaultLocation);

        this.uid = Layer.nextID++;
        this.block = block;

        this.layerType = "";
        this.parameterDefaults = {};
        this.children = new Set();
        this.parents = new Set();
        this.wires = new Set();
        this.shape = [];

        this.outputWiresAllowed = true;
        this.wireGuidePresent = true;
        this.tfjsLayer = null;

        for (const rect of this.block) {
            this.svgComponent.call(rect.svgAppender.bind(rect));
        }

        this.paramBox = document.createElement("div");
        this.paramBox.className = "parambox";
        this.paramBox.style.visibility = "hidden";
        this.paramBox.style.position = "absolute";
        document.getElementById("paramtruck").appendChild(this.paramBox);

        this.svgComponent.on("click", () => {
            this.select();
            window.clearTimeout(this.moveTimeout);
            this.hoverText.style("visibility", "hidden");
        });

        this.populateParamBox();
    }
    setParent(parents){
        this.parents = parents;
    }
    setChild(children){
        this.children = children;
    }
    moveAction() {
        for (const wire of this.wires) {
            wire.updatePosition();
        }

        if (windowProperties.selectedElement === this) {
            windowProperties.shapeTextBox.setPosition(this.getPosition());
        }
    }

    raise() {
        this.wires.forEach((w) => w.raiseGroup());
        this.parents.forEach((p) => p.raiseGroup());
        this.children.forEach((c) => c.raiseGroup());
        this.raiseGroup();
    }

    select() {
        const currSelected = windowProperties.selectedElement;
        if (currSelected && currSelected !== this &&
            currSelected instanceof Layer && currSelected.outputWiresAllowed) {
            currSelected.addChild(this);
        }
        super.select();

        document.getElementById("defaultparambox").style.display = "none";
        this.paramBox.style.visibility = "visible";
        this.svgComponent.selectAll("path").style("stroke", "yellow").style("stroke-width", "2");
        this.svgComponent.selectAll(".outerShape").style("stroke", "yellow").style("stroke-width", "2");

        const bbox = this.outerBoundingBox();
        windowProperties.shapeTextBox.setOffset(new Point((bbox.left + bbox.right) / 2, bbox.bottom + 25));
        //windowProperties.shapeTextBox.setText("[" + this.layerShape().toString() + "]");
        windowProperties.shapeTextBox.setPosition(this.getPosition());
        windowProperties.shapeTextBox.show();
    }

    unselect() {
        super.unselect();
        document.getElementById("defaultparambox").style.display = null;
        this.paramBox.style.visibility = "hidden";
        this.svgComponent.selectAll("path").style("stroke", null).style("stroke-width", null);
        this.svgComponent.selectAll(".outerShape").style("stroke", null).style("stroke-width", null);
        windowProperties.shapeTextBox.hide();
    }

    addChild(child) {
        if (!this.children.has(child) && !child.children.has(this)) {
            this.children.add(child);
            child.parents.add(this);

            const newWire = new Wire(this, child);
            this.wires.add(newWire);
            child.wires.add(newWire);
        }
    }

    addParent(parent) {
        parent.addChild(this);
    }

    delete() {
        super.delete();
        this.wires.forEach((w) => w.delete());
    }

    toJson() {
        return {
            children_ids: Array.from(this.children, (child) => child.uid),
            id: this.uid,
            layer_name: this.layerType,
            params: this.getJSONParams(),
            parent_ids: Array.from(this.parents, (parent) => parent.uid),
            xPosition: this.getPosition().x,
            yPosition: this.getPosition().y,
        };
    }

    getJSONParams() {
        const params = {};
        for (const line of this.paramBox.children) {
            const name = line.children[0].getAttribute("data-name");
            if (line.children[1].className === "select") {
                const selectElement = line.children[1].children[0];
                params[name] = selectElement.options[selectElement.selectedIndex].value;
            } else {
                const value = line.children[1].value;
                params[name] = parseString(value);
            }
        }
        return params;
    }

    getParams() {
        return this.getJSONParams();
    }

    setParams(params) {
        for (const line of this.paramBox.children) {
            const name = line.children[0].getAttribute("data-name");
            if (line.children[1].className === "select") {
                const selectElement = line.children[1].children[0];
                for (let i = 0; i < selectElement.options.length; i++) {
                    if (selectElement.options.item(i).value === params[name]) {
                        selectElement.selectedIndex = i;
                        break;
                    }
                }
            } else {
                line.children[1].value = params[name];
            }
        }
    }

    generateTfjsLayer() {
        const parameters = this.getParams();

        if (this.parents.size > 1) {
            displayError(new Error("Must use a concatenate when a layer has multiple parents"));
        }

        const parent = Array.from(this.parents)[0];
        this.tfjsLayer = this.tfjsEmptyLayer(parameters).apply(parent.getTfjsLayer());
    }

    //layerShape() {
        //if (this.layerType === "Input") {
            //changeDataset(svgData.input.getParams().dataset);
        //}
        //try {
            //generateTfjsModel(topologicalSort(svgData.input, false));
            //return this.getTfjsLayer().shape;
        //} catch (err) {
            //return null;
        //}
    //}

    hasParentType(type) {
        return Array.from(this.parents).some((p) => p instanceof type);
    }

    focusing() {
        for (const line of this.paramBox.children) {
            const inputElement = line.children[1];
            inputElement.onfocus = () => this.toggleFocus(inputElement);
            inputElement.onblur = () => this.toggleFocus(inputElement);
        }
    }

    toggleFocus(inputElement) {
        inputElement.classList.toggle("focusParam");
    }

    populateParamBox() {
        throw new Error("populateParamBox must be implemented by subclasses");
    }
}
