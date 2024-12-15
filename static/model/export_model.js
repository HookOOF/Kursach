//import { saveAs } from "file-saver";
import { displayError } from "../error.js";
import { Activation, Relu, Sigmoid, Tanh } from "../activation.js";
import { ActivationLayer } from "../activationlayer.js";
import { Layer } from "../layer.js";
import { Add } from "../add.js";
import { BatchNorm } from "../batchnorm.js";
import { Concatenate } from "../concatenate.js";
import { Conv2D } from "../convolution.js";
import { Dense } from "../dense.js";
import { Dropout } from "../Dropout.js";
import { Flatten } from "../flatten.js";
import { Input } from "../input.js";
import { MaxPooling2D } from "../maxpooling.js";
import { Output } from "../output.js";
import { Point } from "../shape.js";

/**
 * Check that there is a path from the input to the output.
 * @param {Object} svgData - The input nn architecture
 * @returns {boolean} Whether a path exists
 */
export function hasPathToOutput(svgData) {
    const queue = [svgData.input];
    const visited = new Set();
    const layersFromInput = new Set();
    while (queue.length !== 0) {
        const current = queue.shift();
        layersFromInput.add(current);
        // Check each connection of the node
        for (const child of current.children) {
            if (!visited.has(child)) {
                queue.push(child);
                visited.add(child);
            }
        }
    }
    return layersFromInput.has(svgData.output);
}

/**
 * Convert the nn to a JSON blob for storage.
 * @param {Object} svgData - The input nn architecture
 * @returns {Object} Serialized network data
 */
export function graphToJson(svgData) {
    const queue = [svgData.input];
    const visited = new Set();
    const layersJson = [];
    while (queue.length !== 0) {
        const current = queue.shift();
        layersJson.push(current.toJson());
        for (const child of current.children) {
            if (!visited.has(child)) {
                queue.push(child);
                visited.add(child);
            }
        }
    }
    return {
        graph: layersJson,
        hyperparameters: setHyperparameterData(),
    };
}

/**
 * Takes the hyperparameters from the HTML and assigns them to the global model.
 * @returns {Object} Hyperparameter data
 */
function setHyperparameterData() {
    let learningRate, batchSize, optimizerId, epochs, lossId;
    const hyperparams = document.getElementsByClassName("hyperparamvalue");
    for (const hyperparam of hyperparams) {
        const value = document.getElementById(hyperparam.id).value;
        switch (hyperparam.id) {
            case "learningRate":
                learningRate = Number(value);
                break;
            case "epochs":
                epochs = parseInt(value, 10);
                break;
            case "batchSize":
                batchSize = parseInt(value, 10);
                break;
        }
    }
    for (const elmt of document.getElementsByClassName("selected")) {
        if (elmt.hasAttribute("data-trainType")) {
            optimizerId = elmt.id;
        } else if (elmt.hasAttribute("data-lossType")) {
            lossId = elmt.id;
        }
    }
    return { batchSize, epochs, learningRate, lossId, optimizerId };
}

/**
 * Deserialize a serialized network into svgData.
 * @param {Object} svgData - An empty structure for Layer instances
 * @param {Object} serializedNet - A blob of all of the JSON
 * @returns {Object} svgData populated with layers and hyperparameters
 */
export function stateFromJson(svgData, serializedNet) {
    setHyperparams(serializedNet.hyperparameters);
    return graphFromJson(svgData, serializedNet.graph);
}

/**
 * Set hyperparameters from serialized data.
 * @param {Object} hyperparamData - Hyperparameter data
 */
function setHyperparams(hyperparamData) {
    const hyperparams = document.getElementsByClassName("hyperparamvalue");
    for (const hyperparam of hyperparams) {
        const paramName = document.getElementById(hyperparam.id);
        paramName.value = hyperparamData[hyperparam.id].toString();
    }
    document.getElementById("defaultOptimizer").classList.remove("selected");
    document.getElementById(hyperparamData.optimizerId).classList.add("selected");
    document.getElementById("defaultLoss").classList.remove("selected");
    document.getElementById(hyperparamData.lossId).classList.add("selected");
}

/**
 * Populate svgData from a serialized nn architecture in layersJson.
 * @param {Object} svgData - Empty structure blob to be filled
 * @param {Array} layersJson - JSON blob of all of the nn architecture
 * @returns {Object} svgData populated with layers
 */
function graphFromJson(svgData, layersJson) {
    const uidToObject = new Map();
    for (const l of layersJson) {
        const layer = createLayerInstanceFromName(svgData, l);
        uidToObject.set(l.id, layer);
    }
    for (const l of layersJson) {
        const layer = uidToObject.get(l.id);
        for (const childId of l.children_ids) {
            layer.addChild(uidToObject.get(childId));
        }
        for (const parentId of l.parent_ids) {
            layer.addParent(uidToObject.get(parentId));
        }
        layer.setParams(l.params);
        if (l.params.activation != null) {
            createActivationInstanceFromName(svgData, layer, l.params.activation);
        }
    }
    return svgData;
}

/**
 * Create an Activation instance from its name and attach it to the given layer.
 * @param {Object} svgData - The input nn architecture
 * @param {Object} layer - Layer to attach the activation to
 * @param {string} activationName - Name of the activation
 * @returns {Object} The created Activation instance
 */
function createActivationInstanceFromName(svgData, layer, activationName) {
    let activation;
    switch (activationName) {
        case "relu":
            activation = new Relu();
            break;
        case "sigmoid":
            activation = new Sigmoid();
            break;
        case "tanh":
            activation = new Tanh();
            break;
        default:
            displayError(new Error(`The specified activation "${activationName}" was not recognized.`));
    }
    layer.addActivation(activation);
    svgData.draggable.push(activation);
    return activation;
}

/**
 * Create a Layer instance from its name and add it to svgData.
 * @param {Object} svgData - The input nn architecture
 * @param {Object} lj - A JSON blob of the layer
 * @returns {Object} The created Layer instance
 */
function createLayerInstanceFromName(svgData, lj) {
    let layer;
    const location = new Point(lj.xPosition, lj.yPosition);
    switch (lj.layer_name) {
        case "Input":
            layer = new Input();
            layer.setPosition(location);
            svgData.input = layer;
            break;
        case "Output":
            layer = new Output();
            layer.setPosition(location);
            svgData.output = layer;
            break;
        default:
            switch (lj.layer_name) {
                case "MaxPooling2D":
                    layer = new MaxPooling2D(location);
                    break;
                case "Dense":
                    layer = new Dense(location);
                    break;
                case "Conv2D":
                    layer = new Conv2D(location);
                    break;
                case "Concatenate":
                    layer = new Concatenate(location);
                    break;
                case "Flatten":
                    layer = new Flatten(location);
                    break;
                case "BatchNorm":
                    layer = new BatchNorm(location);
                    break;
                case "Dropout":
                    layer = new Dropout(location);
                    break;
                case "Add":
                    layer = new Add(location);
                    break;
                default:
                    displayError(new Error(`The specified layer "${lj.layer_name}" was not recognized.`));
            }
            svgData.draggable.push(layer);
            break;
    }
    return layer;
}

/**
 * Download a file given the content and name.
 * @param {string} content - Content to add to the file
 * @param {string} filename - Name of the file to be created
 */
export function download(content, filename) {
    const blob = new Blob([content], {
        type: "text/plain;charset=utf-8",
    });
    saveAs(blob, filename);
}
