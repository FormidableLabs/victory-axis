/* eslint no-unused-expressions: 0 */
/* global sinon */
import Helpers from "src/helper-methods";
import { Chart, Scale } from "victory-util";

describe("helper-methods", () => {
  describe("getDomain", () => {
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(Helpers, "getDomainFromTickValues");
      const fakeGetAxis = () => "x";
      sandbox.stub(Helpers, "getAxis", fakeGetAxis);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("determines a domain from props", () => {
      const props = {domain: [1, 2]};
      const domainResult = Helpers.getDomain(props);
      expect(Helpers.getDomainFromTickValues).notCalled;
      expect(domainResult).to.eql([1, 2]);
    });

    it("calculates a domain from tickValues", () => {
      const props = {tickValues: [1, 2, 3, 4]};
      const domainResult = Helpers.getDomain(props);
      expect(Helpers.getDomainFromTickValues).calledWith(props)
        .and.returned([1, 4]);
      expect(domainResult).to.eql([1, 4]);
    });

    it("returns undefined if the given axis doesn't match this axis", () => {
      const props = {domain: [1, 3]};
      const domainResultX = Helpers.getDomain(props, "x");
      expect(Helpers.getAxis).calledWith(props).and.returned("x");
      expect(domainResultX).to.eql([1, 3]);
      const domainResultY = Helpers.getDomain(props, "y");
      expect(Helpers.getAxis).calledWith(props).and.returned("x");
      expect(domainResultY).to.be.undefined;
    });
  });

  describe("getAxis", () => {
    it("determines the axis based on orientation prop", () => {
      expect(Helpers.getAxis({orientation: "top"})).to.equal("x");
      expect(Helpers.getAxis({orientation: "bottom"})).to.equal("x");
      expect(Helpers.getAxis({orientation: "left"})).to.equal("y");
      expect(Helpers.getAxis({orientation: "right"})).to.equal("y");
    });

    it("determines the axis based on type (dependent / independent)", () => {
      expect(Helpers.getAxis({dependentAxis: true})).to.equal("y");
      expect(Helpers.getAxis({})).to.equal("x");
    });

    it("determines the axis based on type when flipped", () => {
      expect(Helpers.getAxis({dependentAxis: true}, true)).to.equal("x");
      expect(Helpers.getAxis({}, true)).to.equal("y");
    });
  });

  describe("getScale", () => {
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(Helpers, "getDomain");
      const fakeGetAxis = () => "x";
      sandbox.stub(Helpers, "getAxis", fakeGetAxis);
      sandbox.spy(Scale, "getBaseScale");
      const fakeGetRange = () => [0, 100];
      sandbox.stub(Chart, "getRange", fakeGetRange);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("returns a scale", () => {
      const props = {domain: [0, 10]};
      const scaleResult = Helpers.getScale(props);
      expect(Helpers.getAxis).calledWith(props).and.returned("x");
      expect(Scale.getBaseScale).calledWith(props, "x");
      expect(Helpers.getDomain).calledWith(props).and.returned([0, 10]);
      expect(Chart.getRange).calledWith(props, "x").and.returned([0, 100]);
      expect(scaleResult.domain()).to.eql([0, 10]);
      expect(scaleResult.range()).to.eql([0, 100]);
    });
  });
});
