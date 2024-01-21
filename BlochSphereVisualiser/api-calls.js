// Checks that circuit ID is non-empty and fetches circuit from database 
function fetchCircuitAndApply() {
    var circuitID = document.getElementById('jobID').value;

    if (circuitID) {
        fetch(`http://13.49.145.179:5001/job/${circuitID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error in server response.');
                }
                return response.json();
            })
            .then(data => {
               document.getElementById('responseContent').textContent = JSON.stringify(data, null, 2);

               if (data.optimized_circuit) {
                    applyCircuitToQubit(data.optimized_circuit); 
                } 
                else {
                    applyCircuitToQubit(data.circuit);
                }
            })
            .catch(error => {
                console.error('Error fetching circuit:', error);
            });
    } else {
        alert("Error: Circuit ID cannot be empty!");
    }
}
