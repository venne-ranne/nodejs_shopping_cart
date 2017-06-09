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
            console.log('Server failed to provide shopping cart number');
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
        // send get to cart with cartid as a url query
        $.ajax({
            method: 'GET',
            url: '/cart?cartid=' + shoppingCartNumber,
            success: function(data) {
                clearCart();
                for (var a = 0; a < data.length; ++ a) {
                    console.log('Adding data to cart : ' + data[a]);
                    addToCartHTML(data[a]);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {

            }
        });
    });

    $('.cart-submit').on('click', function(){

    });
});

function clearCart() { $('.shopping-cart').empty(); }

function addToCartHTML(product) {
    console.log(product);
    var cartHTML = '<li class = "shopping-list">';
    cartHTML += '<img class = "cart-image" src ="' + product.imagepath + '" width = "50px" height = "50px">';
    cartHTML += '<label class = "cart-name-label"></label>';
    cartHTML += '<input type="number" name="quantity" min="1" max="10" value="' + product.quantity + '">';
    cartHTML += '<button class = "cart-delete"><span  class = "modern-pic-icon">x</span></button>';
    cartHTML += '<label class = "cart-price-label"></label></li>';
    var $addProduct = $(cartHTML);
    $addProduct.find('.cart-name-label').html(product.name);
    $addProduct.find('.cart-price-label').html(' $' + product.price);
    $('.shopping-cart').append($addProduct);
    console.log(product.name);
}
