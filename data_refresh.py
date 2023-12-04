from modules import data_modules
from urllib.request import urlretrieve
import pandas as pd

title_file_url = ["https://datasets.imdbws.com/title.basics.tsv.gz", 'title_file.gz']
ratings_file_url = ["https://datasets.imdbws.com/title.ratings.tsv.gz", 'ratings_file.gz']

urlretrieve(title_file_url[0], title_file_url[1])
urlretrieve(ratings_file_url[0], ratings_file_url[1])

df = pd.read_table(ratings_file_url[1], sep='\t')

data = data_modules.DataFile(title_file=title_file_url[1], ratings_file=ratings_file_url[1])

data.data_title_cleanup()

data.data_merge()

data_modules.clean_data()

data_modules.extract_genre()

data_modules.genre_split()

data_modules.remove_genre()

data_modules.csv_to_sql()



