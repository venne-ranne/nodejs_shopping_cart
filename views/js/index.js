

$(document).ready(function(e) {
    $('.replace-container').load('collections.ejs');
    // on dom ready call to collections with no query to get all products
    $.ajax({
        method:'GET',
        url:'/collections',
        success: function(data) {
            clearProducts();
            for (var a = 0; a < data.length; ++ a) {
                addProduct(data[a]);
            }
        }
    });
    var fadeSpeed = 200, fadeTo = 0.5, topDistance = 30;
    var topbarME = function() { $('.header').fadeTo(fadeSpeed,1); };
    var topbarML = function() { $('.header').fadeTo(fadeSpeed,fadeTo);};
    var inside = false;
    //do
    $(window).scroll(function() {
        position = $(window).scrollTop();
        if (position > topDistance && !inside) {
            //add events
            topbarML();
            $('.header').bind('mouseenter',topbarME);
            $('.header').bind('mouseleave',topbarML);
            inside = true;
        } else if (position < topDistance){
            topbarME();
            $('.header').unbind('mouseenter',topbarME);
            $('.header').unbind('mouseleave',topbarML);
            inside = false;
        }
    });

    $('#menu-new').on('click', function(e){
        if (window.location.pathname === '/collections/new') return;
        $('.replace-container').load('collections.ejs');
        // get all the products from the database
        $.ajax({
            type: 'GET',
            url: '/collections/everything',
            success: function(data){
                for (i = 0; i < data.rows.length; i++) {
                    var productId = 'product_'+data.rows[i].id;  // add the id to the div
                    var imagepath = ''+data.rows[i].imagepath;     // add the imagepath to src
                    var productHTML = '<div class="products-list_single">';
                    productHTML += '<img class = "product-image" width = "250px" height = "250px" src ="'+imagepath+'"><br />';
                    productHTML += '<span class = "product-name"></span><br />';
                    productHTML += '<span class = "product-price"></span><br />';
                    productHTML += '<button id = "'+productId+'" class="cart-submit" onclick = addToCart(this.id)>ADD TO CART</button><br />';
                    var $newProduct = $(productHTML);
                    $newProduct.find('.product-name').text(data.rows[i].name);
                    $newProduct.find('.product-price').text(data.rows[i].price);
                    $('.products-list').append($newProduct);
                }
                var url = e.target.getAttribute('data-name');
                history.pushState(null, null, url); // what does this do???
            }
        });
    });
});

// selected item is the product id
function addToCart(selectedItem){
    console.log(selectedItem);
    $.ajax({
        type: 'PUT',
        url: '/cart',
        data: JSON.stringify({
            cartid: shoppingCartNumber,
            id: selectedItem
        }),
        contentType: 'application/json',
        dataType: 'json',
        success: function(data){
            var imagepath = ''+data[0].imagepath;     // add the imagepath to src
            var cartHTML = '<li class = "shopping-list">';
            cartHTML += '<img class = "cart-image" src ="'+imagepath+'" width = "50px" height = "50px">';
            cartHTML += '<label class = "cart-name-label"></label>';
            cartHTML += '<input type="number" name="quantity" min="1" max="10" value="1">';
            cartHTML += '<button class = "cart-delete"><span  class = "modern-pic-icon">x</span></button>';
            cartHTML += '<label class = "cart-price-label"></label></li>';
            var $addProduct = $(cartHTML);
            $addProduct.find('.cart-name-label').html(data[0].name);
            $addProduct.find('.cart-price-label').html(' $'+data[0].price);
            $('.shopping-cart').append($addProduct);
            console.log(data[0].name);
        }
    });
}

function clearProducts() {
    $('.products-list').empty();
}

function addProduct(product) {
    //console.log('Adding product: ' + product.name);
    var productHTML = '<div class="products-list_single">';
    productHTML += '<img class = "product-image" width = "250px" height = "250px" src ="'+product.imagepath+'"><br />';
    productHTML += '<span class = "product-name"></span><br />';
    productHTML += '<span class = "product-price"></span><br />';
    productHTML += '<button id = "'+product.id+'" class="cart-submit" onclick = addToCart(this.id)>ADD TO CART</button><br />';
    var $newProduct = $(productHTML);
    $newProduct.find('.product-name').text(product.name);
    $newProduct.find('.product-price').text(product.price);
    $('.products-list').append($newProduct);
}
