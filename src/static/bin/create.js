/* globals $, hljs, FileReader */

var sample = {
  text: {
    status: 200,
    statusText: 'OK',
    httpVersion: 'HTTP/1.1',
    headers: [
      {
        name: 'Content-Type',
        value: 'text/plain'
      }
    ],
    cookies: [],
    content: {
      mimeType: 'text/plain',
      text: 'Hello World'
    }
  },

  json: {
    status: 200,
    statusText: 'OK',
    httpVersion: 'HTTP/1.1',
    headers: [
      {
        name: 'Content-Type',
        value: 'application/json'
      }
    ],
    cookies: [],
    content: {
      mimeType: 'application/json',
      text: '{\n    "foo": "Hello Word"\n}'
    }
  },

  jsonp: {
    status: 200,
    statusText: 'OK',
    httpVersion: 'HTTP/1.1',
    headers: [
      {
        name: 'Content-Type',
        value: 'application/javascript'
      }
    ],
    cookies: [],
    content: {
      mimeType: 'application/javascript',
      text: 'callback({\n    "foo": "Hello Word"\n})'
    }
  },

  xml: {
    status: 200,
    statusText: 'OK',
    httpVersion: 'HTTP/1.1',
    headers: [
      {
        name: 'Content-Type',
        value: 'application/xml'
      }
    ],
    cookies: [],
    content: {
      mimeType: 'application/xml',
      text: '<?xml version="1.0"?>\n<foo>Hello World</foo>'
    }
  }
}

$(function () {
  $('select[name="example"]').on('change', function (e) {
    var data = sample[$(this).val()]

    if (data) {
      $('input[name="response"]').val(JSON.stringify(data))
      $('pre code').text(JSON.stringify(data, null, 2))
      hljs.highlightBlock($('pre code')[0])
    }
  })

  $('input[type="file"]').on('change', function (e) {
    var file = e.target.files[0]

    if (!file) {
      return
    }

    var reader = new FileReader()

    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result)
      } catch (e) {
        console.log(e)
      }

      if (data) {
        $('input[name="response"]').val(JSON.stringify(data))

        $('pre code').text(JSON.stringify(data, null, 2))
        hljs.highlightBlock($('pre code')[0])
      }
    }

    reader.readAsText(file)
  })

  var addKeyPair = function (event) {
    var self = $(this)

    var group = self.parents('.form-group')
    var form = self.parents('form')

    group.clone().appendTo(form)
  }

  var processFormData = function (event) {
    var response = {
      status: '',
      statusText: '',
      httpVersion: 'HTTP/1.1',
      headers: [],
      cookies: [],
      content: {
        mimeType: '',
        text: ''
      }
    }

    $('.has-error').removeClass('has-error')

    $('.form input:not(:valid)').each(function () {
      $(this).parents('.form-group').addClass('has-error')
    })

    var forms = [{ form: 'status', parent: response }, { form: 'content', parent: response.content }]

    forms.forEach(function (item) {
      $('form[name="' + item.form + '"] div.form-group:not(.pair) .form-control').each(function () {
        var self = $(this)

        item.parent[self.attr('name')] = self.val()
      })
    })

    var groups = ['headers', 'cookies']

    groups.forEach(function (pair) {
      var params = []

      $('form[name="' + pair + '"] .pair input[name="name"]').slice(0, -1).each(function (index, header) {
        var value = $(header).val()

        if (value.trim() !== '') {
          params.push({ name: value })
        }
      })

      $('form[name="' + pair + '"] .pair input[name="value"]').slice(0, -1).each(function (index, header) {
        if (params[index]) {
          params[index].value = $(header).val()
        }
      })

      response[pair] = params
    })

    // fix type issues
    response.status = parseInt(response.status, 10)

    $('input[name="response"]').val(JSON.stringify(response))
    $('pre code').text(JSON.stringify(response, null, 2))

    hljs.highlightBlock($('pre code')[0])
  }

  $('.toggle-comments').on('click', function (event) {
    $('.form').toggleClass('no-comments')
    $('.form  input[name="comment"]').attr('disabled', $(this).hasClass('active'))
  })

  $('form').on('click', '.form-group.pair:last-of-type .btn-success', addKeyPair)

  $('form').on('focus', '.form-group.pair:last-child input', addKeyPair)

  $('form').on('click', '.form-group.pair .btn-danger', function (event) {
    $(this).parents('.form-group').remove()
  })

  $('form').on('keyup keypress change blur', '.form-control', processFormData)
  $('form').on('click', '[type!="submit"].btn', processFormData)

  $(document).ready(function () {
    processFormData()
  })
})
