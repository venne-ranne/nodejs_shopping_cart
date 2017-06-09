// number to store users shopping cart
var shoppingCartNumber = undefined;
$(document).ready(function(e) {
    // when page is loaded make a request to the server to a shopping cart number
    $.ajax({
        method: 'POST',
        url: '/cart',
        success: function(data) {
            shoppingCartNumber = data.cartid;
            console.log('Shopping cart number = ' + shoppingCartNumber);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('Server failed to respond to request for shopping cart number');
        }
    });
    // pop-up shopping cart dialog box
    $('.shopping-cart-container').dialog({
        modal:true,
        autoOpen:false,
        autoResize:true,
        minWidth: 380,
        resizable: false,
        position: { my: "bottom+120%", at: "right bottom", of: '#shopping-cart-btn' }
    });

    // when the shopping cart button on header is clicked
    $('#shopping-cart-btn').on('click', function(){
        $('.shopping-cart-container').dialog('open');
    });

    $('.cart-submit').on('click', function(){

    });
});
