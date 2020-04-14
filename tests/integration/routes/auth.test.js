const request = require("supertest");
const bcrypt = require("bcrypt");
const { Account } = require("../../../models/account");
const mongoose = require("mongoose");
let server;

describe("/api/auth", () => {
  //init server berfore test
  beforeEach(() => {
    server = require("../../../index");
  });
  //closer server after test
  afterEach(async () => {
    await server.close();
    //clear dummy data
    await Account.deleteMany({});
  });

  describe("POST /", () => {
    //MOSH approach to wrtite clean test
    //#define the happy path
    //change parameter that match to the test case
    let acc, testAcc;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server).post("/api/auth").send(testAcc);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      acc = new Account({
        isVerified: true,
        name: "abcdef",
        email: "abcdef@mail.com",
        password: "abcdef",
        user: mongoose.Types.ObjectId(),
        supervisor: mongoose.Types.ObjectId(),
      });
      const salt = await bcrypt.genSalt();
      acc.password = await bcrypt.hash(acc.password, salt);
      await acc.save();
    });

    it("should return 400 if body of request in invalid", async () => {
      testAcc = {};
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if email is not found in db", async () => {
      testAcc = {
        email: "a@mail.com",
        password: "abcdef",
      };
      const res = await exec();
      expect(res.status).toBe(400);
      expect(res.text).toBe("Email or password is incorrect");
    });

    it("should return 400 if password is invalid", async () => {
      testAcc = {
        email: "abcdef@mail.com",
        password: "123456",
      };
      const res = await exec();
      expect(res.status).toBe(400);
      expect(res.text).toBe("Email or password is incorrect");
    });

    it("should return 401 if account is note verified", async () => {
      acc.isVerified = false;
      await acc.save();
      testAcc = {
        email: "abcdef@mail.com",
        password: "abcdef",
      };
      const res = await exec();
      expect(res.status).toBe(401);
      expect(res.text).toBe("Your account has not verified");
    });

    it("should return 200 if email and password is correct", async () => {
      testAcc = {
        email: "abcdef@mail.com",
        password: "abcdef",
      };
      const res = await exec();
      expect(res.status).toBe(200);
    });
  });
});
