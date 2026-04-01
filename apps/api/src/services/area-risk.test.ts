import test from "node:test";
import assert from "node:assert/strict";
import { __internal, scoreAreaRisk, type AreaRiskRequest } from "./area-risk";

const baseFeatures = {
  weatherDisruption: 62,
  permitVolatility: 43,
  logisticsFriction: 58,
  marketVolatility: 49,
  safetyLossExposure: 55,
  collectionsRiskProxy: 47,
};

const buildRequest = (): AreaRiskRequest => ({
  input: { tract: "06073000100", lat: 32.71, lng: -117.16 },
  context: { clientKey: "test-client" },
  areaProfiles: {
    tract: {
      id: "tract-1",
      population: 9000,
      households: 3500,
      sourceRecordCount: 91,
      uniquenessRisk: 0.23,
      features: baseFeatures,
    },
    zip: {
      id: "zip-92101",
      population: 18000,
      households: 7600,
      sourceRecordCount: 250,
      uniquenessRisk: 0.11,
      features: baseFeatures,
    },
    county: {
      id: "county-073",
      population: 3200000,
      households: 1100000,
      sourceRecordCount: 850,
      uniquenessRisk: 0.02,
      features: baseFeatures,
    },
    city_cluster: {
      id: "city-cluster-san-diego-core",
      population: 480000,
      households: 170000,
      sourceRecordCount: 410,
      uniquenessRisk: 0.08,
      features: baseFeatures,
    },
  },
});

test("address input normalizes to safe regional geography", () => {
  __internal.resetState();
  const request = buildRequest();
  request.input = { address: "100 Main St, San Diego, CA 92101" };

  const result = scoreAreaRisk(request, 1);
  assert.equal(result.status, "ok");
  assert.equal(result.geography?.output_level, "zip");
  assert.equal(result.compliance.property_specific_inference, false);
});

test("sparse tract upscales to zip", () => {
  __internal.resetState();
  const result = scoreAreaRisk(buildRequest(), 2);
  assert.equal(result.status, "ok");
  assert.equal(result.geography?.output_level, "zip");
});

test("sparse zip upscales to county", () => {
  __internal.resetState();
  const request = buildRequest();
  request.areaProfiles.zip = {
    ...request.areaProfiles.zip!,
    population: 3000,
    households: 900,
    sourceRecordCount: 20,
    uniquenessRisk: 0.4,
  };

  const result = scoreAreaRisk(request, 3);
  assert.equal(result.status, "ok");
  assert.equal(result.geography?.output_level, "county");
});

test("unsafe output is suppressed when all geographies fail thresholds", () => {
  __internal.resetState();
  const request = buildRequest();
  for (const key of ["tract", "zip", "county", "city_cluster"] as const) {
    request.areaProfiles[key] = {
      ...request.areaProfiles[key]!,
      population: 100,
      households: 30,
      sourceRecordCount: 5,
      uniquenessRisk: 0.9,
    };
  }

  const result = scoreAreaRisk(request, 4);
  assert.equal(result.status, "suppressed");
  assert.equal(result.compliance.output_level, "suppressed");
});

test("repeated adjacent queries are blocked", () => {
  __internal.resetState();
  const request = buildRequest();
  const first = scoreAreaRisk(request, 5);
  const second = scoreAreaRisk(request, 6);

  assert.equal(first.status, "ok");
  assert.equal(second.status, "blocked");
  assert.equal(second.block_reason, "repeated_nearby_query_blocked");
});

test("response does not expose property or household inference fields", () => {
  __internal.resetState();
  const result = scoreAreaRisk(buildRequest(), 7);
  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes("parcel"), false);
  assert.equal(serialized.includes("occupant"), false);
  assert.equal(serialized.includes("homeowner"), false);
  assert.equal(serialized.includes("resident"), false);
  assert.equal(serialized.includes("\"lat\":"), false);
  assert.equal(serialized.includes("\"lng\":"), false);
});
