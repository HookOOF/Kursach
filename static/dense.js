//import * as tf from "@tensorflow/tfjs";
import { ActivationLayer } from "./activationlayer.js";
import { PathShape, Point } from "./shape.js";

export class Dense extends ActivationLayer {
    constructor(defaultLocation = Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super(
            [new PathShape("M-8 -90 h26 v100 h-8 v-10 h-10 v10 h-8 v-100 Z", "#F7473B")],
            defaultLocation
        );

        this.layerType = "Dense";
        this.parameterDefaults = { units: 32 };
        //this.tfjsEmptyLayer = tf.layers.dense;
    }

    populateParamBox() {
        const line = document.createElement("div");
        line.className = "paramline";

        const name = document.createElement("div");
        name.className = "paramname";
        name.innerHTML = "Units:";
        name.setAttribute("data-name", "units");

        const value = document.createElement("input");
        value.className = "paramvalue layerparamvalue";
        value.value = "32";

        line.appendChild(name);
        line.appendChild(value);
        this.paramBox.append(line);

        this.focusing();
    }

    getHoverText() {
        return "Dense";
    }

    lineOfPython() {
        const params = this.getParams();
        const activation = this.getActivationText();
        const activationText = activation == null ? "" : `, activation='${activation}'`;
        return `Dense(${params.units}${activationText})`;
    }

    initLineOfJulia() {
        const params = this.getParams();
        const activation = this.getActivationText();
        const activationText = activation == null ? "" : `, ${activation}`;
        return `x${this.uid} = insert!(net, (shape) -> Dense(shape[1], ${params.units}${activationText}))\n`;
    }

    clone() {
        const newLayer = new Dense(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation));
        newLayer.paramBox = this.paramBox;
        newLayer.activation = this.activation;
        return newLayer;
    }
}
