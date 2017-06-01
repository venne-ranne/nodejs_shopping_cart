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
});
