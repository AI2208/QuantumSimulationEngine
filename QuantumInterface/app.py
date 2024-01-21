# -*- coding: utf-8 -*-

# Import necessary modules and packages
import json
from flask import Flask, render_template

# Create a Flask application instance
app = Flask(__name__)

# Route to render the HTML template
@app.route('/')
def index():
    return render_template('introPage.html')

if __name__ == '__main__':
    app.run()
