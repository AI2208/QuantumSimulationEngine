// Used to create state labels
function createLabelTrace(label, position) {
    return {
        x: [position.x],
        y: [position.y],
        z: [position.z],
        type: 'scatter3d',
        mode: 'text',
        text: [label],
        textfont: {
            size: 20,
            color: 'white'
        },
        hoverinfo: 'skip',
        showscale: false
    };
}

// Defining state labels and positions
var plusPosition = { x: 1.1, y: 0, z: -0.1 };  
var minusPosition = { x: -1.1, y: 0, z: -0.1 };
var iPosition = { x: 0, y: 1.1, z: -0.1 };
var minusIPosition = { x: 0, y: -1.1, z: -0.1 };

var labelPlus = createLabelTrace('|+〉', plusPosition);
var labelMinus = createLabelTrace('|-〉', minusPosition);
var labelI = createLabelTrace('|+i〉', iPosition);
var labelMinusI = createLabelTrace('|-i〉', minusIPosition);


// Initialise plot
function set_plot(data) {
    const config = {
        responsive:true,
        displayModeBar: false
    };
    var layout = {
        scene: {
            bgcolor: "#0d1213",
            xaxis: {
                ticks: '',
                showticklabels: false,
                range: [-1.1,1.1],
                showspikes: false,
                showgrid: false,
                zeroline: false,
                showline: false,
                visible: false
            }, 
            yaxis: {
                ticks: '',
                showticklabels: false,
                range: [-1.1,1.1],
                showspikes: false,
                showgrid: false,
                zeroline: false,
                showline: false,
                visible: false
            },
            zaxis: {
                ticks: '',
                showticklabels: false,
                range: [-1.1,1.1],
                showspikes: false,
                showgrid: false,
                zeroline: false,
                showline: false,
                visible: false
            },
            camera: {
                projection: 'perspective',
                eye: {
                    x:-0.9, y:1, z:0.3
                },
                center: {
                    x:0, y:0,z:0
                },
            }
        },
        hovermode:'closest',
        margin: {l: 0, r: 0, b: 0, t: 0}, 
        showlegend: false,
    };
    data.push(labelPlus, labelMinus, labelI, labelMinusI);
    Plotly.react('blochDiv', data, layout,config);
}

function cylinderAxes(vector, baseVector = [2, 0, 0]) {
    const dotProduct = math.dot(vector, baseVector);
    let orthogonalComponent = math.subtract(baseVector, math.multiply(dotProduct, vector));
    let normalizedOrthogonal = math.divide(orthogonalComponent, math.norm(orthogonalComponent));
    let perpendicularVector = math.divide(math.cross(vector, normalizedOrthogonal), math.norm(math.cross(vector, normalizedOrthogonal)));

    return [normalizedOrthogonal, perpendicularVector];
}

function grid(xValues, yValues) {
    const gridX = new Array(yValues.length).fill(xValues);
    const gridY = yValues.map(value => new Array(xValues.length).fill(value));
    return [gridX, gridY];
}

function linspace(start, end, numPoints = Math.max(Math.round(end - start) + 1, 1)) {
    if (numPoints < 2) return numPoints === 1 ? [start] : [];
    return Array.from({ length: numPoints }, (_, i) => (i * end + (numPoints - i) * start) / (numPoints - 1));
}

function create_vector(inputVector, normalize = true) {
    const color = "rgb(230,255,255)";
    let [u, v, w] = inputVector;

    if (normalize) {
        const length = math.norm([u, v, w]);
        [u, v, w] = [u, v, w].map(component => component / length);
    }

    const zAxis = [u, v, w];
    const [orthogonal, perpendicular] = cylinderAxes(zAxis);

    const generateAxisArray = (axisIndex, radius, length, phi) => [
        (orthogonal[axisIndex] * Math.cos(phi) + perpendicular[axisIndex] * Math.sin(phi)) * radius,
        (orthogonal[axisIndex] * Math.cos(phi) + perpendicular[axisIndex] * Math.sin(phi)) * radius + zAxis[axisIndex] * length
    ];

    const axisArrays = { x: [], y: [], z: [] };
    for (let i = 0; i <= 6; i++) {
        const phi = Math.PI * i / 3;
        const radius = 0.024;
        const length = 0.8;
        ['x', 'y', 'z'].forEach((axis, index) => {
            axisArrays[axis].push(generateAxisArray(index, radius, length, phi));
        });
    }
    const head = {
        u: [0.4 * u],
        v: [0.4 * v],
        w: [0.4 * w],
        x: [u],
        y: [v],
        z: [w],
        sizemode: 'absolute',
        sizeref: .22,
        colorscale: [['0.0', color], ['1.0', color]],
        showscale: false,
        type: 'cone',
        anchor: 'tip',
        hoverinfo: 'skip'
    };
    const tail = {
        name: 'tail',
        ...axisArrays,
        type: 'surface',
        contours: { x: { highlight: false }, y: { highlight: false }, z: { highlight: false } },
        colorscale: [['0.0', color], ['1.0', color]],
        showscale: false,
        opacity: 1.0,
    };
    return [head, tail];
}

function createBlochSphere() {
    // Define theta and phi for sphere coordinates
    const theta = linspace(0, Math.PI, 20);
    const phi = linspace(0, 2 * Math.PI, 40);

    // Create a meshgrid of theta and phi
    const [u, v] = grid(theta, phi);

    // Calculate the cartesian coordinates for the sphere
    const sinU = math.map(u, math.sin);
    const xs = math.dotMultiply(math.map(v, math.cos), sinU);
    const ys = math.dotMultiply(math.map(v, math.sin), sinU);
    const zs = math.map(u, math.cos);

    // Initialize arrays for gridlines
    let xGrid = [], yGrid = [], zGrid = [];
    let xBoldGrid = [], yBoldGrid = [], zBoldGrid = [];

    // Calculate the longitude lines on the sphere
    for (let i = 0; i < 14; i++) {
        const t = i * Math.PI / 7;
        const xCurrent = math.multiply(math.map(theta, math.sin), math.cos(t));
        const yCurrent = math.multiply(math.map(theta, math.sin), math.sin(t));
        const zCurrent = math.map(theta, math.cos);

        // Check for highlighted lines
        if ([0, 3, 6, 9].includes(i)) {
            xBoldGrid.push(...xCurrent, null);
            yBoldGrid.push(...yCurrent, null);
            zBoldGrid.push(...zCurrent, null);
        } else {
            xGrid.push(...xCurrent, null);
            yGrid.push(...yCurrent, null);
            zGrid.push(...zCurrent, null);
        }
    }

    // Calculate the latitude lines on the sphere
    for (let i = 1; i < 12; i++) {
        const t = i * Math.PI / 8;
        const xCurrent = math.multiply(math.map(phi, math.cos), math.sin(t));
        const yCurrent = math.multiply(math.map(phi, math.sin), math.sin(t));
        const zCurrent = Array(phi.length).fill(math.cos(t));

        // Check for highlighted lines
        if ([3].includes(i)) {
            xBoldGrid.push(...xCurrent, null);
            yBoldGrid.push(...yCurrent, null);
            zBoldGrid.push(...zCurrent, null);
        } else {
            xGrid.push(...xCurrent, null);
            yGrid.push(...yCurrent, null);
            zGrid.push(...zCurrent, null);
        }
    }

    // Sphere surface configuration
    const sphere = {
        name: 'sphere',
        x: xs, y: ys, z: zs,
        type: 'surface',
        colorscale: [['0.0', 'rgb(0, 255, 255)'], ['1.0', 'black']],
        showscale: false,
        opacity: 0.1,
        hoverinfo: 'skip',
        contours: {x : {highlight: false},y : {highlight: false},z : {highlight: false}}
    };

    // Equator plane configuration
    const equatorPlane = {
        name: 'equator_plane',
        x: xs, y: ys, z: math.multiply(zs, 0),
        type: 'surface',
        colorscale: [['0.0', 'cyan'], ['1.0', 'cyan']],
        showscale: false,
        opacity: 0.04,
        hoverinfo: 'skip'
    };

    // Regular gridlines configuration
    const gridlines = {
        name: 'gridlines_bold',
        x: xGrid, y: yGrid, z: zGrid,
        type: 'scatter3d',
        mode: 'lines',
        opacity: 0.05,
        line: { color: 'white', width: 2 },
        showscale: false,
        hoverinfo: 'skip'
    };  

    // Bold gridlines configuration
    const gridlinesBold = {
        name: 'gridlines_bold',
        x: xBoldGrid, y: yBoldGrid, z: zBoldGrid,
        type: 'scatter3d',
        mode: 'lines',
        opacity: 0.05,
        line: { color: 'white', width: 3 },
        showscale: false,
        hoverinfo: 'skip'
    };
    

    // Axes configuration
    const axes = {
        name: 'axes',
        x: [-1, 1, null, 0, 0, null, 0, 0],
        y: [0, 0, null, -1, 1, null, 0, 0],
        z: [0, 0, null, 0, 0, null, -1, 1],
        type: 'scatter3d',
        mode: 'lines+text',
        opacity: 0.5,
        line: { color: 'cyan', width: 4 },
        text: ["", "x", "", "", "y", "", "", "|0〉", ""],
        textfont: { size: 28, color: "cyan" },
        textposition: 'top center',
        showscale:false,
        showspikes:false,
        hoverinfo: 'skip'
    };

    // Lower tag configuration
    const lowerTag = {
        x: [0], y: [0], z: [-1],
        type: 'scatter3d',
        mode: 'text',
        opacity: 0.5,
        line: { color: 'white', width: 3 },
        text: ["|1〉"],
        textfont: { size: 28, color: "cyan" },
        textposition: 'bottom center',
        showscale:false,
        showspikes:false,
        hoverinfo: 'skip'
    };
    return [sphere, gridlines, gridlinesBold, equatorPlane, axes, lowerTag];
}


function updatePlot(full_update=false) {
    // Update the state vector
    point_vector = stateToVector(PSIVECTOR[PSIVECTOR.length-1]);
    new_data = create_vector(point_vector);
    set_plot(BLOCHSPHERE.concat(new_data)); 

    // Update the state vector display
    const currentState = PSIVECTOR[PSIVECTOR.length-1];
    const alpha = math.format(currentState.subset(math.index(0)), {notation: 'fixed', precision: 2});
    const beta = math.format(currentState.subset(math.index(1)), {notation: 'fixed', precision: 2});

    // Format the state vector string
    const stateVectorStr = `|\u03C8<sub>current</sub>〉 = (${alpha})|0〉 + (${beta})|1〉`;

    // Update the div content
    document.getElementById('state').innerHTML = stateVectorStr;
}
