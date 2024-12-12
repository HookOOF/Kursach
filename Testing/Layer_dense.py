import numpy as np
import nnfs
from nnfs.datasets import spiral_data
nnfs.init()


class Dense_layer():
    def __init__(self,n_inputs,n_neurons) -> None:
        self.weights = 0.01*np.random.randn(n_inputs,n_neurons)
        self.biases = np.zeros((1,n_neurons))
    def forward(self,inputs):
        self.outputs = np.dot(inputs,self.weights)+self.biases
class Activation_Relu():
    def __init__(self) -> None:
        pass
    def forward(self,inputs):
        self.output = np.maximum(0, inputs)
class Activation_Softmax:
# Forward pass
    def forward(self, inputs):
        exp_values = np.exp(inputs - np.max(inputs, axis=1,keepdims=True))
        probabilities = exp_values / np.sum(exp_values, axis=1,keepdims=True)
        self.output = probabilities
class Loss():
    def calculate(self,output,y):
        sample_losses = self.forward(output,y)

        data_loss = np.mean(sample_losses)
        return data_loss

class Loss_Cathegorical_CrossEntropy(Loss):
    def forward(self,y_pred,y_true):
        samples_len = len(y_pred)
        y_pred_clipped = np.clip(y_pred,1e-7,1-1e-7)
        if len(y_true.shape)==1:
            correct_confidences = y_pred_clipped[
            range(samples_len),y_true]
        elif len(y_true.shape) == 2:
            correct_confidences = np.sum(
            y_pred_clipped * y_true,axis=1)
        negative_log_likelihoods = -np.log(correct_confidences)
        return negative_log_likelihoods


X, y = spiral_data(samples=100, classes=3)
# Create Dense layer with 2 input features and 3 output values
dense1 = Dense_layer(2, 3)
# Create ReLU activation (to be used with Dense layer):
activation1 = Activation_Relu()
# Create second Dense layer with 3 input features (as we take output
# of previous layer here) and 3 output values
dense2 = Dense_layer(3, 3)
# Create Softmax activation (to be used with Dense layer):
activation2 = Activation_Softmax()
# Create loss function
loss_function = Loss_Cathegorical_CrossEntropy()
# Perform a forward pass of our training data through this layer
dense1.forward(X)
# Perform a forward pass through activation function
# it takes the output of first dense layer here
activation1.forward(dense1.outputs)

# Perform a forward pass through second Dense layer
# it takes outputs of activation function of first layer as inputs
dense2.forward(activation1.output)
# Perform a forward pass through activation function
# it takes the output of second dense layer here
activation2.forward(dense2.outputs)
predictions = np.argmax(activation2.output, axis=1)


print(activation2.output[:5])
# Perform a forward pass through loss function
# it takes the output of second dense layer here and returns loss
loss = loss_function.calculate(activation2.output, y)
# Print loss value
print('loss:', loss)
