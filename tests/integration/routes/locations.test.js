const request = require("supertest");
const mongoose = require("mongoose");
const { Location } = require("../../../models/location");
const { User } = require("../../../models/user");
const { Account } = require("../../../models/account");
let server;

describe("/api/locations", () => {
  //init server berfore test
  beforeEach(() => {
    server = require("../../../index");
  });
  //closer server after test
  afterEach(async () => {
    await server.close();
    //clear dummy data
    await Location.deleteMany({});
    await User.deleteMany({});
  });

  describe("GET /:id", () => {
    let token, userId, locationId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .get("/api/locations/" + userId)
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      token = new Account().generateAuthToken();

      const location = new Location({
        isFireStation: false,
        address: "abcdefg",
        lat: 123,
        lng: 12,
        province: "abcdefg",
        district: "abcdefg",
        device: {
          deviceName: "abcdefg",
          deviceId: "abcdefg",
          registrationToken: "abcdefg",
        },
      });
      await location.save();
      locationId = location._id;

      const user = new User({
        fullname: "abcdef",
        phone: "0000000000",
        dob: "01/01/2000",
        gender: "male",
        locations: [locationId],
      });
      await user.save();
      userId = user._id;
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 404 if given id is invalid", async () => {
      userId = "1";
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("invalid ID");
    });

    it("should return 404 if user with given id is not existed", async () => {
      userId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("User is not found");
    });

    it("should return 200 with array of locations in db of its user", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty("_id", locationId.toHexString());
      expect(res.body[0]).toHaveProperty("isFireStation", false);
    });
  });

  describe("POST /:id", () => {
    let token, userId, testLocation;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .post("/api/locations/" + userId)
        .set("x-auth-token", token)
        .send(testLocation);
    };

    beforeEach(async () => {
      token = new Account().generateAuthToken();

      testLocation = {
        address: "abcdefg",
        lat: 123,
        lng: 12,
        province: "abcdefg",
        district: "abcdefg",
        device: {
          deviceName: "abcdefg",
          deviceId: "abcdefg",
          registrationToken: "abcdefg",
        },
      };

      const user = new User({
        fullname: "abcdef",
        phone: "0000000000",
        dob: "01/01/2000",
        gender: "male",
      });
      await user.save();
      userId = user._id;
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 404 if given id is invalid", async () => {
      userId = "1";
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("invalid ID");
    });

    it("should return 400 if request body is invalid", async () => {
      testLocation = {};
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 404 if user with given id is not existed", async () => {
      userId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("User is not found");
    });

    it("should return 200 with location is saved and added to user.locations in db", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      const userInDb = await User.findById(userId);
      const locationInDb = await Location.findById(res.body._id);
      expect(locationInDb).not.toBeNull();
      expect(userInDb.locations).toContainEqual(locationInDb._id);
    });
  });

  describe("GET /fire-station", () => {
    let token, fireStationId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .get("/api/locations/fire-station")
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      token = new Account().generateAuthToken();

      const fireStation = new Location({
        isFireStation: true,
        address: "abcdefg",
        lat: 123,
        lng: 12,
        province: "abcdefg",
        district: "abcdefg",
      });
      await fireStation.save();
      fireStationId = fireStation._id;

      const location = new Location({
        isFireStation: false,
        address: "abcdefg",
        lat: 123,
        lng: 12,
        province: "abcdefg",
        district: "abcdefg",
      });
      await location.save();
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 200 with array of fireStation in db", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty("_id", fireStationId.toHexString());
      expect(res.body[0]).toHaveProperty("isFireStation", true);
    });
  });

  describe("POST /fire-station", () => {
    let token, testFireStation;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .post("/api/locations/fire-station")
        .set("x-auth-token", token)
        .send(testFireStation);
    };

    beforeEach(async () => {
      token = new Account({ isAdmin: true }).generateAuthToken();

      testFireStation = {
        address: "abcdefg",
        lat: 123,
        lng: 12,
        province: "abcdefg",
        district: "abcdefg",
      };
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 403 if account not admin", async () => {
      token = new Account({}).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it("should return 400 if request body is invalid", async () => {
      testFireStation = {};
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 200 with the new fire station is saved in db", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("address", testFireStation.address);
      const fireStationInDb = await Location.findById(res.body._id);
      expect(fireStationInDb).not.toBeNull();
    });
  });

  describe("DELETE /:id", () => {
    let token, locationId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .delete("/api/locations/" + locationId)
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      token = new Account().generateAuthToken();

      const location = new Location({
        address: "abcdefg",
        lat: 123,
        lng: 12,
        province: "abcdefg",
        district: "abcdefg",
        device: {
          deviceName: "abcdefg",
          deviceId: "abcdefg",
          registrationToken: "abcdefg",
        },
      });
      await location.save();
      locationId = location._id;
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 404 if given id is invalid", async () => {
      locationId = "1";
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("invalid ID");
    });

    it("should return 404 if location with given id is not existed", async () => {
      await Location.deleteMany({});
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Location is not found");
    });

    it("should return 200 and deleted location with given id in db", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.text).toBe("Location is deleted");
      const locationInDb = await Location.findById(locationId);
      expect(locationInDb).toBeNull();
    });
  });
});
