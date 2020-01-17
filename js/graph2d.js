var barGraph = null;
var categories = [];
var groups = [];

function drawVisualization(){
    if(barGraph!=null){
        barGraph.destroy();
    }

    barGraph = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options
    });
}

window.addEventListener("load", async () => {
    isloaded = true;
    drawVisualization();      
});