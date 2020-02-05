var csvData = [];

window.addEventListener("load", async () => {
    isloaded = true;
    await getReports();
    await showTables();
    $('#reportsTable').DataTable({
        scrollY: 400
    });

});

async function showTables() {

    $('#showCategoriesTable div').html("");

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