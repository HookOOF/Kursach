// state.js

// Объект для хранения состояния шаблона
const state = {
    currentTemplateID:  1, // Изначально blank
    setTemplateID(id) {
        this.currentTemplateID = id;
        console.log(`Template ID updated to: ${this.currentTemplateID}`);
    }
};

export default state; // Экспортируем объект по умолчанию
