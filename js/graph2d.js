var barGraph = null;
var search = 0;
var reports = [];
var byGroupCount = [];
var byCategoryCount = [];
var categories = [];
var groups = [];
var barColors = [];
var colors = [];
var maxCategoryCount = 0;
var maxGroupCount = 0;

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

async function getReports(){
    clearValues();

    await db.collection("reports").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
           reports.push(doc.data())
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

    initArray();
    byGroup();
    byCategory();
    findMax();
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

function generateColors(){
    for(let i=0; i<categories.length; i++){
        var r = Math.floor((Math.random() *  255));
        var g = Math.floor((Math.random() *  255));
        var b = Math.floor((Math.random() *  255));
        stringColor =  "rgba(" +  r  + "," +  g  + "," + b ;
        colors[i] =  stringColor + ",1)";
        barColors[i] = stringColor + ",0.6)";
    }
}

function drawVisualization(search){
    let displayLabel = [];
    let displayData = [];
    let index = search - 1; 

    displayLabel = categories;
    displayData = byGroupCount[index];
    
    if(barGraph!=null){
        barGraph.destroy();
    }
    
    barGraph = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: displayLabel,
            datasets: [{
                label: 'Group ' + groups[index], 
                data: displayData,
                backgroundColor: barColors,
                borderColor: colors,
                borderWidth: 1,
            }]
        },
    });
}

function drawVisualization2(search){
    let displayLabel = [];
    let displayData = [];
    let index = search - 1;

    displayLabel = groups;
    displayData = byCategoryCount[index];
    
    if(barGraph!=null){
        barGraph.destroy();
    }
    
    barGraph = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: displayLabel,
            datasets: [{
                barPercentage: 0.5,
                label: 'Category ' + categories[index], 
                data: displayData,
                backgroundColor: barColors,
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
                            max: maxCategoryCount
                        }
                    }]
            }
        }
    });
}

function nextButton(){
    $('#prev').attr('disabled', false);
    search += 1;
    if(search == categories.length){
        $('#next').attr('disabled', true);
    }
    document.getElementById("search").value = search.toString();
    drawVisualization2(search);
}

function prevButton(){
    search -= 1;
    $('#next').attr('disabled', false);
    if(search == 1){
        $('#prev').attr('disabled', true);
    }
    document.getElementById("search").value = search.toString();
    drawVisualization2(search);
}

window.addEventListener("load", async () => {
    isloaded = true;
    await getReports();
    generateColors();
    initSearchValue();
    drawVisualization2(search);      
});