#%%
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib import rcParams


storeData = pd.read_csv('./store.csv')
retData = pd.read_csv('./retrieve.csv')
factor = 0.95


#%%
length = round(retData['mleIU'].size)
xLabels = [
    '2 MB','4 MB','6 MB','8 MB','10 MB'
]
config = {
    "font.family":'Times New Roman',
    "font.size": 18,
    "mathtext.fontset":'stix',
    "font.serif": ['Times New Roman'],
}
rcParams.update(config)
plt.figure(1,[8.5,6])
plt.ylabel('Time cost (ms)',fontsize=25)
plt.xlabel('File size',fontsize=25)
plt.xticks(range(length), xLabels)
plt.grid(zorder = -1, axis='y')

barWidth = 0.18
bars1 = storeData['mleIU']
bars2 = storeData['hurIU']
bars3 = storeData['enhancedIU']
bars4 = storeData['dynamicIU']

r1 = np.arange(len(bars1)) - barWidth*1.5
r2 = [x + barWidth for x in r1]
r3 = [x + barWidth for x in r2]
r4 = [x + barWidth for x in r3]

plt.bar(r1, bars1, width=barWidth,color='#003a8c',edgecolor='#002766',zorder=100, label='CE')
plt.bar(r2, bars2, width=barWidth,color='#096dd9',edgecolor='#002766',zorder=100, label='Hur et al.')
plt.bar(r3, bars3, width=barWidth,color='#40a9ff',edgecolor='#002766',zorder=100, label='Enhanced')
plt.bar(r4, bars4, width=barWidth,color='#bae7ff',edgecolor='#002766',zorder=100, label='Dynamic')

plt.legend(
    ['CE','Hur et al.','Enhanced','Dynamic'],
    fontsize=18,
    handlelength=1,
    ncol=4,
    loc='upper left',
)
plt.ylim([0,120])
plt.tight_layout()
plt.savefig(r'D:\NutStore\BoAndHarry\Paper\2022 JISA\Paper JISA 2022\figures\IUstore.pdf',bbox_inches='tight')
plt.show()

#%%
plt.figure(2,[8.5,6])
plt.ylabel('Time cost (ms)',fontsize=25)
plt.xlabel('File size',fontsize=25)
plt.xticks(range(length), xLabels)
plt.grid(zorder = -1, axis='y')

barWidth = 0.18
bars1 = storeData['mleSU']
bars2 = storeData['hurSU']
bars3 = storeData['enhancedSU']
bars4 = storeData['dynamicSU']

r1 = np.arange(len(bars1)) - barWidth*1.5
r2 = [x + barWidth for x in r1]
r3 = [x + barWidth for x in r2]
r4 = [x + barWidth for x in r3]

plt.bar(r1, bars1, width=barWidth,color='#003a8c',edgecolor='#002766',zorder=100, label='CE')
plt.bar(r2, bars2, width=barWidth,color='#096dd9',edgecolor='#002766',zorder=100, label='Hur et al.')
plt.bar(r3, bars3, width=barWidth,color='#40a9ff',edgecolor='#002766',zorder=100, label='Enhanced')
plt.bar(r4, bars4, width=barWidth,color='#bae7ff',edgecolor='#002766',zorder=100, label='Dynamic')

plt.legend(['CE','Hur et al.','Enhanced','Dynamic'],fontsize=18,handlelength=1,ncol=4,loc='upper left')
plt.ylim([0,120])
plt.tight_layout()
plt.savefig(r'D:\NutStore\BoAndHarry\Paper\2022 JISA\Paper JISA 2022\figures\SUstore.pdf',bbox_inches='tight')
plt.show()

#%%
plt.figure(3,[8.5,6])
plt.ylabel('Time cost (ms)',fontsize=25)
plt.xlabel('File size',fontsize=25)
plt.xticks(range(length), xLabels)
plt.grid(zorder = -1, axis='y')

barWidth = 0.18
bars1 = retData['mleIU']
bars2 = retData['hurIU']
bars3 = retData['enhancedIU']
bars4 = retData['dynamicIU']

r1 = np.arange(len(bars1)) - barWidth*1.5
r2 = [x + barWidth for x in r1]
r3 = [x + barWidth for x in r2]
r4 = [x + barWidth for x in r3]

plt.bar(r1, bars1, width=barWidth,color='#003a8c',edgecolor='#002766',zorder=100, label='CE')
plt.bar(r2, bars2, width=barWidth,color='#096dd9',edgecolor='#002766',zorder=100, label='Hur et al.')
plt.bar(r3, bars3, width=barWidth,color='#40a9ff',edgecolor='#002766',zorder=100, label='Enhanced')
plt.bar(r4, bars4, width=barWidth,color='#bae7ff',edgecolor='#002766',zorder=100, label='Dynamic')

plt.legend(['CE','Hur et al.','Enhanced','Dynamic'],fontsize=18,handlelength=1,ncol=4,loc='upper left')
plt.ylim([0,30])
plt.tight_layout()
plt.savefig(r'D:\NutStore\BoAndHarry\Paper\2022 JISA\Paper JISA 2022\figures\Retrieve.pdf',bbox_inches='tight')
plt.show()

#%%
# plt.figure(2,[6*1.3,4*1])
# plt.ylabel('Time cost [ms]')
# plt.xlabel('File size [MB]')
# plt.xticks(range(length), xLabels)
# plt.grid(axis='y')
# plt.tick_params(bottom=False, left=False)
# plt.plot(range(length), (retData['mleIU'][::2]),'^-')
# plt.plot(range(length), (retData['hurIU'][::2]),'D-')
# plt.plot(range(length), (retData['enhancedIU'][::2]),'s-')
# plt.plot(range(length), (retData['dynamicIU'][::2]),'o-')
# plt.legend(['CE','Hur et al.','Enhanced','Dynamic'])
# plt.tight_layout()
# plt.savefig('retrieve.pdf')
# plt.show()