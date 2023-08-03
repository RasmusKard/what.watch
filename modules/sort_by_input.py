import pandas as pd
import pyarrow.parquet as pq

class Randomizationparameters:
    """ Class for applying user input to sort .parquet files based on parameters"""
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
        """
        Sorts data by content types.

        This function reads the parquet files for each content type specified in the 'content_types' list. 
        It converts the parquet files into pandas dataframes and concatenates the dataframes.
        The concatenated dataframe is then stored in the class data variable.
        """

        dataframe_by_types = []
        for content_type in self.content_types:
            file_path = f'{content_type}_data.parquet'
            table = pq.read_table(file_path)
            dataframe = table.to_pandas()
            dataframe_by_types.append(dataframe)
        Randomizationparameters.data = pd.concat(dataframe_by_types)

    def data_sort_by_rating(self):
        """
        Sorts the pandas dataframe that is in the class data variable by rating, 
        leaving out data that isn't between min, max rating and above min votes.
        """
        Randomizationparameters.data = Randomizationparameters.data[
            (Randomizationparameters.data['averageRating'].between(self.min_rating, self.max_rating)) &
            (Randomizationparameters.data['numVotes'] >= self.min_votes)
            ]

    def data_sort_by_genres(self):
        """
        Sorts the pandas dataframe that is in the class data variable by genres, leaving out data that isn't in the list of genres.
        """
        Randomizationparameters.data = Randomizationparameters.data[
            Randomizationparameters.data['genres'].apply(lambda x: any(genre in x for genre in self.genres))
        ]

    def data_sort_by_year(self):
        """
        Sorts the data by the 'startYear' column in ascending order. 
        Filters the data to include only rows where the 'startYear' falls within the range of 'min_year' and 'max_year' (inclusive). 
        Updates the 'data' attribute of the Randomizationparameters class with the sorted and filtered data.
        """
        # Convert 'startYear' column to numeric type
        Randomizationparameters.data['startYear'] = pd.to_numeric(Randomizationparameters.data['startYear'], errors='coerce').astype('Int64')
        # Filter the data to include only rows within the range of 'min_year' and 'max_year'
        Randomizationparameters.data = Randomizationparameters.data[(Randomizationparameters.data['startYear'].between(self.min_year, self.max_year))]

    def data_remove_watched(self):
        """
        Removes already watched content from the data by the 'tconst' column. (IMDb ID)
        """
        # Create a set of watched content
        watched_content_set = set(self.watched_content)
        # Remove rows from the data where 'tconst' column is in watched_content_set
        Randomizationparameters.data = Randomizationparameters.data[
            ~Randomizationparameters.data['tconst'].isin(watched_content_set)]

