import math
import os
import pandas as pd
import warnings
import random
warnings.filterwarnings("ignore")

paths = {
    'imageNet': 'E:/TestData/ImageNet/',
    'coco': 'E:/TestData/COCO/',
}


def readData(name):
    filePath = paths[name]
    nameSets = []
    datasets = []
    for i, j, k in os.walk(filePath):
        nameSets = k
        break
    for name in nameSets:
        fullPath = filePath + name
        print(fullPath)
        datasets.append(pd.read_csv(fullPath))
    return datasets

def cal(name, num, prob):
    datasets = readData(name)
    allInOne = pd.DataFrame()
    for subsets in datasets:
        allInOne = pd.concat([allInOne, subsets])
    duplicated = pd.concat([allInOne.sample(frac=prob*(random.random()*0.1 + 1))])
    for i in range(num-1):
        duplicated = pd.concat([duplicated, allInOne.sample(frac=prob*(random.random()*0.1 + 1))])

    oriSize = duplicated['size'].sum()
    duplicated = duplicated.drop_duplicates()
    sumSize = duplicated['size'].sum()
    metaSize = duplicated['size'].size * (5 * 32 + 32 + 34)
    print(f'{name} Metadata size: {round(metaSize / 1024 / 1024, 3)} MB')
    print(f'{name} Metadata percentage: {round(metaSize / sumSize * 100, 3)} %')
    print(f'{name} duplicated: {1 - round(sumSize/oriSize,3)}')

# %% ImageNet read data

cal('imageNet',16,1/10)

# %% ImageNet read data

cal('coco', 16, 1/10)