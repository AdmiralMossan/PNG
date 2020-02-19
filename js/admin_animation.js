function load_content(){
    var bg1 = document.getElementById("bg1");
    var bg2 = document.getElementById("bg2");
    var bg3 = document.getElementById("bg3");
    var main = document.getElementById("maincontent");
    setTimeout(function(){ 
      bg2.media = '';
      setTimeout(function(){ 
        bg3.media = '';
        setTimeout(function(){ 
          main.style.display='';
        },600);
      },600);
    },600);
  }