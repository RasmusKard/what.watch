from flask import Flask, render_template, send_from_directory, request
import os
from flask_modules import get_sorted_data, get_poster_url

app = Flask(__name__)
app.debug = True

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
        # If the requested path is outside of the static folder, return an error or handle it as needed
        return "Invalid file path", 400

    # If the path is safe, serve the file using send_from_directory
    return send_from_directory(static_folder_path, filename)


@app.route('/run_script', methods=['POST'])
def run_script():
    
    global sorted_data
    sorted_data = get_sorted_data()
    
    if len(sorted_data) == 0:
        # If the sorted data is empty, return an error
        error_message = "Error: No results found, please widen search parameters."
        return render_template("index.html", error_message=error_message), 400
    randomized_data = sorted_data.sample()
    poster_url, overview = get_poster_url(randomized_data['tconst'].values[0])
    
    return render_template("randomized_content.html", sorted_data=randomized_data, poster_url=poster_url, overview=overview)

@app.route('/reroll', methods=['POST'])
def reroll():
    randomized_data = sorted_data.sample()
    poster_url, overview = get_poster_url(randomized_data['tconst'].values[0])
    return render_template("randomized_content.html", sorted_data=randomized_data, poster_url=poster_url, overview=overview)
    




if __name__ == "__main__":
    app.run()
