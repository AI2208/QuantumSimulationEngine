# -*- coding: utf-8 -*-
"""
Created on Mon May 1 17:25:12 2023

@author: aamna

This file defines a REST API for processing quantum circuits.

"""

# Import necessary modules and packages
import os
import json
import numpy as np
from flask import Flask, request, jsonify, render_template
from collections import OrderedDict
from models import db, Job
from flask_migrate import Migrate
from flask_cors import CORS


# Create a Flask application instance
app = Flask(__name__)
CORS(app)

# Route to render the HTML template
@app.route('/')
def index():
    return render_template('index.html')

# Read the database URI from the environment variable
database_uri = os.environ.get("SQLALCHEMY_DATABASE_URI")

# Configure the application to use a PostgreSQL database
app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Create a SQLAlchemy database instance
db.init_app(app)

# Create a Migrate instance
migrate = Migrate(app, db)
   
# API POST endpoint
@app.route('/job', methods=['POST'])
def process_job():
    try:
        circuit = request.json.get('circuit')
        # Verify existence and data type of circuit nd ensure at least one gate
        if circuit is None or not isinstance(circuit, list) or len(circuit) < 1:
            raise ValueError('Invalid circuit format. The circuit must be a non-empty list.')

        # Validate the input - gate must be a dictionary with an axis (must be X, Y or Z) and an amount (must be an integer) key
        for i, gate in enumerate(circuit):
            if not isinstance(gate, dict):
                raise ValueError(f"Invalid gate format at index {i}. The gate must be a dictionary.")
              
            if not set(gate.keys()) == {'axis', 'amount'}:
                raise ValueError(f"Invalid gate at index {i}. The gate must have 'axis' and 'amount' keys only.")
              
            if gate['axis'] not in ['X', 'Y', 'Z']:
                raise ValueError(f"Invalid axis value at index {i}. The axis must be 'X', 'Y', or 'Z'.")
              
            if not isinstance(gate['amount'], int):
                raise ValueError(f"Invalid amount value at index {i}. The amount must be an integer.")
        
    
        # Optimize the circuit
        optimized_circuit = optimize_circuit(circuit)
        print("The current circuit given to database is "+str(circuit))

        # Process the circuit and generate the result
        result = process_circuit(optimized_circuit)
        
        if optimized_circuit == circuit:
            optimized_circuit = None

        # Create a new Job object and add it to the database
        job = Job(circuit=circuit, optimized_circuit=optimized_circuit, result=result)
        db.session.add(job)
        db.session.commit()
   
        # Return the ordered response
        response = OrderedDict([
            ('status', 'completed'),
            ('job_id', job.id),
            ('circuit', circuit),
            ('optimized_circuit',optimized_circuit),
            ('result', result)
        ])
        # Convert the dictionary to a JSON string
        json_response = json.dumps(response)
         
        # Add a newline character to the end of the response - this just cleans up the result
        json_response += '\n'
         
        return json_response, 200

    except ValueError as e:
        response = {
            'error_code': 400,
            'error_reason': str(e)
        }
        return jsonify(response), 400

    except Exception as e:
        response = {
            'error_code': 500,
            'error_reason': str(e)
        }
        return jsonify(response), 500
    
# API GET endpoint
@app.route('/job/<job_id>', methods=['GET'])
def get_job(job_id):
    try:
        # Verify that the job_id is an integer
        job_id = int(job_id)
    except ValueError:
        response = {
            'error_code': 400,
            'error_reason': 'Job ID must be an integer.'
        }
        return jsonify(response), 400
    
    job = Job.query.filter_by(id=job_id).first()
    if job is None:
        response = {
            'error_code': 404,
            'error_reason': f"Job ID {job_id} not found."
        }
        return jsonify(response), 404
    
    # Sort the keys in the result dictionary by their integer values
    sorted_keys = sorted(job.result, key=lambda k: int(k))

    # Create an ordered dictionary with the sorted keys
    result = OrderedDict()
    for key in sorted_keys:
        result[str(key)] = job.result[key]

    # Create an ordered dictionary with the response keys in the desired order
    if job.optimized_circuit:
        response = OrderedDict([
            ('status', 'completed'),
            ('job_id', job_id),
            ('circuit', job.circuit),
            ('optimized_circuit',job.optimized_circuit),
            ('result', job.result)
        ])
    else:
        response = OrderedDict([
            ('status', 'completed'),
            ('job_id', job_id),
            ('circuit', job.circuit),
            ('result', job.result)
        ])
 
    # Convert the dictionary to a JSON string
    json_response = json.dumps(response)
    
    # Add a newline character to the end of the response - this just cleans up the result
    json_response += '\n'
    
    return json_response, 200


def optimize_circuit(circuit):
    optimized_circuit = []
    for gate in circuit:
        if len(optimized_circuit) > 0 and gate['axis'] == optimized_circuit[-1]['axis']:
            optimized_circuit[-1]['amount'] += gate['amount']
        else:
            optimized_circuit.append(gate.copy())  # Copy the gate dictionary
    return optimized_circuit

def process_circuit(circuit):
    # Initialize a single qubit in the |0⟩ state
    qubit_state = np.array([1, 0])

    # Apply each gate in the circuit to the qubit
    for gate in circuit:
        # Construct the corresponding unitary matrix for the gate
        if gate['axis'] == 'X':
            gate_matrix = np.array([[np.cos(gate['amount']/2), -1j*np.sin(gate['amount']/2)],
                                    [-1j*np.sin(gate['amount']/2), np.cos(gate['amount']/2)]])
        elif gate['axis'] == 'Y':
            gate_matrix = np.array([[np.cos(gate['amount']/2), -np.sin(gate['amount']/2)],
                                    [np.sin(gate['amount']/2), np.cos(gate['amount']/2)]])
        elif gate['axis'] == 'Z':
            gate_matrix = np.array([[np.exp(-1j*gate['amount']/2), 0],
                                    [0, np.exp(1j*gate['amount']/2)]])
        # Apply the gate to the qubit
        qubit_state = np.dot(gate_matrix, qubit_state)
    
    # Measure the qubit in the computational basis
    probabilities = np.abs(qubit_state)**2
    result = {'0': int(probabilities[0]*1000), '1': int(probabilities[1]*1000)}
    return result

# Error handler
@app.errorhandler(404)
def bad_request(error):
    return {
        'error_code': 404,
        'error_reason': 'Bad Request'
    }

@app.errorhandler(500)
def internal_server_error(error):
    return {
        'error_code': 500,
        'error_reason': 'Internal Server Error'
    }

if __name__ == '__main__':
    app.run()
