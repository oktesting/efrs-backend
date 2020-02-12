const fs = require("fs");
const { Fire } = require("../models/fire");

let clients = [];
let id = 0;

// Iterate clients list and use write res object method to send new nest
function sendEventsToAll(newFire) {
  clients.forEach(c => {
    c.res.write(`id: ${++id}\n`);
    c.res.write("event: realtimeEvent\n");
    c.res.write(`data: ${JSON.stringify(newFire)}\n\n`);
  });
}

function convertFilesToBinary(req, fire) {
  req.files.forEach(file => {
    const evidence = { ...file };
    var img = fs.readFileSync(file.path);
    var encode_image = img.toString("base64");
    evidence["buffer"] = Buffer.from(encode_image, "base64");
    fire.evidences.push(evidence);
  });
}

function closeConnection(response, clientId) {
  if (!response.finished) {
    response.end();
    clients = clients.filter(c => c.id !== clientId);
    console.log(`${clientId} Connection closed`);
  }
}

module.exports.addAlert = async (req, res, next) => {
  const fire = new Fire(req.body);
  convertFilesToBinary(req, fire);
  await fire.save();
  res.send({ _id: fire._id });
  return sendEventsToAll(fire);
};

module.exports.addEvidencesToCurrentAlert = async (req, res, next) => {
  const fire = await Fire.findById(req.params.id);
  if (!fire) return res.status(404).send("not found fire with given id");
  convertFilesToBinary(req, fire);
  await fire.save();
  return res.status(200).send("evidences is submitted");
};

module.exports.handleAlert = async (req, res, next) => {
  req.socket.setTimeout(0);

  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache"
  };
  res.writeHead(200, headers);
  res.flushHeaders();

  const data = await Fire.find();
  res.write(`id: ${++id}\n`);
  res.write("event: firstEvent\n");
  res.write(`data: ${JSON.stringify(data)}\n\n`);

  // Generate an id based on timestamp and save res
  // object of client connection on clients list
  // Later we'll iterate it and send updates to each client
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };
  clients.push(newClient);
  console.log(`${clientId} Connection opened`);

  // When client closes connection we update the clients list
  // avoiding the disconnected one
  req.on("close", () => {
    // console.log(`${clientId} Connection closed`);
    // clients = clients.filter(c => c.id !== clientId);
    // res.end();
    closeConnection(res, clientId);
  });
};
