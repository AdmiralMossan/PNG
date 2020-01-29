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

  await db
    .collection("reports")
    .orderBy("created", "desc")
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        reports.push(doc.data());
      });
    });

  await db
    .collection("categories")
    .orderBy("id")
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        categories.push(doc.data().name);
      });
    });

  await db
    .collection("groups")
    .orderBy("id")
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        groups.push(doc.data().name);
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
  console.log(steps);
  var z = 0;

  dataArray = [];
  for (let i = 0; i < axisMax; i += axisStep) {
    for (let j = 0; j < yAxisMax; j += axisStep) {
      z = getData(i, j);
      color = colorBy == 1 ? colors[i] : colors[j];
      dataArray.push({
        x: i,
        y: j,
        z: z,
        style: {
          fill: color,
          stroke: "#999"
        }
      });
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
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    stringColor = "rgba(" + r + "," + g + "," + b;
    colors[i] = stringColor + ",1)";
    pieColors[i] = stringColor + ",0.4)";
  }
}

// Called when the Visualization API is loaded.
async function drawVisualization(data) {
  // specify options
  var options = {
    width: "100%",
    style: "bar-color",
    showPerspective: true,
    showGrid: true,
    showShadow: true,
    animationPreload: true,
    axisFontType: "arial",
    axisFontSize: 30,
    xLabel: "    Category    ", //Categories
    yLabel: "    Group    ", //Groups
    zLabel: "  Number  ", //Number
    xBarWidth: 0.5,
    yBarWidth: 0.5,
    rotateAxisLabels: true,
    xCenter: "45%",
    yCenter: "34%",
    xStep: 1,
    yStep: 1,
    zStep: 1,

    tooltip: function (point) {
      // parameter point contains properties x, y, z
      return (
        "Category: <b>" +
        categories[point.x] +
        "</b> " +
        "Group: <b>" +
        groups[point.y] +
        "</b> " +
        "Number: <b>" +
        point.z +
        "</b>"
      );
    },

    xValueLabel: function (value) {
      if (value % 1 == 0) {
        return "  " + categories[value];
      }
      return "";
    },

    yValueLabel: function (value) {
      if (value % 1 == 0) {
        return "  " + groups[value];
      }
      return "";
    },

    zValueLabel: function (value) {
      return value;
    },

    keepAspectRatio: true
  };

  // create our graph
  var container = document.getElementById("mygraph");
  graph = new vis.Graph3d(container, data, options);

  graph.setCameraPosition({ horizontal: 1.2, vertical: 0.3, distance: 2.3 }); // restore camera position
}

function notifyReport(report) {
  PNotify.info({
    title: "New Report",
    text:
      "Username: " +
      report.data().username +
      " Category: " +
      report.data().category +
      " Group: " +
      report.data().group +
      " " +
      report
        .data()
        .created.toDate()
        .toLocaleString(),
    delay: 3000,
    modules: {
      Buttons: {
        closer: true,
        closerHover: true,
        sticker: false
      },
      Desktop: {
        desktop: true,
        fallback: true,
        icon: null
      },
      Mobile: {
        swipeDismiss: true,
        styling: true
      }
    }
  });
}

async function reportsTable() {
  let cat = {};
  let group = {};
  let cCtr = {};
  let gCtr = {};
  let ctr = 0;

  //Add Head
  let head =
    "<table id='reportsTable' class='table table-striped table-responsive' style='display:block;'>" +
    "<thead class='thead-inverse bg-custom text-custom'>" +
    "<tr>" +
    "<th style='width:4em; text-align:center;'>User</th>" +
    "<th style='width:8em; text-align:center;'>Group</th>" +
    "<th style=' text-align:center;'>Category</th>" +
    "<th style='width:16em; text-align:center;'>Date " +
    "</th>" +
    "<th style='width:0.5em;'>" +
    "<div class='btn-group'>" +
    "<a href='javascript:download()' title='Download as CSV' class='material-icons' style='text-decoration:none'>cloud_download</a>" +
    "</div>" +
    "</th>" +
    "</th></tr></thead>";

  let head2 =
    "<table id='reportsTable2' class='table m-0 table-responsive' style='display:block;'>" +
    "<thead class='bg-custom text-custom'>" +
    "<tr>" +
    "<th style='width:4em; text-align:center;' class='p-0'>User</th>" +
    "<th style='width:10em; text-align:center;' class='p-0'>Group</th>" +
    "<th style='width:2em; text-align:center;' class='p-0'>Category</th>" +
    "</td>" +
    "</th></tr></thead>";

  //Add body
  let body2 = '<tbody class="scroll-secondary">';
  let body = '<tbody class="scroll-secondary">';
  reports.forEach(function (report) {
    ctr += 1;
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

    let date = new Date(report.created["seconds"] * 1000);

    body +=
      "<tr>" +
      "<td style='width:8em;'>" +
      report.username +
      "</td>" +
      "<td style='width:6em;'>" +
      report.group +
      "</td>" +
      "<td style='width:6em;'>" +
      report.category +
      "</td>" +
      "<td style='width:12em;display:flex;justify-content:space-between;'>" +
      report.created.toDate().toLocaleString("en-US") +
      "</td><td style='width:0.5em;'></td>" +
      "</tr>";
    if (ctr <= 5) {
      body2 +=
        "<tr>" +
        "<td style='width:12em;'>" +
        report.username +
        "</td>" +
        "<td style='width:14em;'>" +
        report.group +
        "</td>" +
        "<td style='width:6em;'>" +
        report.category +
        "</td>" +
        "</tr>";
    }
    csvData.push({
      user: report.username,
      group: report.group,
      category: report.category,
      date:
        date.getMonth() +
        1 +
        "-" +
        date.getDay() +
        "-" +
        date.getFullYear() +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes()
    });
  });

  $.each(cCtr, function (key, value) {
    if (cat["value"] < value || typeof cat["value"] === "undefined") {
      cat = { key, value };
    }
  });

  $.each(gCtr, function (key, value) {
    if (group["value"] < value || typeof group["value"] === "undefined") {
      group = { key, value };
    }
  });

  $("#allReports > div:last-child").append(head + body + "</tbody></table>");

  $("#categoryCount").text(cat["key"]);
  $("#groupCount").text(group["key"]);
  $("#reportCount").text(reports.length);
  $("#latestReport").append(head2 + body2 + "</tbody></table>");
}

window.addEventListener("load", async () => {
  isloaded = true;
  await getReports();
  await reportsTable();
  generateColors(1);

  loadData(1).then(function () {
    drawVisualization(data);
    drawPie(1);
    drawVisualization2d(search, 1);
  });

  $("#reportCount").text(reports.length);

  $('#category').change(function () {
    generateColors(1);
    loadData(1).then(function () {
      drawVisualization(data);
      drawPie(1);
      search = 1;
      document.getElementById("search").value = search.toString();
      $('#next').attr('disabled', false);
      $('#prev').attr('disabled', true);
      drawVisualization2d(search, 1);
    });
  });

  $('#group').change(function () {
    generateColors(2);
    loadData(2).then(function () {
      drawVisualization(data);
      drawPie(2);
      search = 1;
      document.getElementById("search").value = search.toString();
      $('#next').attr('disabled', false);
      $('#prev').attr('disabled', true);
      drawVisualization2d(search, 2);
    });
  });

  db.collection("reports").orderBy("created", "desc").onSnapshot(async function (querySnapshot) {
    if (loaded) {
      querySnapshot.docChanges().forEach(async function (change) {
        if (change.type === "added") {
          let displayBy = $('input[name="inlineRadioOptions"]:checked').val();
          await getReports();
          generateColors(displayBy);

          $("#reportCount").text(reports.length);
          loadData(displayBy).then(function () {
            notifyReport(querySnapshot.docs[0]);
            drawVisualization(data);
            drawPie(displayBy);
            drawVisualization2d(search, displayBy);
          });
        }
      });

    } else {
      loaded = true;
    }
  });

  initSearchValue();
});
function convertToCSV(objArray) {
  var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
  var str = "";

  for (var i = 0; i < array.length; i++) {
    var line = "";
    for (var index in array[i]) {
      if (line != "") line += ",";

      line += array[i][index];
    }

    str += line + "\r\n";
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

  var exportedFilenmae = fileTitle + ".csv" || "export.csv";

  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, exportedFilenmae);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", exportedFilenmae);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

function download() {
  let headers = {
    user: "Username",
    group: "Group",
    category: "Category",
    date: "Date"
  };
  let csvDataFormated = [];
  // format the data
  csvData.forEach(item => {
    csvDataFormated.push({
      user: item.user,
      group: item.group,
      category: item.category,
      date: item.date
    });
  });

  let date = new Date(Date.now());
  let formatedDate =
    date.getMonth() +
    1 +
    "-" +
    date.getDay() +
    "-" +
    date.getFullYear() +
    " " +
    date.getHours() +
    ":" +
    date.getMinutes();
  var fileTitle = "reports(" + formatedDate + ")";

  exportCSVFile(headers, csvDataFormated, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
}

async function addCategory() {
  let name = document.getElementById("catName").value;
  let desc = document.getElementById("catdesc").value;
  if (name == "" || desc == "")
    return
  let size = 0;

  await db.collection("ids").get().then(function (querySnapshot) {
    size = querySnapshot.docs[0].data().categoryID + 1;
    querySnapshot.forEach(function (doc) {
      let newID = doc.data().categoryID + 1
      db.collection("ids").doc(doc.id).update({
        categoryID: newID
      });
    });
  });

  db.collection("categories").doc().set({
    id: size,
    name: name,
    description: desc
  })
    .then(async function () {
      console.log("Document successfully written!");
      sessionStorage.removeItem("category");
      PNotify.success({
        title: "Successfully added Category",
        delay: 2000,
        modules: {
          Buttons: {
            closer: true,
            closerHover: true,
            sticker: false
          },
          Mobile: {
            swipeDismiss: true,
            styling: true
          }
        }
      });
      let displayBy = $('input[name="inlineRadioOptions"]:checked').val();
      await getReports();
      generateColors(displayBy);

      $("#reportCount").text(reports.length);
      loadData(displayBy).then(function () {
        drawVisualization(data);
        drawPie(displayBy);
        drawVisualization2d(search, displayBy);
      });
      document.getElementById("catName").value = "";
      document.getElementById("catdesc").value = "";

    })
    .catch(function (error) {
      console.error("Error writing document: ", error);
    });

}
