from datetime import date
import pandas as pd


class Randomizationparameters:
    """ Class for applying user input to sort .tsv files based on parameters"""
    data = []

    def __init__(self, content_types, min_rating, max_rating, min_votes, genres, min_year, max_year):
        self.content_types = content_types
        self.min_rating = min_rating
        self.max_rating = max_rating
        self.min_votes = min_votes
        self.genres = genres
        self.min_year = min_year
        self.max_year = max_year

    def data_sort_by_content_types(self):
        dataframe_by_types = [pd.read_table(f'{content_type}_data.tsv', sep='\t') for content_type in
                              self.content_types]
        Randomizationparameters.data = pd.concat(dataframe_by_types)

    def data_sort_by_rating(self):
        df = Randomizationparameters.data
        Randomizationparameters.data = df.loc[
            (df['averageRating'] >= self.min_rating) &
            (df['averageRating'] <= self.max_rating) &
            (df['numVotes'] >= self.min_votes)]

    def data_sort_by_genres(self):
        df = Randomizationparameters.data
        Randomizationparameters.data = df[df['genres'].apply(lambda x: any(genre in x for genre in self.genres))]

    def data_sort_by_year(self):
        df = Randomizationparameters.data
        df['startYear'] = df['startYear'].replace('\\N', 0)
        df = df[df['startYear'] != 0]
        df = df.astype({'startYear': 'int'})
        Randomizationparameters.data = df.loc[
            (df['startYear'] >= self.min_year) &
            (df['startYear'] <= self.max_year)]