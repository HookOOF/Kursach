//import * as tf from "@tensorflow/tfjs";
import { displayError } from "./error.js";
import { getSvgOriginalBoundingBox } from "./utils.js";
import { ActivationLayer } from "./activationlayer.js";
import { Layer } from "./layer.js";
import { Point, Rectangle } from "./shape.js";

export class Output extends ActivationLayer {
    constructor() {
        const svgBoundingBox = getSvgOriginalBoundingBox(document.getElementById("svg"));
        const defaultLocation = new Point(
            svgBoundingBox.width - 100,
            svgBoundingBox.height / 2
        );

        super(
            [new Rectangle(new Point(-8, -90), 30, 200, "#806CB7")],
            defaultLocation
        );

        this.layerType = "Output";
        this.parameterDefaults = { units: 10, activation: "softmax" };
        //this.tfjsEmptyLayer = tf.layers.dense;
        this.outputWiresAllowed = false;
        this.wireGuidePresent = false;
        this.defaultLocation = defaultLocation;
        this.juliaFinalLineId = null;
    }

    getHoverText() {
        return "Output";
    }

    delete() {
        this.unselect();
    }

    populateParamBox() {
        return;
    }

    lineOfPython() {
        return `Dense(10, activation='softmax')`;
    }

    clone() {
        const newLayer = new Output();
        newLayer.paramBox = this.paramBox;
        return newLayer;
    }

    addChild(_) {
        displayError(new Error("Output cannot have children."));
    }
}
