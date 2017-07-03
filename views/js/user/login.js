var userEmail = undefined;
function start() {
    gapi.load('auth2', function() {
        auth2 = gapi.auth2.init({
            client_id: '529872489200-7p4rr06g8ari4q01ti122kfbrntmnkp2.apps.googleusercontent.com'
        });
    });
}

$(document).ready(function(e) {
    if (localStorage.name == undefined){
        $('#logout-li').hide();
        $('#admin-container').hide();
    } else {
      $('#login-li').hide();
      $('#logout-li').show();
      $('#logout-button').text("Hi, "+localStorage.name + "! logout");
      if (localStorage.role == 'admin'){
          admin_dashboard();
          //window.location.href = "/admin";
      }
    }
    var login_btn = document.getElementById('signin-btn');
    var register_btn = document.getElementById('register-btn');
    var salt = -1;

    $('#login-dialog').dialog({
        modal:true,
        autoOpen:false,
        autoResize:true,
        minHeight: 380,
        minWidth: 500,
        close: function(){  // to reset the textfield to the default values
            $('#login-dialog [type=email]').val('');
            $('#login-dialog [type=password]').val('');
            $('#login-dialog [type=text]').val('');
        }
    });

    // login button on the header
    $('#login-btn').on('click', function(){
        // request salt from server

        $.ajax({
            method: 'GET',
            url: '/login',
            success: function(data) {
                salt = data.salt;
                console.log(salt);
            }
        });
        $('#login-dialog').dialog('open');
    }); //end click function

    // hide the login form when register form is showing
    $('#register-btn').on('click', function(){
        $('#login-container').hide();
        activate_tabs(login_btn, register_btn);
        $('#register-container').show();
    });

    // hide the register form when login form is showing
    $('#signin-btn, #login-btn').on('click', function(){
        $('#register-container').hide();
        activate_tabs(register_btn, login_btn);
        $('#login-container').show();
    });

    // when login button in the login dialog is clicked
    $('#login-submit').on('click', function(){
        // get form data
        var username = $('#email').val();
        var plainTextPassword = $('#password').val();
        var saltedPassword = plainTextPassword + salt;
        var hashedPassword = CryptoJS.SHA256(saltedPassword).toString();
        var formData = {
            email:username,
            password:hashedPassword
        };
        console.log(JSON.stringify(formData));
        // send post request with form data as JSON to /login route
        $.ajax({
            method: 'POST',
            url: '/login',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            dataType: 'json',
            success: function(data, textStatus, response) {
                localStorage.email = response.getResponseHeader('email');
                localStorage.name = response.getResponseHeader('name');
                localStorage.role = data.user.role;
                console.log('Name : ' + localStorage.name);
                console.log('Email : ' + localStorage.email);
                $('#login-li').hide();
                $('#logout-li').show();
                $('#logout-button').text("Hi, "+localStorage.name + "! logout");
                if (data.user.role === 'admin'){
                    //indow.location.href = "/admin"; // redirect to admin
                    admin_dashboard();
                }
                $('#login-dialog').dialog('close');
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (errorThrown === 'Unprocessable Entity') {
                    alert('incorrect username');
                } else if (errorThrown === 'Forbidden') {
                    alert('incorrect password');
                }
            }
        });
    });

    $('#register-submit').on('click', function(){
        // get form data
        var realname = $('#name-reg').val();
        var username = $('#email-reg').val();
        var password1 = $('#password-reg').val();
        var password2 = $('#password-reg-confirm').val();
        // check passwords match
        if (password1 !== password2) {
            // could be prettier
            alert('Passwords do not match');
        } else {
            // salt and hash password
            var saltedPassword = password1 + salt;
            var hashedPassword = CryptoJS.SHA256(saltedPassword).toString();
            var formData = {
                email:username,
                password:hashedPassword,
                name:realname
            };
            console.log(JSON.stringify(formData));
            // send post request with form data as JSON to /register route
            $.ajax({
                method: 'POST',
                url: '/register',
                data: JSON.stringify(formData),
                contentType: 'application/json',
                dataType: 'json',
                success: function(data, textStatus, response) {
                    localStorage.userEmail = response.getResponseHeader('userEmail');
                    localStorage.userName = response.getResponseHeader('userName');
                    localStorage.role = data.user.role;
                    $('#login-li').hide();
                    $('#logout-li').show();
                    $('#logout-button').text("Hi, "+localStorage.userName + "! logout");
                    //location.reload();  // change site to reflect logged on status
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if (errorThrown === 'Conflict') {
                        alert('username already exists');
                    }
                    console.log('register error');
                }
            });
        }
    });

    $('#logout-button').on('click', function(){
        console.log("Logout btn is clicked..");
        $.ajax({
            method: 'GET',
            url: '/logout',
            success: function(data, textStatus, request) {
                localStorage.removeItem('email');
                localStorage.removeItem('name') ;
                localStorage.removeItem('role');
                after_logout_display();
                //location.reload();
            }
        });
    });

    $('.google-btn').on('click', function(){
        console.log("Sign in with google button is clicked...");
        auth2.grantOfflineAccess().then(function (result) {
            if (result['code']) {
                // Send the code to the server
                var code = {
                    code: result.code
                }
                $.ajax({
                    type: 'POST',
                    url: '/login/google',
                    contentType: 'application/json',
                    success: function(result, textStatus, response) {
                        console.log('Success : ' + JSON.stringify(result));
                        // login successful - result object contains user
                        // if (result.user.role == 'user'){
                        //     location.reload();  // change site to reflect logged on status
                        // } else {
                        //     window.location.href = "/admin"; // redirect to admin
                        // }
                        $('#login-li').hide();
                        $('#logout-li').show();
                        $('#logout-button').text("Hi, "+localStorage.userName + "! logout");
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log('Error');
                    },
                    processData: false,
                    data: JSON.stringify(code)
                });
            } else {
                console.log('Error');
            }
        });
    }); // end click
}); // end ready

function after_logout_display(){
    $('#shopping-cart-li').show();
    $('#checkout-li').show();
    $('.replace-container').show();
    $('.nav-container').show();
    $('#search-box').show();
    $('.admin-container').hide();
    $('#logout-li').hide();
    $('#login-li').show();
}

function activate_tabs(button1 , button2){
    button1.style.removeProperty('background');
    button1.style.removeProperty('color');
    button2.style.background = '#3c43a4';
    button2.style.color = 'white';
}
