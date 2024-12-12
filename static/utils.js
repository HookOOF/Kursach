export async function copyTextToClipboard(text) {
    // Создаём скрытое текстовое поле
    const textArea = document.createElement("textarea");

    // Устанавливаем стили, чтобы минимизировать видимость элемента
    textArea.style.position = "fixed"; // Размещаем элемент в фиксированной позиции
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";

    // Устанавливаем текст, который нужно скопировать
    textArea.value = text;

    // Добавляем элемент в документ
    document.body.appendChild(textArea);

    // Фокусируемся на элементе и выделяем текст
    textArea.focus();
    textArea.select();

    try {
        // Копируем текст в буфер обмена
        await navigator.clipboard.writeText(text);
    } finally {
        // Удаляем временный элемент
        document.body.removeChild(textArea);
    }
}

export function parseString(s) {
    // Проверяем, содержит ли строка запятую
    if (s.indexOf(",") === -1) {
        return Number(s); // Если нет, возвращаем число
    }

    // Убираем символы "(", ")", "[", "]" из строки
    s = s.replace("(", "").replace(")", "").replace("[", "").replace("]", "");

    // Разделяем строку по запятой и преобразуем части в числа
    return s.split(",").map((x) => Number(x));
}

export function getSvgOriginalBoundingBox(svg) {
    // Получаем ширину и высоту SVG-элемента
    const width = svg.width.baseVal.value;
    const height = svg.height.baseVal.value;

    // Возвращаем объект с шириной и высотой
    return { width, height };
}
