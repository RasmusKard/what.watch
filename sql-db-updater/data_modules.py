import pandas as pd
import variables


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
        self.title_dtypes = {
            'tconst': str,
            'titleType': 'category',
            'primaryTitle': str,
            'originalTitle': str,
            'isAdult': str,
            'startYear': 'Int64',
            'endYear': 'Int64',
            'runtimeMinutes': str,
            'genres': str,
        }
        self.ratings_dtypes = {
            'tconst': str,
            'averageRating': float,
            'numVotes': int
        }

    def data_title_cleanup(self):
        """
        Removes unnecessary data from IMDb title.basics tsv.
        """
        if self.title_df is not None:
            pass
        else:
            self.title_df = pd.read_csv(self.title_file, sep='\t', dtype=self.title_dtypes, na_values=r'\N',
                                        compression='gzip')

        self.title_df = self.title_df[~self.title_df["titleType"].isin(['tvEpisode', 'videoGame'])]

        self.title_df = self.title_df[self.title_df["isAdult"] != 1]

        self.title_df.drop(['isAdult', 'endYear', 'runtimeMinutes', 'originalTitle'], axis=1, inplace=True)

        self.title_df.to_csv('temp_title.csv', sep='\t', index=False)

        self.title_df = None

    def data_merge(self):
        """
        Merges two dataframes based on matching 'tconst' title identifiers.
        """
        if self.title_df is not None:
            pass
        else:
            self.title_df = pd.read_csv('temp_title.csv', sep='\t', dtype=self.title_dtypes, na_values=r'\N')

        if self.ratings_df is not None:
            pass
        else:
            self.ratings_df = pd.read_csv(self.ratings_file, sep='\t', compression='gzip', dtype=self.ratings_dtypes)

        self.merged_data = pd.merge(self.title_df, self.ratings_df,
                                    on='tconst',
                                    how='inner')

    def clean_merged_data(self):
        values = {'startYear': 0, 'genres': 'NULL'}

        self.merged_data.fillna(value=values, inplace=True)

    def df_to_sql(self):
        engine = variables.mysql_engine

        self.merged_data.to_sql(name='test', con=engine, index=False, if_exists='replace', chunksize=5000)
