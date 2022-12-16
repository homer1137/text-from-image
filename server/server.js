const express = require("express");
const cors = require("cors");
const uuid = require("uuid");
const puppeteer = require("puppeteer");
const fileupload = require("express-fileupload");
const axios = require("axios");
const path = require("path");
const screenshot = require("desktop-screenshot");
const childProcess = require('child_process');

const apiKey = "AQVNxfhRDnNYgoZwXlbSed8VLmqAS2wXIIk-d3zD";

const PORT = 5000;

const app = express();

app.use(cors());
app.use(fileupload({}));

const fs = require("fs");

//Скриншот без библиотеки, linux

app.get('/screenshot3', function(request, response){
  childProcess.exec('scrot screenshot22.png', function(err){
    if(err) {
      response.send(503,'Error creating image!');
    } else {
      let fileImage = fs.readFileSync("screenshot22.png");
      const encoded = Buffer.from(fileImage).toString("base64");

      const data = {
        folderId: "b1gd5tqca34gb4biui0j",
        analyze_specs: [
          {
            content: encoded,
            features: [
              {
                type: "TEXT_DETECTION",
                text_detection_config: {
                  language_codes: ["*"],
                },
              },
            ],
          },
        ],
      };

      axios
        .post(
          "https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze",
          data,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Api-Key ${apiKey}`,
            },
          }
        )
        .then((respo) =>
          JSON.stringify(
            respo.data.results[0].results[0].textDetection.pages[0]
          ).match(/"text":("([^""]+)"|\[[^[]+])/gm)
        )
        .then((result) =>
          result
            .map((item) => item.replace(/text/, "").replace(/[^a-zа-яё]/gi, ""))
            .join(" ")
        )
        .then((resp) => {
          const fileName = uuid.v4() + ".txt";
          const filePath = path.resolve(fileName);
          fs.writeFileSync(filePath, resp, () => {});
        });
      res.status(200).json("well done");
    }
  });
});

//Скриншот с библиотекой, linux, windows
app.get("/screenshot2", (req, res) => {
  screenshot("screenshot.png", function async(error, complete) {
    if (error) {
      console.log("Screenshot failed", error);
      res.status(500).json("some error");
    } else {
      let fileImage = fs.readFileSync("screenshot.png");
      const encoded = Buffer.from(fileImage).toString("base64");

      const data = {
        folderId: "b1gd5tqca34gb4biui0j",
        analyze_specs: [
          {
            content: encoded,
            features: [
              {
                type: "TEXT_DETECTION",
                text_detection_config: {
                  language_codes: ["*"],
                },
              },
            ],
          },
        ],
      };

      axios
        .post(
          "https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze",
          data,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Api-Key ${apiKey}`,
            },
          }
        )
        .then((respo) =>
          JSON.stringify(
            respo.data.results[0].results[0].textDetection.pages[0]
          ).match(/"text":("([^""]+)"|\[[^[]+])/gm)
        )
        .then((result) =>
          result
            .map((item) => item.replace(/text/, "").replace(/[^a-zа-яё]/gi, ""))
            .join(" ")
        )
        .then((resp) => {
          const fileName = uuid.v4() + ".txt";
          const filePath = path.resolve(fileName);
          fs.writeFileSync(filePath, resp, () => {});
        });
      res.status(200).json("well done");
    }
  });
});

// скриншот окна браузера
app.get("/screenshot", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    const isLink = await page.goto(req.query.url);
    if (isLink.status !== 200) {
      const image = await page.screenshot({ fullPage: true });
      await browser.close();
      //save file
      const fileName = uuid.v4() + ".png";
      const filePath = path.resolve(fileName);
      fs.writeFileSync(filePath, image, () => {});

      const encoded = Buffer.from(image).toString("base64");

      const data = {
        folderId: "b1gd5tqca34gb4biui0j",
        analyze_specs: [
          {
            content: encoded,
            features: [
              {
                type: "TEXT_DETECTION",
                text_detection_config: {
                  language_codes: ["*"],
                },
              },
            ],
          },
        ],
      };

      await axios
        .post(
          "https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze",
          data,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Api-Key ${apiKey}`,
            },
          }
        )
        .then((respo) =>
          JSON.stringify(
            respo.data.results[0].results[0].textDetection.pages[0]
          ).match(/"text":("([^""]+)"|\[[^[]+])/gm)
        )
        .then((result) =>
          result
            .map((item) => item.replace(/text/, "").replace(/[^a-zа-яё]/gi, ""))
            .join(" ")
        )
        .then((resp) => {
          const fileName = uuid.v4() + ".txt";
          const filePath = path.resolve(fileName);
          fs.writeFileSync(filePath, resp, () => {});

          return res.status(200).json(resp);
        });
    } else res.status(400).json({ data: { message: "link is not correct" } });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

app.listen(PORT, () => {
  console.log(`server started at ${PORT} port`);
});
