import random

from flask import Flask, render_template, session, request
from modules.flask_modules import get_sorted_data, get_poster_url
from decimal import Decimal, getcontext
import secrets
import math
import mysql.connector, mysql.connector.pooling
from datetime import timedelta

connection_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name='your_pool_name', pool_size=5,
                                                              user='root', password='RandomTest123!',
                                                              host='localhost',
                                                              database='content_data')

default_values = {
    'default_content_types': ["movie", "tvMovie", "tvSeries", "tvMiniSeries", "tvSpecial", "video", "short", "tvShort"],
    'default_min_rating': 0,
    'default_max_rating': 10,
    'default_min_votes': 0,
    'default_genres': ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama',
                       'Fantasy', 'Family', 'Film-Noir', 'Horror', 'Musical', 'Mystery', 'Romance', 'Sci-Fi',
                       'Short', 'Thriller', 'War', 'Western'],
    'default_min_year': 1874,
    'default_max_year': 2023
}


app = Flask(__name__)
app.debug = True
app.secret_key = secrets.token_urlsafe(16)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=60)


# Render the main HTML page
@app.route("/")
def index():
    return render_template("index.html")


def get_template_variables():
    sorted_data = get_sorted_data(connection_pool=connection_pool)
    row_count = len(sorted_data.index)

    getcontext().prec = 3
    probability = Decimal('100') / Decimal(f'{row_count}')

    row_count = '{:,}'.format(row_count)

    return sorted_data, row_count, probability


@app.route('/run_script', methods=['POST', 'GET'])
def run_script():
    if request.method == 'GET':
        return render_template("index.html")


    session['content_types'] = request.form.getlist('contentTypes') or default_values['default_content_types']
    session['min_rating'] = float(request.form.get('min_rating', default_values['default_min_rating']))
    session['max_rating'] = float(request.form.get('max_rating', default_values['default_max_rating']))
    session['min_votes'] = int(math.floor(float(request.form.get('min_votes', default_values['default_min_votes']))))
    session['genres'] = request.form.getlist('genres') or default_values['default_genres']
    session['min_year'] = int(request.form.get('min_year', default_values['default_min_year']))
    session['max_year'] = int(request.form.get('max_year', default_values['default_max_year']))
    session['watched_content'] = str(request.form.get('watchedContent', '')).splitlines()

    sorted_data = get_sorted_data(connection_pool=connection_pool, default_values=default_values)
    result_count = len(sorted_data)

    if result_count == 0:
        # If the sorted data is empty, return an error
        error_message = "Error: No results found, please widen search parameters."
        return render_template("index.html", error_message=error_message), 400

    randomized_data = random.choice(sorted_data)
    poster_url, overview = get_poster_url(randomized_data[0])

    getcontext().prec = 3
    probability = Decimal('100') / Decimal(f'{result_count}')

    # Thousand separators
    result_count_formatted = '{:,}'.format(result_count)

    return render_template("randomized_content.html", sorted_data=randomized_data, poster_url=poster_url,
                           overview=overview, result_count=result_count_formatted, probability=probability)


@app.route('/reroll', methods=['POST', 'GET'])
def reroll():
    if request.method == 'GET':
        return render_template("index.html")

    try:
        sorted_data = get_sorted_data(connection_pool=connection_pool, default_values=default_values)
        result_count = len(sorted_data)
    except TypeError:
        error_message = "Error: Session has expired, please try again."
        return render_template("index.html", error_message=error_message), 400

    if result_count == 0:
        # If the sorted data is empty, return an error
        error_message = "Error: No results found, please widen search parameters."
        return render_template("index.html", error_message=error_message), 400

    randomized_data = random.choice(sorted_data)

    getcontext().prec = 3
    probability = Decimal('100') / Decimal(f'{result_count}')

    # Thousand separators
    result_count_formatted = '{:,}'.format(result_count)
    poster_url, overview = get_poster_url(randomized_data[0])


    return render_template("randomized_content.html", sorted_data=randomized_data, poster_url=poster_url,
                           overview=overview, result_count=result_count_formatted, probability=probability)


if __name__ == "__main__":
    app.run()
