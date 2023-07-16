from flask import Flask, render_template, request
import requests
import sort_by_input as sbi
from bs4 import BeautifulSoup
import json
from flask_modules import get_sorted_data, get_poster_url, imdb_scrape

app = Flask(__name__)
app.debug = False

# Default values for empty inputs



# Render the main HTML page
@app.route("/")
def index():
    return render_template("index.html")



@app.route('/run_script', methods=['POST'])
def run_script():
    return get_sorted_data()




if __name__ == "__main__":
    app.run()
