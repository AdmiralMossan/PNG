var ctx1;
var ctx2;
var ctx3;
var ctx4;

window.addEventListener("load", async () => {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

    ctx1 = document.getElementById('graph1').getContext('2d');
    ctx2 = document.getElementById('graph2').getContext('2d');
    ctx3 = document.getElementById('graph3').getContext('2d');
    ctx4 = document.getElementById('graph4').getContext('2d');

    isloaded = true;
    await getGroupsAndCategories();
    initSearchValue();
    initArray();
    byCategory();
    byGroup();
    findMax();
    generateColors(1);
    
    graphDestroy(barGraph);
    graphDestroy(barGraph2);
    graphDestroy(barGraph3);
    graphDestroy(barGraph4);

    barGraph = new Chart(ctx1, drawVisualization2d(search, 1));
    barGraph2 = new Chart(ctx2, drawVisualization2d(search + 2, 1));
    barGraph3 = new Chart(ctx3, drawVisualization2d(search + 3, 1));
    barGraph4 = new Chart(ctx4, drawVisualization2d(search + 4, 1));

    $('#category').change(function () {
        generateColors(1);
        search = 1;
        document.getElementById("search").value = search.toString();
        buttonEnabler(search);
        $('#searchBoxLabel').text("Search by Category: ");
        
        graphDestroy(barGraph);
        graphDestroy(barGraph2);
        graphDestroy(barGraph3);
        graphDestroy(barGraph4);

        barGraph = new Chart(ctx1, drawVisualization2d(search, 1));
        barGraph2 = new Chart(ctx2, drawVisualization2d(search + 2, 1));
        barGraph3 = new Chart(ctx3, drawVisualization2d(search + 3, 1));
        barGraph4 = new Chart(ctx4, drawVisualization2d(search + 4, 1));
    });
  
    $('#group').change(function () {
        generateColors(2);
        search = 1;
        document.getElementById("search").value = search.toString();
        buttonEnabler(search);
        $('#searchBoxLabel').text("Search by Group: ");
        
        graphDestroy(barGraph);
        graphDestroy(barGraph2);
        graphDestroy(barGraph3);
        graphDestroy(barGraph4);

        barGraph = new Chart(ctx1, drawVisualization2d(search, 2));
        barGraph2 = new Chart(ctx2, drawVisualization2d(search + 2, 2));
        barGraph3 = new Chart(ctx3, drawVisualization2d(search + 3, 2));
        barGraph4 = new Chart(ctx4, drawVisualization2d(search + 4, 2));
    });  
});

function graphDestroy(graphD){
    if (graphD != null) {
        graphD.destroy();
    }
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

    let graphData = {
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
            maintainAspectRatio: true,
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
    }

    return graphData;
}

function printGraphs() {
    var pdf = new jsPDF("p", "pt", "letter");
	pdf.addHTML($('#graphCollection'), 30, 30, function() {
	  pdf.save('div.pdf');
	});
}

// function findString(value){
//     let sortBy = document.getElementById('category').checked ? 1 : 2;
//     let displayData = [];
    
//     displayData = sortBy == 1 ? categories.slice() : groups.slice();
    
//     for(i = 0; i < displayData.length ;i++){
//         displayData[i] = displayData[i].toLowerCase();
//     }

//     displayData.forEach(function(a){

//         if (typeof(a) === 'string' && a.indexOf(value)>-1) {
//             let index = displayData.indexOf(value) + 1;
            
//             document.getElementById("search").value = index.toString();
//             search = index;
//             buttonEnabler(index);
//             drawVisualization2d(ctx1, index, sortBy);
//         }
//     });
// }

// function searchBoxField(){
//     let sortBy = document.getElementById('category').checked ? 1 : 2;
//     let displayData = [];
//     let searchString = document.getElementById('searchBox').value;
    
//     displayData = sortBy == 1 ? categories : groups;

//     $('#searchBox').autocomplete({
//         source: displayData
//     });
    
//     if(event.key === 'Enter' || event.type === 'click'){
//         findString(searchString.toLowerCase());
//     }
// }

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
    
    graphDestroy(barGraph);
    graphDestroy(barGraph2);
    graphDestroy(barGraph3);
    graphDestroy(barGraph4);

    barGraph = new Chart(ctx1, drawVisualization2d(search, sortBy));
    barGraph2 = new Chart(ctx2, drawVisualization2d(search + 2, sortBy));
    barGraph3 = new Chart(ctx3, drawVisualization2d(search + 3, sortBy));
    barGraph4 = new Chart(ctx4, drawVisualization2d(search + 4, sortBy));
}

function nextButton(){
    search += 1;
    buttonEnabler(search);

    document.getElementById("search").value = search.toString();

    let sortBy = document.getElementById('category').checked ? 1 : 2;
    
    graphDestroy(barGraph);
    graphDestroy(barGraph2);
    graphDestroy(barGraph3);
    graphDestroy(barGraph4);

    barGraph = new Chart(ctx1, drawVisualization2d(search, sortBy));
    barGraph2 = new Chart(ctx2, drawVisualization2d(search + 2, sortBy));
    barGraph3 = new Chart(ctx3, drawVisualization2d(search + 3, sortBy));
    barGraph4 = new Chart(ctx4, drawVisualization2d(search + 4, sortBy));
}