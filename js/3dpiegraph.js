//3D Graph Globals
var data = null;
var graph = null;
var reports = [];
var notif = false;
var categoriesCount = [];
var groupsCount = [];
var myPieChart = null;
var categories = [];
var groups = [];
var colors = [];
var pieColors = [];
var loaded = false;
var csvData = [];
var reportSelected = {};
var maxZvalue = 0;


//2D Graph Globals
var barGraph = null;
var search = 0;
var byGroupCount = [];
var byCategoryCount = [];
var maxCategoryCount = 0;
var maxGroupCount = 0;

function clearValues() {
    categoriesCount = [];
    groupsCount = [];
    categories = [];
    groups = [];
    reports = [];
    groupsCount = [];
    colors = [];
    pieColors = [];
    notif = false;
    return;
}

//Array initializations
function initializeCounts() {
    for (let i = 0; i < categories.length; i++) {
        categoriesCount[i] = 0;
    }

    for (let i = 0; i < groups.length; i++) {
        groupsCount[i] = 0;
    }
}

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
async function getGroupsAndCategories() {
    clearValues();
    getReports();
    let locCat = [];
    let locGrps = [];

    await db
        .collection("categories")
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                locCat.push(doc.data().name);
            });
        });

    await db
        .collection("groups")
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                locGrps.push(doc.data().name);
            });
        });
    categories = locCat;
    groups = locGrps;
    initializeCounts();

    for (let i = 0; i < reports.length; i++) {
        for (let j = 0; j < categories.length; j++) {
            if (reports[i].category == categories[j]) {
                categoriesCount[j] += 1;
            }
        }

        for (let k = 0; k < groups.length; k++) {
            if (reports[i].group - 1 == k) {
                groupsCount[k] += 1;
            }
        }
    }

    initArray();
    return;
}


window.addEventListener("load", async () => {
    isloaded = true;
    await getGroupsAndCategories()
    generateColors(1);

    loadData(1).then(function () {
        drawVisualization(data);
        drawPie(1);
    });

    $("#reportCount").text(reports.length);

    $('#category').change(function () {
        generateColors(1);
        loadData(1).then(function () {
            drawVisualization(data);
            drawPie(1);
            search = 1;
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
                if (change.type === "added") {
                    let displayBy = $('input[name="inlineRadioOptions"]:checked').val();
                    await getGroupsAndCategories();
                    generateColors(displayBy);

                    $("#reportCount").text(reports.length);
                    loadData(displayBy).then(function () {
                        notifyReport(querySnapshot.docs[0]);
                        drawVisualization(data);
                        drawPie(displayBy);
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

function byGroup() {
    for (let i = 0; i < reports.length; i++) {
        for (let j = 0; j < groups.length; j++) {
            for (let k = 0; k < categories.length; k++) {
                if (reports[i].category == categories[k] && reports[i].group == j + 1) {
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


function findString(value) {
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    let displayData = [];

    displayData = sortBy == 1 ? categories.slice() : groups.slice();

    for (i = 0; i < displayData.length; i++) {
        displayData[i] = displayData[i].toLowerCase();
    }

    displayData.forEach(function (a) {
        if (typeof (a) === 'string' && a.indexOf(value) > -1) {
            let index = displayData.indexOf(value) + 1;
            if (index === 0) {

            } else {
                document.getElementById("search").value = index.toString();
                search = index;
                buttonEnabler(index);
                drawVisualization2d(index, sortBy);
            }
        }
    });
}

function buttonEnabler(value) {
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

function prevButton() {
    search -= 1;
    buttonEnabler(search);

    document.getElementById("search").value = search.toString();

    let sortBy = document.getElementById('category').checked ? 1 : 2;

    drawVisualization2d(search, sortBy);
}

function nextButton() {
    search += 1;
    buttonEnabler(search);

    document.getElementById("search").value = search.toString();

    let sortBy = document.getElementById('category').checked ? 1 : 2;

    drawVisualization2d(search, sortBy);
}

function searchBoxField() {
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    let displayData = [];
    let searchString = document.getElementById('searchBox').value;

    displayData = sortBy == 1 ? categories : groups;

    $('#searchBox').autocomplete({
        source: displayData
    });

    if (event.key === 'Enter' || event.type === 'click') {
        findString(searchString.toLowerCase());
    }
}