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

function drawVisualization2d(search, sortBy){
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

    if(barGraph!=null){
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
            legend: {
                labels: {
                    fontColor: 'black',
                    fontSize: 16
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
                            fontSize: 14,
                            display: true,
                            labelString: 'Number'
                        }
                }],
                xAxes : [{
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
    let test = ['some','bs','sexual harra', 'other two', 'another one', 'something'];
    let len = test.length;

    // test.forEach(function(a){
    //     if (typeof(a) == 'string' && a.indexOf(value)>-1) {
    //         console.log(a);
    //     } 
    // });
    // for(let i = 0;i < len;i++){
    //     if(value.match(test[i])){
    //         console.log(value.search(/test[i]/));
    //     }
    // }
}

function prevButton(){
    initSearchValue();
    search -= 1;
    $('#next').attr('disabled', false);
    if(search == 1){
        $('#prev').attr('disabled', true);
    }
    
    document.getElementById("search").value = search.toString();
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    
    drawVisualization2d(search, sortBy);
}

function nextButton(){
    initSearchValue();
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

function searchField(element){
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    let len = sortBy == 1 ? categories.length : groups.length;
    let value = parseInt(element.value);
    
    if(event.key === 'Enter' && Number.isInteger(value)){
        if(value > len){
            $('#next').attr('disabled', true);
            $('#prev').attr('disabled', false);
            document.getElementById("search").value = len.toString();
            drawVisualization2d(len, sortBy);
        }else if(value < 1){
            $('#prev').attr('disabled', true);
            $('#next').attr('disabled', false);
            document.getElementById("search").value = 1;
            drawVisualization2d(1, sortBy);
        }else if(value == 1){
            $('#prev').attr('disabled', true);
            $('#next').attr('disabled', false);
            drawVisualization2d(value, sortBy);
        }else if(value == len){
            $('#next').attr('disabled', true);
            $('#prev').attr('disabled', false);
            drawVisualization2d(value, sortBy);
        }else{
            $('#prev').attr('disabled', false);
            $('#next').attr('disabled', false);
            drawVisualization2d(value, sortBy);
        }
    }else if(event.key === 'Enter'){
        $('#prev').attr('disabled', true);
        $('#next').attr('disabled', false);
        document.getElementById("search").value = 1;
        drawVisualization2d(1, sortBy);
    }
}

function searchBoxField(element){
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    //let len = sortBy == 1 ? categories.length : groups.length;
    let value = parseInt(document.getElementById("search").value)
    let searchString = element.value;

    let test = ['some','bs','sexual harra', 'other two', 'another one', 'something'];
    let len = test.length;
    
    $('#searchBox').autocomplete({
        source: test
    });

    if(event.key === 'Enter'){
        findString(searchString);
    }
}