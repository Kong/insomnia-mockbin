'use strict';

const bodyParserMiddleware = require('../../lib/middleware/body-parser');
const httpMocks = require('node-mocks-http');

let expect;

// Setup Chai before running tests
before(async () => {
  const chai = await import('chai');
  expect = chai.expect;
});

// Test generated using Keploy

describe('Body Parser Middleware', () => {
it('should parse valid JSON body', (done) => {
  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/test',
    headers: {
      'content-type': 'application/json',
    },
  });
  const res = httpMocks.createResponse();

  bodyParserMiddleware(req, res, () => {
    expect(req.jsonBody).to.deep.equal({ key: 'value' });
    done();
  });

  req.emit('data', Buffer.from(JSON.stringify({ key: 'value' })));
  req.emit('end');
});

// Test generated using Keploy

it('should parse URL-encoded form body', (done) => {
  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/test',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
  const res = httpMocks.createResponse();

  bodyParserMiddleware(req, res, () => {
    expect(req.formBody).to.deep.equal({ key: 'value' }); // 
    done();
  });

  req.emit('data', Buffer.from('key=value'));
  req.emit('end');
});

// Test generated using Keploy

  it('should parse multipart/form-data', (done) => {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/test',
    headers: {
      'content-type': `multipart/form-data; boundary=${boundary}`,
    },
  });
  const res = httpMocks.createResponse();

  const multipartBody = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="key"',
    '',
    'value',
    `--${boundary}--`,
  ].join('\r\n');

  bodyParserMiddleware(req, res, () => {
    expect(req.multiPartSimple.key).to.deep.equal('value');
    done();
  });

  req.emit('data', Buffer.from(multipartBody));
  req.emit('end');
});

// Test generated using Keploy

it('should handle missing Content-Type header', (done) => {
  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/test',
    headers: {},
  });
  const res = httpMocks.createResponse();

  bodyParserMiddleware(req, res, () => {
    expect(req.contentType).to.be.oneOf([null, undefined]);
    done();
  });

  req.emit('data', Buffer.from('Some data'));
  req.emit('end');
});

it('should parse JSON body correctly', (done) => {
  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/test',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ key: 'value' }),
  });
  const res = httpMocks.createResponse();

  bodyParserMiddleware(req, res, () => {
    expect(req.jsonBody).to.deep.equal({ key: 'value' });
    done();
  });

  req.emit('data', Buffer.from(JSON.stringify({ key: 'value' })));
  req.emit('end');
});


// Test generated using Keploy

it('should parse form-urlencoded body correctly', (done) => {
  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/test',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: 'key=value&key2=value2',
  });
  const res = httpMocks.createResponse();

  bodyParserMiddleware(req, res, () => {
    expect(req.formBody).to.deep.equal({ key: 'value', key2: 'value2' });
    done();
  });

  req.emit('data', Buffer.from('key=value&key2=value2'));
  req.emit('end');
});


// Test generated using Keploy

it('should parse multipart form-data correctly', (done) => {
  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/test',
    headers: {
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary',
    },
    body: '------WebKitFormBoundary\r\nContent-Disposition: form-data; name="key"\r\n\r\nvalue\r\n------WebKitFormBoundary--',
  });
  const res = httpMocks.createResponse();

  bodyParserMiddleware(req, res, () => {
    expect(req.multiPartSimple.key).to.equal('value');
    done();
  });

  req.emit('data', Buffer.from('------WebKitFormBoundary\r\nContent-Disposition: form-data; name="key"\r\n\r\nvalue\r\n------WebKitFormBoundary--'));
  req.emit('end');
});


// Test generated using Keploy

it('should set req.contentType to null when no Content-Type header is provided', (done) => {
  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/test',
  });
  const res = httpMocks.createResponse();

  bodyParserMiddleware(req, res, () => {
    expect(req.contentType).to.be.oneOf([null, undefined]);
    done();
  });

  req.emit('data', Buffer.from(''));
  req.emit('end');
});

// Test generated using Keploy

it('should not crash on invalid JSON body', (done) => {
  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/test',
    headers: {
      'content-type': 'application/json',
    },
  });
  const res = httpMocks.createResponse();

  bodyParserMiddleware(req, res, () => {
    expect(req.jsonBody).to.be.oneOf([null,undefined]);
    done();
  });

  req.emit('data', Buffer.from('invalid-json'));
  req.emit('end');
});

// Test generated using Keploy

it('should fail gracefully if multipart/form-data is missing a boundary', (done) => {
  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/test',
    headers: {
      'content-type': 'multipart/form-data', // No boundary provided
    },
  });
  const res = httpMocks.createResponse();

  bodyParserMiddleware(req, res, (err) => {
    try {
      expect(err).to.exist;
      expect(err.message).to.include('Boundary required');
      done();
    } catch (error) {
      done(error);
    }
  });

  req.emit('data', Buffer.from('------MissingBoundary\r\nContent-Disposition: form-data; name="key"\r\n\r\nvalue\r\n------MissingBoundary--'));
  req.emit('end');
});

// Test generated using Keploy

it('should call next() when content type is unrecognized', (done) => {
  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/test',
    headers: {
      'content-type': 'application/unknown-type',
    },
  });
  const res = httpMocks.createResponse();

  bodyParserMiddleware(req, res, () => {
    expect(req.contentType).to.equal('application/unknown-type'); // Ensure it recognizes the type
    done();
  });

  req.emit('data', Buffer.from('some random data'));
  req.emit('end');
});

});
