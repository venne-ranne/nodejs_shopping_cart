// number to store users shopping cart
var shoppingCartNumber = undefined;
$(document).ready(function(e) {

    //when page is loaded make a request to the server to a shopping cart number
    // $.ajax({
    //     method: 'POST',
    //     url: '/cart',
    //     success: function(data) {
    //         shoppingCartNumber = data.cartid;
    //         console.log('Shopping cart number = ' + shoppingCartNumber);
    //     },
    //     error: function(jqXHR, textStatus, errorThrown) {
    //         console.log('Server failed to provide shopping cart number');
    //     }
    // });

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
        // $.ajax({
        //     type: 'GET',
        //     url: '/cart',
        //     success: function(data){
        //         for (i = 0; i < data.length; i++) {
        //             addProductToCartList(data[i]);
        //         }
        //     }
        // });
    });

    $('.cart-submit').on('click', function(){

    });
});

function clearCart() { $('.shopping-cart').empty(); }

// selected item is the product id when the button addToCart is clicked
function addToCart(selectedItem){
    console.log(selectedItem);
    $.ajax({
        method: 'PUT',
        url: '/cart',
        data: JSON.stringify({
            cartid: shoppingCartNumber,
            id: selectedItem
        }),
        contentType: 'application/json',
        dataType: 'json',
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('failed to add item to cart');
        },
        success: function(data){
            //addProductToCartList(data[0]);
            console.log('item added to cart');
        }
    });
}

function addProductToCartList(product) {
    var imagepath = '../'+product.imagepath;
    var cartHTML = '<li class = "shopping-list">';
    cartHTML += '<img class = "cart-image" src ="'+imagepath+'" width = "50px" height = "50px">';
    cartHTML += '<label class = "cart-name-label"></label>';
    cartHTML += '<input type="number" name="quantity" min="1" max="10" value="1">';
    cartHTML += '<button class = "cart-delete"><span  class = "modern-pic-icon">x</span></button>';
    cartHTML += '<label class = "cart-price-label"></label></li>';
    var $addProduct = $(cartHTML);
    $addProduct.find('.cart-name-label').text(product.name);
    $addProduct.find('.cart-price-label').text(' $'+product.price);
    $('.shopping-cart').append($addProduct);
}
