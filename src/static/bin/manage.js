/* globals $ */
// hljs, FileReader

$(function () {
  $(document).ready(function () {
    console.log('Loaded the manage page')

    // all button delete icons
    $('i.delete').each(function (count, item) {
      var $elem = $(item)
      var $locked = $elem.parent().parent().siblings('td').find('div.btn-group i.fa.lock-status')
      var src = $elem.attr('data-src')
      $elem.on('click', function (event) {
        // If I'm locked display the modal
        // if not delete with redir
        if ($locked.hasClass('fa-lock')) {
          $('#locked_warning').find('#warning-delete').attr('href', src)
          $('#locked_warning').modal('show')
        } else {
          document.location = src
        }
      })
      $elem = undefined
    })
  })
})
