from flask import Flask, render_template, request
import sort_by_input as sbi
import os

app = Flask(__name__)

# Default values for empty inputs
default_content_types = ["movie", "tvSeries", "tvMovie", "tvMovie", "tvSpecial", "video", "short", "tvShort"]
default_genres = ['Action', 'Adventure', 'Adult', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama',
                  'Fantasy', 'Family', 'Film-Noir', 'Horror', 'Musical', 'Mystery', 'Romance', 'Sci-Fi',
                  'Short', 'Thriller', 'War', 'Western']

# Render the main HTML page
@app.route("/")
def index():
    return render_template("index.html")


@app.route('/run_script', methods=['POST'])
def get_sorted_data():
    # Get the user input from the form
    content_types = request.form.getlist('contentTypes') or default_content_types
    min_rating = float(request.form.get('min_rating')) if request.form.get('min_rating') else 0
    max_rating = float(request.form.get('max_rating')) if request.form.get('max_rating') else 10
    min_votes = int(request.form.get('min_votes')) if request.form.get('min_votes') else 0
    genres = request.form.getlist('genres') or default_genres
    min_year = int(request.form.get('min_year')) if request.form.get('min_year') else 0
    max_year = int(request.form.get('max_year')) if request.form.get('max_year') else 2023
    # Create an instance of RandomizationParameters
    randomization_params = sbi.RandomizationParameters(content_types = content_types, min_rating=min_rating,
                                                       max_rating=max_rating, min_votes=min_votes,
                                                       genres=genres, min_year=min_year, max_year=max_year)
    print(content_types,min_rating,max_rating,min_votes,genres,min_year,max_year)
    # Apply the sorting methods
    randomization_params.data_sort_by_content_types()
    randomization_params.data_sort_by_rating()
    randomization_params.data_sort_by_genres()
    randomization_params.data_sort_by_year()

    # Retrieve the sorted data
    sorted_data = randomization_params.data

    # Take random sample from data
    sorted_data = sorted_data.sample()
    print(sorted_data)
    # Return randomized content
    return render_template('randomized_content.html', data=sorted_data)


if __name__ == "__main__":
    app.run(debug=True)
