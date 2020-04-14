const request = require("supertest");
const { Account } = require("../../../models/account");
const { Report } = require("../../../models/report");
const { Fire } = require("../../../models/fire");
const mongoose = require("mongoose");
let server;

describe("/api/reports", () => {
  //init server berfore test
  beforeEach(() => {
    server = require("../../../index");
  });
  //closer server after test
  afterEach(async () => {
    await server.close();
    //clear dummy data
    await Report.deleteMany({});
    await Fire.deleteMany({});
  });

  describe("GET /", () => {
    let token, fire, report;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .get("/api/reports")
        .set("x-auth-token", token);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      token = new Account({
        supervisor: mongoose.Types.ObjectId(),
      }).generateAuthToken();

      fire = new Fire({
        longtitude: 105.525507,
        latitude: 21.014149,
        user: mongoose.Types.ObjectId(),
      });
      await fire.save();

      report = new Report({
        location: "Tầng 2 khu chung cư ACX đường SZS phường XHW Quận Hoàn Kiếm",
        area: 100,
        totalVehicle: 20,
        totalFireman: 40,
        totalDamageProperty: 2000,
        listDamageProperty: "1 TV, 1 xe máy, 1 ô tô",
        totalDeath: 1,
        totalInjury: 1,
        investigation: "phòng pháp chế đang điều tra theo quy định",
        fireResult: "cháy được dập tắt trước khi lan sang nhà lân cận",
        fireCause: "đang điều tra làm rõ",
        owner: "ông XYZ",
        fireType: "Cháy khu dân cư",
        usageType: "căn hộ",
        cadastral: "Nội thành Hà Nội, Quận Hoàn Kiếm",
        fireStationManagement: "dưới sự quản lý của phòng cảnh sát pccc ABC",
        travelDistance: "khoảng 10km đường xe chạy, 50 km đường chim bay",
        supervisorName: "họ tên cán bộ trực",
        waterSource: "nguồn nước được dùng để chữa cháy",
        summary: "tình hình diễn biến vụ cháy",
        assessmentAndClassification:
          "nhận xét đánh giá công tác pccc và phân loại",
        receivedTime: "2020-03-22T12:13:30.834+00:00",
        finishedTime: "2020-03-23T15:13:30.834+00:00",
        fire: fire._id,
      });
      await report.save();
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 403 if account is not supervisor", async () => {
      token = new Account({}).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it("should return 200 with the array of 1 report in db", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].fire).toHaveProperty("_id", fire._id.toHexString());
    });
  });

  describe("GET /:id", () => {
    let token, fire, report, reportId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .get("/api/reports/" + reportId)
        .set("x-auth-token", token);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      token = new Account({
        supervisor: mongoose.Types.ObjectId(),
      }).generateAuthToken();

      fire = new Fire({
        longtitude: 105.525507,
        latitude: 21.014149,
        user: mongoose.Types.ObjectId(),
      });
      await fire.save();

      report = new Report({
        location: "Tầng 2 khu chung cư ACX đường SZS phường XHW Quận Hoàn Kiếm",
        area: 100,
        totalVehicle: 20,
        totalFireman: 40,
        totalDamageProperty: 2000,
        listDamageProperty: "1 TV, 1 xe máy, 1 ô tô",
        totalDeath: 1,
        totalInjury: 1,
        investigation: "phòng pháp chế đang điều tra theo quy định",
        fireResult: "cháy được dập tắt trước khi lan sang nhà lân cận",
        fireCause: "đang điều tra làm rõ",
        owner: "ông XYZ",
        fireType: "Cháy khu dân cư",
        usageType: "căn hộ",
        cadastral: "Nội thành Hà Nội, Quận Hoàn Kiếm",
        fireStationManagement: "dưới sự quản lý của phòng cảnh sát pccc ABC",
        travelDistance: "khoảng 10km đường xe chạy, 50 km đường chim bay",
        supervisorName: "họ tên cán bộ trực",
        waterSource: "nguồn nước được dùng để chữa cháy",
        summary: "tình hình diễn biến vụ cháy",
        assessmentAndClassification:
          "nhận xét đánh giá công tác pccc và phân loại",
        receivedTime: "2020-03-22T12:13:30.834+00:00",
        finishedTime: "2020-03-23T15:13:30.834+00:00",
        fire: fire._id,
      });
      await report.save();

      reportId = report._id;
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 403 if account is supervisor", async () => {
      token = new Account({}).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it("should return 404 if given id is invalid", async () => {
      reportId = "1";
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("invalid ID");
    });

    it("should return 404 if report with given id is not existed", async () => {
      reportId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Report is not found");
    });

    it("should return 200 and report with given id in db", async () => {
      const res = await exec();
      const reportInDb = await Report.findById(reportId);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", report._id.toHexString());
      expect(reportInDb).toHaveProperty("_id", report._id);
    });
  });

  describe("POST /", () => {
    //MOSH approach to wrtite clean test
    //#define the happy path
    //change parameter that match to the test case
    let token, testReport, fire;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .post("/api/reports")
        .set("x-auth-token", token)
        .send(testReport);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      token = new Account({
        supervisor: mongoose.Types.ObjectId(),
      }).generateAuthToken();

      fire = new Fire({
        longtitude: 105.525507,
        latitude: 21.014149,
        user: mongoose.Types.ObjectId(),
      });
      await fire.save();

      testReport = {
        location: "Tầng 2 khu chung cư ACX đường SZS phường XHW Quận Hoàn Kiếm",
        area: 100,
        totalVehicle: 20,
        totalFireman: 40,
        totalDamageProperty: 2000,
        listDamageProperty: "1 TV, 1 xe máy, 1 ô tô",
        totalDeath: 1,
        totalInjury: 1,
        investigation: "phòng pháp chế đang điều tra theo quy định",
        fireResult: "cháy được dập tắt trước khi lan sang nhà lân cận",
        fireCause: "đang điều tra làm rõ",
        owner: "ông XYZ",
        fireType: "Cháy khu dân cư",
        usageType: "căn hộ",
        cadastral: "Nội thành Hà Nội, Quận Hoàn Kiếm",
        fireStationManagement: "dưới sự quản lý của phòng cảnh sát pccc ABC",
        travelDistance: "khoảng 10km đường xe chạy, 50 km đường chim bay",
        supervisorName: "họ tên cán bộ trực",
        waterSource: "nguồn nước được dùng để chữa cháy",
        summary: "tình hình diễn biến vụ cháy",
        assessmentAndClassification:
          "nhận xét đánh giá công tác pccc và phân loại",
        receivedTime: "2020-03-22T12:13:30.834+00:00",
        finishedTime: "2020-03-23T15:13:30.834+00:00",
        fire: fire._id,
      };
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 403 if account is supervisor", async () => {
      token = new Account({}).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it("should return 400 if body of request in invalid", async () => {
      testReport = {};
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if there is already report for the given fire", async () => {
      const report = Report({
        fire: fire._id,
      });
      await report.save();

      const res = await exec();
      expect(res.status).toBe(400);
      expect(res.text).toBe("There is already report for this fire");
    });

    it("should saved report is valid for given fire in db", async () => {
      await exec();
      const report = await Report.findOne({ fire: fire._id });
      expect(report).not.toBeNull();
      expect(report).toHaveProperty("fire", fire._id);
    });

    it("should return 200 if report is valid for given fire", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.text).toBe("Report is submitted");
    });
  });

  describe("PUT /:id", () => {
    //MOSH approach to wrtite clean test
    //#define the happy path
    //change parameter that match to the test case
    let token, testReport, fire, report, reportId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .put("/api/reports/" + reportId)
        .set("x-auth-token", token)
        .send(testReport);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      token = new Account({
        supervisor: mongoose.Types.ObjectId(),
      }).generateAuthToken();

      fire = new Fire({
        longtitude: 105.525507,
        latitude: 21.014149,
        user: mongoose.Types.ObjectId(),
      });
      await fire.save();

      report = new Report({
        location: "Tầng 2 khu chung cư ACX đường SZS phường XHW Quận Hoàn Kiếm",
        area: 100,
        totalVehicle: 20,
        totalFireman: 40,
        totalDamageProperty: 2000,
        listDamageProperty: "1 TV, 1 xe máy, 1 ô tô",
        totalDeath: 1,
        totalInjury: 1,
        investigation: "phòng pháp chế đang điều tra theo quy định",
        fireResult: "cháy được dập tắt trước khi lan sang nhà lân cận",
        fireCause: "đang điều tra làm rõ",
        owner: "ông XYZ",
        fireType: "Cháy khu dân cư",
        usageType: "căn hộ",
        cadastral: "Nội thành Hà Nội, Quận Hoàn Kiếm",
        fireStationManagement: "dưới sự quản lý của phòng cảnh sát pccc ABC",
        travelDistance: "khoảng 10km đường xe chạy, 50 km đường chim bay",
        supervisorName: "họ tên cán bộ trực",
        waterSource: "nguồn nước được dùng để chữa cháy",
        summary: "tình hình diễn biến vụ cháy",
        assessmentAndClassification:
          "nhận xét đánh giá công tác pccc và phân loại",
        receivedTime: "2020-03-22T12:13:30.834+00:00",
        finishedTime: "2020-03-23T15:13:30.834+00:00",
        fire: fire._id,
      });
      await report.save();
      reportId = report._id;

      testReport = {
        location: "a",
        area: 1,
        totalVehicle: 1,
        totalFireman: 1,
        totalDamageProperty: 1,
        listDamageProperty: "a",
        totalDeath: 1,
        totalInjury: 1,
        investigation: "a",
        fireResult: "a",
        fireCause: "a",
        owner: "a",
        fireType: "a",
        usageType: "a",
        cadastral: "a",
        fireStationManagement: "a",
        travelDistance: "a",
        supervisorName: "a",
        waterSource: "a",
        summary: "a",
        assessmentAndClassification: "a",
        receivedTime: "2020-03-22T12:13:30.834+00:00",
        finishedTime: "2020-03-23T15:13:30.834+00:00",
        fire: fire._id,
      };
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 403 if account is supervisor", async () => {
      token = new Account({}).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it("should return 404 if given id is invalid", async () => {
      reportId = "1";
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("invalid ID");
    });

    it("should return 400 if body of request in invalid", async () => {
      testReport = {};
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 404 if report with given id is not existed", async () => {
      reportId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Report is not found");
    });

    it("should return 200 if report is valid for given fire", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.text).toBe("Report is modified");
    });

    it("should modified report with given id in db", async () => {
      await exec();
      const reportInDb = await Report.findById(reportId);
      expect(reportInDb).not.toBeNull();
      expect(reportInDb).toHaveProperty("location", "a");
    });
  });

  describe("DELETE /:id", () => {
    //MOSH approach to wrtite clean test
    //#define the happy path
    //change parameter that match to the test case
    let token, fire, report, reportId;

    //function that will be used in all the test-case
    const exec = async () => {
      return await request(server)
        .delete("/api/reports/" + reportId)
        .set("x-auth-token", token);
    };

    //set the valid data for the happy path
    beforeEach(async () => {
      token = new Account({
        supervisor: mongoose.Types.ObjectId(),
      }).generateAuthToken();

      fire = new Fire({
        longtitude: 105.525507,
        latitude: 21.014149,
        user: mongoose.Types.ObjectId(),
      });
      await fire.save();

      report = new Report({
        location: "Tầng 2 khu chung cư ACX đường SZS phường XHW Quận Hoàn Kiếm",
        area: 100,
        totalVehicle: 20,
        totalFireman: 40,
        totalDamageProperty: 2000,
        listDamageProperty: "1 TV, 1 xe máy, 1 ô tô",
        totalDeath: 1,
        totalInjury: 1,
        investigation: "phòng pháp chế đang điều tra theo quy định",
        fireResult: "cháy được dập tắt trước khi lan sang nhà lân cận",
        fireCause: "đang điều tra làm rõ",
        owner: "ông XYZ",
        fireType: "Cháy khu dân cư",
        usageType: "căn hộ",
        cadastral: "Nội thành Hà Nội, Quận Hoàn Kiếm",
        fireStationManagement: "dưới sự quản lý của phòng cảnh sát pccc ABC",
        travelDistance: "khoảng 10km đường xe chạy, 50 km đường chim bay",
        supervisorName: "họ tên cán bộ trực",
        waterSource: "nguồn nước được dùng để chữa cháy",
        summary: "tình hình diễn biến vụ cháy",
        assessmentAndClassification:
          "nhận xét đánh giá công tác pccc và phân loại",
        receivedTime: "2020-03-22T12:13:30.834+00:00",
        finishedTime: "2020-03-23T15:13:30.834+00:00",
        fire: fire._id,
      });
      await report.save();
      reportId = report._id;
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 403 if account is supervisor", async () => {
      token = new Account({}).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it("should return 404 if given id is invalid", async () => {
      reportId = "1";
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("invalid ID");
    });

    it("should return 404 if report with given id is not existed", async () => {
      reportId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Report is not found");
    });

    it("should return 404 if fire in report with given id is not existed", async () => {
      await Fire.deleteMany({});
      const res = await exec();
      expect(res.status).toBe(404);
      expect(res.text).toBe("Fire is not found");
    });

    it("should return 200 if report and its fire are deleted", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.text).toBe("Report and its Fire are deleted");
    });
  });
});
