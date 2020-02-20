// import { decodeBase64 } from "bcryptjs";

// var latestReportsTable

window.addEventListener("load", async () => {
    isloaded = true;
    await getReports();
    await reportSummary();
    getWeeklyReport();
    $('#latestReportsTable').DataTable({
        scrollY: 210,
        responsive: true,
        searching: false,
        lengthChange: false,
        ordering: false,
        paging: false,
        info: false
    });

});

function showLatest() {
    let options = { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    let cat = {};
    let group = {};
    let cCtr = {};
    let gCtr = {};
    let ctr = 0;

    //Add Head
    let head =
        "<table id='latestReportsTable' class='display'>" +
        "<thead>" +
        "<tr>" +
        "<th style='width:20%;'>User</th>" +
        "<th style='width:10%;'>Group</th>" +
        "<th style='width:30%;'>Category</th>" +
        "<th style='width:40%;'>Date" +

        "</th></tr></thead>";

    //Add body
    let body = '<tbody class="scroll-secondary">';
    loop: reports.forEach(function (report) {
        if (ctr++ < 5) {
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
            
            body +=
                "<tr ondblclick= selectReport(" + report.id + ")>" +
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
                report.created.toDate().toLocaleString("en-US", options) +
                "</td>" +
                "</tr>";
        }
    });

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

    $("#latestReport").append(head + body + "</tbody></table>");
    $('#card5 > div').append('<div class="card-footer mx-auto py-1"><a href="/table.html"> All Reports</a></div>')
}


async function reportSummary() {

    let cat = {};
    let group = {};
    let cCtr = {};
    let gCtr = {};

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
    });

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


    $("#categoryCount").text(cat["key"]);
    $("#groupCount").text(group["key"]);
    $("#reportCount").text(reports.length);
    showLatest()
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

Date.prototype.subtractDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() - days);
    return date;
}

function getDates(startDate, stopDate) {
    let options = { month: '2-digit', day: '2-digit', year: 'numeric'};
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push((new Date (currentDate)).toLocaleString("en-US", options));
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}



function getWeeklyReport(){
    let options = { month: '2-digit', day: '2-digit', year: 'numeric'};

    let date = new Date();

    var ctx = document.getElementById("weeklyReports").getContext('2d');

    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: getDates(date.subtractDays(6), date),
            datasets: [
            {
                label: 'Series 1', // Name the series
                data: [500,	50,	2424,	14040,	14141,	4111,	4544,	47,	5555, 6811], // Specify the data values array
                fill: false,
                borderColor: '#2196f3', // Add custom color border (Line)
                backgroundColor: '#2196f3', // Add custom color background (Points and Fill)
                borderWidth: 1.5 // Specify bar border width
            },
            {
                label: 'Series 2', // Name the series
                data: [520,	60,	224,	1040,	4141,	411,	454,	47,	555, 811], // Specify the data values array
                fill: false,
                borderColor: 'red', // Add custom color border (Line)
                backgroundColor: 'red', // Add custom color background (Points and Fill)
                borderWidth: 1.5 // Specify bar border width
            }
            ]},
        options: {
        responsive: true, // Instruct chart js to respond nicely.
        maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height 
        }
    });

    // console.log(date.subtractDays(7));
    console.log(getDates(date.subtractDays(6), date));
    let tmpDate = date.subtractDays(5).toLocaleString("en-US", options);
    
    //console.log(date.toLocaleString("en-US", options));

    // date.setDate(date.getDate() + 7);

    // console.log(date);
    
    // for(let i = 0 ; i < reports.length ; i++){
    //     if (reports[i].created.toDate().toLocaleString("en-US", options) === tmpDate){
    //         console.log(reports[i].created.toDate().toLocaleString("en-US", options));
    //     }
    // }
}