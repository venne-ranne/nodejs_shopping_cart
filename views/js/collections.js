$(document).ready(function(e) {
  // get all the products from the database
  $.ajax({
      type: 'GET',
      url: '/collections',
      success: function(data){
          for (i = 0; i < data.length; i++) {
              var productId = 'product_id'+data[i].id;  // add the id to the div
              var imagepath = ''+data[i].imagepath;     // add the imagepath to src
              var productHTML = '<div class="products-list_single" id = "'+productId+'">';
              productHTML += '<img class = "product-image" width = "250px" height = "250px" src ="'+imagepath+'"><br />';
              productHTML += '<span class = "product-name"></span><br />';
              productHTML += '<span class = "product-price"></span><br />';
              productHTML += '<input type="button" value="ADD TO CART" class="cart-submit"><br />';
              var $newProduct = $(productHTML);
              $newProduct.find('.product-name').text(data[i].name);
              $newProduct.find('.product-price').text(data[i].price);
              $('.products-list').append($newProduct);
          }
      }
  });
});
