

'''
inputs = [1, 2, 3]
weights = [0.2, 0.8, -0.5]
bias = 2
print(sum([inputs[x]*weights[x] for x in range(len(inputs))])+bias)
'''

'''
inputs = [1,2,3,2.5]
weights1 = [0.2, 0.8, -0.5, 1]
weights2 = [0.5, -0.91, 0.26, -0.5]
weights3 = [-0.26, -0.27, 0.17, 0.87]
bias1 = 2
bias2 = 3
bias3 = 0.5
print(sum([inputs[x]*weights1[x] for x in range(len(inputs))])+bias1)
print(sum([inputs[x]*weights2[x] for x in range(len(inputs))])+bias2)
print(sum([inputs[x]*weights3[x] for x in range(len(inputs))])+bias3)
'''
'''
inputs = [1, 2, 3, 2.5]
weights = [[0.2, 0.8, -0.5, 1],
[0.5, -0.91, 0.26, -0.5],
[-0.26, -0.27, 0.17, 0.87]]
biases = [2, 3, 0.5]
layer_output = []
for x in range(len(weights)):
    temp_value = 0 
    for x1 in range(len(inputs)):
        temp_value += weights[x][x1]*inputs[x1]
    layer_output.append(temp_value+biases[x])
print(layer_output)
'''

