const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const stubPromise = require('sinon-stub-promise');
stubPromise(sinon);
const storj = require('storj-lib');
const expect = require('chai').expect;
const EventEmitter = require('events').EventEmitter;
const Config = require('../../../lib/config');
const ReferralsRouter = require('../../../lib/server/routes/referrals');
const ReadableStream = require('stream').Readable;
const errors = require('storj-service-error-types');
const routerOpts = require('../../_fixtures/router-opts');
const Mailer = require('storj-service-mailer');
const Storage = require('storj-service-storage-models');
const defaults = require('../../../lib/config.js').DEFAULTS;
const mailer = new Mailer(defaults.mailer);
const Promise = require('bluebird');
const test = require('tape');

let sandbox;

beforeEach(function() {
  sandbox = sinon.sandbox.create();
});

afterEach(function() {
  sandbox.restore();
});

describe('#referralsRouter', function() {
  const referrals = new ReferralsRouter(routerOpts);

  describe('@constructor', function() {
    it('smoke test', function(done) {
      expect(referrals).to.be.instanceOf(ReferralsRouter);
      expect(referrals.storage).to.be.instanceOf(Storage);
      expect(referrals.mailer).to.be.instanceOf(Mailer);
      expect(referrals.config).to.be.instanceOf(Config);
      done();
    });
  });

  describe('#sendReferralEmail', function() {
    it('should send referral email', function(done) {

      done();
    });
  });

  describe('#_sendEmail', function() {
    it('send email', function(done) {
      const sender = 'sender@example.com';
      const recipient = 'recipient@example.com';
      const marketing = new referrals.storage.models.Marketing({
        user: 'dylan@storj.io',
        referralLink: 'abc-123'
      });

      const _dispatch = sandbox.stub(Mailer.prototype, 'dispatch')
        .callsArgWith(3, null);

      const refs = referrals._sendEmail(sender, recipient, marketing);
      expect(refs).to.be.instanceOf(Promise);
      expect(_dispatch.callCount).to.equal(1);
      done();
    });

    it('should reject if error sending email', (done) => {
      const sender = 'sender@example.com';
      const recipient = 'recipient@example.com';
      const marketing = new referrals.storage.models.Marketing({
        user: 'dylan@storj.io',
        referralLink: 'abc-123'
      });

      const err = new errors.BadRequestError('Internal mailer error');

      const _dispatch = sandbox.stub(Mailer.prototype, 'dispatch')
        .callsArgWith(3, err);

      const refs = referrals._sendEmail(sender, recipient, marketing);
      expect(refs._settledValue).to.be.instanceOf(Error);
      expect(refs._settledValue.statusCode).to.equal(500);
      expect(refs._settledValue.message).to.equal('Internal mailer error');
      expect(refs).to.be.instanceOf(Promise);
      expect(_dispatch.callCount).to.equal(1);
      done();
    });
  });

  describe('#_createReferral', () => {
    it('should resolve with referral', (done) => {
      const mockMarketing = new referrals.models.Marketing({
        user: 'dylan@storj.io',
        referralLink: 'abc-123'
      });
      const mockReferral = new referrals.storage.models.Referral({
        sender: {
          email: 'sender@storj.io',
          referralLink: 'abc-123',
          amount_to_credit: 10
        },
        recipient: {
          email: 'recipient@storj.io',
          amount_to_credit: 10
        },
        type: 'email'
      })
      const email = 'dylan@storj.io';
      const _referral = sandbox.stub(referrals.models.Referral, 'create')
        .returnsPromise();
      _referral.resolves(mockReferral);

      const refs = referrals._createReferral(mockMarketing, email);
      expect(_referral.callCount).to.equal(1);
      done();
    });

    it('should throw error if create referral fails', (done) => {
      const mockMarketing = new referrals.storage.models.Marketing({
        user: 'dylan@storj.io',
        referralLink: null
      });
      const email = 'dylan@storj.io';
      const _referral = sandbox.stub(referrals.models.Referral, 'create')
        .returnsPromise();
      const err = new errors.BadRequestError('Panic!');
      _referral.rejects(err);
      const refs = referrals._createReferral(mockMarketing, email);
      expect(refs._settledValue.code).to.equal(400);
      expect(refs._settledValue.message).to.equal('Panic!');
      expect(refs._settledValue.statusCode).to.equal(400);
      done();
    });
  });

  describe('#sendReferralEmail', () => {
    it('should return resolve', (done) => {
      const mockMarketing = new referrals.storage.models.Marketing({
        user: 'dylan@storj.io',
        referralLink: null
      });

      const mockReferral = new referrals.storage.models.Referral({
        sender: {
          email: 'sender@storj.io',
          referralLink: 'abc-123',
          amount_to_credit: 10
        },
        recipient: {
          email: 'recipient@storj.io',
          amount_to_credit: 10
        },
        type: 'email'
      });

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/referrals/sendReferralEmail',
        body: {
          marketing: mockMarketing,
          emailList: [ 'dylan@storj.io', 'dylan2@storj.io' ]
        }
      });
      const res = httpMocks.createResponse({
        eventEmitter: EventEmitter,
        req: req
      });

      const _notCurrent = sandbox.stub(referrals, '_isNotCurrentUser')
        .returnsPromise()
      _notCurrent.resolves();

      const _sendEmail = sandbox.stub(referrals, '_sendEmail')
        .returnsPromise();
      _sendEmail.resolves();

      const _create = sandbox.stub(referrals, '_createReferral')
        .returnsPromise();
      _create.resolves();

      res.on('end', function() {
        setImmediate(() => {
          const data = res._getData();
          expect(data.successes.length).to.equal(2);
          expect(data.failures.length).to.equal(0);
          expect(res._getData()).to.be.an('object');
          expect(_create.callCount).to.equal(2);
          expect(_sendEmail.callCount).to.equal(2);
          expect(_notCurrent.callCount).to.equal(2);

          done();
        });
      });

      referrals.sendReferralEmail(req, res);
    });

    it('should reject if error sending email', (done) => {
      const mockMarketing = new referrals.storage.models.Marketing({
        user: 'dylan@storj.io',
        referralLink: null
      });
      const mockReferral = new referrals.storage.models.Referral({
        sender: {
          email: 'sender@storj.io',
          referralLink: 'abc-123',
          amount_to_credit: 10
        },
        recipient: {
          email: 'recipient@storj.io',
          amount_to_credit: 10
        },
        type: 'email'
      });

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/referrals/sendReferralEmail',
        body: {
          marketing: mockMarketing,
          emailList: [ 'dylan@storj.io', 'dylan2@storj.io' ]
        }
      });
      const res = httpMocks.createResponse({
        eventEmitter: EventEmitter,
        req: req
      });

      const _notCurrent = sandbox.stub(referrals, '_isNotCurrentUser')
        .returnsPromise()
      _notCurrent.resolves();

      const _sendEmail = sandbox.stub(referrals, '_sendEmail')
        .returnsPromise();
      _sendEmail.resolves();

      const err = new errors.BadRequestError('Panic!!');

      const _create = sandbox.stub(referrals, '_createReferral')
        .returnsPromise();
      _create.rejects(err);

      res.on('end', () => {
        setImmediate(() => {
          const data = res._getData();
          expect(data.failures.length).to.equal(1);
          expect(data.successes.length).to.equal(1);
          expect(data.failures[0].message).to.equal('Panic!!');
          done();
        });
      });

      referrals.sendReferralEmail(req, res);
    });
  });



});
