import json
import math
import requests
from bs4 import BeautifulSoup
from flask import request

import sort_by_input as sbi

# Define a whitelist of allowed domains for SSRF protection
ALLOWED_DOMAINS = ['api.themoviedb.org', 'www.imdb.com']


def is_valid_url(url):
    # Check if the URL's hostname is in the allowed domains
    return any(domain.lower() in url.lower() for domain in ALLOWED_DOMAINS)


def get_sorted_data():
    """
    Retrieves sorted data based on user input from a form and returns it along with a poster URL and overview.
    """
    # Define default values
    default_content_types = ["movie", "tvSeries", "tvMovie", "tvSpecial", "video", "short", "tvShort"]
    default_min_rating = 0
    default_max_rating = 10
    default_min_votes = 0
    default_genres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama',
                      'Fantasy', 'Family', 'Film-Noir', 'Horror', 'Musical', 'Mystery', 'Romance', 'Sci-Fi',
                      'Short', 'Thriller', 'War', 'Western']


    # Get the user input from the form
    content_types = request.form.getlist('contentTypes') or default_content_types
    min_rating = float(request.form.get('min_rating', default_min_rating))
    max_rating = float(request.form.get('max_rating', default_max_rating))
    min_votes = int(math.floor(float(request.form.get('min_votes', default_min_votes))))
    genres = request.form.getlist('genres') or default_genres
    min_year = int(request.form.get('min_year', 0))
    max_year = int(request.form.get('max_year', 2023))
    watched_content = str(request.form.get('watchedContent', '')).splitlines()
    # Create an instance of RandomizationParameters
    randomization_params = sbi.Randomizationparameters(content_types=content_types, min_rating=min_rating,
                                                       max_rating=max_rating, min_votes=min_votes,
                                                       genres=genres, min_year=min_year, max_year=max_year,
                                                       watched_content=watched_content)
    
    # Apply the sorting methods. Doesn't call sorting functions if they match defaults since default values don't sort anything out
    randomization_params.data_sort_by_content_types()
    
    if min_rating != default_min_rating or max_rating != default_max_rating or min_votes != default_min_votes:
        randomization_params.data_sort_by_rating()

    genres.sort()
    default_genres.sort()
    if genres != default_genres:
        randomization_params.data_sort_by_genres()

    if min_year != 0 or max_year != 2023:
        randomization_params.data_sort_by_year()
        
    if len(watched_content) > 0:
        randomization_params.data_remove_watched()

    return randomization_params.data


def get_poster_url(imdb_id):
    """
    Retrieves the poster URL and overview for a movie or TV show based on its IMDb ID.

    Args:
        imdb_id (str): The IMDb ID of the movie or TV show.

    Returns:
        The poster URL (str) and overview (str) of the movie or TV show.

    Raises:
        ValueError: If the provided IMDb ID is not a valid URL or if the API response is not successful.

    Notes:
        If the API request fails, the function falls back to the 'imdb_scrape' function.
    """
    # API key for themoviedb.org
    api_key = "YOUR_API_KEY"
    url = f"https://api.themoviedb.org/3/find/{imdb_id}?api_key={api_key}&external_source=imdb_id"

    # Check if the URL is in the list of allowed domains
    if not is_valid_url(url):
        return "Invalid URL", 400

    response = requests.get(url)
    
    # Check if the API response is successful
    if response.ok:
        json_response = response.json()
        if json_response['movie_results']:
            poster_path = json_response['movie_results'][0]['poster_path']
            overview = json_response['movie_results'][0]['overview']
        elif json_response['tv_results']:
            poster_path = json_response['tv_results'][0]['poster_path']
            overview = json_response['tv_results'][0]['overview']
        else:
            return imdb_scrape(imdb_id)

        poster_url = f"https://image.tmdb.org/t/p/original{poster_path}"
        return poster_url, overview
    else:
        return imdb_scrape(imdb_id)



def imdb_scrape(imdb_id):
    """
    Scrapes IMDb for information about a movie or TV show using the IMDb ID.

    Parameters:
        imdb_id (str): The IMDb ID of the movie or TV show.

    Returns:
        tuple: A tuple containing the poster URL (str) and the overview (str) of the movie or TV show.
               If the URL is invalid, it returns "Invalid URL" and a status code of 400.
    """
    url = f"https://www.imdb.com/title/{imdb_id}"
    
    # Check if the URL is in the list of allowed domains
    if not is_valid_url(url):
        return "Invalid URL", 400

    # Set the User-Agent header to make the request look like it's coming from a web browser
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0'}
    
    response = requests.get(url, headers=headers)
    
    if response.ok:
        response = response.content
    else:
        return None, None
    
    # Parse the HTML response using BeautifulSoup
    soup = BeautifulSoup(response, 'html.parser')
    
    # Find the JSON script tag containing the movie or TV show information
    json_response = json.loads(str(soup.find('script', {'type': 'application/ld+json'}).text))

    # Extract the poster URL and overview from the JSON response
    poster_url = json_response.get('image')
    overview = json_response.get('description')

    return poster_url, overview
