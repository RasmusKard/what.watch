from flask import Flask, render_template
from flask_modules import get_sorted_data

app = Flask(__name__)
app.debug = False

# Default values for empty inputs



# Render the main HTML page
@app.route("/")
def index():
    return render_template("index.html")


@app.route('/static/<path:filename>')
def serve_static(filename):
    return app.send_static_file(filename)


@app.route('/run_script', methods=['POST'])
def run_script():
    return get_sorted_data()




if __name__ == "__main__":
    app.run()
