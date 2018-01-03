/* globals $ */

$(function () {
  $('.lock-status').on('click', function (event) {
    updateButtonLockStatus($(this))
  })

  $(window).on('load', function () {
    if (getButtonLockStatus($('#locked'))) {
      $('#locked_warning').modal('show')
    }
  })

  $('#warning-edit').on('click', function () {
    $('#locked_warning').modal('hide')
    $('#locked').click()
  })

  $('#warning-cancel').on('click', function () {
    window.location = '/bin/' + $('#update-bin').attr('uuid') + '/view'
  })

  $('i.fa.fa-edit').on('click', function () {
    $($(this).attr('tgt')).removeAttr('readonly')
  })

  $(document).ready(function () {

  })

  function updateButtonLockStatus ($button) {
    var $input = $button.siblings('input[name=' + $button.attr('id') + ']')
    var curr, next

    if ($input.val() === 'true') {
      curr = 'fa-lock'
      next = 'fa-unlock-alt'
    } else {
      curr = 'fa-unlock-alt'
      next = 'fa-lock'
    }

    // toggle a hidden element with the lock status
    $input.val(next === 'fa-lock' ? 'true' : 'false')
    $button.find('i').removeClass(curr).addClass(next)
  }

  function getButtonLockStatus ($button) {
    var $input = $button.siblings('input[name=' + $button.attr('id') + ']')
    return $input.val() === 'true'
  }
})
