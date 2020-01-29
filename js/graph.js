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
  for (let i = 0; i < axisMax; i += axisStep) {
    for (let j = 0; j < yAxisMax; j += axisStep) {
      z = getData(i, j);
      
      maxZvalue = z > maxZvalue ? z : maxZvalue;

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
  maxZvalue = Math.ceil((maxZvalue + 1) / 10) * 10
  
  var options = {
    height: "100%",
    width: "100%",
    style: "bar-color",
    showPerspective: true,
    showGrid: true,
    showShadow: true,
    animationPreload: true,
    axisFontType: "arial",
    axisFontSize: 26,
    xLabel: "Category", //Categories
    yLabel: "Group", //Groups
    zLabel: "Number", //Number
    xBarWidth: 0.5,
    yBarWidth: 0.5,
    rotateAxisLabels: true,
    xCenter: "45%",
    yCenter: "50%",
    xStep: 1,
    yStep: 1,
    zMin: 0,
    zMax: maxZvalue,

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

  graph.setCameraPosition({ horizontal: 0, vertical: 0.5, distance: 1.5 }); // restore camera position
}

async function reportsTable() {

  $('#allReports div').html("");
  $('#notifDropdown').html('<i class="material-icons">notifications</i>')
  $('#notifItem').html('<div class="dropdown-item py-0"><hr><div class="row"><p class="col-12 m-0 text-success p-0">All reports are read.</p></div><hr></div>')

  let cat = {};
  let group = {};
  let cCtr = {};
  let gCtr = {};
  let ctr = 0;

  //Add Head
  let head =
    "<table id='reportsTable' class='table table-striped table-responsive h-100' style='display:block;'>" +
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
      "</td><td style='width:0.5em;'><a class='cursor-pointer' id=" + report.id + " onClick= selectReport(" + report.id + ")> <i class='material-icons'>unfold_more</i ></a ></td > " +
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
    if (report.read === false) {
      notif = true;
      if (ctr === 0) {
        $('#notifItem').html('<div class="px-4 py-0"><hr class="m-2 mb-3"></div>');
      }
      ctr += 1;
      $('#notifDropdown').html('<i class="material-icons text-danger">notifications_active</i><span class="badge badge-pill badge-danger p-1">' + ctr + '</span>')
      $('#notifItem').append('<div class="dropdown-item py-0"><div class="row"><p class="col-12 text-danger m-0">New category "' + report.category + '" incident was reported.</p><p class="col-8 text-danger m-0"> (' + report.created.toDate().toLocaleString("en-US") + ')</p><a class="ml-auto py-0" href="#" onClick= selectReport(' + report.id + ')>more details...</a></div><hr class="mt-1"></div>')
    }
  });
  if (notif === false) {

    $('#notifDropdown').html('<i class="material-icons">notifications</i>')
  }

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
