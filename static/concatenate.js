//import * as tf from "@tensorflow/tfjs";
import { ActivationLayer } from "./activationlayer.js";
import { Layer } from "./layer.js";
import { PathShape, Point } from "./shape.js";

export class Concatenate extends Layer {
    constructor(defaultLocation = Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super(
            [
                new PathShape("M-23 -120 h23 v120 h-23 v-120 Z", "#F27493"),
                new PathShape("M-23 -81 h23 v2 h-23 v-2  Z", "rgba(20, 20, 20, 0.3)"),
                new PathShape("M-23 -41 h23 v2 h-23 v-2  Z", "rgba(20, 20, 20, 0.3)")
            ],
            defaultLocation
        );

        this.layerType = "Concatenate";
        this.parameterDefaults = {};
        //this.tfjsEmptyLayer = tf.layers.concatenate;
    }

    populateParamBox() {
        return;
    }

    getHoverText() {
        return "Concatenate";
    }

    lineOfPython() {
        return `Concatenate()`;
    }

    initLineOfJulia() {
        return `x${this.uid}  = insert!(net, (x) -> vcat(x...))\n`;
    }

    generateTfjsLayer() {
        // Concatenate layers handle fan-in
        const parents = [];
        for (const parent of this.parents) {
            parents.push(parent.getTfjsLayer());
        }
        this.tfjsLayer = this.tfjsEmptyLayer().apply(parents);
    }

    clone() {
        const newLayer = new Concatenate();
        return newLayer;
    }
}
