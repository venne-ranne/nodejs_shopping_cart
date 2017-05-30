$(document).ready(function(e) {

    var login_btn = document.getElementById('signin-btn');
    var register_btn = document.getElementById('register-btn');
    var salt = -1;

    $('#login-dialog').dialog({
      modal:true,
  		autoOpen:false,
      autoResize:true,
      minHeight: 300,
      minWidth: 500,
			close: function(){  // to reset the textfield to the default values
				$('#login-dialog [type=email]').val('');
        $('#login-dialog [type=password]').val('');
        $('#login-dialog [type=text]').val('');
			}
    });

    $('#login-btn').on('click', function(){
            // request salt from server
            $.ajax({
                method: 'GET',
                url: '/login',
                success: function(data) {
                    salt = data;
                }
            });
		    $('#login-dialog').dialog('open');
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
        // get form data
        var username = $('#email').val();
        var plainTextPassword = $('#password').val();
        var saltedPassword = plainTextPassword + salt;
        var hashedPassword = CryptoJS.SHA256(saltedPassword).toString();
        var formData = { email:username, password:hashedPassword};
        console.log(JSON.stringify(formData));
        // send post request with form data as JSON to /login route
        $.ajax({
            method: 'POST',
            url: '/login',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            dataType: 'json',
            success: function(data) {
                // recieve token to use in future communications with server
                // change site to reflect logged on status
            }
        });
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
