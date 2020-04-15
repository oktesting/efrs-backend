const request = require("supertest");
const mongoose = require("mongoose");
const { Fire } = require("../../../models/fire");
const { Account } = require("../../../models/account");
const { User } = require("../../../models/user");
let server;

describe("/api/fires-history", () => {
  //init server berfore test
  beforeEach(() => {
    server = require("../../../index");
  });
  //closer server after test
  afterEach(async () => {
    await server.close();
    //clear dummy data
    await Fire.deleteMany({});
    await User.deleteMany({});
  });

  describe("GET /:id", () => {
    let fireId, token, userId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .get("/api/fires-history/" + fireId)
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      token = new Account({
        supervisor: mongoose.Types.ObjectId(),
      }).generateAuthToken();

      const user = new User({
        fullname: "abcdef",
        phone: "0000000000",
        age: 19,
        gender: "male",
      });
      await user.save();
      userId = user._id;

      const fire = new Fire({
        longtitude: 123,
        latitude: 12,
        user: userId,
      });
      await fire.save();
      fireId = fire._id;
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

    it("should return 404 if given id is invalid", async () => {
      fireId = "1";
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("invalid ID");
    });

    it("should return 404 if report with given id is not existed", async () => {
      fireId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Fire is not found");
    });

    it("should return 200 with the fire and user obj nested under it", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", fireId.toHexString());
      expect(res.body.user).toHaveProperty("_id", userId.toHexString());
    });
  });

  describe("GET /user/:id", () => {
    let fireId, token, userId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .get("/api/fires-history/user/" + userId)
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      token = new Account({
        supervisor: mongoose.Types.ObjectId(),
      }).generateAuthToken();

      const user = new User({
        fullname: "abcdef",
        phone: "0000000000",
        age: 19,
        gender: "male",
      });
      await user.save();
      userId = user._id;

      const fire = new Fire({
        longtitude: 123,
        latitude: 12,
        user: userId,
      });
      await fire.save();
      fireId = fire._id;
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

    it("should return 404 if given id is invalid", async () => {
      userId = "1";
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("invalid ID");
    });

    it("should return 200 with array of fire of its user", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty("_id", fireId.toHexString());
    });
  });
});
