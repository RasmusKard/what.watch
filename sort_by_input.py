import pandas as pd
import pyarrow.parquet as pq

class Randomizationparameters:
    """ Class for applying user input to sort .tsv files based on parameters"""
    data = []

    def __init__(self, content_types, min_rating, max_rating, min_votes, genres, min_year, max_year, watched_content=0):
        self.content_types = content_types
        self.min_rating = min_rating
        self.max_rating = max_rating
        self.min_votes = min_votes
        self.genres = genres
        self.min_year = min_year
        self.max_year = max_year
        self.watched_content = watched_content

    def data_sort_by_content_types(self):
        dataframe_by_types = []
        for content_type in self.content_types:
            file_path = f'{content_type}_data.parquet'
            table = pq.read_table(file_path)
            dataframe = table.to_pandas()
            dataframe_by_types.append(dataframe)
        Randomizationparameters.data = pd.concat(dataframe_by_types)

    def data_sort_by_rating(self):
        Randomizationparameters.data = Randomizationparameters.data[
            (Randomizationparameters.data['averageRating'].between(self.min_rating, self.max_rating)) &
            (Randomizationparameters.data['numVotes'] >= self.min_votes)
            ]

    def data_sort_by_genres(self):
        Randomizationparameters.data = Randomizationparameters.data[
            Randomizationparameters.data['genres'].apply(lambda x: any(genre in x for genre in self.genres))
        ]

    def data_sort_by_year(self):
        df = Randomizationparameters.data
        df['startYear'] = pd.to_numeric(df['startYear'], errors='coerce').astype('Int64')
        df = df[(df['startYear'].between(self.min_year, self.max_year))]
        Randomizationparameters.data = df

    def data_remove_watched(self):
        watched_content_set = set(self.watched_content)
        Randomizationparameters.data = Randomizationparameters.data[
            ~Randomizationparameters.data['tconst'].isin(watched_content_set)]

