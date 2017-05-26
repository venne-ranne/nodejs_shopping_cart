$(document).ready(function(e) {

    var login_btn = document.getElementById('signin-btn');
    var register_btn = document.getElementById('register-btn');

    $('#login-dialog').dialog({
      modal:true,
  		autoOpen:false,
      autoResize:true
    });

    $('#login-btn').on('click', function(){
		    $('#login-dialog').dialog('open');
      //  $('#register-container').hide();
        //activate_tabs(register_btn, login_btn);
        //$('#login-container').show();
    }); //end click function

    $('#register-btn').on('click', function(){
        $('#login-container').hide();
        activate_tabs(login_btn, register_btn);
        $('#register-container').show();
    });

    $('#signin-btn, #login-btn').on('click', function(){
        $('#register-container').hide();
        activate_tabs(register_btn, login_btn);
        $('#login-container').show();
    });

    $('#login-submit').on('click', function(){
        console.log("loggin in");
    });

    $('#register-submit').on('click', function(){
        console.log("loggin in");
    });



  var fadeSpeed = 200, fadeTo = 0.5, topDistance = 30;
  var topbarME = function() { $('.header').fadeTo(fadeSpeed,1); }, topbarML = function() { $('.header').fadeTo(fadeSpeed,fadeTo); };
  var inside = false;
  //do
  $(window).scroll(function() {
      position = $(window).scrollTop();
      if(position > topDistance && !inside) {
          //add events
          topbarML();
          $('.header').bind('mouseenter',topbarME);
          $('.header').bind('mouseleave',topbarML);
          inside = true;
      }
      else if (position < topDistance){
          topbarME();
          $('.header').unbind('mouseenter',topbarME);
          $('.header').unbind('mouseleave',topbarML);
          inside = false;
      }
  });

}); // end ready


function activate_tabs(button1 , button2){
  button1.style.removeProperty('background');
  button1.style.removeProperty('color');
  button2.style.background = '#3c43a4';
  button2.style.color = 'white';
}
