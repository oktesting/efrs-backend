const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../../../models/user");
const { Account } = require("../../../models/account");
let server;

describe("/api/users", () => {
  //init server berfore test
  beforeEach(() => {
    server = require("../../../index");
  });
  //closer server after test
  afterEach(async () => {
    await server.close();
    //clear dummy data
    await Account.deleteMany({});
    await User.deleteMany({});
  });

  describe("GET /", () => {
    let token, userId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server).get("/api/users").set("x-auth-token", token);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      const user = new User({
        age: 19,
        fullname: "abcdef",
        phone: "1111111111",
        gender: "female",
      });
      await user.save();
      userId = user._id;

      const acc = new Account({
        name: "abcdef",
        email: "abcdef@mail.com",
        password: "123456",
        supervisor: mongoose.Types.ObjectId(),
        user: userId,
      });
      await acc.save();
      token = acc.generateAuthToken();
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

    it("should return 200 and an array of account with its user inside", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).not.toBeUndefined();
      expect(res.body[0]).not.toBeNull();
      expect(res.body[0]).toHaveProperty("user");
      expect(res.body[0].user).toHaveProperty("_id", userId.toHexString());
    });
  });

  describe("GET /:id", () => {
    let token, userId, accId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .get("/api/users/" + accId)
        .set("x-auth-token", token);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      const user = new User({
        age: 19,
        fullname: "abcdef",
        phone: "1111111111",
        gender: "female",
      });
      await user.save();
      userId = user._id;

      const acc = new Account({
        name: "abcdef",
        email: "abcdef@mail.com",
        password: "123456",
        user: userId,
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

    it("should return 404 if given id is invalid", async () => {
      accId = "1";
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("invalid ID");
    });

    it("should return 404 if account with given id is not existed", async () => {
      accId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("User is not found");
    });

    it("should return 404 if account with given id is existed but its user is not found", async () => {
      await User.deleteMany({});
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("User is not found");
    });

    it("should return 200 and an account with its user inside", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", accId.toHexString());
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).not.toBeUndefined();
      expect(res.body.user).not.toBeNull();
      expect(res.body.user).toHaveProperty("_id", userId.toHexString());
    });
  });

  describe("GET /change-activation/:id", () => {
    let token, userId, isActivated;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .get("/api/users/change-activation/" + userId)
        .set("x-auth-token", token);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      const user = new User({
        age: 19,
        fullname: "abcdef",
        phone: "1111111111",
        gender: "female",
      });
      await user.save();
      userId = user._id;
      isActivated = user.isActivated;

      token = new Account({
        supervisor: mongoose.Types.ObjectId(),
      }).generateAuthToken();
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

    it("should return 404 if user with given id is not existed", async () => {
      userId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("User is not found");
    });

    it("should return 200 and user.isActivated is changed in db", async () => {
      const res = await exec();
      const userInDb = await User.findById(userId);
      expect(res.status).toBe(200);
      expect(res.text).toBe("User activation is changed");
      expect(userInDb.isActivated).not.toBe(isActivated);
    });
  });

  describe("POST /", () => {
    let token, testUser, accId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .post("/api/users/")
        .set("x-auth-token", token)
        .send(testUser);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      testUser = {
        age: 19,
        fullname: "abcdef",
        phone: "1111111111",
        gender: "female",
      };

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

    it("should return 400 if body of request is invalid", async () => {
      testUser = {};
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 404 if account._id in jwt token of request is not found", async () => {
      token = new Account({}).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Account is not found");
    });

    it("should return 400 if account in db is already registered with a user", async () => {
      const accInDb = await Account.findById(accId);
      accInDb.user = mongoose.Types.ObjectId();
      await accInDb.save();
      const res = await exec();
      expect(res.status).toBe(400);
      expect(res.text).toBe("This account is already registered");
    });

    it("should return 200 with account is register with the new user in db", async () => {
      const res = await exec();
      const accInDb = await Account.findById(accId);
      expect(res.status).toBe(200);
      expect(res.text).toBe("User is created");
      expect(accInDb).toHaveProperty("user");
      const userInDb = await User.findById(accInDb.user.toHexString());
      expect(userInDb).not.toBeNull();
    });
  });

  describe("PUT /", () => {
    let token, testUser, user, acc;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .put("/api/users/")
        .set("x-auth-token", token)
        .field("fullname", testUser.fullname)
        .field("age", testUser.age)
        .field("phone", testUser.phone)
        .field("gender", testUser.gender)
        .attach("avatar", testUser.avatar);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      testUser = {
        age: 19,
        fullname: "abcdef",
        phone: "1111111111",
        gender: "female",
        avatar: "./uploads/testFile.jpg",
      };

      user = new User({
        age: 20,
        fullname: "ghijklm",
        phone: "2222222222",
        gender: "male",
      });
      await user.save();

      acc = new Account({
        name: "abcdef",
        email: "abcdef@mail.com",
        password: "123456",
        user: user._id,
      });
      await acc.save();
      token = acc.generateAuthToken();
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 400 if body of request is invalid", async () => {
      testUser.age = 0;
      testUser.fullname = "";
      testUser.gender = "";
      testUser.phone = "";
      testUser.avatar = "";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 404 if account._id in jwt token of request is not found", async () => {
      token = new Account({}).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Account is not found");
    });

    it("should return 404 if account.user._id in jwt token of request is not found", async () => {
      //at this case user object is not embedded under account obj in jwt
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("User is not found");
    });

    it("should return 200 with edited user in db and auth token in res.header", async () => {
      //add user obj under account in token before make request
      acc["user"] = user;
      token = acc.generateAuthToken();
      const res = await exec();
      const userInDb = await User.findById(user._id.toHexString());
      expect(res.status).toBe(200);
      expect(res.text).toBe("User is edited");
      expect(res.header).toHaveProperty("x-auth-token");
      expect(userInDb).toHaveProperty("fullname", testUser.fullname);
      expect(userInDb).toHaveProperty("phone", testUser.phone);
      expect(userInDb).toHaveProperty("gender", testUser.gender);
      expect(userInDb).toHaveProperty("age", testUser.age);
    });
  });
});
