import json
import requests
from bs4 import BeautifulSoup
from flask import request
import mysql_sort
from flask import session, render_template

# Define a whitelist of allowed domains for SSRF protection
ALLOWED_DOMAINS = ['api.themoviedb.org', 'www.imdb.com']


def is_valid_url(url):
    # Check if the URL's hostname is in the allowed domains
    return any(domain.lower() in url.lower() for domain in ALLOWED_DOMAINS)


def get_sorted_data(connection_pool):
    """
    Retrieves sorted data based on user input from a form and returns it along with a poster URL and overview.
    """
    # Define default values

    # Get the user input from the form
    watched_content = str(request.form.get('watchedContent', '')).splitlines()
    # Create an instance of RandomizationParameters
    try:
        content_types = session['content_types']
        min_rating = session['min_rating']
        max_rating = session['max_rating']
        min_votes = session['min_votes']
        genres = session['genres']
        min_year = session['min_year']
        max_year = session['max_year']
    except KeyError:
        error_message = "Error: Session has expired, please try again."
        return render_template("index.html", error_message=error_message), 400

    result = mysql_sort.sql_sort(content_types=content_types, min_rating=min_rating,
                                 max_rating=max_rating, min_votes=min_votes,
                                 genres=genres, min_year=min_year, max_year=max_year, connection_pool=connection_pool)

    return result


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
    api_key = ""
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
