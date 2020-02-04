async function getReports() {
    clearValues();
    let locCat = [];
    let locReps = [];
    let locGrps = []
    await db
        .collection("reports")
        .orderBy("created", "desc")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                locReps.push(doc.data());
            });
        });

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
    reports = locReps;
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
    // byGroup();
    // byCategory();
    // findMax();
    return;
}

function notifyReport(report) {
    PNotify.info({
        title: "New Report",
        text:
            "Username: " +
            report.data().username +
            " Category: " +
            report.data().category +
            " Group: " +
            report.data().group +
            " " +
            report
                .data()
                .created.toDate()
                .toLocaleString(),
        delay: 3000,
        modules: {
            Buttons: {
                closer: true,
                closerHover: true,
                sticker: false
            },
            Desktop: {
                desktop: true,
                fallback: true,
                icon: null
            },
            Mobile: {
                swipeDismiss: true,
                styling: true
            }
        }
    });
}

async function reportsTable() {

    $('#allReports div').html("");
    $('#notifDropdown').html('<i class="fas fa-bell"></i>')
    $('#notifItem').html('<div class="dropdown-item py-0"><hr><div class="row"><p class="col-12 m-0 text-success p-0">All reports are read.</p></div><hr></div>')

    let cat = {};
    let group = {};
    let cCtr = {};
    let gCtr = {};
    let ctr = 0;

    //Add Head
    let head =
        "<table id='reportsTable' class='display table table-striped table-responsive'>" +
        "<thead class='thead-inverse bg-custom text-custom'>" +
        "<tr>" +
        "<th style='width:15%;'>User</th>" +
        "<th style='width:16%;'>Group</th>" +
        "<th style='width:30%;'>Category</th>" +
        "<th style='width:30%;'>Date" +
        "</th>" +
        "<th style='width:4%;' class='cursor-pointer'>" +
        "<a href='javascript:download()' title='Download as CSV' class='material-icons' style='text-decoration:none'>cloud_download</a>" +
        "</th>" +
        "</th></tr></thead>";

    //Add body
    let body = '<tbody class="scroll-secondary">';
    reports.forEach(function (report) {
        if (typeof cCtr[report.category] === "undefined") {
            cCtr[report.category] = 0;
        } else {
            cCtr[report.category] += 1;
        }
        if (typeof gCtr[report.group] === "undefined") {
            gCtr[report.group] = 0;
        } else {
            gCtr[report.group] += 1;
        }

        let date = new Date(report.created["seconds"] * 1000);
        body +=
            "<tr>" +
            "<td>" +
            report.username +
            "</td>" +
            "<td>" +
            report.group +
            "</td>" +
            "<td>" +
            report.category +
            "</td>" +
            "<td>" +
            report.created.toDate().toLocaleString("en-PH") +
            "</td><td><a class='cursor-pointer' id=" + report.id + " onClick= selectReport(" + report.id + ")> <i class='material-icons'>unfold_more</i ></a ></td > " +
            "</tr>";

        csvData.push({
            user: report.username,
            group: report.group,
            category: report.category,
            date:
                date.getMonth() +
                1 +
                "-" +
                date.getDay() +
                "-" +
                date.getFullYear() +
                " " +
                date.getHours() +
                ":" +
                date.getMinutes()
        });
        if (report.read === false) {
            notif = true;
            if (ctr === 0) {
                $('#notifItem').html('<div class="px-4 py-0"><hr class="m-2 mb-3"></div>');
            }
            ctr += 1;
            $('#notifDropdown').html('<i class="material-icons text-danger">notifications_active</i><span class="badge badge-pill badge-danger p-1">' + ctr + '</span>')
            $('#notifItem').append('<div class="dropdown-item py-0"><div class="row"><p class="col-12 text-danger m-0">New category "' + report.category + '" incident was reported.</p><p class="col-8 text-danger m-0"> (' + report.created.toDate().toLocaleString("en-PH") + ')</p><a class="ml-auto py-0" href="#" onClick= selectReport(' + report.id + ')>more details...</a></div><hr class="mt-1"></div>')
        }
    });
    if (notif === false) {

        $('#notifDropdown').html('<i class="fas fa-bell"></i>')
    }

    $.each(cCtr, function (key, value) {
        if (cat["value"] < value || typeof cat["value"] === "undefined") {
            cat = { key, value };
        }
    });

    $.each(gCtr, function (key, value) {
        if (group["value"] < value || typeof group["value"] === "undefined") {
            group = { key, value };
        }
    });

    $("#allReports").append(head + body + "</tbody></table>");

    $("#categoryCount").text(cat["key"]);
    $("#groupCount").text(group["key"]);
    $("#reportCount").text(reports.length);
}


function convertToCSV(objArray) {
    var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
    var str = "";

    for (var i = 0; i < array.length; i++) {
        var line = "";
        for (var index in array[i]) {
            if (line != "") line += ",";

            line += array[i][index];
        }

        str += line + "\r\n";
    }

    return str;
}

function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
        items.unshift(headers);
    }

    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    var csv = this.convertToCSV(jsonObject);

    var exportedFilenmae = fileTitle + ".csv" || "export.csv";

    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) {
            // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

async function selectReport(reportID) {
    reports.forEach(async function (report) {
        if (report.id === reportID) {
            await db.collection("reports").where('id', '==', report.id).get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    db.collection("reports").doc(doc.id).update({
                        read: true
                    });
                });
            });
            loadReportDetails(report).then(() => {
                $('#reportDetails').modal('show');
            })
        }
    })
}

async function loadReportDetails(reportSelected) {
    $("#reportTitle").html("<h1>" + reportSelected.username + "<h1><h3> " + reportSelected.created.toDate().toLocaleString("en-PH") + "</h3>");
    $("#sgroup").text("Group: " + reportSelected.group);
    $("#scategory").text("Category: " + reportSelected.category);
    $("#sdateInfo").text("Occurence: " + reportSelected.datInfo);
    $("#sotherDetails").text("Other Details: " + reportSelected.otherDetails);
    $("#spersonInfo").text("Subject: " + reportSelected.personInfo);
    if (reportSelected.attachFile === "") {
        $("#sattachment").html('Link to attachment: No attachment');
    } else {
        $("#sattachment").html('Link to attachment: <a target=_blank href= ' + reportSelected.attachFile + '>Link</a>');
    }
}

function download() {
    let headers = {
        user: "Username",
        group: "Group",
        category: "Category",
        date: "Date"
    };
    let csvDataFormated = [];
    // format the data
    csvData.forEach(item => {
        csvDataFormated.push({
            user: item.user,
            group: item.group,
            category: item.category,
            date: item.date
        });
    });

    let date = new Date(Date.now());
    let formatedDate =
        date.getMonth() +
        1 +
        "-" +
        date.getDay() +
        "-" +
        date.getFullYear() +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes();
    var fileTitle = "reports(" + formatedDate + ")";

    exportCSVFile(headers, csvDataFormated, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
}