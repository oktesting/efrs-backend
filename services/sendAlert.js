const gcm = require("node-gcm");

module.exports.sendAlert = async (alert, registrationTokens) => {
  // ... or some given values
  // const message = new gcm.Message({
  //     collapseKey: "demo",
  //   priority: "high",
  //   contentAvailable: true,
  //   delayWhileIdle: true,
  //   timeToLive: 10,
  //   restrictedPackageName: "somePackageName",
  //   dryRun: true,
  //   data: {
  //     title: alert.title,
  //     message: alert.message,
  //   },
  //   notification: {
  //     title: alert.title,
  //     icon: "ic_launcher",
  //     body: alert.message,
  //   },
  // });

  // Set up the sender with you API key
  // const sender = new gcm.Sender(process.env.firebase_server_api_key);

  // Add the registration tokens of the devices you want to send to
  //   var registrationTokens = [];
  //   registrationTokens.push("regToken1");
  //   registrationTokens.push("regToken2");

  // Send the message
  // ... trying only once
  //   sender.sendNoRetry(
  //     message,
  //     { registrationTokens: registrationTokens },
  //     function (err, response) {
  //       if (err) console.error(err);
  //       else console.log(response);
  //     }
  //   );

  // ... or retrying
  //   sender.send(message, { registrationTokens: registrationTokens }, function (
  //     err,
  //     response
  //   ) {
  //     if (err) console.error(err);
  //     else console.log(response);
  //   });

  // ... or retrying a specific number of times (10)
  // sender.send(message, { registrationTokens: registrationTokens }, 5, function (
  //   err,
  //   response
  // ) {
  //   if (err) console.error(err);
  //   else console.log(response);
  // });

  // Q: I need to remove all "bad" token from my database, how do I do that?
  //    The results-array does not contain any tokens!
  // A: The array of tokens used for sending will match the array of results, so you can cross-check them.
  //   sender.send(message, { registrationTokens: registrationTokens }, function (
  //     err,
  //     response
  //   ) {
  //     var failed_tokens = registrationTokens.filter(
  //       (token, i) => response[i].error != null
  //     );
  //     console.log("These tokens are no longer ok:", failed_tokens);
  //   });
};
