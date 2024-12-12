//import * as tf from "@tensorflow/tfjs";
//import { dataset } from "../../../model/data";
import { getSvgOriginalBoundingBox } from "./utils.js";
import { Layer } from "./layer.js";
import { Point, Rectangle } from "./shape.js";

export class Input extends Layer {
    constructor() {
        const defaultLocation = new Point(
            100,
            getSvgOriginalBoundingBox(document.getElementById("svg")).height / 2
        );
        super(
            [new Rectangle(new Point(0, 0), 40, 40, "#806CB7")],
            defaultLocation
        );

        this.layerType = "Input";
        this.parameterDefaults = {};
        //this.tfjsEmptyLayer = tf.input;
        this.defaultLocation = defaultLocation;
    }

    getHoverText() {
        return "Input";
    }

    delete() {
        this.unselect();
    }

    populateParamBox() {
        const line = document.createElement("div");
        line.className = "paramline selectline";

        const name = document.createElement("div");
        name.className = "paramname";
        name.innerHTML = "Dataset:";
        name.setAttribute("data-name", "dataset");

        const selectDiv = document.createElement("div");
        selectDiv.className = "select";

        const arrow = document.createElement("div");
        arrow.className = "select__arrow";

        const select = document.createElement("select");
        select.className = "parameter-select";

        [["mnist", "MNIST"], ["cifar", "Cifar-10"]].forEach(([value, label]) => {
            const option = document.createElement("option");
            option.value = value;
            option.innerHTML = label;
            select.appendChild(option);
        });

        line.appendChild(name);
        line.appendChild(selectDiv);
        selectDiv.appendChild(select);
        selectDiv.appendChild(arrow);
        this.paramBox.append(line);
        this.focusing();
    }

    //generateTfjsLayer() {
        //this.tfjsLayer = this.tfjsEmptyLayer({
            //shape: [
                //dataset.IMAGE_HEIGHT,
                //dataset.IMAGE_WIDTH,
                //dataset.IMAGE_CHANNELS
            //]
        //});
    //}

    lineOfPython() {
        return `Input(shape=input_shape)`;
    }

    clone() {
        return new Input();
    }
}
