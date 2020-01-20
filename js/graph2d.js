var barGraph = null;
var search = 0;
var reports = [];
var categoriesCount = [];
var categories = [];
var groups = [];
var barColors = [];
var colors = [];

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

    initializeCounts();

    for(let i=0; i<reports.length; i++){
        for(let j=0; j<categories.length; j++){
            if(reports[i].category == categories[j]){  
                categoriesCount[j] += 1;
            }
        }
    }
}

function initializeCounts(){
    for(let i=0; i<categories.length; i++){
        categoriesCount[i] = 0; 
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

    displayLabel = categories;
    displayData = categoriesCount;
    
    if(barGraph!=null){
        barGraph.destroy();
    }
    console.log(reports[search]);
    console.log(groups);
    console.log(search);
    barGraph = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: displayLabel,
            datasets: [{
                label: 'Group ' + groups[search], 
                data: displayData,
                backgroundColor: barColors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
    });
}

async function nextButton(){
    $('#prev').attr('disabled', false);
    search += 1;
    document.getElementById("search").value = search.toString();
    drawVisualization(search);
}

function prevButton(){
    var search = parseInt(document.getElementById("search").value);
    
    search -= 1;
    if(search == 1){
        $('#prev').attr('disabled', true);
    }
    document.getElementById("search").value = search.toString();
}

window.addEventListener("load", async () => {
    isloaded = true;
    await getReports();
    generateColors();
    drawVisualization(search);      
});