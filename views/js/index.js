

$(document).ready(function(e) {

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
        $('.replace-container').load('collections.ejs');
        // get all the new arrival products from the database
        $.ajax({
            type: 'GET',
            url: '/collections/new',
            success: function(data){
                for (i = 0; i < data.rows.length; i++) {
                    addProductToList(data.rows[i]);
                }
            }
        });
    });

    $('#menu-shop-all').on('click', function(e){
        // if (window.location.pathname === '/collections/everything') return;
        $('.replace-container').load('collections.ejs');
        // get all the products from the database
        $.ajax({
            type: 'GET',
            url: '/collections/everything',
            success: function(data){
                for (i = 0; i < data.rows.length; i++) {
                    addProductToList(data.rows[i]);
                }
                // var url = '/collections/everything';
                // history.pushState(null, null, url);
            }
        });
    });
});

function addProductToList(product) {
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
