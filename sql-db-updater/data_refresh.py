import data_modules, variables
from urllib.request import urlretrieve
import pandas as pd



title_file_url = ["https://datasets.imdbws.com/title.basics.tsv.gz", variables.title_file_path]
ratings_file_url = ["https://datasets.imdbws.com/title.ratings.tsv.gz", variables.ratings_file_path]

urlretrieve(title_file_url[0], title_file_url[1])
urlretrieve(ratings_file_url[0], ratings_file_url[1])

df = pd.read_table(ratings_file_url[1], sep='\t')

data = data_modules.DataFile(title_file=title_file_url[1], ratings_file=ratings_file_url[1])

data.data_title_cleanup()

data.data_merge()

data.clean_merged_data()

data.df_to_sql()