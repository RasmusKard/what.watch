import tsvfile

files = tsvfile.TsvFile('title_data.tsv', 'rating_data.tsv')

files.tsv_title_cleanup()
files.tsv_merge()
tsvfile.titletype_split()
