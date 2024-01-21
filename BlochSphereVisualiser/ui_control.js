// Initial state of qubit
const DEFAULT_STATE_VECTOR = math.matrix([1, 0]);

// Initialises state of qubit to default state
function initializePlot() {
    PSIVECTOR = [DEFAULT_STATE_VECTOR];
    BLOCHSPHERE = createBlochSphere();
    PSIARROW = create_vector(stateToVector(PSIVECTOR[PSIVECTOR.length - 1]));
    set_plot(BLOCHSPHERE.concat(PSIARROW));
    document.getElementById('state').innerHTML = '|&psi;<sub>current</sub>〉 = 1|0〉 + 0|1〉';
}

// Returns to previous state (undoes last gate applied)
function undo() {
    // Checks if a previous state exists
    if (PSIVECTOR.length > 1){ 
        PSIVECTOR.pop();
        updatePlot();
    }
}

// Rotates qubit by specified angle
function rotate_state(axis,angle) {
    PSIVECTOR.push(rotate(axis,angle,PSIVECTOR[PSIVECTOR.length-1]));
    updatePlot();
}

initializePlot();