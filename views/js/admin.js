$(document).ready(function(e) {
    // if (localStorage.userName !== undefined){
    //   //$('#login-li').hide();
    //   $('#admin-container').hide();
    //   //$('#logout-li').show();
    //   $('#logout-button').text("Hi, "+localStorage.userName + "! logout");
    //   if (localStorage.role === 'admin'){
    //       admin_dashboard();
    //   }
    // } else {
    //   $('#logout-li').hide();
    // }
    $('#order-edit-container').dialog({
        modal:true,
        autoOpen:false,
        autoResize:true,
        minHeight: 380,
        minWidth: 500,
        close: function(){  // to reset the textfield to the default values
            $('#login-dialog [type=email]').val('');
            $('#login-dialog [type=password]').val('');
            $('#login-dialog [type=text]').val('');
        }
    });

    $('.table-body').on('click', '.row-delete-btn', function(){
        var $selectedRow = $(this);
        var $parent = $selectedRow.closest("tr");
        var $cartid = $parent.find(".row-cartid").text();
        console.log($cartid);
        // remove a row in carts table
        $.ajax({
            type: 'DELETE',
            url: '/carts/all/row',
            data: JSON.stringify({ cartid: $cartid}),
            contentType: 'application/json',
            dataType: 'json',
            success: function(data){
                console.log("remove successful...");
                $parent.remove();
            }
        });
    });

    $('.table-body').on('click', '.row-edit-btn', function(){
        var $selectedRow = $(this);
        var $parent = $selectedRow.closest("tr");
        var $cartid = $parent.find(".row-cart-id").text();
        // need to get all the products in the cart to the edit dialog
        $.ajax({
            type: 'GET',
            url: '/cart?parameter=' + $cartid,
            contentType: 'application/json',
            dataType: 'json',
            success: function(data){
                $('.shopping-cart').empty();
                for (i = 0; i < data.length; i++) {
                    $("#edit-cartid").text("Cart-id: "+$cartid);
                    $("#edit-email").text("Email: "+ $parent.find(".row-user").text());
                    $("#edit-status").text("Status: "+ $parent.find(".row-status").text());
                    var product = data[i];
                    var imagepath = '../'+product.imagepath;
                    var cartHTML = '<li class = "shopping-list">';
                    cartHTML += '<img class = "cart-image" src ="'+imagepath+'" width = "50px" height = "50px">';
                    cartHTML += '<label class = "cart-name-label"></label>';
                    cartHTML += '<input type="number" name="quantity" min="1" max="10" value="'+product.quantity+'" class = "cart-quantity">';
                    cartHTML += '<button id = "btn_'+product.id+'" class = "cart-delete"><span  class = "modern-pic-icon">x</span></button>';
                    cartHTML += '<label class = "cart-price-label"></label></li>';
                    var $addProduct = $(cartHTML);
                    $addProduct.find('.cart-name-label').text(product.name);
                    var total = product.price;
                    total = parseFloat(total).toFixed(2);
                    $addProduct.find('.cart-price-label').text(' $'+total);
                    $('.shopping-cart').append($addProduct);
                }
                $('#order-edit-container').dialog('open');
            }
        });
    });

});

function admin_dashboard(){
    $('.products-list').empty();
    $('#shopping-cart-li').hide();
    $('#checkout-li').hide();
    $('.replace-container').hide();
    $('.nav-container').hide();
    $('#search-box').hide();
    $('.admin-container').show();
    $.ajax({
        type: 'GET',
        url: '/carts/all',
        success: function(data){
            for (i = 0; i < data.length; i++) {
                var product = data[i];
                var status = product.sold ? 'COMPLETER' : 'INCOMPLETE';
                var rowHTML = '<tr class = "order-rows">';
                rowHTML += '<td class = "row-date">'+product.date_added+'</td>';
                rowHTML += '<td class = "row-cartid">'+product.cartid+'</td>';
                rowHTML += '<td class = "row-status">'+status+'</td>';
                rowHTML += '<td class = "row-user">'+product.email+'</td>';
                rowHTML += '<td class = "row-total"></td>';
                rowHTML += '<td><button class = "row-edit-btn"><span class = "modern-pic-icon">V</span></button>';
                rowHTML += '<button class = "row-delete-btn"><span class = "modern-pic-icon">X<span></button></td>';
                rowHTML += '</tr>';
                $('.table-body').append(rowHTML);
            }

        }
    });
}

// app.get('/cart', function(req, res) {
//     var cartid = req.session.cartid;
//     var cartid;
//     if (req.session.user.role == 'admin') cartid = req.query.parameter;
//     else cartid = req.session.cartid;
//     console.log(cartid);
//     console.log(req.query);
//     if (cartid != undefined && cartid !== '') {
//         pg.connect(connectionString, function (err, client, done) {
//             if (err) res.status(500).send('Database connection error');
//             });
//             query.on('end', function(result) {
//                 done();
//                 res.render('dashboard.ejs', { layout: 'layouts/dashboard-layout', user: req.session.user, rows: result.rows});
//                 res.render('admin.ejs', { layout: 'layouts/dashboard-layout', user: req.session.user, rows: result.rows});
//             });
//         })
//     }
