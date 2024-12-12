// Импорты

// Перечисление Mode
export const Mode = {
    Move: "Move",
    Connect: "Connect",
};

class WindowProperties {
    // Статическое свойство для хранения экземпляра
    static instance = null;

    // Публичные свойства
    selectedElement = null;
    activationLayers = new Set();
    mode = Mode.Move;
    draggedElement = null;
    selectState = null;
    xClickOffset = null;
    yClickOffset = null;
    wireInputElement = null;
    defaultparambox = null;
    wireGuide = null;
    svgTransformRatio = 1;
    svgYOffset = 0;
    shapeTextBox = null;

    // Приватный конструктор
    constructor() {
        if (WindowProperties.instance) {
            return WindowProperties.instance;
        }
        WindowProperties.instance = this;

    }

    // Метод для получения экземпляра
    static getInstance() {
        if (!WindowProperties.instance) {
            WindowProperties.instance = new WindowProperties();
        }
        return WindowProperties.instance;
    }
}

// Экспорт Singleton
export const windowProperties = WindowProperties.getInstance();
