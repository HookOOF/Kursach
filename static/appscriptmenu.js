import { windowProperties } from './window.js';
import { Draggable } from './draggable.js';
import { WireGuide } from './wireguide.js';
import { Add } from './add.js';
import { buildNetworkDAG, topologicalSort } from "./model/build_network.js";
import { BatchNorm } from './batchnorm.js';
import { TextBox } from './textbox.js';
import { Dropout } from './Dropout.js';
import { Flatten } from './flatten.js';
import { Concatenate } from './concatenate.js';
import { Dense } from './dense.js';
import { clearError,displayError } from './error.js';
import { Conv2D } from './convolution.js';
import { MaxPooling2D } from './maxpooling.js';
import { Input } from './input.js';
import { Output } from './output.js';
import { ActivationLayer } from "./activationlayer.js";
import { Activation, Relu, Sigmoid, Tanh } from "./activation.js";
import { Point } from './shape.js';
import {generatePython } from "./model/code_generation.js";
import { mnistdataset as dataset } from './data.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { setupTestResults, showPredictions } from "./graph.js";
import { model } from "./params_model.js";
import { download} from "./model/export_model.js";
import { blankTemplate} from "./model/model_templates.js";
import { Layer } from './layer.js';
import state from "./state.js";

console.log("JS is connected");

export let svgData = {
    draggable: [],
    input: null,
    output: null,
};
svgData.input = new Input();
svgData.output = new Output();
export function setModelHyperparameters() {
    const hyperparams = document.getElementsByClassName("hyperparamvalue");

    Array.from(hyperparams).forEach((hp) => {
        const name = hp.id;
        const temp = Number(document.getElementById(name).value);

        if (temp < 0 || isNaN(temp)) {
            const error = new Error("Hyperparameters should be positive numbers.");
            displayError(error);
            return;
        }

        switch (name) {
            case "learningRate":
                model.params.learningRate = temp;
                break;

            case "epochs":
                model.params.epochs = Math.trunc(temp);
                break;

            case "batchSize":
                model.params.batchSize = Math.trunc(temp);
                break;
        }
    });
}
function deleteSelected() {
    if (windowProperties.selectedElement) {
        windowProperties.selectedElement.delete_from_db();
        windowProperties.selectedElement.delete();
        windowProperties.selectedElement = null;
    }

}


function resizeMiddleSVG() {
    const originalSVGWidth = 1000; // Исходная ширина SVG

    // Получение ширины и высоты элемента middle
    const svgWidth = document.getElementById("middle").clientWidth;
    const svgHeight = document.getElementById("middle").clientHeight;

    // Вычисление коэффициента масштабирования
    const ratio = svgWidth / originalSVGWidth;

    // Вычисление смещения по осям X и Y
    const xTranslate = (svgWidth - originalSVGWidth) / 2;
    const yTranslate = Math.max(0, (svgHeight * ratio - svgHeight) / 2);

    // Корректировка начальных положений для элементов
    const yOffsetDelta = yTranslate / ratio - windowProperties.svgYOffset;
    ActivationLayer.defaultInitialLocation.y += yOffsetDelta;
    Activation.defaultLocation.y += yOffsetDelta;
    // Обновление свойств окна
    windowProperties.svgYOffset = yTranslate / ratio;
    windowProperties.svgTransformRatio = ratio;

    // Применение трансформации к SVG
    document.getElementById("svg").setAttribute("transform", `translate(${xTranslate}, 0) scale(${ratio}, ${ratio})`);
    if (svgData.input != null) {
        svgData.input.cropPosition();
        svgData.input.moveAction();
    }
    if (svgData.output != null) {
        svgData.output.cropPosition();
        svgData.output.moveAction();
    }

    svgData.draggable.forEach(function (elem) {
        elem.cropPosition();
        elem.moveAction();
    });
}

const MenuManager = (() => {
    let menus = [];
    let buttons = [];

    const initMenusAndButtons = (menuElements, buttonElements) => {
        menus = menuElements;
        buttons = buttonElements;
    };

    const hideAllMenus = () => {
        menus.forEach(menu => {
            menu.style.display = 'none';
        });
    };

    const unselectAllButtons = () => {
        buttons.forEach(button => {
            button.classList.remove('tab-selected', 'top_neighbor_tab-selected', 'bottom_neighbor_tab-selected');
        });
    };

    const showMenu = (menu, button, topNeighbor, bottomNeighbor) => {
        hideAllMenus();
        unselectAllButtons();

        button.classList.add('tab-selected');
        if (topNeighbor) topNeighbor.classList.add('top_neighbor_tab-selected');
        if (bottomNeighbor) bottomNeighbor.classList.add('bottom_neighbor_tab-selected');
        menu.style.display = '';
    };

    return {
        initMenusAndButtons,
        hideAllMenus,
        unselectAllButtons,
        showMenu
    };
})();

// Менеджер для категорий
const CategoryManager = (() => {
    const toggleCategoryOptions = (category) => {
        const isExpanded = category.getAttribute('data-expanded') === 'true';
        const expander = category.children[0];
        const value = isExpanded ? 'none' : 'block';

        category.setAttribute('data-expanded', !isExpanded);
        expander.classList.toggle('expanded', isExpanded);

        let sibling = category.nextElementSibling;
        while (sibling) {
            sibling.style.display = value;
            sibling = sibling.nextElementSibling;
        }
    };

    return {
        toggleCategoryOptions
    };
})();

function createTemplate(template) {
    switch (template) {
        case "blank":
            state.setTemplateID(1);
            blankTemplate(svgData);
            loadDraggables();
            break;
        case "default":
            state.setTemplateID(2);
            blankTemplate(svgData);
            break;
        case "resnet":
            state.setTemplateID(3);
            blankTemplate(svgData);
            break;
        default:
            console.error("Unknown template:", template);
            return;
    }
}


const initDOM = () => {



    const networkButton = document.getElementById('network');
    const progressButton = document.getElementById('progress');
    const vizualizationButton = document.getElementById('visualization');
    const educationButton = document.getElementById('education');
    const blanktab = document.getElementById('blanktab');
    const midletab = document.getElementById('middleblanktab');
    const bottomtab = document.getElementById('bottomblanktab');
    const categories = document.getElementsByClassName('categoryTitle');
    const menuContainer = document.getElementById('menu').children;
    const menus = Array.from(menuContainer);
    const buttons = [networkButton, progressButton, vizualizationButton, educationButton, blanktab, midletab, bottomtab];
    MenuManager.initMenusAndButtons(menus, buttons);
    window.addEventListener("resize", resizeMiddleSVG);
    windowProperties.wireGuide = new WireGuide();
    windowProperties.shapeTextBox = new TextBox();
    
    document.getElementById("exportPython").addEventListener("click", () => {
        const filename =  + "mnist_model.py";
        download(generatePython(topologicalSort(svgData.input)), filename);
    });
    networkButton.addEventListener('click', () => MenuManager.showMenu(menus[0], networkButton, blanktab, progressButton));
    progressButton.addEventListener('click', () => MenuManager.showMenu(menus[1], progressButton, networkButton, vizualizationButton));
    vizualizationButton.addEventListener('click', () => {
        MenuManager.showMenu(menus[2], vizualizationButton, progressButton, midletab);
        showPredictions();
      });
    educationButton.addEventListener('click', () => MenuManager.showMenu(menus[3], educationButton, midletab, bottomtab));
    document.getElementById("x").addEventListener("click", () => clearError());
      
    setupTestResults();
      
    // Обработчики для категорий
    Array.from(categories).forEach(category => {
        category.addEventListener('click', () => CategoryManager.toggleCategoryOptions(category));
    });
    d3.select("#svg").on("mousemove", (event) => {
        if (windowProperties.selectedElement instanceof Layer) {
            windowProperties.wireGuide.moveToMouse(event);
        }
    });
    document.getElementById("svg").addEventListener("click", (event) => {
        if (windowProperties.selectedElement && event.target instanceof SVGElement && event.target.id === "svg") {
            windowProperties.selectedElement.unselect();
            windowProperties.selectedElement = null;
        }
    });


    window.onkeyup = (event) => {
        switch (event.key) {
            case "Escape":
                if (windowProperties.selectedElement) {
                    windowProperties.selectedElement.unselect();
                    windowProperties.selectedElement = null;
                }
                break;
            case "Delete":
                if (document.getElementsByClassName("focusParam").length === 0) {
                    deleteSelected();
                }
                break;
            case "Backspace":
                if (document.getElementsByClassName("focusParam").length === 0) {
                    deleteSelected();
                }
                break;
            case "Enter":
                break;
        }
    };



    setupOptionOnClicks();
    resizeMiddleSVG();
    loadDraggables();
};

export function tabSelected(){
    if (document.getElementById("networkTab").style.display !== "none") {
        return "networkTab";
    }else if (document.getElementById("visualizationTab").style.display !== "none") {
        return "visualizationTab";
    }
     else {
        throw new Error("No tab selection found");
    }
}




function addOnClickToOptions(categoryId, func) {
    const options = document.getElementById(categoryId).getElementsByClassName("option");
    for (const element of options) {
        element.addEventListener("click", () => {
            func(element.getAttribute("data-optionValue"), element);
        });
    }
}

// Функция добавления элементов
function appendItem(itemType,x,y) {
    const itemConstructors = {
        add: Add,
        batchnorm: BatchNorm,
        dropout: Dropout,
        flatten: Flatten,
        concatenate: Concatenate,
        dense : Dense,
        conv2d: Conv2D,
        maxpooling2d: MaxPooling2D,
        relu: Relu,
        sigmoid: Sigmoid,
        tanh: Tanh,
    };
    itemType = itemType.toLowerCase();
    if (x && y){
        const item = new itemConstructors[itemType]({x,y});
        svgData.draggable.push(item);
        return item;
    }
    else{
        const item = new itemConstructors[itemType]();
        svgData.draggable.push(item);
        return item;
    }
    ;
}


export function saveDraggable(object) {
    if (object instanceof Layer) {
        const serializableObject = object.toJson();
        console.log("Serialized object:", serializableObject);
        fetch('/update-draggable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serializableObject),
        }).then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    }
    else if (object instanceof Activation) {
        const serializableObject = {
            id : object.uid,
            layer_name: object.activationType,
            xPosition: object.draggedX,
            yPosition: object.draggedY,
            parent_ids : [],
            children_ids : []

        };
        console.log("Serialized object:", serializableObject);
        fetch('/update-draggable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serializableObject),
        }).then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    }
}

async function loadDraggables() {
    try {
        // Включаем текущий templateID в параметры запроса
        const templateID = state.currentTemplateID || 1; // Используем 1 по умолчанию
        const response = await fetch(`/get-draggables?templateID=${templateID}`, {
            method: "GET", // Или POST, если нужно
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
            let relations = {};
            const data = await response.json();

            data.draggables.forEach((draggable) => {
                const { eid, position_x, position_y, layer_name, children_ids, parent_ids } = draggable;

                if (layer_name === "Output") {
                    svgData.output.setPosition(new Point(position_x, position_y));
                    relations[eid] = { object: svgData.output, parents: [parent_ids], children: [] };
                } else if (layer_name === "Input") {
                    svgData.input.setPosition(new Point(position_x, position_y));
                    relations[eid] = { object: svgData.input, parents: [parent_ids], children: [children_ids] };
                } else {
                    const item = appendItem(layer_name, position_x, position_y);
                    relations[eid] = { object: item, parents: [parent_ids], children: [children_ids] };
                }
            });

            // Установка связей между объектами
            Object.values(relations).forEach((relation) => {
                relation.children.forEach((childId) => {
                    if (relations[childId]) {
                        relation.object.addChild(relations[childId].object);
                    } else {
                        childId.forEach((child) => {
                            relation.object.addChild(relations[child].object);
                        });
                    }
                });
            });
        } else {
            console.error("Failed to load draggables:", await response.json());
        }
    } catch (error) {
        console.error("Error fetching draggables:", error);
    }
}
function selectOption(optionCategoryId,optionElement){
    for (const option of document.getElementById(optionCategoryId).getElementsByClassName("option")) {
        option.classList.remove("selected");
    }
    optionElement.classList.add("selected");
}
function switchTab(tabType) {
    // Hide all tabs
    document.getElementById("networkTab").style.display = "none";
    document.getElementById("visualizationTab").style.display = "none";

    // Hide all menus
    document.getElementById("networkMenu").style.display = "none";
    document.getElementById("visualizationMenu").style.display = "none";

    // Hide all paramshells
    document.getElementById("networkParamshell").style.display = "none";
    document.getElementById("visualizationParamshell").style.display = "none";

    // Unselect all tabs
    document.getElementById("network").classList.remove("tab-selected");
    document.getElementById("visualization").classList.remove("tab-selected");

    // Display only the selected tab
    document.getElementById(tabType + "Tab").style.display = null;
    document.getElementById(tabType).classList.add("tab-selected");
    document.getElementById(tabType + "Menu").style.display = null;
    document.getElementById(tabType + "Paramshell").style.display = null;
    document.getElementById("paramshell").style.display = null;
    document.getElementById("menu").style.display = null;

    switch (tabType) {
        case "network": resizeMiddleSVG(); break;
        case "visualization": showPredictions(); break;
    }

    // Give border radius to top and bottom neighbors
    if (document.getElementsByClassName("top_neighbor_tab-selected").length > 0) {
        document.getElementsByClassName("top_neighbor_tab-selected")[0].classList
            .remove("top_neighbor_tab-selected");
        document.getElementsByClassName("bottom_neighbor_tab-selected")[0].classList
            .remove("bottom_neighbor_tab-selected");
    }

    const tabMapping = ["blanktab", "network", "progress", "visualization",
        "middleblanktab", "education", "bottomblanktab"];
    const index = tabMapping.indexOf(tabType);

    document.getElementById(tabMapping[index - 1]).classList.add("top_neighbor_tab-selected");
    document.getElementById(tabMapping[index + 1]).classList.add("bottom_neighbor_tab-selected");
}
function setupOptionOnClicks() {
    addOnClickToOptions("tabselector", (tabType) => switchTab(tabType));
    addOnClickToOptions("layers", (layerType) => appendItem(layerType));
    //addOnClickToOptions("templates", (templateType) => createTemplate(templateType));
    addOnClickToOptions("activations", (activationType) => appendItem(activationType));
    addOnClickToOptions("classes", (_, element) => {
        selectOption("classes", element);
        if (model.architecture != null) {
            showPredictions();
        }
    });
    addOnClickToOptions("optimizers", (optimizerType, element) => {
        selectOption("optimizers", element);
        model.params.optimizer = optimizerType;
    });
    addOnClickToOptions("losses", (lossType, element) => {
        selectOption("losses", element);
        model.params.loss = lossType;
    });
    addOnClickToOptions("templates", (templateType,element) => {
        selectOption("templates",element);
        createTemplate(templateType)}
    );
}

// Запуск инициализации
document.addEventListener('DOMContentLoaded', initDOM);
