/* globals $ */
// hljs, FileReader

$(function () {
  $(document).ready(function () {
    console.log('Loaded the manage page')

    // all button delete icons
    $('i.delete').each(function(item) {
      var $elem = $(item)
      var $locked = $elem.parent().parent().siblings('td div i.fa.lock').find('div i.fa.lock')
      $elem.on('click',function(event) {
debugger
        // If I'm locked display the modal
        // if not delete with redir
        if( $locked.hasClass('fa-lock') ) {
          // set the button target to 
          // $elem.src
          $('#locked_warning').find('#warning-delete').attr('href',$elem.src)
          $('#locked_warning').modal('show')
        } else {
          alert('Deleting!!', $elem.src)
          // document.location= $elem.src
        }
      }.bind($elem))
    })
  })
})
