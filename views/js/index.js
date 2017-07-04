const headers = ['name', 'email', 'role', 'cartid'];

$(document).ready(function(e) {

    // Set headers to be sent on all ajax requests
    $.ajaxSetup({
        beforeSend: function(req) {
            console.log('Setting headers');
            for (var a = 0; a < headers.length; ++ a) {
                console.log(headers[a] + ':' + localStorage.getItem(headers[a]));
                req.setRequestHeader(headers[a], localStorage.getItem(headers[a]));
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
        //
        // $.ajax({
        //     method: 'POST',
        //     url: '/collections/new',
        //     success: function(data) {
        //         $('.products-list').empty();   // removed the previous content
        //         // get json array of products which match query in some way
        //         $('.products-list').append('</br><span class = "title-name">NEW ARRIVAL</span></br>');
        //         for (i = 0; i < 4; i++) {
        //             addProductToList(data[i]);
        //         }
        //     },
        //     error: function(jqXHR, textStatus, errorThrown) {
        //         console.log('Error!!!!');
        //     }
        // });
        //
        // $.ajax({
        //     method: 'POST',
        //     url: '/collections/new',
        //     success: function(data) {
        //         $('.products-list').empty();   // removed the previous content
        //         // get json array of products which match query in some way
        //         $('.products-list').append('</br><span class = "title-name">NEW ARRIVAL</span></br>');
        //         for (i = 0; i < 4; i++) {
        //             addProductToList(data[i]);
        //         }
        //     },
        //     error: function(jqXHR, textStatus, errorThrown) {
        //         console.log('Error!!!!');
        //     }
        // });

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
