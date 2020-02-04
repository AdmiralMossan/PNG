$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });
});

window.addEventListener("load", async () => {
    isloaded = true;
  
    $("#reportCount").text(reports.length);
  
    $('#category').change(function () {
      generateColors(1);
      loadData(1).then(function () {
        drawVisualization(data);
        drawPie(1);
        search = 1;
        document.getElementById("search").value = search.toString();
        buttonEnabler(search);
        $('#searchBoxLabel').text("Search by Category: ");
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
        buttonEnabler(search);
        $('#searchBoxLabel').text("Search by Group: ");
        drawVisualization2d(search, 2);
      });
    });
  
  
    await db.collection("reports").orderBy("created", "desc").onSnapshot(async function (querySnapshot) {
      if (loaded) {
        querySnapshot.docChanges().forEach(async function (change) {
          if (change.type === "added" || change.type === "modified") {
            let displayBy = $('input[name="inlineRadioOptions"]:checked').val();
            await clearValues();
            await getReports();
            generateColors(displayBy);
  
            $("#reportCount").text(reports.length);
            loadData(displayBy).then(function () {
              if (change.type === "added") {
                notifyReport(querySnapshot.docs[0]);
                drawVisualization(data);
                drawPie(displayBy);
                drawVisualization2d(search, displayBy);
              }
              reportsTable().then(function () {
                $('#reportsTable').DataTable();
              });
            });
            return;
          }
        });
  
      } else {
        loaded = true;
      }
    });
  
  });

  var barGraph = null;
var search = 0;
var byGroupCount = [];
var byCategoryCount = [];
var maxCategoryCount = 0;
var maxGroupCount = 0;

function initArray() {
    for (let i = 0; i < groups.length; i++) {
        byGroupCount[i] = [];
    }

    for (let i = 0; i < categories.length; i++) {
        byCategoryCount[i] = [];
    }

    for (let i = 0; i < categories.length; i++) {
        for (let j = 0; j < groups.length; j++) {
            byCategoryCount[i][j] = 0;
        }
    }

    for (let i = 0; i < groups.length; i++) {
        for (let j = 0; j < categories.length; j++) {
            byGroupCount[i][j] = 0;
        }
    }
}

function findMax() {
    for (let i = 0; i < categories.length; i++) {
        for (let j = 0; j < groups.length; j++) {
            if (maxCategoryCount < byCategoryCount[i][j]) {
                maxCategoryCount = byCategoryCount[i][j];
            }
        }
    }

    for (let i = 0; i < groups.length; i++) {
        for (let j = 0; j < categories.length; j++) {
            if (maxGroupCount < byGroupCount[i][j]) {
                maxGroupCount = byGroupCount[i][j];
            }
        }
    }
}

function byCategory() {
    for (let i = 0; i < reports.length; i++) {
        for (let j = 0; j < categories.length; j++) {
            for (let k = 0; k < groups.length; k++) {
                if (reports[i].category == categories[j] && reports[i].group == k + 1) {
                    byCategoryCount[j][k] += 1;
                }
            }
        }
    }
}

function byGroup(){
    for(let i=0; i<reports.length; i++){
        for(let j=0; j<groups.length; j++){
            for(let k=0; k<categories.length; k++){
                if(reports[i].category == categories[k] && reports[i].group == j + 1){
                    byGroupCount[j][k] += 1;
                }
            }
        }
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

function drawVisualization2d(search, sortBy) {
    let displayLabel = [];
    let displayData = [];
    let arrayLabel = [];
    let displayMax = 0;
    let index = search - 1;

    let stringLabel = sortBy == 1 ? ' Category ' : ' Group ';
    let labelStr = sortBy == 1 ? 'Group' : 'Category';

    arrayLabel = sortBy == 1 ? categories : groups;
    displayLabel = sortBy == 1 ? groups : categories;
    displayData = sortBy == 1 ? byCategoryCount[index] : byGroupCount[index];
    displayMax = sortBy == 1 ? maxCategoryCount : maxGroupCount;
    displayMax = Math.ceil((displayMax + 1) / 10) * 10;

    if (barGraph != null) {
        barGraph.destroy();
    }

    barGraph = new Chart(ctx2d, {
        type: 'bar',
        data: {
            labels: displayLabel,
            datasets: [{
                label: arrayLabel[index] + stringLabel,
                data: displayData,
                backgroundColor: pieColors,
                borderColor: colors,
                borderWidth: 1,
            }]
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: 'top',
                labels: {
                    fontSize: 16,
                    fontStyle: 'bold',
                    fontFamily: 'times',
                    boxWidth: 0
                }
            },
            scales: {
                yAxes: [{
                    display: true,
                    ticks: {
                        beginAtZero: true,
                        max: displayMax
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Number',
                        fontSize: 14,
                        ticks: {
                            beginAtZero: true,
                            max: displayMax
                        },
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        fontSize: 14,
                        display: true,
                        labelString: labelStr
                    }
                }]
            }
        }
    });
}

function findString(value){
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    let displayData = [];
    
    displayData = sortBy == 1 ? categories.slice() : groups.slice();
    
    for(i = 0; i < displayData.length ;i++){
        displayData[i] = displayData[i].toLowerCase();
    }

    displayData.forEach(function(a){

        if (typeof(a) === 'string' && a.indexOf(value)>-1) {
            let index = displayData.indexOf(value) + 1;
            
            document.getElementById("search").value = index.toString();
            search = index;
            buttonEnabler(index);
            drawVisualization2d(index, sortBy);
        }
    });
}

function buttonEnabler(value){
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    let len = sortBy == 1 ? categories.length : groups.length;

    if (value == len) {
        $('#next').attr('disabled', true);
        $('#prev').attr('disabled', false);
    } else if (value == 1) {
        $('#prev').attr('disabled', true);
        $('#next').attr('disabled', false);
    } else {
        $('#prev').attr('disabled', false);
        $('#next').attr('disabled', false);
    }
}

function prevButton(){
    search -= 1;
    buttonEnabler(search);

    document.getElementById("search").value = search.toString();
    
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    
    drawVisualization2d(search, sortBy);
}

function nextButton(){
    search += 1;
    buttonEnabler(search);

    document.getElementById("search").value = search.toString();

    let sortBy = document.getElementById('category').checked ? 1 : 2;
    
    drawVisualization2d(search, sortBy);
}

function searchBoxField(){
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    let displayData = [];
    let searchString = document.getElementById('searchBox').value;
    
    displayData = sortBy == 1 ? categories : groups;

    $('#searchBox').autocomplete({
        source: displayData
    });
    
    if(event.key === 'Enter' || event.type === 'click'){
        findString(searchString.toLowerCase());
    }
}