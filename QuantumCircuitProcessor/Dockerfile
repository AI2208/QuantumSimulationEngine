
# Use the official Python image as a parent image
FROM python:3.9

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /usr/src/app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install Flask Flask-Migrate Flask-CORS numpy psycopg2-binary  -r requirements.txt

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define environment variable for the Flask application
ENV FLASK_APP=app.py
ENV SQLALCHEMY_DATABASE_URI="postgresql://postgres:postgres@db:5432/QuantumAPIdb"

# Run app.py when the container launches using Flask's development server
CMD ["flask", "run", "--host=0.0.0.0"]


