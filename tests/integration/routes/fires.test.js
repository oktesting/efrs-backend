const request = require("supertest");
const mongoose = require("mongoose");
const { Fire } = require("../../../models/fire");
const { Account } = require("../../../models/account");
const { User } = require("../../../models/user");
let server;

describe("/api/accounts", () => {
  //init server berfore test
  beforeEach(() => {
    server = require("../../../index");
  });
  //closer server after test
  afterEach(async () => {
    await server.close();
    //clear dummy data
    await Account.deleteMany({});
    await Fire.deleteMany({});
    await User.deleteMany({});
  });

  describe("GET /change-status/:option/:id", () => {
    let token, fireId, option;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .get("/api/fires/change-status/" + option + "/" + fireId)
        .set("x-auth-token", token);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      token = new Account({
        supervisor: mongoose.Types.ObjectId(),
      }).generateAuthToken();

      const fire = new Fire({
        longtitude: 123,
        latitude: 12,
        user: mongoose.Types.ObjectId(),
      });
      await fire.save();
      fireId = fire._id;
      //option 1: pending => processing
      option = 1;
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

    it("should return 400 if given option is invalid", async () => {
      option = 3;
      const res = await exec();
      expect(res.status).toBe(400);
      expect(res.text).toBe("Option is invalid");
    });

    it("should return 404 if fire with given id is not existed", async () => {
      fireId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Fire is not found");
    });

    it("should return 200 with fire.status changed to processing in db", async () => {
      const res = await exec();
      const fireInDb = await Fire.findById(fireId);
      expect(res.status).toBe(200);
      expect(res.text).toBe("Fire status is changed");
      expect(fireInDb).toHaveProperty("status", "processing");
    });

    it("should return 200 with fire.status changed to finished in db", async () => {
      //option 2: processing => finished
      option = 2;
      const res = await exec();
      const fireInDb = await Fire.findById(fireId);
      expect(res.status).toBe(200);
      expect(res.text).toBe("Fire status is changed");
      expect(fireInDb).toHaveProperty("status", "finished");
    });
  });

  describe("GET /", () => {
    let token, fireId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server).get("/api/fires").set("x-auth-token", token);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      token = new Account({
        supervisor: mongoose.Types.ObjectId(),
      }).generateAuthToken();

      const fire = new Fire({
        longtitude: 123,
        latitude: 12,
        user: mongoose.Types.ObjectId(),
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

    // it("should return 200 with list of fire with status pending and processing in db", async () => {
    //   const res = exec();
    //   expect(res.status).toBe(200);
    // });
  });

  describe("POST /", () => {
    let token, testFire;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .post("/api/fires")
        .set("x-auth-token", token)
        .field("longtitude", testFire.longtitude)
        .field("latitude", testFire.latitude)
        .field("user", testFire.user)
        .attach("files", testFire.file)
        .attach("files", testFire.file);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      const userId = mongoose.Types.ObjectId();
      token = new Account({
        user: userId,
      }).generateAuthToken();

      testFire = {
        longtitude: 123,
        latitude: 12,
        user: userId.toHexString(),
        file: "./uploads/testFile.jpg",
      };
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 403 if account not user", async () => {
      token = new Account({}).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it("should return 400 if body of request in invalid", async () => {
      testFire.longtitude = "";
      testFire.latitude = "";
      testFire.user = "";
      testFire.file = "";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 200 with fire id and saved new pending fire in db", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      const fireInDb = await Fire.findById(res.body._id);
      expect(fireInDb).not.toBeNull();
    });
  });

  describe("PUT /:id", () => {
    let token, testFile, fireId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .put("/api/fires/" + fireId)
        .set("x-auth-token", token)
        .attach("files", testFile)
        .attach("files", testFile);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      const userId = mongoose.Types.ObjectId();
      token = new Account({
        user: userId,
      }).generateAuthToken();

      const fire = new Fire({
        longtitude: 123,
        latitude: 12,
        user: userId,
      });
      await fire.save();
      fireId = fire._id;

      testFile = "./uploads/testFile.jpg";
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 403 if account not user", async () => {
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

    it("should return 404 if fire with given id is not existed", async () => {
      fireId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Fire is not found");
    });

    it("should return 200 with new files of fire saved in db", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.text).toBe("Evidences is submitted");
      const fireInDb = await Fire.findById(fireId);
      expect(fireInDb).not.toBeNull();
      expect(fireInDb).toHaveProperty("evidences");
      expect(fireInDb.evidences).toHaveLength(2);
    });
  });
});
