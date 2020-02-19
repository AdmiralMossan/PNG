let ctx = [];
let barG = [];
let categoryLength = 0;
let groupLength = 0;

window.addEventListener("load", async () => {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

    isloaded = true;
    await getGroupsAndCategories();
    categoryLength = categories.length;
    groupLength = groups.length;
    initSearchValue();
    initArray();
    byCategory();
    byGroup();
    findMax();
    generateColors(1);

    renderGraphs();

    $('#category').change(function () {
        generateColors(1);
        search = 1;
        document.getElementById("search").value = search.toString();
        buttonEnabler(search);
        $('#searchBoxLabel').text("Search by Category: ");
        
        renderGraphs();
    });
  
    $('#group').change(function () {
        generateColors(2);
        search = 1;
        document.getElementById("search").value = search.toString();
        buttonEnabler(search);
        $('#searchBoxLabel').text("Search by Group: ");
        
        renderGraphs();
    });  
});

function graphDestroy(graphD){
    if (graphD != null) {
        graphD.destroy();
    }
}

function renderGraphs(){
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    let len = sortBy == 1 ? categoryLength : groupLength;
    let body = '';

    $('#graphCollection div').html("");

    for (let i = 0 ; i < 4 ; i++){
        body += "<div class='col-6'><canvas id='graph"+ i + "'></canvas></div>";
    }


    $("#graphCollection").append(body);
    
    for (let i = 0 ; i < 4 ; i++){
        ctx[i] = document.getElementById('graph' + i).getContext('2d');
        graphDestroy(barG[i]);
        let index = search * 4 - (3-i);
        if(index <= len){
            barG[i] = new Chart(ctx[i], drawVisualization2d(index, sortBy));
        }
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
            },
            events: false,
            tooltips: {
                enabled: false
            },
            hover: {
                animationDuration: 0
            },
            animation: {
                duration: 500,
                onComplete: function () {
                    var chartInstance = this.chart,
                    ctx = chartInstance.ctx;
                    ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';

                    this.data.datasets.forEach(function (dataset, i) {
                        var meta = chartInstance.controller.getDatasetMeta(i);
                        meta.data.forEach(function (bar, index) {
                            var data = dataset.data[index];                            
                            ctx.fillText(data, bar._model.x, bar._model.y - 5);
                        });
                    });
                }
            }
        }
    }

    return graphData;
}

function printGraphs() {
    let docText = document.getElementById('category').checked ? 'Category ' : 'Group ';
    html2canvas($("#graphCollection"), {
        onrendered: function(canvas) {         
            var imgData = canvas.toDataURL(
                'image/png');              
            var doc = new jsPDF('l', 'mm', 'legal');
            doc.text(docText + "Reports", 105, 15, null, null, "center");
            doc.addImage(imgData, 'PNG', 40, 20);
            doc.save(docText + "Graphs");
        }
    });
}

function buttonEnabler(value){
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    let len = sortBy == 1 ? Math.ceil(categoryLength/4) : Math.ceil(groupLength/4);

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
    
    renderGraphs();
}

function nextButton(){
    search += 1;
    buttonEnabler(search);

    document.getElementById("search").value = search.toString();
    
    renderGraphs();
}