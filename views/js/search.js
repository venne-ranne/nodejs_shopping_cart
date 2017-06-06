$(document).ready(function(e) {
    $('#search-text').on('keydown', function(e) {
        if (e.which == 13) {
            console.log("enter!!!");
            // get what the user typed
            var userQuery = $(this).val();
            // send to server
            console.log(userQuery);
            $.ajax({
                method: 'GET',
                url: '/collections?search=' + userQuery,
                success: function(data) {
                    // get json array of products which match query in some way
                    for (var a = 0; a < data.length; ++ a) {
                        console.log(data[a].name + ' : ' + data[a].description);
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
