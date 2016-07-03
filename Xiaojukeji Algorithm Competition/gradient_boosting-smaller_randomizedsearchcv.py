import os
import pdb
import numpy as np
import gcp.bigquery as bq
import gcp.storage as storage
from sklearn.metrics import make_scorer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import Imputer, MinMaxScaler, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
import matplotlib.pyplot as plt
from sklearn.feature_selection import SelectKBest
from sklearn.feature_selection import f_classif
from sklearn.svm import SVR
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import AdaBoostRegressor
from sklearn.preprocessing import Imputer, OneHotEncoder
from sklearn.grid_search import RandomizedSearchCV
from sklearn.grid_search import GridSearchCV
from sklearn.decomposition import PCA
from sklearn import cross_validation
from sklearn.ensemble import BaggingRegressor
from sklearn.feature_selection import RFECV
from scipy.stats import norm

try:
  import cPickle as pickle
except:
  import pickle
EST_PICKLE_FILENAME0 = 'GradientBoostingRegressor_final_small.pkl'
EST_PICKLE_FILENAME1 = 'BaggingGradientBoostingRegressor_final_small.pkl'
LOAD_EST = False
RUN_SIMULATED_FEATURE_SELECTION = False

seed = 13
np.random.seed(seed)


# Put all categorical data first for easier implementation of One Hot Encoding.
fields_str = """
gap day_in_week weather_1_slots_ago weather_2_slots_ago weather_3_slots_ago busy_time 
tj_level1_1_slots_ago tj_level2_1_slots_ago tj_level3_1_slots_ago tj_level4_1_slots_ago 
tj_level1_2_slots_ago tj_level2_2_slots_ago tj_level3_2_slots_ago tj_level4_2_slots_ago 
tj_level1_3_slots_ago tj_level2_3_slots_ago tj_level3_3_slots_ago tj_level4_3_slots_ago 
temperature_1_slots_ago pm25_1_slots_ago  
temperature_2_slots_ago pm25_2_slots_ago  
temperature_3_slots_ago pm25_3_slots_ago  
gap_1_slots_ago sum_price_1_slots_ago 
gap_2_slots_ago sum_price_2_slots_ago 
gap_3_slots_ago sum_price_3_slots_ago 
f1  f11 f11_1 f11_2 f11_3 f11_4 f11_5 f11_6 f11_7 
f11_8 f13_4 f13_8 f14 f14_1 f14_10  f14_2 f14_3 f14_6 f14_8 f15 f15_1 
f15_2 f15_3 f15_4 f15_6 f15_7 f15_8 f16 f16_1 f16_10  f16_11  f16_12  f16_3 
f16_4 f16_6 f17 f17_2 f17_3 f17_4 f17_5 f19 f19_1 f19_2 f19_3 f19_4 f1_1  
f1_10 f1_11 f1_2  f1_3  f1_4  f1_5  f1_6  f1_7  f1_8  f20 f20_1 f20_2 
f20_4 f20_5 f20_6 f20_7 f20_8 f20_9 f21_1 f21_2 f22 f22_1 f22_2 f22_3 
f22_4 f22_5 f23 f23_1 f23_2 f23_3 f23_4 f23_5 f23_6 f24 f24_1 f24_2 f24_3 
f25 f25_1 f25_3 f25_7 f25_8 f25_9 f2_1  f2_10 f2_11 f2_12 f2_13 f2_2  
f2_4  f2_5  f2_6  f2_7  f2_8  f3_1  f3_2  f3_3  f4  f4_1  f4_10 f4_11 
f4_13 f4_14 f4_16 f4_17 f4_18 f4_2  f4_3  f4_5  f4_6  f4_7  f4_8  f4_9  
f5  f5_1  f5_3  f5_4  f6  f6_1  f6_2  f6_4  f7  f8  f8_1  f8_2  f8_3  f8_4  
f8_5
"""
fields = map(lambda x: x.strip(), fields_str.split('\t'))
features = fields[1:]

# Use this instead of len(features) since this variable can change
# e.g. when one hot encoding is used and/or new features are added.
n_features = len(features)