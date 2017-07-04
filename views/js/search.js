$(document).ready(function(e) {

    $('#search-text').on('keydown', function(e) {
        if (e.which == 13) {
            // get what the user typed
            var userQuery = $(this).val();
            // send to server
            console.log(userQuery);
            $.ajax({
                method: 'GET',
                url: '/collections?search=' + userQuery,
                success: function(data) {
                    // if the page is on the index file
                    if (window.location.pathname == '/'){
                        $('.home-features').hide();
                    }
                    $('.products-list').empty();   // removed the previous content
                    // if the result is 0
                    if (data == "NOT FOUND" || data == undefined){
                        $('.result-label').text("0 results");
                        return;
                    }
                    $('.result-label').text(data.length + " results");   // display the number of results
                    // get json array of products which match query in some way
                    for (i = 0; i < data.length; i++) {
                        addProductToList(data[i]);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('Error!!!!');
                }
            });
            e.preventDefault();
        }
    });

    $('#search-text').blur(function() {
        $(this).val('');
    }); //END blur()
});

function addToCart(pid){
    var productId = pid;
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
}

function addProductToList(product) {
    var imagepath = '../'+product.imagepath;
    var productHTML = '<div class="products-list_single">';
    productHTML += '<img class = "product-image" width = "250px" height = "250px" src ="'+imagepath+'"><br />';
    productHTML += '<span class = "product-name"></span><br />';
    productHTML += '<span class = "product-price"></span><br />';
    productHTML += '<button id = "'+product.id+'" class="cart-submit" onclick = addToCart(this.id)>ADD TO CART</button><br />';
    var $newProduct = $(productHTML);
    $newProduct.find('.product-name').text(product.name);
    $newProduct.find('.product-price').text(product.price);
    $('.products-list').append($newProduct);
}
