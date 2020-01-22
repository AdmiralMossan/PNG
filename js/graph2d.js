var barGraph = null;
var search = 0;
var byGroupCount = [];
var byCategoryCount = [];
var maxCategoryCount = 0;
var maxGroupCount = 0;

function initArray(){
    for(let i=0; i<groups.length; i++){
        byGroupCount[i] = [];
    }

    for(let i=0; i<categories.length; i++){
        byCategoryCount[i] = [];
    }

    for(let i=0; i<categories.length; i++){
        for(let j=0; j<groups.length; j++){
            byCategoryCount[i][j] = 0;
        }
    }

    for(let i=0; i<groups.length; i++){
        for(let j=0; j<categories.length; j++){
            byGroupCount[i][j] = 0;
        }
    }
}

function initSearchValue(){
    search = parseInt(document.getElementById("search").value);
}

function findMax(){
    for(let i=0; i<categories.length; i++){
        for(let j=0; j<groups.length; j++){
            if(maxCategoryCount < byCategoryCount[i][j]){
                maxCategoryCount = byCategoryCount[i][j];
            }
        }
    }

    for(let i=0; i<groups.length; i++){
        for(let j=0; j<categories.length; j++){
            if(maxGroupCount < byGroupCount[i][j]){
                maxGroupCount = byGroupCount[i][j];
            }
        }
    }
}

function byCategory(){
    for(let i=0; i<reports.length; i++){
        for(let j=0; j<categories.length; j++){
            for(let k=0; k<groups.length; k++){
                if(reports[i].category == categories[j] && reports[i].group == k + 1){  
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

function drawVisualization2d(search, sortBy){
    let displayLabel = [];
    let displayData = [];
    let arrayLabel = [];
    let displayMax = 0;
    let index = search - 1; 

    let stringLabel = sortBy == 1 ? 'Category ' : 'Group ';
    let labelStr = sortBy == 1 ? 'Group' : 'Category';

    arrayLabel = sortBy == 1 ? categories : groups;
    displayLabel = sortBy == 1 ? groups : categories;
    displayData = sortBy == 1 ? byCategoryCount[index] : byGroupCount[index];
    displayMax = sortBy == 1 ? maxCategoryCount : maxGroupCount;

    if(barGraph!=null){
        barGraph.destroy();
    }
    
    barGraph = new Chart(ctx2d, {
        type: 'bar',
        data: {
            labels: displayLabel,
            datasets: [{
                label: stringLabel + arrayLabel[index], 
                data: displayData,
                backgroundColor: pieColors,
                borderColor: colors,
                borderWidth: 1,
            }]
        },
        options: {
            scales: {
                yAxes: [{
                        display: true,
                        ticks: {
                            beginAtZero: true,
                            max: displayMax
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Number of Reports'
                        }
                }],
                xAxes : [{
                    scaleLabel: {
                        display: true,
                        labelString: labelStr
                    }
                }]
            }
        }
    });
}

function nextButton(){
    $('#prev').attr('disabled', false);
    search += 1;
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    let len = sortBy == 1 ? categories.length : groups.length;
    if(search == len){
        $('#next').attr('disabled', true);
    }
    
    document.getElementById("search").value = search.toString();
    
    drawVisualization2d(search, sortBy);
}

function prevButton(){
    search -= 1;
    $('#next').attr('disabled', false);
    if(search == 1){
        $('#prev').attr('disabled', true);
    }
    
    document.getElementById("search").value = search.toString();
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    
    drawVisualization2d(search, sortBy);
}