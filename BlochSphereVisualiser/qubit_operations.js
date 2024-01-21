
// Validates circuit and applies each gate in turn to qubit 
function applyCircuitToQubit(circuit) {
    if (!circuit || !circuit.length) {
        console.error("Invalid or empty circuit data");
        Materialize.toast('Invalid or empty circuit data', 4000);
        return;
    }
    circuit.forEach(gate => {
        // Convert gate amount to radians
        var angleInRadians = gate.amount * Math.PI / 180;

        switch (gate.axis) {
            case 'X':
            case 'Y':
            case 'Z':
                console.log("New gate added: "+gate.axis+" with angle: "+gate.amount);
                rotate_state(gate.axis.toLowerCase(), angleInRadians);
                break;
            default:
                console.error("Unknown gate axis:", gate.axis);
                Materialize.toast('Unknown gate axis: ' + gate.axis, 4000); 
        }
    });
}

// Rotate a quantum state by a specified angle around a given axis.
function rotate(axis, angle, ...state) {
    let rotmat;
    // Determine the rotation operator based on the axis specified.
    if (typeof(axis) === 'string') {
        switch (axis) {
            case 'x':
                rotmat = math.matrix([[0, math.complex(0.5, 0)], [math.complex(0.5, 0), 0]]);
                break;
            case 'y':
                rotmat = math.matrix([[0, math.complex(0, -0.5)], [math.complex(0, 0.5), 0]]);
                break;
            case 'z':
                rotmat = math.matrix([[math.complex(0.5, 0), 0], [0, math.complex(-0.5, 0)]]);
                break;
            default:
                throw new Error('Unknown axis string');
        }
    } else {
        rotmat = axis;
    }
    const rot_operator = math.expm(math.multiply(math.complex(0, -angle), rotmat));
    // If no state is specified, return the rotation operator. Otherwise, apply the rotation to the given state.
    return state.length === 0 ? rot_operator : math.multiply(rot_operator, state[0]);
}

// Converts a quantum state into a Bloch vector.
function stateToVector(state) {

    // Extract the elements of the state matrix
    const [u, v] = state.toArray();

    // Compute the inner products: <state_0|state_1>, <state_0|state_0>, <state_1|state_1>
    const mat01 = math.multiply(u, math.conj(v));
    const mat00 = math.multiply(u, math.conj(u));
    const mat11 = math.multiply(v, math.conj(v));

    // Calculate the components of the Bloch vector
    const a = -2 * math.re(mat01);
    const b = 2 * math.im(mat01);
    const c = math.re(mat00 - mat11);

    return [a, b, c];
}
  
  