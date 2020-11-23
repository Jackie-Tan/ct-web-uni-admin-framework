import fetch from "node-fetch";
import { Readable } from "stream";

Router.route("/project-image-upload/:image_id", { where: "server" }).post(function () {
  var request = this.request;
  var response = this.response;
  const readable = new Readable();
  readable._read = () => {};

  request
    .on("data", (data) => {
      readable.push(data);
    })
    .on("end", () => {
      readable.push(null);
      fetch(`${process.env.GATEWAY_URL}/v1/internal/images/upload`, {
        body: readable,
        headers: {
          "content-type": request.headers["content-type"],
          "content-length": request.headers["content-length"],
        },
        method: "POST",
      })
        .then((res) => res.json())
        .then((res) => {
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ url: res.image_url }));
        })
        .catch((err) => {
          response.writeHead(400, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ error: err.message }));
        });
    });
});
