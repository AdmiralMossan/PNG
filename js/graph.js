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

function clearValues() {
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
    clearValues();

    await db.collection("reports").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
           reports.push(doc.data())
        });
    });

    await db.collection("categories").orderBy("name").get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            categories.push(doc.data().name)
        });
    });

    await db.collection("groups").orderBy("name").get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            groups.push(doc.data().name)
        });
    });
    
    initializeCounts();
    
    for(let i=0; i<reports.length; i++){
        for(let j=0; j<categories.length; j++){
            if(reports[i].category == categories[j]){
                categoriesCount[j] += 1;
            }
        }

        for (let k = 0; k < groups.length; k++) {
            if (reports[i].group - 1 == k) {
                groupsCount[k] += 1;
            }     
        }
    }
}

function initializeCounts() {
    for (let i = 0; i < categories.length; i++) {
        categoriesCount[i] = 0;
    }
    for (let i = 0; i < groups.length; i++) {
        groupsCount[i] = 0;
    }
}

function getData(x, y) {
    let count = 0;
    for (let i = 0; i < reports.length; i++) {
        if (reports[i].category == categories[x] && reports[i].group == y + 1)
            count += 1;
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
            z = getData((i),(j));
            color = colorBy == 1 ? colors[i] : colors[j];
            dataArray.push({x: i, y: j , z: z,  style: {
                fill:  color,
                stroke: "#999"
              }
            })
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
    colors = [];
    let sortLength = sortBy == 1 ? categories.length : groups.length;
 
    for(let i=0; i<sortLength; i++){
        var r = Math.floor((Math.random() *  255));
        var g = Math.floor((Math.random() *  255));
        var b = Math.floor((Math.random() *  255));
        stringColor =  "rgba(" +  r  + "," +  g  + "," + b ;
        colors[i] =  stringColor + ",1)";
        pieColors[i] = stringColor + ",0.4)";
    }

}

async function drawPie(groupBy) {
    let displayData = []
    let displayLabel = []
    if (groupBy == 1) {
        displayData = categoriesCount;
        displayLabel = categories;
    } else {
        displayData = groupsCount;
        displayLabel = groups;
    }
    if (myPieChart != null) {
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
        axisFontType: "courier",
        axisFontSize: 35,
        xLabel: "", //Categories
        yLabel: "", //Groups
        zLabel: "", //Number
        xBarWidth: 0.5,
        yBarWidth: 0.5,
        rotateAxisLabels: true,

        tooltip: function (point) {
            // parameter point contains properties x, y, z
            return "Category: <b>" + categories[point.x] + "</b> " + "Group: <b>" + groups[point.y] + "</b> " + "Number: <b>" + point.z + "</b>";
        },

        xValueLabel: function (value) {
            if (value % 1 == 0) {
                return "Category " + categories[value];
            }
            return "";
        },

        yValueLabel: function (value) {
            if (value % 1 == 0) {
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

    graph.setCameraPosition({ horizontal: -1.85, vertical: 0.6, distance: 2 }); // restore camera position
}



// function newReport(recentReports){
//     var today = new Date();
//     var list = document.getElementById("recentReports");
//     list.innerHTML = "";
//     for(let i=0; i<3; i++){   
//         let active = loaded && i==0 ? "active" : "";
//         list.innerHTML +=   `<li  class="list-group-item list-group-item-action flex-column align-items-start ` + active +`">
//         <div class=\"d-flex w-100 justify-content-between\">
//           <h6 class=\"mb-1\">Username: ` + recentReports[i].data().username + ` Category: ` + recentReports[i].data().category +  ` Group: ` + recentReports[i].data().group + `
//           <small>` + recentReports[i].data().created.toDate().toLocaleString() +`</small></h6>
//         </div>    
//       </li>`;
//     }
// }

function notifyReport(report){
    PNotify.info({
        title: 'New Report',
        text: 'Username: ' +  report.data().username  + ' Category: ' + report.data().category + ' Group: ' + report.data().group + " " + report.data().created.toDate().toLocaleString(),
        delay: 3000,
        modules: {
          Buttons: {
             closer: true,
             closerHover: true,
             sticker: false,
          },
          Desktop: {
            desktop: true,
            fallback: true,
            icon: null,
          },
          Mobile: {
            swipeDismiss: true,
            styling: true   
          }

        }
    });
}


async function reportsTable() {
    let cat = {}
    let group = {};
    let cCtr = {}
    let gCtr = {}
    //Add Head
    let head = "<table id='reportsTable' class='table table-striped table-responsive' style='display:block;'><thead class='thead-inverse bg-custom text-custom'><tr><th style='width:7em;'>User</th><th style='width:5em;'>Group</th><th style='width:5em;'>Category</th><th style='width:7em;'>Date</th></tr></thead>"
    //Add body
    let body = '<tbody class="scroll-secondary">';
    reports.forEach(function (report) {
        if(typeof cCtr[report.category] === "undefined"){
            cCtr[report.category] = 0;
        }else{
            cCtr[report.category] += 1;
        }
        if(typeof gCtr[report.group] === "undefined"){
            gCtr[report.group] = 0;
        }else{
            gCtr[report.group] += 1;
        }

        let date = new Date((report.created.seconds * 1000));
        let formatedDate = (date.getMonth() + 1) + "-" + date.getDay() + "-" + date.getFullYear() + "<span>" + date.getHours() + ":" + date.getMinutes() +"</span>"
        body += "<tr>" +
            "<td style='width:7em;'>" + report.username + "</td>" +
            "<td style='width:5em;'>" + report.group + "</td>" +
            "<td style='width:5em;'>" + report.category + "</td>" +
            "<td style='width:7em;display:flex;justify-content:space-between;'>" + formatedDate + "</td>" +
            "</tr>"
    })
    console.log(cCtr)
    $.each( cCtr, function( key, value ) {
        if(cat["value"] < value || typeof cat["value"] === "undefined"){
            cat = {key,value}
        }
      });

      $.each( gCtr, function( key, value ) {
        if(group["value"] < value || typeof group["value"] === "undefined"){
            group = {key,value}
        }
      });

      $('#allReports > div:last-child').append(head+body + '</tbody></table>');
    
      $("#categoryCount").text(cat["key"]);
      $("#groupCount").text(group["key"]);
      $("#reportCount2").text(reports.length);
      
    }


window.addEventListener("load", async () => {
    isloaded = true;
    await getReports();
    await reportsTable();
    generateColors(1);
    loadData(1).then(function () {
        drawVisualization(data);
        drawPie(1);
    });

    $("#reportCount").text(reports.length);
    
    $('#group').change(function(){
        generateColors(2);
        loadData(2).then(function () {
            drawVisualization(data);
            drawPie(2);
        });
    });
    
    $('#category').change(function(){
        generateColors(1);
        loadData(1).then(function () {
            drawVisualization(data);
            drawPie(1);
        });
    });

    db.collection("reports").orderBy("created", "desc").onSnapshot(async function(querySnapshot) {
        if(loaded){
            let displayBy = $('input[name="inlineRadioOptions"]:checked').val();
            await getReports();
            generateColors(displayBy);
            
            $("#reportCount").text(reports.length);
            loadData(displayBy).then(function () {
                notifyReport(querySnapshot.docs[0]);
                drawVisualization(data);
                drawPie(displayBy);
            });
        
        }else{
            loaded = true;        
        }
    });


        
});