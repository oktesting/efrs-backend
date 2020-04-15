const request = require("supertest");
const mongoose = require("mongoose");
const { EmergencyAlert } = require("../../../models/emergencyAlert");
const { Account } = require("../../../models/account");
let server;

describe("/api/emergency-alerts", () => {
  //init server berfore test
  beforeEach(() => {
    server = require("../../../index");
  });
  //closer server after test
  afterEach(async () => {
    await server.close();
    //clear dummy data
    await Account.deleteMany({});
    await EmergencyAlert.deleteMany({});
  });

  describe("POST /", () => {
    let token, testEmergencyAlert;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .post("/api/emergency-alerts")
        .set("x-auth-token", token)
        .send(testEmergencyAlert);
    };

    //set the valid data for the happy path
    beforeEach(() => {
      token = new Account({
        supervisor: mongoose.Types.ObjectId(),
      }).generateAuthToken();

      testEmergencyAlert = {
        lat: 12,
        lng: 123,
        radius: 12,
        title: "abcdefgh",
        message: "abcdefghabcdefgh",
        supervisor: mongoose.Types.ObjectId(),
      };
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 403 if account not supervisor", async () => {
      token = new Account({}).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it("should return 400 if body of request is invalid", async () => {
      testEmergencyAlert = {};
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 200 with the emergencyAlert is saved in db", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      const emergencyAlertInDb = await EmergencyAlert.findById(res.body._id);
      expect(emergencyAlertInDb).toHaveProperty(
        "title",
        testEmergencyAlert.title
      );
    });
  });
});
