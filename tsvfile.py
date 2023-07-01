import pandas as pd
import os


class TsvFile:
    def __init__(self, title_file, ratings_file):
        self.title_file = title_file
        self.ratings_file = ratings_file

    # Converts .tsv files into .csv.
    # def tsv_to_csv(self):
    #     csv_table = pd.read_table(self.title_file, sep='\t')
    #     csv_table.to_csv(f'{self.title_file}.csv', index=False)
    #
    #     csv_table = pd.read_table(self.ratings_file, sep='\t')
    #     csv_table.to_csv(f'{self.ratings_file}.csv', index=False)

    # Removes unnecessary tvEpisode data from csv.
    def tsv_title_cleanup(self):
        df = pd.read_table(self.title_file, sep='\t')

        df = df[df["titleType"] != "tvEpisode"]

        df = df.drop(['isAdult', 'endYear'], axis=1)

        df.to_csv(f'filtered_{self.title_file}', sep='\t', index=False)

    # Merges rating data .csv and title data .csv based on matching 'tconst' title identifiers.
    def tsv_merge(self):
        data1 = pd.read_table(f'filtered_{self.title_file}', sep='\t')
        data2 = pd.read_csv(f'{self.ratings_file}', sep='\t')

        data_merged = pd.merge(data1, data2,
                               on='tconst',
                               how='inner')
        data_merged.to_csv('title_ratings_merged.tsv', sep="\t", index=False)
        try:
            os.remove(f'filtered_{self.title_file}')
        except OSError:
            pass

    # def delete_redundant_files(self):
    #     redundant_files = ['filtered_{self.title_file}']
    #     for file in redundant_files:
    #         if os.path.exists(file):
    #             os.remove(file)


def titletype_split():
    titletypes = ["movie", "tvSeries", "tvMovie", "tvMovie", "tvSpecial", "video", "short", "tvShort"]
    for titletype in titletypes:
        df = pd.read_table('title_ratings_merged.tsv', sep='\t')
        df = df[df["titleType"] == f"{titletype}"]
        df.to_csv(f'{titletype}_data.tsv', sep="\t", index=False)
    for titletype in titletypes:
        df = pd.read_table(f'{titletype}_data.tsv', sep='\t')
        df.to_csv(f'{titletype}_data.tsv', sep="\t", index=True)
