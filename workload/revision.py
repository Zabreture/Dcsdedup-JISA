# %%
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib import rcParams


# %%
class FileGroup:
    users = []
    flag = 1

    def __init__(self, lamb, mue):
        self.lamb = lamb
        self.mue = mue

    def day_pass(self):
        new_users = self.new_users(np.random.poisson(lam=self.lamb, size=1)[0], self.mue)
        add_users_count = len(new_users)
        if len(self.users) == 0 and len(new_users) > 0:
            initial_upload = 1
            self.flag = 0
        else:
            initial_upload = 0

        self.users += new_users
        alter_users_count = 0
        next_users = []
        current_users = len(self.users)
        kek_count = 0
        for user in self.users:
            if user >= 1:
                user -= 1
                if user == 0:
                    alter_users_count += 1
                    kek_count += current_users
                    current_users -= 1
                else:
                    next_users.append(user)
        self.users = next_users
        # print(self.users)
        return alter_users_count, add_users_count, initial_upload, kek_count

    def new_users(self, count, mue):
        new_users = []
        for i in range(count):
            new_users.append(round(np.random.exponential(scale=mue, size=1)[0]))
        return new_users


# %%

fC = 10.0 * 2 ** 20
fT = 32.0
fK = 32.
uid = 32.
fid = 34.
r = 16.
factor = 0.72

def simulation(file_num, lamb, mue, days, initial_cost, subsequent_cost, download_cost, KEK_size):
    cost = []
    file_group = []
    for i in range(file_num):
        file_group.append(FileGroup(lamb, mue))
    for now in range(days):
        cost.append(0)
        for i in range(file_num):
            alter_users_count, add_users_count, initial_upload, kek_count = file_group[i].day_pass()
            cost[now] += (
                    alter_users_count * (download_cost + subsequent_cost) +
                    add_users_count * subsequent_cost +
                    initial_upload * initial_cost +
                    kek_count * KEK_size
            )

    return range(days), cost


config = {
    "font.family": 'Times New Roman',
    "font.size": 20,
    "mathtext.fontset": 'stix',
    "font.serif": ['Times New Roman'],
}
rcParams.update(config)

x1, y1 = simulation(5, 24, 30, 100, fC + fT, fT, fC + fT, 0)
x2, y2 = simulation(5, 24, 30, 100, fC + fT + fK + uid, fC + fT + fK + uid, fC + fT, fK)
x3, y3 = simulation(5, 24, 30, 100, fC + fT + fK + uid, fT + r + fK + uid, fC + fT, fK)
x4, y4 = simulation(5, 24, 30, 100, fT + r + fid, fT + r + fid, 0, fK)
x5, y5 = simulation(5, 24, 30, 100, fT + r + fid + uid, fT + r + fid + uid, 0, fK)

plt.figure(1, [9*factor, 7*factor])
plt.plot(x1, y1, 'k-^')
plt.plot(x2, y2, 'c-s')
# plt.plot(x3, y3)
plt.plot(x4, y4, 'r-p')
plt.plot(x5, y5, 'b-o')
plt.grid(zorder=-1, axis='y')
plt.ticklabel_format(style='sci')

plt.legend(["CE", "Hur et al.", "Enhanced", "Dynamic", ],
# plt.legend(["CE", "Hur et al."],
           fontsize=18,
           handlelength=1,
           ncol=2,
           loc='best')
plt.xlabel('Time (days)')
plt.ylabel('Communication Cost (in bytes)')
# plt.xlim([-2, 365])
# plt.ylim([-5e7, 1e9])
plt.tight_layout()
plt.savefig(r'D:\NutStore\BoAndHarry\Paper\2023 JISA\2nd-submission\paper\figures\Bandwidth_all.pdf', bbox_inches='tight')
plt.show()


plt.figure(2, [9*factor, 7*factor])
plt.plot(x4, y4, 'r-p')
plt.plot(x5, y5, 'b-o')
plt.grid(zorder=-1, axis='y')
plt.ticklabel_format(style='sci')
plt.legend(["Enhanced", "Dynamic", ],
# plt.legend(["CE", "Hur et al."],
           fontsize=18,
           handlelength=0.8,
           ncol=1,
           loc='lower right')
plt.xlabel('Time (days)')
plt.ylabel('Communication Cost (in bytes)')
# plt.xlim([-2, 365])
# plt.ylim([-100, 7.1e5])
plt.tight_layout()
plt.savefig(r'D:\NutStore\BoAndHarry\Paper\2023 JISA\2nd-submission\paper\figures\Bandwidth_ours.pdf', bbox_inches='tight')
plt.show()