$(document).ready(function(e) {
    if (localStorage.cartid == undefined || localStorage.cartid === 'null') {
        localStorage.removeItem('cartid');
        $('#total-num-cart').text(0);
    } else {
        getCartSize();
    }
    var subtotal = 0.00;

    $('#cart-checkout-submit').on('click', function() {
        $.ajax({
            type: 'POST',
            url: '/carts/checkout',
            success: function(data, textStatus, response){
                localStorage.removeItem('cartid');
                $('.shopping-cart-container').dialog('close');
                location.reload();
            }
        });
    });

    // pop-up shopping cart dialog box
    $('.shopping-cart-container').dialog({
        modal:true,
        autoOpen:false,
        autoResize:true,
        minWidth: 450,
        resizable: false,
        position: { my: "bottom+120%", at: "right bottom", of: '#shopping-cart-btn' }
    });

    // when the shopping cart button on header is clicked
    $('#shopping-cart-btn').on('click', function(){
        $.ajax({
            type: 'GET',
            url: '/carts',
            success: function(data, textStatus, response){
                getHeaders(response);
                subtotal = 0.00;
                $('.shopping-cart').empty();
                for (i = 0; i < data.length; i++) {
                    addProductToCartList(data[i]);
                    subtotal = subtotal+(data[i].quantity*data[i].price);
                }
                subtotal = parseFloat(subtotal).toFixed(2);  // two decimal points
                $('.cart-subtotal').text(' $'+subtotal);
            }
        });
        $('.shopping-cart-container').dialog('open');
    });

    // selected item is the product id when the button addToCart is clicked
    $('.cart-submit').on('click', function(){
        var productId = this.id;
        var total_items = document.getElementById("total-num-cart").innerHTML;
        // set up the cartid number for the first-timer
        console.log('Adding item to cart, total:' + total_items);
        if (localStorage.cartid == undefined){
            console.log('No items making new cart');
            var user = localStorage.email || 'guest';
            $.ajax({
                method: 'POST',
                url: '/carts',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({email:user}),
                success: function(data, textStatus, res) {
                    getHeaders(res);
                    console.log(JSON.stringify(data));
                    localStorage.cartid = data.cartid;
                    updateTotalCartNumber(productId, total_items);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('Server failed to provide shopping cart number');
                }
            });
        } else {
            // put the new added item to the cart
            updateTotalCartNumber(productId, total_items);
        }
    });

    $('.shopping-cart').on('click', '.cart-delete', function(){
        var $deleteItem = $(this);
        var itemId = parseInt(this.id.substr(4));
        var quantity = $deleteItem.siblings('.cart-quantity').attr('value');
        $.ajax({
            method: 'DELETE',
            url: '/carts',
            data: JSON.stringify({ id: itemId, numItems: quantity, cartid: localStorage.cartid}),
            contentType: 'application/json',
            dataType: 'json',
            success: function(data, textStatus, response){
                getHeaders(response);
                $deleteItem.parent('li').effect('puff', function(){ $deleteItem.remove(); });
                minusTotal = (quantity*data.products[0].price);
                subtotal = parseFloat(subtotal-minusTotal).toFixed(2);  // two decimal points
                getCartSize();
                $('#total-num-cart').text(data.totalcart);
                $('.cart-subtotal').text(' $'+subtotal);
                console.log("item deleted from cart.");
            }
        });
    });
//
//     $('.shopping-cart').on('change', '.cart-quantity', function(){
//         var $deleteItem = $(this);
//         var itemId = parseInt(this.id.substr(4));
//         var changeValue = $deleteItem[0].value;
//         $.ajax({
//             method: 'PUT',
//             url: '/carts/quantity',
//             data: JSON.stringify({ id: itemId, quantity: changeValue}),
//             contentType: 'application/json',
//             dataType: 'json',
//             success: function(data, textStatus, response){
//                 getHeaders(response);
//                 console.log("effdsf");
//                 $deleteItem.parent('li').effect('puff', function(){ $deleteItem.remove(); });
//                 minusTotal = (quantity*data.products[0].price);
//                 subtotal = parseFloat(subtotal-minusTotal).toFixed(2);  // two decimal points
//                 $('#total-num-cart').text(data.totalcart);
//                 $('.cart-subtotal').text(' $'+subtotal);
//                 console.log("item deleted from cart.");
//             }
//         });
//     });
 });

// update the cart total number when an item is added to cart
function updateTotalCartNumber(selectedItem, total_items){
    $.ajax({
        method: 'PUT',
        url: '/carts',
        data: JSON.stringify({ id: selectedItem }),
        contentType: 'application/json',
        dataType: 'json',
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('failed to add item to cart');
        },
        success: function(data, textStatus, response){
            console.log(localStorage.cartid);
            getCartSize();
        }
    });
}

// Gets the size of the shopping cart
function getCartSize() {
    $.ajax({
        method: 'GET',
        url: '/carts/size',
        success: function(data, textStatus, response) {
            $('#total-num-cart').text(data.total.sum);
        }
    });
}

// add a product to the shopping cart list
function addProductToCartList(product) {
    var imagepath = '../'+product.imagepath;
    var cartHTML = '<li class = "shopping-list">';
    var total = 0.00;
    cartHTML += '<img class = "cart-image" src ="'+imagepath+'" width = "50px" height = "50px">';
    cartHTML += '<label class = "cart-name-label"></label>';
    //cartHTML += '<button class = "cart-plus">+</button>';
    cartHTML += '<input type="number" name="quantity" min="1" max="10" value="'+product.quantity+'" class = "cart-quantity">';
    //cartHTML += '<button class = "cart-minus">+</button>';
    cartHTML += '<button id = "btn_'+product.id+'" class = "cart-delete"><span  class = "modern-pic-icon">x</span></button>';
    cartHTML += '<label class = "cart-price-label"></label></li>';
    var $addProduct = $(cartHTML);
    $addProduct.find('.cart-name-label').text(product.name);
    total = product.price;
    total = parseFloat(total).toFixed(2);
    $addProduct.find('.cart-price-label').text(' $'+total);
    $('.cart-quantity').attr("disabled", true);
    $('.shopping-cart').append($addProduct);
}


function getHeaders(res) {
    console.log('Getting response headers');
    localStorage.name = res.getResponseHeader('name');
    localStorage.email = res.getResponseHeader('email');
    localStorage.role = res.getResponseHeader('role');
    localStorage.cartid = res.getResponseHeader('cartid');
}
