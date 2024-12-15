//import { svgData } from "../appscriptmenu.js";
//import { Activation, Relu } from "./shapes/activation";
//import { ActivationLayer } from "./shapes/activationlayer";
//import { Layer } from "../layer.js";
//import { Add } from "./shapes/layers/add";
//import { BatchNorm } from "./shapes/layers/batchnorm";
//import { Concatenate } from "./shapes/layers/concatenate";
//import { Conv2D } from "./shapes/layers/convolutional";
//import { Dense } from "./shapes/layers/dense";
//import { Dropout } from "./shapes/layers/dropout";
//import { Flatten } from "./shapes/layers/flatten";
//import { MaxPooling2D } from "./shapes/layers/maxpooling";
//import { Point } from "./shapes/shape";
//import { getSvgOriginalBoundingBox } from "./utils";
import { windowProperties } from "../window.js";
import state from "../state.js";


export function resetWorkspace(svgData){
    // Deselect current element
    if (windowProperties.selectedElement != null) {
        windowProperties.selectedElement.unselect();
    }
    // Set input and output locations
    if (svgData.input != null) {
        svgData.input.setPosition(svgData.input.defaultLocation);
        svgData.input.wires.forEach((w) => w.delete());
        svgData.input.template_id = state.currentTemplateID;
    }
    if (svgData.output != null) {
        svgData.output.setPosition(svgData.output.defaultLocation);
        svgData.output.template_id = state.currentTemplateID;

    }

    // Remove all other layers
    for (const layer of svgData.draggable) {
        layer.delete();
    }

    // Clear the current list of draggables
    svgData.draggable = [];
}

export function blankTemplate(svgData){
    resetWorkspace(svgData);
}