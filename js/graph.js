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
var csvData = [];

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

async function getReports() {
    clearValues();

    await db.collection("reports").get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
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

    for (let i = 0; i < reports.length; i++) {
        for (let j = 0; j < categories.length; j++) {
            if (reports[i].category == categories[j]) {
                categoriesCount[j] += 1;
            }
        }

        for (let k = 0; k < groups.length; k++) {
            if (reports[i].group - 1 == k) {
                groupsCount[k] += 1;
            }     
        }
    }

    initArray();
    byGroup();
    byCategory();
    findMax();
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
            dataArray.push({
                x: i, y: j, z: z, style: {
                    fill: color,
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

function generateColors(sortBy) {
    colors = [];
    let sortLength = sortBy == 1 ? categories.length : groups.length;

    for (let i = 0; i < sortLength; i++) {
        var r = Math.floor((Math.random() * 255));
        var g = Math.floor((Math.random() * 255));
        var b = Math.floor((Math.random() * 255));
        stringColor = "rgba(" + r + "," + g + "," + b;
        colors[i] = stringColor + ",1)";
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

function notifyReport(report) {
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
    let head = "<table id='reportsTable' class='table table-striped table-responsive' style='display:block;'>"+
    "<thead class='thead-inverse bg-custom text-custom'>"+
    "<tr>"+
    "<th style='width:8em; text-align:center;'>User</th>"+
    "<th style='width:6em; text-align:center;'>Group</th>"+
    "<th style='width:6em; text-align:center;'>Category</th>"+
    "<th style='width:12em; text-align:center;'>Date "+"</th>" +
    "<td style='width:0.5em;'>"+
        "<div class='btn-group'>"+
            "<button type='button' class='btn btn-secondary dropdown-toggle p-0 m-0' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'></button>"+
            "<div class='dropdown-menu'>"+
            "<button class='dropdown-item' onClick='download()' style='display: block;width: 20px;padding-bottom: 0px;'>"+
            "<i class='fa fa-download'></i>"+
            "</button>"+
            "</div>"+
            "</div>"+
    "</td>" +
    "</th></tr></thead>"
    //Add body
    let body = '<tbody class="scroll-secondary">';
    reports.forEach(function (report) {
        if (typeof cCtr[report.category] === "undefined") {
            cCtr[report.category] = 0;
        } else {
            cCtr[report.category] += 1;
        }
        if (typeof gCtr[report.group] === "undefined") {
            gCtr[report.group] = 0;
        } else {
            gCtr[report.group] += 1;
        }
        let date = new Date((report.created.seconds * 1000));
        body += "<tr>" +
            "<td style='width:8em;'>" + report.username + "</td>" +
            "<td style='width:6em;'>" + report.group + "</td>" +
            "<td style='width:6em;'>" + report.category + "</td>" +
            "<td style='width:12em;display:flex;justify-content:space-between;'>" + date.toLocaleString('en') + "</td><td style='width:0.5em;'></td>"+
            "</tr>"

        csvData.push({
            user: report.username,
            group: report.group,
            category: report.category,
            date: (date.getMonth() + 1) + "-" + date.getDay() + "-" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes()
        })
    })

    $.each(cCtr, function (key, value) {
        if (cat["value"] < value || typeof cat["value"] === "undefined") {
            cat = { key, value }
        }
    });

    $.each(gCtr, function (key, value) {
        if (group["value"] < value || typeof group["value"] === "undefined") {
            group = { key, value }
        }
    });

    $('#allReports > div:last-child').append(head + body + '</tbody></table>');

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

    $('#group').change(function () {
        generateColors(2);
        loadData(2).then(function () {
            drawVisualization(data);
            drawPie(2);
        });
    });

    $('#category').change(function () {
        generateColors(1);
        loadData(1).then(function () {
            drawVisualization(data);
            drawPie(1);
        });
    });

    db.collection("reports").orderBy("created", "desc").onSnapshot(async function (querySnapshot) {
        if (loaded) {
            let displayBy = $('input[name="inlineRadioOptions"]:checked').val();
            await getReports();
            generateColors(displayBy);

            $("#reportCount").text(reports.length);
            loadData(displayBy).then(function () {
                notifyReport(querySnapshot.docs[0]);
                drawVisualization(data);
                drawPie(displayBy);
            });

        } else {
            loaded = true;
        }
    });

    generateColors2d();
    initSearchValue();
    drawVisualization2d2(search);

});

function convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}

function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
        items.unshift(headers);
    }

    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    var csv = this.convertToCSV(jsonObject);

    var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function download() {
    let headers = {
        user: 'Username',
        group: "Group",
        category: "Category",
        date: "Date"
    };
    let csvDataFormated = [];
    // format the data
    csvData.forEach((item) => {
        csvDataFormated.push({
            user: item.user,
            group: item.group,
            category: item.category,
            date: item.date
        });
    });

    let date = new Date(Date.now())
    let formatedDate = (date.getMonth() + 1) + "-" + date.getDay() + "-" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes()
    var fileTitle = 'reports(' + formatedDate +")"

    exportCSVFile(headers, csvDataFormated, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
}