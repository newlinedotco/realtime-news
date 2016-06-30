var express = require('express');
var router = express.Router();

module.exports = ({wss, logger}) => {
  router.get("/updates", function(req, res){
  	initialiseSSE(req, res);
  });

  router.get("/post-update", function(req, res) {
  	res.render("postupdate", {});
  });

  router.put("/post-update", function(req, res) {
  	var json = JSON.stringify(req.body);
  	dataChannel.publish(json);
  	res.status(204).end();
  });

  return router;
}

function initialiseSSE(req, res) {
	dataChannel.subscribe(function(channel, message){
		var messageEvent = new ServerEvent();
		messageEvent.addData(message);
		outputSSE(req, res, messageEvent.payload());
	});

	res.set({
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		"Connection": "keep-alive",
		"Access-Control-Allow-Origin": "*"
	});

	res.write("retry: 10000\n\n");
}

function outputSSE(req, res, data) {
	res.write(data);
}

class ServerEvent {
  constructor() {
    this.data = "";
  }

  addData(data) {
    const lines = data.split(/\n/);
    lines.forEach(line => this.data += `data: ${line}\n`);
  }

  payload() {
    return `${this.data}\n`
  }
}
