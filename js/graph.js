var data = null;
var graph = null;

function custom(x, y) {
    return (-Math.sin(x / Math.PI) * Math.cos(y / Math.PI) * 10 + 10) * 100;
}

async function getData(x, y) {
    let count = 0;
    categories = ["A", "B", "C"];
    await db.collection("reports").where("category", "==", categories[x]).where("group", "==", y + 1).get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            count += 1;
        });
    });
    return count;


}

async function loadData() {
    var steps = 3;
    var axisMax = 3;
    var yAxisMax = 3;
    var axisStep = axisMax / steps;
    var z = 0;

    let dataArray = [];

    for (let i = 0; i < 3; i += axisStep) {
        for (let j = 0; j < 3; j += axisStep) {
            z = await getData((i / axisStep), (j / axisStep));
            console.log(z);
            dataArray.push({ x: i, y: j, z: z })
        }
    }


    // Create and populate a data table.
    data = new vis.DataSet();

    for (let i = 0; i < dataArray.length; i++) {
        data.add(dataArray[i]);
    }

    return dataArray;
}


async function drawPie(data) {
    var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [
                    
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {

        }
    });

}

// Called when the Visualization API is loaded.
async function drawVisualization(data) {
    console.log(data);
    var style = "bar";//document.getElementById("style").value;
    var withValue =
        ["bar-color", "bar-size", "dot-size", "dot-color"].indexOf(style) != -1;



    // specify options
    var options = {
        width: "90%",
        height: "90%",
        style: 'bar',
        showPerspective: true,
        showGrid: true,
        showShadow: true,
        animationPreload: true,
        xLabel: "Category",
        yLabel: "Groups",
        zLabel: "Number",
        xBarWidth: 0.5,
        yBarWidth: 0.5,

        // Option tooltip can be true, false, or a function returning a string with HTML contents
        //tooltip: true,
        tooltip: function (point) {
            // parameter point contains properties x, y, z
            return "Number: <b>" + point.z + "</b>";
        },

        xValueLabel: function (value) {
            switch (value) {
                case 0: return "A";
                case 1: return "B";
                case 2: return "C";
                default: return "";
            }
        },

        yValueLabel: function (value) {
            switch (value) {
                case 0: return "Group I";
                case 1: return "Group II";
                case 2: return "Group III";
                default: return "";
            }
        },

        zValueLabel: function (value) {
            return value;
        },

        keepAspectRatio: true,
        verticalRatio: 0.5
    };


    // create our graph
    var container = document.getElementById("mygraph");
    graph = new vis.Graph3d(container, data, options);

    graph.setCameraPosition({ horizontal: 0.0, vertical: 0.0, distance: 2 }); // restore camera position

    //document.getElementById("style").onchange = drawVisualization;
}

window.addEventListener("load", () => {
    loadData().then(function () {
        drawVisualization(data);
        drawPie(data);
    });
});

