import numpy as np
inputs = [0, 2, -1, 3.3, -2.7, 1.1, 2.2, -100]
nextt = []
'''

for input in inputs:
    nextt.append(max(0,input))
print(nextt)
'''
output = np.maximum(0,inputs)
print(output)