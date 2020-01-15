var data = null;
var graph = null;
var reports = [];
var categoriesCount = [];
var groupsCount = [];
var myPieChart = null;
var categories = [];
var groups = [];
var colors = [];
var pieColors = [];
var loaded = false; 

function clearValues(){
    categoriesCount = [];
    groupsCount = [];
    categories = [];
    groups = [];
    reports = [];
    groupsCount = [];
    colors = [];
    pieColors = [];
}

async function getReports(){
    let locReports = [];
    clearValues();

    await db.collection("reports").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
           locReports.push(doc.data())
        });
    }); 

    await db.collection("categories").orderBy("name").get().then(function(querySnapshot){
        querySnapshot.forEach(function(doc){
             categories.push(doc.data().name)
        });
    });

    await db.collection("groups").orderBy("name").get().then(function(querySnapshot){
        querySnapshot.forEach(function(doc){
             groups.push(doc.data().name)
        });
    });
    
    reports = locReports;
    initializeCounts();
    console.log(groups);
    for(let i=0; i<reports.length; i++){
        for(let j=0; j<categories.length; j++){
            if(reports[i].category == categories[j])
                categoriesCount[j] += 1;
        }

        for(let k=0; k<groups.length; k++){
            if(reports[i].group - 1 == k ){
                console.log(groups[k]);
                groupsCount[k] += 1;
            }
                
        }
    }
}

function initializeCounts(){
    for(let i=0; i<categories.length; i++){
        categoriesCount[i] = 0; 
    }
    for(let i=0; i<groups.length; i++){
        groupsCount[i] = 0;
    }
}

function getData(x, y){
    let count = 0;
    for(let i=0; i<reports.length; i++){
        if(reports[i].category == categories[x] && reports[i].group == y+1)
            count+=1;
    }
    return count;
   
}

async function loadData(colorBy) {
    var steps = categories.length;
    var axisMax = steps;    
    var yAxisMax = groups.length;
    var axisStep = axisMax / steps;
    var z = 0;

    dataArray = [];
    for(let i=0; i<axisMax; i+=axisStep){
        for(let j=0; j<yAxisMax; j+=axisStep){
            z = getData((i/axisStep),(j/axisStep));
            color = colorBy == 1 ? colors[i] : colors[j];
            dataArray.push({x: i, y: j , z: z,  style: {
                fill:  color,
                stroke: "#999"
              }})
        }
    }


    // Create and populate a data table.
    data = new vis.DataSet();

    for (let i = 0; i < dataArray.length; i++) {
        data.add(dataArray[i]);
    }

    return dataArray;
}

function generateColors(sortBy){
    colors = []
    var r =  Math.floor((Math.random() *  255));
    let sortLength = sortBy == 1 ? categories.length : groups.length;
 
    for(let i=0; i<sortLength; i++){
        var r =  Math.floor((Math.random() *  255));
        var g =  Math.floor((Math.random() *  255));
        var b =  Math.floor((Math.random() *  255));
        stringColor =  "rgba(" +  r  + "," +  g  + "," + b ;
        colors[i] =  stringColor + ",1)";
        pieColors[i] = stringColor + ",0.4)";
    }
    
}

async function drawPie(data, groupBy) {
    let displayData = []
    let displayLabel = []
    if(groupBy == 1){
        displayData = categoriesCount;
        displayLabel = categories;
    }else{
        displayData = groupsCount;
        displayLabel = groups;
    }
    if(myPieChart!=null){
        myPieChart.destroy();
    }
    myPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: displayLabel,
            datasets: [{
                label: '# of Votes',
                data: displayData,
                backgroundColor: pieColors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {

        }
        
    });

}

// Called when the Visualization API is loaded.
async function drawVisualization(data) {
    // specify options
    var options = {
        width: "90%",
        height: "90%",
        style: 'bar-color',
        showPerspective: true,
        showGrid: true,
        showShadow: true,
        animationPreload: true,
        xLabel: "Categories",
        yLabel: "Groups",
        zLabel: "Number",
        xBarWidth: 0.5,
        yBarWidth: 0.5,

        // Option tooltip can be true, false, or a function returning a string with HTML contents
        //tooltip: true,
        tooltip: function (point) {
            // parameter point contains properties x, y, z
            return "Category: <b>"+ categories[point.x] + "</b> " + "Group: <b>" +  groups[point.y] +"</b> " + "Number: <b>" + point.z + "</b>";
        },

        xValueLabel: function(value) {
            if(value%1==0){
                return "Category " + categories[value];
            }
            return "";
        },

        yValueLabel: function(value) {
            if(value%1==0){
                return "Group " + groups[value];
            }
            return "";
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
}

window.addEventListener("load", async () => {
    isloaded = true;
    await getReports(); 
    generateColors(1);
    console.log(colors);
    loadData(1).then(function () {
        drawVisualization(data);
        drawPie(data, 1);
    });
    $("#reportCount").text(reports.length);
    $('#group').change(function(){
        generateColors(2);
        loadData(2).then(function () {
            drawVisualization(data);
            drawPie(data, 2);
        });
    });
    $('#category').change(function(){
        generateColors(1);
        loadData(1).then(function () {
            drawVisualization(data);
            drawPie(data, 1);
        });
    });

    db.collection("reports").onSnapshot(async function(querySnapshot) {   
        if(loaded){
            let displayBy = $('input[name="inlineRadioOptions"]:checked').val();
            await getReports(); 
            generateColors(displayBy);
            $("#reportCount").text(reports.length);
            loadData(displayBy).then(function () {
                alert("new report");
                console.log(displayBy);
                drawVisualization(data);
                drawPie(data, displayBy);
            });
        }else{
            loaded = true;
        }
    });
        
   
});