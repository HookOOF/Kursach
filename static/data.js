import * as tf from "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs";

class ImageData {
    constructor() {
        
        this.IMAGE_HEIGHT = null;
        this.IMAGE_WIDTH = null;
        this.IMAGE_CHANNELS = null;
        this.IMAGE_SIZE = this.IMAGE_HEIGHT * this.IMAGE_WIDTH * this.IMAGE_CHANNELS;
        this.NUM_CLASSES = null;

        this.trainImages = null;
        this.testImages = null;
        this.trainLabels = null;
        this.testLabels = null;
    }

    async load() {
        throw new Error("Method 'load()' must be implemented.");
    }

    getTrainData(numExamples = 15000) {
        return this._getData(this.trainImages, this.trainLabels, numExamples);
    }

    getTestData(numExamples = 1500) {
        return this._getData(this.testImages, this.testLabels, numExamples);
    }

    _getData(images, labels, numExamples) {
        let xs = tf.reshape(images, [
            images.size / this.IMAGE_SIZE,
            this.IMAGE_HEIGHT,
            this.IMAGE_WIDTH,
            this.IMAGE_CHANNELS,
        ]);
        let ys = tf.reshape(labels, [labels.size / this.NUM_CLASSES, this.NUM_CLASSES]);

        if (numExamples != null) {
            xs = xs.slice([0, 0, 0, 0], [
                numExamples,
                this.IMAGE_HEIGHT,
                this.IMAGE_WIDTH,
                this.IMAGE_CHANNELS,
            ]);
            ys = ys.slice([0, 0], [numExamples, this.NUM_CLASSES]);
        }
        return { xs, ys };
    }
}

class MnistData extends ImageData {
    static instance = null;
    constructor() {
        if (MnistData.instance){
            return MnistData.instance;
        }
        super();
        this.IMAGE_HEIGHT = 28;
        this.IMAGE_WIDTH = 28;
        this.IMAGE_CHANNELS = 1;
        this.IMAGE_SIZE = this.IMAGE_HEIGHT * this.IMAGE_WIDTH * this.IMAGE_CHANNELS;
        this.NUM_CLASSES = 10;
        MnistData.instance = this;
    }
    static getInstance() {
        return this.instance || new MnistData();
    }
    async load() {
        const trainPath = "./train"; // Путь к папке с тренировочными данными
        const testPath = "./test"; // Путь к папке с тестовыми данными

        const { images: trainImages, labels: trainLabels } = await this._loadImagesAndLabels(trainPath);
        const { images: testImages, labels: testLabels } = await this._loadImagesAndLabels(testPath);

        this.trainImages = tf.tensor4d(trainImages, [
            trainImages.length / this.IMAGE_SIZE,
            this.IMAGE_HEIGHT,
            this.IMAGE_WIDTH,
            this.IMAGE_CHANNELS,
        ]);
        this.trainLabels = tf.tensor2d(trainLabels, [trainLabels.length, this.NUM_CLASSES]);

        this.testImages = tf.tensor4d(testImages, [
            testImages.length / this.IMAGE_SIZE,
            this.IMAGE_HEIGHT,
            this.IMAGE_WIDTH,
            this.IMAGE_CHANNELS,
        ]);
        this.testLabels = tf.tensor2d(testLabels, [testLabels.length, this.NUM_CLASSES]);
        this.dataLoaded = true;
    }

    async _loadImagesAndLabels(folderPath) {
        const files = await this._fetchFiles(folderPath);
        const images = [];
        const labels = [];

        for (const file of files) {
            const label = parseInt(file.name.split("_")[0], 10); // Извлекаем метку из имени файла
            const oneHotLabel = new Array(this.NUM_CLASSES).fill(0);
            oneHotLabel[label] = 1;

            const image = await this._loadImage(file.url);
            const grayscaleImage = this._convertToGrayscale(image);

            images.push(...grayscaleImage);
            labels.push(...oneHotLabel);
        }

        return { images: new Float32Array(images), labels: new Float32Array(labels) };
    }

    async _fetchFiles(folderPath) {
        // Симулируем список файлов с их URL
        // Здесь вы можете использовать сервер для отдачи файлов
        const response = await fetch(`${folderPath}/files.json`);
        return await response.json(); // Пример: [{ name: "0_001.png", url: "path/to/0_001.png" }, ...]
    }

    async _loadImage(imageUrl) {
        const img = new Image();
        img.src = imageUrl;
        await img.decode();

        const canvas = document.createElement("canvas");
        canvas.width = this.IMAGE_WIDTH;
        canvas.height = this.IMAGE_HEIGHT;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, this.IMAGE_WIDTH, this.IMAGE_HEIGHT);

        return ctx.getImageData(0, 0, this.IMAGE_WIDTH, this.IMAGE_HEIGHT).data;
    }

    _convertToGrayscale(imageData) {
        const grayscaleImage = new Float32Array(this.IMAGE_SIZE);
        for (let i = 0; i < this.IMAGE_SIZE; i++) {
            grayscaleImage[i] = imageData[i * 4] / 255; // Используем только красный канал
        }
        return grayscaleImage;
    }
}
export const mnistdataset = MnistData.getInstance();