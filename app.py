import pandas as pd
from flask import Flask, render_template, send_from_directory
import os
from flask_modules import get_sorted_data, get_poster_url
from decimal import Decimal, getcontext

app = Flask(__name__)
app.debug = True

sorted_data = pd.DataFrame()
# Default values for empty inputs

# Render the main HTML page
@app.route("/")
def index():
    return render_template("index.html")


static_folder_path = '/static'
@app.route('/static/<path:filename>')
def serve_static(filename):
    # Get the full absolute path of the requested file
    requested_path = os.path.abspath(os.path.join(static_folder_path, filename))

    # Check if the requested path is within the static folder
    if not requested_path.startswith(static_folder_path):
        # If the requested path is outside the static folder, return an error or handle it as needed
        return "Invalid file path", 400

    # If the path is safe, serve the file using send_from_directory
    return send_from_directory(static_folder_path, filename)


@app.route('/run_script', methods=['POST'])
def run_script():
    sorted_data = get_sorted_data()
    global row_count
    row_count = len(sorted_data.index)

    if row_count == 0:
        # If the sorted data is empty, return an error
        error_message = "Error: No results found, please widen search parameters."
        return render_template("index.html", error_message=error_message), 400
    randomized_data = sorted_data.sample()
    poster_url, overview = get_poster_url(randomized_data['tconst'].values[0])

    getcontext().prec = 3
    global probability
    probability = Decimal('100') / Decimal(f'{row_count}')

    # Thousand separators
    row_count = '{:,}'.format(row_count)
    
    return render_template("randomized_content.html", sorted_data=randomized_data, poster_url=poster_url,
                           overview=overview, row_count=row_count, probability=probability)

@app.route('/reroll', methods=['POST'])
def reroll():
    if not sorted_data.empty:
        randomized_data = sorted_data.sample()
    else:
        randomized_data = get_sorted_data().sample()
    poster_url, overview = get_poster_url(randomized_data['tconst'].values[0])
    return render_template("randomized_content.html", sorted_data=randomized_data, poster_url=poster_url,
                           overview=overview, row_count=row_count, probability=probability)
    




if __name__ == "__main__":
    app.run()
