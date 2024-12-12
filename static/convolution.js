//import * as tf from "@tensorflow/tfjs";
import { ActivationLayer } from "./activationlayer.js";
import { PathShape, Point, Rectangle } from "./shape.js";

export class Conv2D extends ActivationLayer {
    constructor(defaultLocation = Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super(
            [
                new Rectangle(new Point(-54, -80), Conv2D.blockSize, Conv2D.blockSize, "#3B6B88"),
                new Rectangle(new Point(-37, -60), Conv2D.blockSize, Conv2D.blockSize, "#3B7B88"),
                new PathShape("M-20 -40 h50 v50 h-20 v-10 h-10 v10 h-20 v-50 Z", "#3B8B88")
            ],
            defaultLocation
        );

        this.layerType = "Conv2D";
        this.parameterDefaults = {
            filters: 8,
            kernelRegularizer: "none",
            kernelSize: [3, 3],
            padding: "same",
            regScale: 0.1,
            strides: [1, 1],
        };
        //this.tfjsEmptyLayer = tf.layers.conv2d;
    }

    populateParamBox() {
        const line1 = document.createElement("div");
        line1.className = "paramline";

        const name1 = document.createElement("div");
        name1.className = "paramname";
        name1.innerHTML = "Filters:";
        name1.setAttribute("data-name", "filters");

        const value1 = document.createElement("input");
        value1.className = "paramvalue layerparamvalue";
        value1.value = this.parameterDefaults.filters;

        line1.appendChild(name1);
        line1.appendChild(value1);

        this.paramBox.append(line1);

        const line2 = document.createElement("div");
        line2.className = "paramline";
        const name2 = document.createElement("div");
        name2.className = "paramname";
        name2.innerHTML = "Kernel size:";
        name2.setAttribute("data-name", "kernelSize");

        const value2 = document.createElement("input");
        value2.className = "paramvalue layerparamvalue";
        value2.value = "3, 3";

        line2.appendChild(name2);
        line2.appendChild(value2);
        this.paramBox.append(line2);

        const line3 = document.createElement("div");
        line3.className = "paramline";
        const name3 = document.createElement("div");
        name3.className = "paramname";
        name3.innerHTML = "Stride:";
        name3.setAttribute("data-name", "strides");

        const value3 = document.createElement("input");
        value3.className = "paramvalue layerparamvalue";
        value3.value = "1, 1";

        line3.appendChild(name3);
        line3.appendChild(value3);
        this.paramBox.append(line3);

        const line4 = document.createElement("div");
        line4.className = "paramline selectline";

        const name4 = document.createElement("div");
        name4.className = "paramname";
        name4.innerHTML = "Norm:";
        name4.setAttribute("data-name", "kernelRegularizer");

        const selectDiv = document.createElement("div");
        selectDiv.className = "select";

        const arrow = document.createElement("div");
        arrow.className = "select__arrow";

        const select = document.createElement("select");
        select.className = "parameter-select";

        [["none", "None"], ["l1", "L1"], ["l2", "L2"]].forEach(([value, label]) => {
            const option = document.createElement("option");
            option.value = value;
            option.innerHTML = label;
            select.appendChild(option);
        });

        line4.appendChild(name4);
        line4.appendChild(selectDiv);
        selectDiv.appendChild(select);
        selectDiv.appendChild(arrow);
        this.paramBox.append(line4);

        const line5 = document.createElement("div");
        line5.className = "paramline";
        const name5 = document.createElement("div");
        name5.className = "paramname";
        name5.innerHTML = "Scale:";
        name5.setAttribute("data-name", "regScale");

        const value5 = document.createElement("input");
        value5.className = "paramvalue layerparamvalue";
        value5.value = "0.1";

        line5.appendChild(name5);
        line5.appendChild(value5);
        this.paramBox.append(line5);
        line5.classList.add("hidden_div");

        select.addEventListener("change", () => {
            if (select.value !== "none") {
                line5.classList.remove("hidden_div");
            } else {
                line5.classList.add("hidden_div");
            }
        });

        this.focusing();
    }

    getHoverText() {
        return "Conv";
    }

    lineOfPython() {
        const params = this.getParams();
        const activation = this.getActivationText();
        const activationText = activation == null ? "" : `, activation='${activation}'`;
        return `Conv2D(${params.filters}, (${params.kernelSize}), strides=(${params.strides})${activationText}, padding='same')`;
    }

    initLineOfJulia() {
        const params = this.getParams();
        const activation = this.getActivationText();
        const activationText = activation == null ? "" : `, ${activation}`;
        return `x${this.uid} = insert!(net, (shape) -> Conv((${params.kernelSize}), shape[3] =>${params.filters}${activationText}, stride=(${params.strides})))\n`;
    }

    clone() {
        const newConv = new Conv2D(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation));
        newConv.activation = this.activation;
        newConv.paramBox = this.paramBox;
        return newConv;
    }

    getParams() {
        const parameters = super.getParams();
        const scale = parameters.regScale;
        delete parameters.regScale;

        if (parameters.kernelRegularizer === "none") {
            delete parameters.kernelRegularizer;
        } else if (parameters.kernelRegularizer === "l1") {
           // parameters.kernelRegularizer = tf.regularizers.l1({ l1: scale });
        } else if (parameters.kernelRegularizer === "l2") {
            //parameters.kernelRegularizer = tf.regularizers.l2({ l2: scale });
        }

        return parameters;
    }
}
