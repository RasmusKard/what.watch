import json

import requests
from bs4 import BeautifulSoup
from flask import render_template, request

import sort_by_input as sbi


def get_sorted_data():
    default_content_types = ["movie", "tvSeries", "tvMovie", "tvMovie", "tvSpecial", "video", "short", "tvShort"]
    default_min_rating = 0
    default_max_rating = 10
    default_min_votes = 0
    default_genres = ['Action', 'Adventure', 'Adult', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama',
                      'Fantasy', 'Family', 'Film-Noir', 'Horror', 'Musical', 'Mystery', 'Romance', 'Sci-Fi',
                      'Short', 'Thriller', 'War', 'Western']

    # Get the user input from the form
    content_types = request.form.getlist('contentTypes') or default_content_types
    min_rating = float(request.form.get('min_rating')) if request.form.get('min_rating') else default_min_rating
    max_rating = float(request.form.get('max_rating')) if request.form.get('max_rating') else default_max_rating
    min_votes = int(request.form.get('min_votes')) if request.form.get('min_votes') else default_min_votes
    genres = request.form.getlist('genres') or default_genres
    min_year = int(request.form.get('min_year')) if request.form.get('min_year') else 0
    max_year = int(request.form.get('max_year')) if request.form.get('max_year') else 2023

    # Create an instance of RandomizationParameters
    randomization_params = sbi.Randomizationparameters(content_types=content_types, min_rating=min_rating,
                                                       max_rating=max_rating, min_votes=min_votes,
                                                       genres=genres, min_year=min_year, max_year=max_year)

    # Apply the sorting methods
    randomization_params.data_sort_by_content_types()
    randomization_params.data_sort_by_rating()
    randomization_params.data_sort_by_genres()
    randomization_params.data_sort_by_year()

    # Retrieve the sorted data
    sorted_data = randomization_params.data

    sorted_data = sorted_data.sample()

    # Retrieve the sorted data and poster URL with overview
    poster_url, overview = get_poster_url(sorted_data['tconst'].values[0])

    # Pass the data, poster URL, and overview to the template
    return render_template("randomized_content.html", sorted_data=sorted_data, poster_url=poster_url, overview=overview)


def get_poster_url(imdb_id):
    api_key = "1ba8a8216959c0bd30febe36bbafa2b8"

    # Construct the API URL with the IMDb ID
    url = f"https://api.themoviedb.org/3/find/{imdb_id}?api_key={api_key}&external_source=imdb_id"

    # Send a GET request to the API
    response = requests.get(url)

    if response.ok:
        json_response = response.json()
    else:
        return imdb_scrape(imdb_id)
    print(json_response)
    if all(len(value) == 0 for value in json_response.values()):
        return imdb_scrape(imdb_id)

    poster_path = json_response['movie_results'][0]['poster_path']
    overview = json_response['movie_results'][0]['overview']
    # Construct the complete poster URL
    poster_url = f"https://image.tmdb.org/t/p/original{poster_path}"

    return poster_url, overview


def imdb_scrape(imdb_id):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0'}
    url = f"https://www.imdb.com/title/{imdb_id}"
    req = requests.get(url, headers=headers).content
    soup = BeautifulSoup(req, 'html.parser')
    json_response = json.loads(str(soup.find('script', {'type': 'application/ld+json'}).text))
    try:
        poster_url = json_response['image']
    except KeyError:
        poster_url = "/static/image-not-found-scaled.png"
        pass
    try:
        overview = json_response['overview']
    except KeyError:
        overview = None
        pass
    return poster_url, overview
