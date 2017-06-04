$(document).ready(function(e) {

    // pop-up shopping cart dialog box
    $('.shopping-cart-container').dialog({
        modal:true,
        autoOpen:false,
        autoResize:true,
        minWidth: 380,
         resizable: false,
        position: { my: "bottom+200", at: "right bottom", of: '#shopping-cart-btn' }
    });

    // when the shopping cart button on header is clicked
    $('#shopping-cart-btn').on('click', function(){
        $('.shopping-cart-container').dialog('open');
    });

    $('.cart-submit').on('click', function(){

    });
});
