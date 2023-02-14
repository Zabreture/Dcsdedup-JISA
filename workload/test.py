# %%
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns


# %%
class FileGroup:
    users = []
    alter_consumed = 0
    add_consumed = 0

    def day_pass(self):
        new_users = []
        for user in self.users:
            if user >= 1:
                user -= 1
                if user == 0:
                    self.alter_consumed += 1
                else:
                    new_users.append(user)
        res1 = self.alter_consumed
        res2 = self.add_consumed
        self.alter_consumed = 0
        self.add_consumed = 0
        self.users = new_users
        return res1, res2

    def new_users(self, count, mue):
        for i in range(count):
            self.users.append(round(np.random.exponential(scale=mue, size=1)[0]))
            self.add_consumed += 1


def simulation(lamb, mue, days, add_rate, alter_rate):
    file_group = FileGroup()
    cost = []
    for now in range(days):
        file_group.new_users(np.random.poisson(lam=lamb, size=1)[0], mue)
        print("Day: " + str(now))
        print(file_group.users)
        print()
        cost_1, cost_2 = file_group.day_pass()
        cost.append(cost_1 * alter_rate + cost_2 * add_rate)

    return range(days), cost


x1, y1 = simulation(24, 10, 100, 10, 8)
x2, y2 = simulation(24, 10, 100, 15, 10)
plt.plot(x1, y1)
plt.plot(x2, y2)
plt.show()
