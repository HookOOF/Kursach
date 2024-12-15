import { displayError } from "../error.js";
import { ActivationLayer } from "../activationlayer.js";
import { Layer } from "../layer.js";
import { pythonSkeleton } from "./python_skeleton.js";

/**
 * Creates corresponding Python code.
 * @param {Layer[]} sorted - Topologically sorted list of layers
 * @returns {string} Python code as a string
 */
export function generatePython(sorted) {
    let pythonScript = "";
    for (const layer of sorted) {
        const layerString = layer.lineOfPython();
        let applyString = ""; // Nothing to apply if no parents (input)

        if (layer.parents.size === 1) {
            applyString = `(x${Array.from(layer.parents)[0].uid})`;
        } else if (layer.parents.size > 1) {
            applyString = `([${Array.from(layer.parents).map((p) => "x" + p.uid).join(", ")}])`;
        }

        pythonScript += `x${layer.uid} = ${layerString}${applyString}\n`;

        // Handle BatchNorm with ReLU activation
        if (layer.layerType === "BatchNorm" && layer instanceof ActivationLayer && layer.activation != null) {
            if (layer.activation.activationType !== "relu") {
                displayError(new Error("Batch Normalization does not support activations other than ReLU"));
            }
            pythonScript += `x${layer.uid} = ReLU()(x${layer.uid})\n`;
        }
    }

    pythonScript += `model = Model(inputs=x${sorted[0].uid}, outputs=x${sorted[sorted.length - 1].uid})`;
    return pythonSkeleton(pythonScript);
}