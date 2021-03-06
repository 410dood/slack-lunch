import {USER_NAME, PLACE_NAME, TEAM_ID} from '../Constants';
import validRequest from './builder/RequestBuilder';
import defaultError from './builder/ErrorBuilder';

require('sinon-mongoose');
require('../../app/model/Place');

var proxyquire = require('proxyquire').noCallThru();
var mongoose = require('mongoose');
var Place = mongoose.model('Place');
var PlaceMock = sinon.mock(Place);

const req = validRequest();
const res = sinon.stub();
const sendResponseStub = sinon.stub();
const sendResponseWithPlaceStub = sinon.stub();
const sendErrorStub = sinon.stub();
const pickRandomPlace = proxyquire('../../app/service/pickRandomPlace', {
  './sendResponse': sendResponseStub,
  './sendError': sendErrorStub,
  './sendResponseWithPlace': sendResponseWithPlaceStub
});

describe('pickRandomPlace', () => {

  afterEach(() => {
    sendResponseStub.reset();
    sendErrorStub.reset();
  });

  it('should suggest adding a place if there are no saved places', () => {
    const NO_PLACES_MESSAGE = `@${USER_NAME} there are no places yet! Why don't you try to create the first one by using the \`/add\` command?`;

    PlaceMock
      .expects('findRandom').withArgs({teamId: TEAM_ID})
      .chain('limit', 1)
      .chain('exec')
      .yields(null, []);

    pickRandomPlace(req, res);

    expect(sendResponseStub).to.have.been.calledWith(res, NO_PLACES_MESSAGE);
    sendErrorStub.callCount.should.equal(0);
  });

  it('should suggest the place returned in findRandom', () => {
    const RANDOM_PLACE_MESSAGE = `@${USER_NAME} you should have lunch at *${PLACE_NAME}*`;
    const PLACE = {name: PLACE_NAME};

    PlaceMock
      .expects('findRandom').withArgs({teamId: TEAM_ID})
      .chain('limit', 1)
      .chain('exec')
      .yields(null, [PLACE]);

    pickRandomPlace(req, res);

    expect(sendResponseWithPlaceStub).to.have.been.calledWith(res, RANDOM_PLACE_MESSAGE, PLACE);
    sendErrorStub.callCount.should.equal(0);
  });

  it('should invoke sendError in the case of an error', () => {
    PlaceMock
      .expects('findRandom').withArgs({teamId: TEAM_ID})
      .chain('limit', 1)
      .chain('exec')
      .yields(defaultError(), []);

    pickRandomPlace(req, res);

    expect(sendErrorStub).to.have.been.calledWith(res, defaultError());
    sendResponseStub.callCount.should.equal(0);
  });

});
