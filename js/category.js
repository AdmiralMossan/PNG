async function showCategories() {
    let tempCategories = [];

    $('#showCategoriesModal div').html("");

    await db
        .collection("categories")
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                tempCategories.push(doc.data());
            });
        });
    //Add body
    let head =
        "<table id='categoriesTable' class='table table-striped table-responsive p-0 scroll-secondary col-12'>" +
        "<thead class='thead-inverse bg-custom text-custom'>" +
        "<tr>" +
        "<th style='width:25%;'>Category</th>" +
        "<th style='width:70%;'>Details</th>" +
        "<th style='width:5%;'>Actions</th>" +
        "</tr>" +
        "</thead>";

    let body = '<tbody class="scroll-secondary">';

    tempCategories.forEach(function (category) {
        body +=
            "<tr>" +
            "<td>" +
            category.name +
            "</td>" +
            "<td style='line-height: 1em;'>" +
            category.description +
            "</td>" +
            "<td class='d-flex'>" +
            "<div class='p-1 m-1 cursor-pointer'><a class='cursor-pointer' id=editCategory" + category.id + " onClick= updateCategory(" + category.id + ")><i class='fas fa-edit'></i></a></div>" +
            "<div class='p-1 m-1 cursor-pointer'><a class='cursor-pointer' id=deleteCategory" + category.id + " onClick= removeCategory(" + category.id + ")><i class='fas fa-trash-alt'></i></a></div>" +
            "</td>";
    });

    $("#showCategoriesModal > div:last-child").append(head + body + "</tbody></table>");
}