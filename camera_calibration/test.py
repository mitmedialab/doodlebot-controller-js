import numpy as np

# np.savez_compressed('filename.npz', array1=array1, array2=array2)
b = np.load('camcalib_escape_room.npz')
print(b.files)
print(b['mtx'])
print(b['dist'])
