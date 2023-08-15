import pandas as pd


def clean_parquet():
    values = {'startYear': 0, 'genres': 'NULL'}

    df = pd.read_parquet('title_ratings_merged.parquet')

    df.to_csv('title_data_clean.csv', index=False)

    df = pd.read_csv('title_data_clean.csv', na_values=r'\N')

    df = df.fillna(value=values)

    df = df.astype({'startYear': 'int64'})

    df.to_csv('title_data_clean.csv', index=False)

    print('clean done')


def extract_genre():
    df = pd.read_csv('title_data_clean.csv', na_values='NULL')

    df = df[['tconst', 'genres']]

    df.to_csv('tconst_genre.csv', index=False, na_rep='NULL')

    print('extract done')


def genre_split():
    df = pd.read_csv('tconst_genre.csv', na_values='NULL')

    df = (df.set_index(['tconst'])
          .stack()
          .str.split(',', expand=True)
          .stack()
          .unstack(-2)
          .reset_index(-1, drop=True)
          .reset_index()
          )
    df.to_csv('tconst_genre.csv', index=False, na_rep='NULL')

    print('split done')


def remove_genre():
    df = pd.read_csv('title_data_clean.csv', na_values='NULL')

    df = df.drop('genres', axis=1)

    df.to_csv('title_data_clean_final.csv', index=False, na_rep='NULL')

    print('remove done')


clean_parquet()
extract_genre()

