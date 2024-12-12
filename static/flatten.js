//import * as tf from "@tensorflow/tfjs";
import { ActivationLayer } from "./activationlayer.js";
import { Layer } from "./layer.js";
import { PathShape, Point } from "./shape.js";

export class Flatten extends Layer {
    constructor(defaultLocation = Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super(
            [new PathShape("M-90 -90 h15 v-30 h15 v100 h-15 v-30 h-15 v-40 Z", "#AA222F")],
            defaultLocation
        );
        this.layerType = "Flatten";
        this.parameterDefaults = {};
        //this.tfjsEmptyLayer = tf.layers.flatten;
    }

    populateParamBox() {
        return;
    }

    getHoverText() {
        return "Flatten";
    }

    lineOfPython() {
        return `Flatten()`;
    }

    initLineOfJulia() {
        return `x${this.uid} = insert!(net, (shape) -> (x) -> reshape(x, :, size(x, 4)))\n`;
    }

    clone() {
        return new Flatten();
    }
}
