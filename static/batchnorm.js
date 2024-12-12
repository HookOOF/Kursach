//import * as tf from "@tensorflow/tfjs";
import { displayError } from "./error.js";
import { ActivationLayer } from "./activationlayer.js";
import { Layer } from "./layer.js";
import { PathShape, Point } from "./shape.js";

export class BatchNorm extends ActivationLayer {
    static blockSize = 50;

    constructor(defaultLocation = Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super(
            [new PathShape("M-10 -90 L 20 -60 v70 h-10 v-10 h-10 v10 h-10 v-100 Z", "#CFB53B")],
            defaultLocation
        );

        this.layerType = "BatchNorm";
        this.parameterDefaults = { momentum: 0.99 };
        //this.tfjsEmptyLayer = tf.layers.batchNormalization;
    }

    populateParamBox() {
        const line1 = document.createElement("div");
        line1.className = "paramline";

        const name1 = document.createElement("div");
        name1.className = "paramname";
        name1.innerHTML = "Momentum:";
        name1.setAttribute("data-name", "momentum");

        const value1 = document.createElement("input");
        value1.className = "paramvalue layerparamvalue";
        value1.value = "0.99";

        line1.appendChild(name1);
        line1.appendChild(value1);

        this.paramBox.append(line1);

        this.focusing();
    }

    getHoverText() {
        return "BatchNorm";
    }

    lineOfPython() {
        const params = this.getParams();
        return `BatchNormalization(momentum=${params.momentum})`;
    }

    initLineOfJulia() {
        const params = this.getParams();
        const activation = this.getActivationText();
        const activationText = activation == null ? "" : `, ${activation}`;
        return `x${this.uid} = insert!(net, (shape) -> BatchNorm(shape[3]${activationText},` +
            `momentum=Float32(${params.momentum})))\n`;
    }

    clone() {
        const newBN = new BatchNorm(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation));
        newBN.activation = this.activation;
        newBN.paramBox = this.paramBox;

        return newBN;
    }

    generateTfjsLayer() {
        const parameters = { momentum: 0.99 };
        const config = this.getParams();
        for (const param of Object.keys(config)) {
            parameters[param] = config[param];
        }

        let parent = null;
        for (const p of this.parents) {
            parent = p;
            break;
        }

        // Concatenate layers handle fan-in
        //this.tfjsLayer = this.tfjsEmptyLayer(parameters).apply(parent.getTfjsLayer());

        if (this.activation != null) {
            if (this.activation.activationType !== "relu") {
                displayError(new Error("Batch Normalization does not support activations other than ReLu"));
            }
            //this.tfjsLayer = tf.layers.reLU().apply(this.tfjsLayer);
        }
    }
}
