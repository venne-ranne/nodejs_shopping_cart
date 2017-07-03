

$(document).ready(function(e) {
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader('name', localStorage.name);
            xhr.setRequestHeader('email', localStorage.email);
            xhr.setRequestHeader('role', localStorage.role);
            xhr.setRequestHeader('cartid', localStorage.cartid);
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

    // $('#menu-new').on('click', function(e){
    //     //$('.replace-container').load('collections.ejs');
    //     // get all the new arrival products from the database
    //     $.ajax({
    //         type: 'GET',
    //         url: '/collections/new',
    //         success: function(data){
    //             // for (i = 0; i < data.rows.length; i++) {
    //             //     addProductToList(data.rows[i]);
    //             // }
    //         }
    //     });
    // });

    // $('#menu-shop-all').on('click', function(e){
    //     // if (window.location.pathname === '/collections/everything') return;
    //     $('.replace-container').load('collections.ejs');
    //     // get all the products from the database
    //     $.ajax({
    //         type: 'GET',
    //         url: '/collections/everything',
    //         success: function(data){
    //             for (i = 0; i < data.rows.length; i++) {
    //                 addProductToList(data.rows[i]);
    //             }
    //             // var url = '/collections/everything';
    //             // history.pushState(null, null, url);
    //         }
    //     });
    // });
});
