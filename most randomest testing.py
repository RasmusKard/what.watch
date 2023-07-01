import pandas as pd
df = pd.read_table('movie_data.tsv', sep='\t')
df = df.reset_index(drop=True)
df.to_csv('test.tsv', sep='\t')