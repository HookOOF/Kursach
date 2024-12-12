from Scripts.test import Model
from Scripts.test import Layer_Dense
from Scripts.test import Layer_Input
from Scripts.test import Activation_ReLU
from Scripts.test import Activation_Softmax
from Scripts.test import Loss_CategoricalCrossentropy
from Scripts.test import Activation_Softmax_Loss_CategoricalCrossentropy
from Scripts.test import Optimizer_Adam
from Scripts.test import Accuracy_Categorical
import cv2
import numpy as np
fashion_mnist_labels = {
    0: 'T-shirt/top',
    1: 'Coat',
    2: 'Pullover',
    3: 'Dress',
    4: 'Trouser',
    5: 'Sandal',
    6: 'Shirt',
    7: 'Sneaker',
    8: 'Bag',
    9: 'Ankle boot'
}


image_data = cv2.imread(r'train/1/0025.png', cv2.IMREAD_GRAYSCALE)

image_data = cv2.resize(image_data, (28, 28))

image_data = 255 - image_data


image_data = (image_data.reshape(1, -1).astype(np.float32) - 127.5) / 127.5


model = Model.load('fashion_mnist.model')


confidences = model.predict(image_data)


predictions = model.output_layer_activation.predictions(confidences)


prediction = fashion_mnist_labels[predictions[0]]

print(prediction)