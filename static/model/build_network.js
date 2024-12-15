//import * as tf from "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs";

import { displayError } from "../error.js";
import { Layer } from "../layer.js";
import { Input } from "../input.js";

/**
 * Wrap errors from networkDAG
 * @param {Input} input - an input layer that is the root of the computational graph
 */
export function buildNetworkDAG(input) {
    const toposorted = topologicalSort(input);
    return networkDAG(toposorted);
}

/**
 * Wrap model generation and produce a summary.
 * @param {Layer[]} toposorted - topologically sorted list of layers
 */
function networkDAG(toposorted) {
    const model = generateTfjsModel(toposorted);
    console.log(model.summary()); // Log the model summary
    return model;
}

/**
 * Clone a full computational graph
 * @param {Input} input - an input layer that is the root of the computational graph
 * @param {Input} newInput - the input that will be the root of the cloned graph
 */
export function cloneNetwork(input, newInput) {
    const oldId2Clone = new Map();
    oldId2Clone.set(input.uid, newInput);

    const queue = [input];
    const visited = new Set();

    while (queue.length !== 0) {
        const current = queue.shift();

        let newLayer;
        if (current !== input) {
            if (!oldId2Clone.has(current.uid)) {
                newLayer = current.clone();
                oldId2Clone.set(current.uid, newLayer);
            } else {
                newLayer = oldId2Clone.get(current.uid);
            }

            for (const p of current.parents) {
                if (!oldId2Clone.has(p.uid)) {
                    oldId2Clone.set(p.uid, p.clone());
                }
                const newParent = oldId2Clone.get(p.uid);
                newParent.addChild(newLayer);
                newLayer.addParent(newParent);
            }
        } else {
            newLayer = newInput;
        }

        for (const child of current.children) {
            if (!visited.has(child)) {
                queue.push(child);
                visited.add(child);
            }
        }
    }
}

/**
 * Topologically sort a graph of layers that are rooted at the input.
 * @param {Input} input - an input layer that is the root of the computational graph
 * @param {boolean} [showErrors=true] - decide whether or not to surface errors to the UI
 * @returns {Layer[]} - sorted layers
 */
export function topologicalSort(input, showErrors = true) {
    const sorted = [];
    const visited = new Set();
    const frontier = [input];
    const potentialBranch = new Set();

    while (frontier.length > 0) {
        const layer = frontier.pop();
        visited.add(layer);
        sorted.push(layer);

        if (potentialBranch.has(layer.uid)) {
            potentialBranch.delete(layer.uid);
        }

        for (const child of layer.children) {
            const childIndex = sorted.indexOf(child);
            if ((child.parents.size > 1) && (child.layerType!='Concatenate') && (child.layerType!='Add')){
                displayError(new Error("Must use a concatenate or add when a layer has multiple parents"));
            }
            if (childIndex >= 0 && childIndex < sorted.indexOf(layer)) {
                displayError(new Error("Cannot have backwards edges"));
            }

            let canAdd = true;
            for (const parent of child.parents) {
                canAdd = visited.has(parent);
                if (!canAdd) {
                    potentialBranch.add(parent.uid);
                    break;
                }
            }

            if (canAdd) {
                frontier.push(child);
            }
        }
    }

    if (sorted[sorted.length - 1].layerType !== "Output" && showErrors) {
        
        if (potentialBranch.size > 0) {
            displayError(new Error("All layers must have input as an ancestor."));
        } else {
            displayError(new Error("Something is wrong with your network architecture."));
        }
    }

    return sorted;
}

/**
 * Creates corresponding tfjs model.
 * @param {Layer[]} sorted - topologically sorted list of layers
// * @returns {tf.LayersModel} - the generated TensorFlow.js model
 */
//export function generateTfjsModel(sorted) {
 //   sorted.forEach((layer) => layer.generateTfjsLayer());
  //  const input = sorted[0].getTfjsLayer();
   // const output = sorted[sorted.length - 1].getTfjsLayer();
   // return tf.model({ inputs: input, outputs: output });
//}
