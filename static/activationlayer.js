import { displayError } from "./error.js";
import { windowProperties } from "./window.js";
//import { Activation } from "./activation";
import { Draggable } from "./draggable.js";
import { Layer } from "./layer.js";
import { Point, Shape } from "./shape.js";

/**
 * Layers that can have an activation attached to them.
 */
export class ActivationLayer extends Layer {
    static defaultInitialLocation = new Point(100, 100);

    constructor(block, defaultLocation = new Point(100, 100)) {
        super(block, defaultLocation);

        this.activation = null; // Активатор слоя

        // Отслеживаем activationLayers в глобальном состоянии для привязки
        windowProperties.activationLayers.add(this);
    }

    moveAction() {
        super.moveAction();
        if (this.activation != null) {
            const p = this.getPosition();
            this.activation.setPosition(p);
            this.activation.draggedX = this.draggedX;
            this.activation.draggedY = this.draggedY;
        }
    }

    raiseGroup() {
        super.raiseGroup();
        if (this.activation != null) {
            this.activation.raiseGroup();
        }
    }

    delete() {
        super.delete();
        // Удаляем слой из глобального состояния
        windowProperties.activationLayers.delete(this);
        if (this.activation != null) {
            this.activation.delete();
            this.removeActivation();
        }
    }

    outerBoundingBox() {
        const bbox = super.outerBoundingBox();
        if (this.activation != null) {
            const nodeBbox = Draggable.nodeBoundingBox(this.activation.svgComponent.node());

            bbox.top = Math.min(nodeBbox.top, bbox.top);
            bbox.bottom = Math.max(nodeBbox.bottom, bbox.bottom);
            bbox.left = Math.min(nodeBbox.left, bbox.left);
            bbox.right = Math.max(nodeBbox.right, bbox.right);
        }
        return bbox;
    }

    addActivation(activation) {
        if (this.activation != null && this.activation !== activation) {
            this.activation.delete();
        }
        this.activation = activation;
        this.activation.layer = this;
        this.activation.setPosition(this.getPosition());
        this.activation.draggedX = this.draggedX;
        this.activation.draggedY = this.draggedY;
    }

    getActivationText() {
        return this.activation != null ? this.activation.activationType : null;
    }

    removeActivation() {
        this.activation = null;
    }

    toJson() {
        const json = super.toJson();
        if (this.activation != null) {
            json.params.activation = this.activation.activationType;
        }
        return json;
    }

    generateTfjsLayer() {
        const parameters = this.parameterDefaults;
        const config = this.getParams();
        for (const param in config) {
            parameters[param] = config[param];
        }
        if (this.activation != null) {
            parameters.activation = this.activation.activationType;
        }

        let parent = null;

        if (this.parents.size > 1) {
            displayError(new Error("Must use a concatenate when a layer has multiple parents"));
        }

        for (const p of this.parents) {
            parent = p;
            break;
        }

        // Обработка многовходовых слоев (fan-in)
        this.tfjsLayer = this.tfjsEmptyLayer(parameters).apply(parent.getTfjsLayer());
    }
}

