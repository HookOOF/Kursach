import numpy as np

'''
inputs = [1.0, 2.0, 3.0, 2.5]
weights = [0.2, 0.8, -0.5, 1.0]
bias = 2.0


print(np.dot(inputs,weights)+bias)
'''
'''
inputs = [[1.0, 2.0, 3.0, 2.5]]
weights = [[0.2, 0.8, -0.5, 1],
[0.5, -0.91, 0.26, -0.5],
[-0.26, -0.27, 0.17, 0.87]]
biases = [2.0, 3.0, 0.5]

layer_outputs = np.dot(weights, inputs) + biases
print(layer_outputs)
'''
'''
inputs = [[1.0, 2.0, 3.0, 2.5],
          [2.0,5.0,-1.0,2.0]]
weights = [[0.2, 0.8, -0.5, 1],
[0.5, -0.91, 0.26, -0.5],
[-0.26, -0.27, 0.17, 0.87]]

print(np.dot(inputs,np.array(weights).T))
'''
inputs = [[1.0, 2.0, 3.0, 2.5],
          [2.0,5.0,-1.0,2.0]]
weights = [[0.2, 0.8, -0.5, 1],
[0.5, -0.91, 0.26, -0.5],
[-0.26, -0.27, 0.17, 0.87]]
biases = [2, 3, 0.5]  
weights2 = [[0.1, -0.14, 0.5],
[-0.5, 0.12, -0.33],
[-0.44, 0.73, -0.13]]
biases2 = [-1, 2, -0.5]

layer_output_1 = np.dot(inputs,np.array(weights).T)+biases
layer_output_2 = np.dot(layer_output_1,np.array(weights2).T)+biases2
print(layer_output_2)
