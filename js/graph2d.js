var barGraph = null;
var reports = [];
var categoriesCount = [];
var categories = [];
var groups = [];

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

    await db.collection("reports").where("group", "==", 1).get().then(function(querySnapshot) {
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

    console.log(categoriesCount);
}

function initializeCounts(){
    for(let i=0; i<categories.length; i++){
        categoriesCount[i] = 0; 
    }
}

function drawVisualization(){
    let displayLabel = [];
    let displayData = [];

    displayLabel = categories;
    displayData = categoriesCount;
    
    if(barGraph!=null){
        barGraph.destroy();
    }

    barGraph = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: displayLabel,
            datasets: [{
                data: displayData,
                borderWidth: 1
            }]
        },
    });
}

function nextButton(){
    var search = parseInt(document.getElementById("search").value);
    
    $('#prev').attr('disabled', false);
    search += 1;
    document.getElementById("search").value = search.toString();
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
    drawVisualization();      
});