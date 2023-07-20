import pandas as pd


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
            file_path = f'{content_type}_data.tsv'
            dataframe = pd.read_table(file_path, sep='\t')
            dataframe_by_types.append(dataframe)
        Randomizationparameters.data = pd.concat(dataframe_by_types)

    def data_sort_by_rating(self):
        self.data = self.data[
            (self.data['averageRating'] >= self.min_rating) &
            (self.data['averageRating'] <= self.max_rating) &
            (self.data['numVotes'] >= self.min_votes)
        ]

    def data_sort_by_genres(self):
        df = Randomizationparameters.data
        Randomizationparameters.data = df[df['genres'].str.contains('|'.join(self.genres))]

    def data_sort_by_year(self):
        df = Randomizationparameters.data
        df['startYear'] = df['startYear'].replace('\\N', 0)
        df = df[df['startYear'] != 0]
        df['startYear'] = df['startYear'].astype(int)
        Randomizationparameters.data = df[
            (df['startYear'] >= self.min_year) &
            (df['startYear'] <= self.max_year)
        ]

    def data_remove_watched(self):
        df = Randomizationparameters.data
        df = df[~df["tconst"].isin(self.watched_content)]
        Randomizationparameters.data = df
