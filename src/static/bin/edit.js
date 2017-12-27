/* globals $, hljs, FileReader */

$(function () {
  
  $('.lock-status').on('click', function(event) {
    var $button = $(this)
    var $input = $button.siblings('input[name='+$button.attr('id')+']')
    var curr, next

    console.log( $input )
    console.log( $input.val() )

    if( $input.val() === 'true' ) {
      curr = 'fa-lock'
      next = 'fa-unlock'
    } else {
      curr = 'fa-unlock'
      next = 'fa-lock'
    }

    // toggle a hidden element with the lock status
    $input.val( next == 'fa-lock' ? 'true' : 'false' )
    $button.find('i')
        .removeClass( curr )
        .addClass( next )
  })

  $(document).ready(function () { })
})
