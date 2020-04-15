const request = require("supertest");
const mongoose = require("mongoose");
const _ = require("lodash");
const { Supervisor } = require("../../../models/supervisor");
const { Account } = require("../../../models/account");
let server;

describe("/api/supervisors", () => {
  //init server berfore test
  beforeEach(() => {
    server = require("../../../index");
  });
  //closer server after test
  afterEach(async () => {
    await server.close();
    //clear dummy data
    await Account.deleteMany({});
    await Supervisor.deleteMany({});
  });

  describe("GET /", () => {
    let token, superId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .get("/api/supervisors")
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      const supervisor = new Supervisor({
        location: mongoose.Types.ObjectId(),
        fullname: "abcdef",
        phone: "1111111111",
        gender: "female",
      });
      await supervisor.save();
      superId = supervisor._id;

      const acc = new Account({
        isAdmin: true,
        name: "abcdef",
        email: "abcdef@mail.com",
        password: "123456",
        supervisor: superId,
      });
      await acc.save();
      token = acc.generateAuthToken();
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

    it("should return 200 and a array of account with its supervisor inside", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).not.toBeUndefined();
      expect(res.body[0]).not.toBeNull();
      expect(res.body[0]).toHaveProperty("supervisor");
      expect(res.body[0].supervisor).toHaveProperty(
        "_id",
        superId.toHexString()
      );
    });
  });

  describe("GET /change-activation/:id", () => {
    let token, isActivated, superId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .get("/api/supervisors/change-activation/" + superId)
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      const supervisor = new Supervisor({
        location: mongoose.Types.ObjectId(),
        fullname: "abcdef",
        phone: "1111111111",
        gender: "female",
      });
      await supervisor.save();
      superId = supervisor._id;
      isActivated = supervisor.isActivated;

      const acc = new Account({
        isAdmin: true,
        name: "abcdef",
        email: "abcdef@mail.com",
        password: "123456",
        supervisor: superId,
      });
      await acc.save();
      token = acc.generateAuthToken();
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

    it("should return 404 if given id is invalid", async () => {
      superId = "1";
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("invalid ID");
    });

    it("should return 404 if supervisor with given id is not existed", async () => {
      superId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Supervisor is not found");
    });

    it("should return 200 and supervisor.isActivated is changed in db", async () => {
      const res = await exec();
      const supervisorInDb = await Supervisor.findById(superId);
      expect(res.status).toBe(200);
      expect(res.text).toBe("Supervisor activation is changed");
      expect(supervisorInDb.isActivated).not.toBe(isActivated);
    });
  });

  describe("GET /:id", () => {
    let token, accId, superId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .get("/api/supervisors/" + accId)
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      const supervisor = new Supervisor({
        location: mongoose.Types.ObjectId(),
        fullname: "abcdef",
        phone: "1111111111",
        gender: "female",
      });
      await supervisor.save();
      superId = supervisor._id;

      const acc = new Account({
        isAdmin: true,
        name: "abcdef",
        email: "abcdef@mail.com",
        password: "123456",
        supervisor: supervisor._id,
      });
      await acc.save();
      accId = acc._id;
      token = acc.generateAuthToken();
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 404 if given id is invalid", async () => {
      accId = "1";
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("invalid ID");
    });

    it("should return 404 if account with given id for supervisor is not existed", async () => {
      accId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Supervisor is not found");
    });

    it("should return 404 if account with given id is existed but its supervisor is not found", async () => {
      await Supervisor.deleteMany({});
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Supervisor is not found");
    });

    it("should return 200 with account and its supervisor in db", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", accId.toHexString());
      expect(res.body).toHaveProperty("supervisor");
      expect(res.body.supervisor).toHaveProperty("_id", superId.toHexString());
    });
  });

  describe("POST /", () => {
    let token, testSuper, accId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .post("/api/supervisors/")
        .set("x-auth-token", token)
        .send(testSuper);
    };

    beforeEach(async () => {
      const acc = new Account({
        name: "abcdef",
        email: "abcdef@mail.com",
        password: "123456",
      });
      await acc.save();
      token = acc.generateAuthToken();
      accId = acc._id;

      testSuper = {
        location: mongoose.Types.ObjectId(),
        fullname: "abcdef",
        phone: "1111111111",
        gender: "female",
      };
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 400 if body of request in invalid", async () => {
      testSuper = {};
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 404 if account._id in jwt token of request is not found", async () => {
      token = new Account({}).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Account is not found");
    });

    it("should return 400 if account in db is already registered with a supervisor", async () => {
      const accInDb = await Account.findById(accId);
      accInDb.supervisor = mongoose.Types.ObjectId();
      await accInDb.save();
      const res = await exec();
      expect(res.status).toBe(400);
      expect(res.text).toBe("This account is already registered");
    });

    it("should return 200 with account is register with the new supervisor in db", async () => {
      const res = await exec();
      const accInDb = await Account.findById(accId);
      expect(accInDb).toHaveProperty("supervisor");
      const supervisorInDb = await Supervisor.findById(
        accInDb.supervisor.toHexString()
      );
      expect(supervisorInDb).not.toBeNull();
      expect(res.status).toBe(200);
      expect(res.text).toBe("Supervisor is created");
    });
  });

  describe("PUT /", () => {
    let token, testSuper, acc, supervisor;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .put("/api/supervisors/")
        .set("x-auth-token", token)
        .field("fullname", testSuper.fullname)
        .field("location", testSuper.location)
        .field("phone", testSuper.phone)
        .field("gender", testSuper.gender)
        .attach("avatar", testSuper.avatar);
    };

    beforeEach(async () => {
      supervisor = new Supervisor({
        location: mongoose.Types.ObjectId(),
        fullname: "abcdef",
        phone: "1111111111",
        gender: "female",
      });
      await supervisor.save();

      acc = new Account({
        name: "abcdef",
        email: "abcdef@mail.com",
        password: "123456",
        supervisor: supervisor._id,
      });
      await acc.save();
      token = acc.generateAuthToken();

      testSuper = {
        location: mongoose.Types.ObjectId().toHexString(),
        fullname: "ghijklm",
        phone: "2222222222",
        gender: "male",
        avatar: "./uploads/testFile.jpg",
      };
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 400 if body of request in invalid", async () => {
      testSuper.fullname = "";
      testSuper.location = "";
      testSuper.phone = "";
      testSuper.gender = "";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 404 if account._id in jwt token of request is not found", async () => {
      token = new Account({}).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Account is not found");
    });

    it("should return 404 if account.supervisor._id in jwt token of request is not found", async () => {
      //at this case supervisor object is not embedded under account obj in jwt
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Supervisor is not found");
    });

    it("should return 200 with edited supervisor in db and auth token in res.header", async () => {
      //add supervisor obj under account in token before make request
      acc["supervisor"] = supervisor;
      token = acc.generateAuthToken();
      const res = await exec();
      const supervisorInDb = await Supervisor.findById(
        supervisor._id.toHexString()
      );
      expect(res.status).toBe(200);
      expect(res.text).toBe("Supervisor is edited");
      expect(res.header).toHaveProperty("x-auth-token");
      expect(supervisorInDb).toHaveProperty("fullname", testSuper.fullname);
      expect(supervisorInDb).toHaveProperty("phone", testSuper.phone);
      expect(supervisorInDb).toHaveProperty("gender", testSuper.gender);
      expect(supervisorInDb).toHaveProperty(
        "location",
        mongoose.Types.ObjectId(testSuper.location)
      );
    });
  });
});
