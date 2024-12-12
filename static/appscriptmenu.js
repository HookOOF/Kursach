import { windowProperties } from './window.js';
import { Draggable } from './draggable.js';
import { WireGuide } from './wireguide.js';
import { Add } from './add.js';
import { BatchNorm } from './batchnorm.js';
import { TextBox } from './textbox.js';
import { Layer } from './layer.js';
import { Dropout } from './Dropout.js';
import { Flatten } from './flatten.js';
import { Concatenate } from './concatenate.js';
import { Dense } from './dense.js';
import { Conv2D } from './convolution.js';
import { MaxPooling2D } from './maxpooling.js';
import { Input } from './input.js';
import { Output } from './output.js';
import { ActivationLayer } from "./activationlayer.js";
import { Activation, Relu, Sigmoid, Tanh } from "./activation.js";
import { Point } from './shape.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

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

// Инициализация DOM
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
    
    // Обработчики кнопок вкладок
    networkButton.addEventListener('click', () => MenuManager.showMenu(menus[0], networkButton, blanktab, progressButton));
    progressButton.addEventListener('click', () => MenuManager.showMenu(menus[1], progressButton, networkButton, vizualizationButton));
    vizualizationButton.addEventListener('click', () => MenuManager.showMenu(menus[2], vizualizationButton, progressButton, midletab));
    educationButton.addEventListener('click', () => MenuManager.showMenu(menus[3], educationButton, midletab, bottomtab));

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
        // Only click if there is a selected element, and the clicked element is an SVG Element, and its id is "svg"
        // It does this to prevent unselecting if we click on a layer block or other svg shape
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

// Функция добавления обработчиков для категорий
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
        const response = await fetch('/get-draggables');
        if (response.ok) {
            let relations = {}
            const data = await response.json();
            data.draggables.forEach((draggable) => {
                const { eid, position_x, position_y, layer_name, properties,children_ids,parent_ids} = draggable;

                if (layer_name=='Output'){
                    svgData.output.setPosition(new Point(position_x, position_y));
                    relations[eid] = {
                        object: svgData.output,
                        parents: [],
                        children: []
                    }; 
                }
                else 
                if (layer_name=='Input'){
                    svgData.input.setPosition(new Point(position_x, position_y));
                    relations[eid] = {
                        object: svgData.input,
                        parents: [parent_ids],
                        children: [children_ids]
                    };    
                }
                else{
                    var item = appendItem(layer_name,position_x,position_y);
                        relations[eid] = {
                        object: item,
                        parents: [parent_ids],
                        children: [children_ids]
                    };    
                }
           

            });
            Object.values(relations).forEach((relation) => {
                relation.children.forEach((childId) => {
                    if (relations[childId]) {
                        relation.object.addChild(relations[childId].object);
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



function setupOptionOnClicks() {
    addOnClickToOptions("tabselector", (tabType) => switchTab(tabType));
    addOnClickToOptions("layers", (layerType) => appendItem(layerType));
    addOnClickToOptions("activations", (activationType) => appendItem(activationType));
}

// Запуск инициализации
document.addEventListener('DOMContentLoaded', initDOM);
