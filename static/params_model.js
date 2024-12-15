import * as tf from "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js";

import { displayError } from "./error.js";

/**
 * Класс для управления гиперпараметрами сети
 */
class NetworkParameters {
    constructor() {
        this.learningRate = 0.01; // Скорость обучения
        this.batchSize = 64; // Размер пакета
        this.optimizer = "sgd"; // Оптимизатор
        this.epochs = 6; // Эпохи
        this.loss = "categoricalCrossentropy"; // Функция потерь
        this.paramNames = new Set(["optimizer", "loss"]); // Набор параметров
    }

    /**
     * Проверяет, является ли параметр допустимым
     * @param {string} param
     * @returns {boolean}
     */
    isParam(param) {
        return this.paramNames.has(param);
    }

    /**
     * Возвращает экземпляр оптимизатора TensorFlow
     * @returns {tf.Optimizer}
     */
    getOptimizer() {
        switch (this.optimizer) {
            case "sgd":
                return tf.train.sgd(this.learningRate);
            case "rmsprop":
                return tf.train.rmsprop(this.learningRate);
            case "adagrad":
                return tf.train.adagrad(this.learningRate);
            case "adam":
                return tf.train.adam(this.learningRate);
            default:
                throw new Error("Undefined optimizer!");
        }
    }

    /**
     * Возвращает имя функции потерь для Python
     * @returns {string}
     */
    getPythonLoss() {
        return this.loss.split(/(?=[A-Z])/).join("_").toLowerCase();
    }

    /**
     * Возвращает имя оптимизатора для Python
     * @returns {string}
     */
    getPythonOptimizer() {
        switch (this.optimizer) {
            case "sgd":
                return "SGD";
            case "rmsprop":
                return "RMSprop";
            case "adagrad":
                return "Adagrad";
            case "adam":
                return "Adam";
            default:
                throw new Error("Undefined optimizer!");
        }
    }

}

/**
 * Singleton для управления моделью
 */
class Model {
    static instance = null;
    constructor() {
        if (Model.instance) {
            return Model.instance;
        }
        this.params = new NetworkParameters();
        this.architecture = null; // Архитектура модели
        Model.instance = this;
    }

    static getInstance() {
        return this.instance || new Model();
    }
}
export const model = Model.getInstance();