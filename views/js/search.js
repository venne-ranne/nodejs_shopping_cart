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

                    // if the result is 0
                    if (data == "NOT FOUND"){
                        $('.result-label').text("0 results");
                        return;
                    }
                    $('.products-list').empty();   // removed the previous content
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
