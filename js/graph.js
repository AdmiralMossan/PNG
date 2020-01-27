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

async function drawPie(groupBy) {
  let displayData = [];
  let displayLabel = [];
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
    type: "pie",
    options: {
      maintainAspectRatio: false
    },
    data: {
      labels: displayLabel,
      datasets: [
        {
          label: "# of Votes",
          data: displayData,
          backgroundColor: pieColors,
          borderColor: colors,
          borderWidth: 1
        }
      ]
    }
  });
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
    axisFontSize: 26,
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
      return (value + 5);
    },

    keepAspectRatio: true
  };

  // create our graph
  var container = document.getElementById("mygraph");
  graph = new vis.Graph3d(container, data, options);

  graph.setCameraPosition({ horizontal: 1.2, vertical: 0.3, distance: 2.3 }); // restore camera position
}