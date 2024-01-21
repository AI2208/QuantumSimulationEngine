document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('circuitForm').addEventListener('submit', function(event) {
        console.log('Form submitted');
        event.preventDefault();

        let circuitData = document.getElementById('circuitInput').value;
        let requestData = { circuit: JSON.parse(circuitData) };
        
        fetch('/job', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('result').innerHTML = 'Result: ' + JSON.stringify(data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
});
