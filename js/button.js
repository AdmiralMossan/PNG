var categories = []
var buttons = []

async function getCategories(){
    await db.collection("categories").orderBy("name").get().then(function(querySnapshot){
        querySnapshot.forEach(function(doc){
             categories.push(doc.data().name)
        });
    });
    console.log(categories);
}

function initializeButtons(){
    console.log(categories.length);
    var Ctgcontainer = document.getElementById("categoryContainer"); 
    var ctgDesc =  document.getElementById("ctgDesc"); 
    for(let i=0; i<categories.length; i++){
        Ctgcontainer.innerHTML += `<div class="col-sm">
             <button type="button" id="category` + categories[i] + `" class="col-sm btn btn-secondary w-75 mx-4 my-2"  style=" height: 120px;" >
             Category ` + categories[i] + `</button>
           </div>`;

           ctgDesc.innerHTML +=  '<h6 class="pt-4">Category ' + categories[i] + `:</h6>
           <p><small>Category ` + categories[i] +  ` is a Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</small></p>`;
    }
}

function disabledButtons(i, j){
    console.log(j.hasAttribute('disabled'));
    if(j.hasAttribute('disabled')){
        $('#picture').attr('src', "Images/buttonD.jpg");
        $('#picture').attr('disabled', true);
        $('#picture').attr('data-toggle', false);
        for(let k=0; k<buttons.length; k++){
            if(k!=i)
                buttons[k].removeAttribute("disabled");
           
        }
    }else{
        $('#picture').attr('src', "Images/buttonA.jpg");
        $('#picture').attr('data-toggle', "modal");
        $('#picture').attr('disabled', false);
        for(let k=0; k<buttons.length; k++){
            if(k!=i){
                buttons[k].setAttribute("disabled", "disabled");
                getCategory(buttons[i].id.replace('category',''));
            }        
        }

    }
   
}

function disableAll(){
    for(let i=0; i<buttons.length; i++){
        buttons[i].removeAttribute("disabled");
    }
}


$(document).ready(function() {
            getCategories().then(function () {
                initializeButtons();
                buttons = $("button[id^='category']");
                for(let i=0; i<buttons.length; i++){
                    let j = i==buttons.length - 1 ? 0 : i+1;
                    buttons[i].onclick = function(){disabledButtons(i, buttons[j])};
                }
            });;
            
            $("#picture").click(function(){
                if (jQuery('#picture')[0].hasAttribute('disabled')) {
                    $('#picture').attr('src', "Images/buttonD.jpg");
                    $('#picture').attr('data-toggle', false);
                    $('#picture').attr('disabled', true);
                    disableAll();
                }else{
                    $('#picture').attr('data-toggle', "modal");
                    $('#picture').attr('src', "Images/buttonD.jpg");
                    $('#picture').attr('disabled', true);
                    disableAll();
                }
            });

            $("#closemodal").click(function(){
                $('#picture').attr('src', "Images/buttonD.jpg");
                $('#picture').attr('data-toggle', false);
                $('#picture').attr('disabled', true);
                disableAll();
            });
        });
