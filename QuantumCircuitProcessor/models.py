# -*- coding: utf-8 -*-

# models.py

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Job(db.Model):
    """
    Represents a quantum computing job in the database.
    - id: Unique identifier for the job
    - circuit: The initial quantum circuit
    - optimized_circuit: The optimized version of the circuit
    - result: The result of executing the circuit
    """
    id = db.Column(db.Integer, primary_key=True)
    circuit = db.Column(db.JSON, nullable=False)
    optimized_circuit = db.Column(db.JSON, nullable=False)
    result = db.Column(db.JSON, nullable=False) 
 