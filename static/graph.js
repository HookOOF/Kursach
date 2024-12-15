import * as tf from "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs";

import { tabSelected } from "./appscriptmenu.js";
import { mnistdataset } from "./data.js";
import { model } from "./params_model.js";
const GRAPH_FONT_SIZE = 14;
const NUM_CLASSES = 10;

const testExamples = 50;

/**
 * Show predictions on a number of test examples.
 */
export async function showPredictions() {
  if (tabSelected() === "visualizationTab") {
    let label = null;
    const options = document.getElementById("classes").getElementsByClassName("option");
    for (const option of options) {
        if (option.classList.contains("selected")) {
            label = option.getAttribute("data-optionValue");
            break;
        }
    }

    mnistdataset.getTestDataWithLabel(testExamples, label).then(({xs, labels}) => {
      tf.tidy(() => {
        const output = model.architecture.predict(xs);

        const axis = 1;
        const newLabels = Array.from(labels.argMax(axis).dataSync());
        const predictions = Array.from(output.argMax(axis).dataSync());

        showTestResults({xs, labels}, predictions, newLabels);
      });
    });
  }
}

export function setupTestResults() {
  const imagesElement = document.getElementById("images");
  imagesElement.innerHTML = "";
  for (let i = 0; i < testExamples; i++) {
    const div = document.createElement("div");
    div.className = "pred-container";

    const canvas = document.createElement("canvas");
    canvas.width = mnistdataset.IMAGE_WIDTH;
    canvas.height = mnistdataset.IMAGE_HEIGHT;
    canvas.className = "prediction-canvas";
    const ctx = canvas.getContext("2d");
    ctx.rect(0, 0, 1000, 5000);
    ctx.fillStyle = "#888";
    ctx.fill();

    const pred = document.createElement("div");
    pred.className = `pred pred-none`;
    pred.innerText = `pred: -`;

    div.appendChild(pred);
    div.appendChild(canvas);

    imagesElement.appendChild(div);
  }
}

function showTestResults(batch, predictions, labels) {
  const imagesElement = document.getElementById("images");
  imagesElement.innerHTML = "";
  for (let i = 0; i < testExamples; i++) {
    const image = batch.xs.slice([i, 0], [1, batch.xs.shape[1]]);

    const div = document.createElement("div");
    div.className = "pred-container";

    const canvas = document.createElement("canvas");
    canvas.className = "prediction-canvas";
    draw(image.flatten(), canvas);

    const pred = document.createElement("div");

    const prediction = predictions[i];
    const label = labels[i];
    const correct = prediction === label;

    pred.className = `pred ${(correct ? "pred-correct" : "pred-incorrect")}`;
    pred.innerText = `pred: ${prediction}`;

    div.appendChild(pred);
    div.appendChild(canvas);

    imagesElement.appendChild(div);
  }
}

function canvasWidth() {
  const columnGap = parseInt(getComputedStyle(document.getElementById("progressTab")).gridColumnGap, 10);
  return document.getElementById("middle").clientWidth - columnGap;
}

function canvasHeight() {
  const verticalPadding = parseInt(getComputedStyle(document.getElementById("progressTab")).padding, 10);
  const height = document.getElementById("middle").clientHeight - 2 * verticalPadding;
  return height;
}

function setupPlots() {
  renderLossPlot();
  renderAccuracyPlot();
  renderConfusionMatrix();
}

function draw(image, canvas) {
  const [width, height] = [mnistdataset.IMAGE_HEIGHT, mnistdataset.IMAGE_WIDTH];
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(width, height);
  const data = image.dataSync();
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    if (mnistdataset.IMAGE_CHANNELS === 3) {
      const k = i * 3;
      imageData.data[j + 0] = data[k + 0] * 255;
      imageData.data[j + 1] = data[k + 1] * 255;
      imageData.data[j + 2] = data[k + 2] * 255;
      imageData.data[j + 3] = 255;
    } else {
      imageData.data[j + 0] = data[i] * 255;
      imageData.data[j + 1] = data[i] * 255;
      imageData.data[j + 2] = data[i] * 255;
      imageData.data[j + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
