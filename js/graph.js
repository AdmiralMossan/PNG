var data = null;
var graph = null;

function custom(x, y) {
    return (-Math.sin(x / Math.PI) * Math.cos(y / Math.PI) * 10 + 10) * 100;
}

async function getData(x, y){
    let count = 0;
    categories = ["A", "B", "C"];
    await db.collection("reports").where( "category" , "==" , categories[x] ).where( "group" , "==" , y+1 ).get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            count+=1;
        });
    }); 
    return count;
    
}
// Called when the Visualization API is loaded.
async function drawVisualization() {
    var style = "bar";//document.getElementById("style").value;
    var withValue =
        ["bar-color", "bar-size", "dot-size", "dot-color"].indexOf(style) != -1;

    // Create and populate a data table.
    data = new vis.DataSet();

    //x: Category, y: Group, z: Number
    // all inputs are of data type Number
    //var x = 0, y = 0, z = 0;
    //data.add({ x: x, y: y, z: z });
    // -----------remove this part-------
    var steps = 3; 
    var axisMax = 3;
    var yAxisMax = 3;
    var axisStep = axisMax / steps;
    var z = 0;

    dataArray = []
    for(let i=0; i<3; i+=axisStep){
        for(let j=0; j<3; j+=axisStep){
            z = await getData((i/axisStep),(j/axisStep));
            console.log(z);
            dataArray.push({x: i, y: j , z: z})
        }
    }

    for(let i=0; i<dataArray.length; i++){
        data.add(dataArray[i]);
    }
    // for (var x = 0; x < axisMax; x += axisStep) {
    //     for (var y = 0; y < yAxisMax; y += axisStep) {
    //         //var z = custom(x, y);
    //         z+=5;
    //         if (withValue) {
    //             var value = y - x;
    //             data.add({ x: x, y: y, z: z, style: value });
    //         } else {
    //             data.add({ x: x, y: y, z: z });
    //         }
    //     }
    // }
    // -----------remove this part END-------

    // specify options
    var options = {
        width: "600px",
        height: "600px",
        style: style,
        showPerspective: true,
        showGrid: true,
        showShadow: false,
        xLabel: "Category",
        yLabel: "Groups",
        zLabel: "Number",
        xBarWidth: 0.5,
        yBarWidth: 0.5,


        // Option tooltip can be true, false, or a function returning a string with HTML contents
        //tooltip: true,
        tooltip: function(point) {
            // parameter point contains properties x, y, z
            return "Number: <b>" + point.z + "</b>";
        },

        xValueLabel: function(value) {
            switch(value){
                case 0: return "A";
                case 1: return "B";
                case 2: return "C";
                default: return "";
            }
        },

        yValueLabel: function(value) {
            switch(value){
                case 0: return "Group I";
                case 1: return "Group II";
                case 2: return "Group III";
                default: return "";
            }
        },

        zValueLabel: function(value) {
            return value;
        },

        keepAspectRatio: true,
        verticalRatio: 0.5
    };

    var camera = graph ? graph.getCameraPosition() : null;

    // create our graph
    var container = document.getElementById("mygraph");
    graph = new vis.Graph3d(container, data, options);

    if (camera) 
        graph.setCameraPosition(camera); // restore camera position

    //document.getElementById("style").onchange = drawVisualization;
}

window.addEventListener("load", () => {
    drawVisualization();
});
