$(document).ready(function(e) {

    $('#order-edit-container').dialog({
        modal:true,
        autoOpen:false,
        autoResize:true,
        minHeight: 380,
        minWidth: 500,
        close: function(){  // to reset the textfield to the default values
            $('#order-edit-container [type=text]').val('');
        }
    });

    $('#user-edit-container').dialog({
        modal:true,
        autoOpen:false,
        autoResize:true,
        minHeight: 380,
        minWidth: 500,
        close: function(){  // to reset the textfield to the default values
            $('#user-edit-container [type=text]').val('');
        }
    });

    $('.saving-btn').on('click', function(e){
      e.preventDefault();
      console.log("save burrrojodjso");123
      $.ajax({
          type: 'PUT',
          url: '/users/row',
          data: JSON.stringify({
            email: $user_email,
            role: $('.user-edit-role').val(),
            name: $('.user-edit-name').val()
          }),
          contentType: 'application/json',
          dataType: 'json',
          success: function(data){
              console.log("update successful...");
              $user_parent.find(".row-user-name").text($('.user-edit-name').val());
              $user_parent.find(".row-user-role").text($('.user-edit-role').val());
              $('#user-edit-container').dialog('close');
          }
      });
    });

    $('.user-table-body').on('click', '.row-user-edit-btn', function(){
        $('#user-edit-container').dialog('open');
        $user_selectedRow = $(this);
        $user_parent = $user_selectedRow.closest("tr");
        $user_email= $user_parent.find(".row-user-email").text();
        $user_password = $user_parent.find(".row-user-password").text();
        $user_name = $user_parent.find(".row-user-name").text();
        $user_role = $user_parent.find(".row-user-role").text();
        $('.user-edit-email').prop('readonly', true);
        $('.user-edit-password').prop('readonly', true);
        $('.user-edit-email').val($user_email);
        $('.user-edit-password').val($user_password);
        $('.user-edit-name').val($user_name);
        $('.user-edit-role').val($user_role);
    });

    $('.table-body').on('click', '.row-edit-btn', function(){
        $('#order-edit-container').dialog('open');
        $item_selectedRow = $(this);
        $item_parent = $item_selectedRow.closest("tr");
        $item_cartid = $item_parent.find(".row-cartid").text();
        $item_date = $item_parent.find(".row-date").text();
        $item_email = $item_parent.find(".row-user").text();
        $('.item-edit-cartid').prop('readonly', true);
        $('.item-edit-email').prop('readonly', true);
        $('.item-edit-date').prop('readonly', true);
        $('.item-edit-cartid').val($item_cartid);
        $('.item-edit-email').val($item_email);
        $('.item-edit-date').val($item_date);
        $.ajax({
            type: 'GET',
            url: '/carts',
            data: JSON.stringify({
              cartid: $item_cartid,
          }),
            success: function(data){
                console.log("get all carts successful...");
            }
        });
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
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('Server failed to provide cart list');
            }
        });
    });

    $('.user-table-body').on('click', '.row-user-delete-btn', function(){
        var $selectedRow = $(this);
        var $parent = $selectedRow.closest("tr");
        var $email = $parent.find(".row-user-email").text();
        // remove a row in users table
        $.ajax({
            type: 'DELETE',
            url: '/users/row',
            data: JSON.stringify({ email:  $email}),
            contentType: 'application/json',
            dataType: 'json',
            success: function(data){
                console.log("user removed successful...");
                $parent.remove();
            }
        });
    });
    //
    // $('.user-table-body').on('click', '.row-user-delete-btn', function(){
    //     var $selectedRow = $(this);
    //     var $parent = $selectedRow.closest("tr");
    //     var $email = $parent.find(".row-user-email").text();
    //     // remove a row in carts table
    //     $.ajax({
    //         type: 'DELETE',
    //         url: '/carts/all/row',
    //         data: JSON.stringify({ email:  $email}),
    //         contentType: 'application/json',
    //         dataType: 'json',
    //         success: function(data){
    //             console.log("user removed successful...");
    //             $parent.remove();
    //         }
    //     });
    // });

    // $('.table-body').on('click', '.row-user-delete-btn', function(){
    //   var $selectedRow = $(this);
    //   var $parent = $selectedRow.closest("tr");
    //   var $cartid = $parent.find(".row-user-email").text();
    //   console.log($cartid);
    //   // remove a row in carts table
    //   $.ajax({
    //       type: 'DELETE',
    //       url: '/carts/all/row',
    //       data: JSON.stringify({ cartid: $cartid}),
    //       contentType: 'application/json',
    //       dataType: 'json',
    //       success: function(data){
    //           console.log("remove successful...");
    //           $parent.remove();
    //       }
    //   });
    // });

    // $('.table-body').on('click', '.row-user-delete-btn', function(){
    //     var $selectedRow = $(this);
    //     var $parent = $selectedRow.closest("tr");
    //     var $cartid = $parent.find(".row-user-email").text();
    //     // need to get all the products in the cart to the edit dialog
    //     $.ajax({
    //         type: 'GET',
    //         url: '/cart?parameter=' + $cartid,row-user-password
    //         success: function(data){
    //             $('.shopping-cart').empty();
    //             for (i = 0; i < data.length; i++) {
    //                 $("#edit-cartid").text("Cart-id: "+$cartid);
    //                 $("#edit-email").text("Email: "+ $parent.find(".row-user").text());
    //                 $("#edit-status").text("Status: "+ $parent.find(".row-status").text());
    //                 var product = data[i];
    //                 var imagepath = '../'+product.imagepath;
    //                 var cartHTML = '<li class = "shopping-list">';
    //                 cartHTML += '<img class = "cart-image" src ="'+imagepath+'" width = "50px" height = "50px">';
    //                 cartHTML += '<label class = "cart-name-label"></label>';
    //                 cartHTML += '<input type="number" name="quantity" min="1" max="10" value="'+product.quantity+'" class = "cart-quantity">';
    //                 cartHTML += '<button id = "btn_'+product.id+'" class = "cart-delete"><span  class = "modern-pic-icon">x</span></button>';
    //                 cartHTML += '<label class = "cart-price-label"></label></li>';
    //                 var $addProduct = $(cartHTML);
    //                 $addProduct.find('.cart-name-label').text(product.name);
    //                 var total = product.price;
    //                 total = parseFloat(total).toFixed(2);
    //                 $addProduct.find('.cart-price-label').text(' $'+total);
    //                 $('.shopping-cart').append($addProduct);
    //             }
    //             $('#order-edit-container').dialog('open');
    //         }
    //     });
    // });


    $('#users-table-btn').on('click', function(){
      $('.order-view-container').hide();
      $('.users-view-container').show();
    });

    $('#carts-table-btn').on('click', function(){
      $('.users-view-container').hide();
      $('.order-view-container').show();
    });

    // if ((localStorage.name != undefined && localStorage.role != 'admin') || localStorage.name == undefined ){
    //     $.ajax({
    //         method: 'POST',
    //         url: '/collections/new',
    //         success: function(data) {
    //             $('.products-list').empty();   // removed the previous content
    //             // get json array of products which match query in some way
    //             $('.products-list').append('</br><span class = "title-name">NEW ARRIVAL</span></br>');
    //             for (i = 0; i < 4; i++) {
    //                 addProductToList(data[i]);
    //             }
    //         },
    //         error: function(jqXHR, textStatus, errorThrown) {
    //             console.log('Error!!!!');
    //         }
    //     });
    // }


});


function admin_dashboard(){
    $('.products-list').empty();
    $('#shopping-cart-li').hide();
    $('#checkout-li').hide();
    $('.replace-container').hide();
    $('.nav-container').hide();
    $('#search-box').hide();
    $('.admin-container').show();
    $('.users-view-container').hide();
    $.ajax({
        type: 'GET',
        url: '/carts/all',
        success: function(data){
            for (i = 0; i < data.length; i++) {
                var product = data[i];
                var status = product.sold ? 'COMPLETER' : 'INCOMPLETE';
                var total = product.subtotal == null ? 0.00 : product.subtotal;
                var rowHTML = '<tr class = "order-rows">';
                rowHTML += '<td class = "row-date">'+product.date_added+'</td>';
                rowHTML += '<td class = "row-cartid">'+product.cartid+'</td>';
                rowHTML += '<td class = "row-status">'+status+'</td>';
                rowHTML += '<td class = "row-user">'+product.email+'</td>';
                rowHTML += '<td class = "row-total">$ '+total+'</td>';
                rowHTML += '<td><button class = "row-edit-btn"><span class = "modern-pic-icon">V</span></button>';
                rowHTML += '<button class = "row-delete-btn"><span class = "modern-pic-icon">X<span></button></td>';
                rowHTML += '</tr>';
                $('.table-body').append(rowHTML);
            }

        }
    });
    $.ajax({
        method: 'GET',
        url: '/users/all',
        success: function(data) {
          for (i = 0; i < data.length; i++) {
              var user = data[i];
              var rowHTML = '<tr class = "order-rows">';
              rowHTML += '<td class = "row-user-email">'+user.email+'</td>';
              rowHTML += '<td class = "row-user-password">'+user.password+'</td>';
              rowHTML += '<td class = "row-user-name">'+user.name+'</td>';
              rowHTML += '<td class = "row-user-role">'+user.role+'</td>';
              rowHTML += '<td><button class = "row-user-edit-btn"><span class = "modern-pic-icon">V</span></button>';
              rowHTML += '<button class = "row-user-delete-btn"><span class = "modern-pic-icon">X<span></button></td>';
              rowHTML += '</tr>';
              $('.user-table-body').append(rowHTML);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('Error getting users table!!!!');
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
//
// <!--<script>
//     if ((localStorage.name != undefined && localStorage.role != 'admin') || localStorage.name == undefined ){
//         $.ajax({
//             method: 'POST',
//             url: '/collections/new',
//             success: function(data) {
//                 $('.products-list').empty();   // removed the previous content
//                 // get json array of products which match query in some way
//                 $('.products-list').append('</br><span class = "title-name">NEW ARRIVAL</span></br>');
//                 for (i = 0; i < 4; i++) {
//                     addProductToList(data[i]);
//                 }
//             },
//             error: function(jqXHR, textStatus, errorThrown) {
//                 console.log('Error!!!!');
//             }
//         });
//     }
// </script>-->
