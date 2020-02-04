var barGraph = null;
var search = 0;
var byGroupCount = [];
var byCategoryCount = [];
var maxCategoryCount = 0;
var maxGroupCount = 0;

$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

});

window.addEventListener("load", async () => {
    isloaded = true;
    await reportsTable();
    $('#reportsTable').DataTable({
      scrollY: 400
    });
    generateColors(1);
  
    initSearchValue();
    loadData(1).then(function () {
      drawVisualization(data);
      drawPie(1);
      drawVisualization2d(search, 1);
      $('#searchBoxLabel').text("Search by Category: ");
    });
  
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
    }
    //below is onload.js  
}

