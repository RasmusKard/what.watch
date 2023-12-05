import pandas as pd
from modules import variables


class DataFile:
    """
    Class for converting raw IMDb .tsv files into SQL database.
    """

    def __init__(self, title_file, ratings_file):
        self.title_file = title_file
        self.ratings_file = ratings_file
        self.merged_data = None
        self.title_df = None
        self.ratings_df = None

    def data_title_cleanup(self):
        """
        Removes unnecessary data from IMDb title.basics tsv.
        """
        if self.title_df is not None:
            df = self.title_df
        else:
            df = pd.read_table(self.title_file, sep='\t')

        df = df[~df["titleType"].isin(['tvEpisode', 'videoGame'])]

        df = df[df["isAdult"] != 1]

        df = df.drop(['isAdult', 'endYear', 'runtimeMinutes', 'originalTitle'], axis=1)

        self.title_df = df

    def data_merge(self):
        """
        Merges two dataframes based on matching 'tconst' title identifiers.
        """
        if self.title_df is not None:
            title_data = self.title_df
        else:
            title_data = pd.read_table(self.title_file, sep='\t')

        if self.ratings_df is not None:
            rating_data = self.ratings_df
        else:
            rating_data = pd.read_table(self.ratings_file, sep='\t')

        data_merged = pd.merge(title_data, rating_data,
                               on='tconst',
                               how='inner')

        self.merged_data = data_merged

    def clean_merged_data(self):
        values = {'startYear': 0, 'genres': 'NULL'}

        df = self.merged_data

        df.replace(r'\N', pd.NA, inplace=True)

        df = df.fillna(value=values)

        df = df.astype({'startYear': 'int64'})

        self.merged_data = df

    def df_to_sql(self):
        engine = variables.mysql_engine

        df = self.merged_data

        df.to_sql(name='test', con=engine, index=False, if_exists='replace')
