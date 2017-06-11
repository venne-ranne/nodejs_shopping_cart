var userEmail = undefined;

$(document).ready(function(e) {

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
            password:hashedPassword,
            cartid:shoppingCartNumber
        };
        console.log(JSON.stringify(formData));
        // send post request with form data as JSON to /login route
        $.ajax({
            method: 'POST',
            url: '/login',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            dataType: 'json',
            success: function(data) {
                console.log(data);
                location.reload();  // change site to reflect logged on status
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
                name:realname,
                cartid:shoppingCartNumber
            };
            console.log(JSON.stringify(formData));
            // send post request with form data as JSON to /register route
            $.ajax({
                method: 'POST',
                url: '/register',
                data: JSON.stringify(formData),
                contentType: 'application/json',
                dataType: 'json',
                success: function(data) {
                    location.reload();  // change site to reflect logged on status
                    //$('#login-btn').html(data.name);
                    //$('#login-dialog').dialog('close');
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if (errorThrown === 'Conflict') {
                        alert('username already exists');
                    }
                }
            });
        }
    });

    $('#logout-btn').on('click', function(){
        console.log("Logout btn is clicked..");
        $.ajax({
            method: 'GET',
            url: '/logout',
            success: function(data) {
                location.reload();
            }
        });
    });

    $('.google-btn').on('click', function(){
        console.log("Sign in with google button is clicked...");
    });
}); // end ready

function activate_tabs(button1 , button2){
    button1.style.removeProperty('background');
    button1.style.removeProperty('color');
    button2.style.background = '#3c43a4';
    button2.style.color = 'white';
}
