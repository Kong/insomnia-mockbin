'use strict';

const errorHandler = require('../../lib/middleware/error-handler');
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

let expect;

// Test generated using Keploy

before(async () => {
  const chai = await import('chai');
  expect = chai.expect;
});

describe('Error Handler Middleware', () => {
  it('should set status to 500 and view to "error" when no status is provided', () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const next = sinon.spy();
    
    const error = new Error('Test error');
    
    errorHandler(error, req, res, next);
    
    expect(res.statusCode).to.equal(500);
    expect(res.view).to.equal('error');
    expect(next.called).to.be.true;
  });
});