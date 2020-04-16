const { Account } = require("../../../models/account");
const auth = require("../../../middleware/auth");
const mongoose = require("mongoose");

describe("auth middleware", () => {
  it("should populate req.account with the payload of valid JWT", () => {
    const acc = {
      _id: mongoose.Types.ObjectId().toHexString(),
      isAdmin: true,
    };
    const token = new Account(acc).generateAuthToken();
    const req = {
      header: jest.fn().mockReturnValue(token),
    };
    const res = {};
    const next = jest.fn();
    auth(req, res, next);
    expect(req.account).toMatchObject(acc);
  });
});
