$(document).ready(function(e) {
  $('#search-text').on('keydown', function(e) {
    if (e.which == 13) {
      console.log("enter!!!");
      e.preventDefault();
    }
  });


  $('#search-text').blur(function() {
    $(this).val('');
  }); //END blur()

  // get all the rows from the
	$.ajax({
		type: 'GET',
		url: '/collections',
		success: function(data){
			for (i = 0; i < data.length; i++) {
				var productId = 'product_id'+data[i].id;  // add the id to the div
        var imagepath = ''+data[i].imagepath;     // add the imagepath to src
        var productHTML = '<div class="products-list_single" id = "'+productId+'">';
        productHTML += '<img class = "product-image" width = "250px" height = "250px" src ="'+imagepath+'">';
        productHTML += '<span class = "product-name"></span>';
        productHTML += '<span class = "product-price"></span>';
        productHTML += '<input type="button" value="ADD TO CART" class="cart-submit">';
        var $newProduct = $(productHTML);
        $newProduct.find('.product-name').text(data[i].name);
        $newProduct.find('.product-price').text(data[i].price);
        $('.products-list').append($newProduct);
			}
		}

	});

});
