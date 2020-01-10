$( document ).ready(function() {
            $("#btn1").click(function(){
                if (jQuery('#btn2')[0].hasAttribute('disabled')) {
                    $('#picture').attr('src', "Images/buttonD.jpg");
                    $('#picture').attr('disabled', true);
                    $("#btn2").attr('disabled', false);
                    $("#btn3").attr('disabled', false);
                }else{
                    $('#picture').attr('src', "Images/buttonA.jpg");
                    $('#picture').attr('disabled', false);
                    $("#btn2").attr('disabled', true);
                    $("#btn3").attr('disabled', true);
                }
            });
            $("#btn2").click(function(){
                if (jQuery('#btn3')[0].hasAttribute('disabled')) {
                    $('#picture').attr('src', "Images/buttonD.jpg");
                    $('#picture').attr('disabled', true);
                    $("#btn1").attr('disabled', false);
                    $("#btn3").attr('disabled', false);
                }else{
                    $('#picture').attr('src', "Images/buttonA.jpg");
                    $('#picture').attr('disabled', false);
                    $("#btn1").attr('disabled', true);
                    $("#btn3").attr('disabled', true);
                }
            });
            $("#btn3").click(function(){
                if (jQuery('#btn1')[0].hasAttribute('disabled')) {
                    $('#picture').attr('src', "Images/buttonD.jpg");
                    $('#picture').attr('disabled', true);
                    $("#btn1").attr('disabled', false);
                    $("#btn2").attr('disabled', false);
                }else{
                    $('#picture').attr('src', "Images/buttonA.jpg");
                    $('#picture').attr('disabled', false);
                    $("#btn1").attr('disabled', true);
                    $("#btn2").attr('disabled', true);
                }
            });
            $("#picture").click(function(){
                $('#picture').attr('src', "Images/buttonD.jpg");
                $('#picture').attr('disabled', true);
                $("#btn1").attr('disabled', false);
                $("#btn2").attr('disabled', false);
                $("#btn3").attr('disabled', false);
            });
        });