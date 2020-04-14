const request = require("supertest");
const mongoose = require("mongoose");
const { Token } = require("../../../models/token");
const { Account } = require("../../../models/account");
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
    await Token.deleteMany({});
  });

  describe("GET /me", () => {
    let token, accId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .get("/api/accounts/me")
        .set("x-auth-token", token);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      const acc = new Account({
        name: "abcdef",
        email: "abcdef@mail.com",
        password: "123456",
      });
      await acc.save();
      token = acc.generateAuthToken();
      accId = acc._id;
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 200 and the account object in db without password property", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", accId.toHexString());
      expect(res.body).not.toHaveProperty("password");
    });
  });

  describe("POST /", () => {
    let testAcc;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server).post("/api/accounts").send(testAcc);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      testAcc = {
        name: "abcdef",
        email: "abcdef@mail.com",
        password: "123456",
      };
    });

    it("should return 400 if request body is invalid", async () => {
      testAcc = {};
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if given email is already registered", async () => {
      const acc = new Account(testAcc);
      await acc.save();
      const res = await exec();
      expect(res.status).toBe(400);
      expect(res.text).toBe("This email already registered");
    });

    it("should return 200 and save new account in db", async () => {
      const res = await exec();
      //remove "" from returned string in res.text
      const accId = res.text.replace(/"/g, "");
      const accInDb = await Account.findById(mongoose.Types.ObjectId(accId));
      expect(res.status).toBe(200);
      expect(accInDb).not.toBeNull();
      expect(accInDb).toHaveProperty("email", testAcc.email);
    });
  });

  describe("GET /confirmation/:token", () => {
    let acc, tokenObj, accId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server).get(
        "/api/accounts/confirmation/" + tokenObj.token
      );
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      acc = {
        name: "abcdef",
        email: "abcdef@mail.com",
        password: "123456",
      };
      const res = await request(server).post("/api/accounts").send(acc);
      accId = res.text.replace(/"/g, "");
      tokenObj = await Token.findOne({ account: accId });
    });

    it("should return 404 if verification token is invalid or expired", async () => {
      await Token.deleteMany({});
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Verification token is invalid or expired");
    });

    it("should return 404 if account in the token is not found", async () => {
      await Account.deleteMany({});
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Account is not found");
    });

    it("should return 400 if account is already verified", async () => {
      accInDb = await Account.findById(accId);
      accInDb.isVerified = true;
      await accInDb.save();
      const res = await exec();
      expect(res.status).toBe(400);
      expect(res.text).toBe("Account is already verified");
    });

    it("should return 200 and account.isVerified in db is true", async () => {
      const res = await exec();
      accInDb = await Account.findById(accId);
      expect(res.status).toBe(200);
      expect(res.text).toBe("Account is now verified. please log in");
      expect(accInDb).not.toBeNull();
      expect(accInDb).toHaveProperty("isVerified", true);
    });
  });
});
