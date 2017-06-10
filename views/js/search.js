$(document).ready(function(e) {

    $('#search-text').on('keydown', function(e) {
        if (e.which == 13) {
            console.log("enter!!!");
            $('.replace-container').load('collections.ejs');
            // get what the user typed
            var userQuery = $(this).val();
            // send to server
            console.log(userQuery);
            $.ajax({
                method: 'GET',
                url: '/collections?search=' + userQuery,
                success: function(data) {
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
