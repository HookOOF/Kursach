import math
import numpy as np
layer_outputs = [4.8, 1.21, 2.385]

'''
exp_values = [math.e**x for x in layer_outputs]
norm_base = sum(exp_values)
norm_values = [x/norm_base for x in exp_values]
print(sum(norm_values))'''

exp_values = np.exp(layer_outputs)
norm_values = exp_values / np.sum(exp_values)
print('normalized exponentiated values:')
print(norm_values)
print('sum of normalized values:', np.sum(norm_values))
probabilities = exp_values / np.sum(exp_values, axis=1, keepdims=True)