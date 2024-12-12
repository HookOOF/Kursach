import * as tf from "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js";
import { displayError } from "./error.js";
import { ActivationLayer } from "./activationlayer.js";
import { Line, PathShape, Point } from "./shape.js";

export class Add extends ActivationLayer {
    constructor(defaultLocation = Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([
            new PathShape("m10,10 v-10 h-10 v10 a30,30 0 1,1 10,0Z", "#73A665"),
            new Line(new Point(-10, -20), new Point(20, -20), 5, "#040"),
            new Line(new Point(5, -35), new Point(5, -5), 5, "#040")
        ], defaultLocation);

        this.layerType = "Add"; // Тип слоя
        this.parameterDefaults = {}; // Параметры по умолчанию
        //this.tfjsEmptyLayer = tf.layers.add; // Пустой слой TF.js
    }

    populateParamBox() {
        // Этот метод ничего не делает, но нужен для совместимости
    }

    getHoverText() {
        return "Add"; // Текст, отображаемый при наведении
    }

    lineOfPython() {
        return `Add()`; // Строка, генерируемая для Python
    }

    initLineOfJulia() {
        // Выбрасываем ошибку, так как экспорт в Julia не поддерживается
        displayError(new Error("Export to Julia does not support Add Layers"));
        throw new Error("Export to Julia does not support Add Layers");
    }

    generateTfjsLayer() {
        // Генерация слоя TF.js с использованием родителей
        const parents = [];
        for (const parent of this.parents) {
            parents.push(parent.getTfjsLayer());
        }
        this.tfjsLayer = this.tfjsEmptyLayer().apply(parents);
    }

    clone() {
        // Создание клона слоя Add
        return new Add();
    }
}
