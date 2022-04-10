import { Service } from "egg";
import { defaultConfig, defaultItem } from "../../config/poster_default_config";
// import sortBy from "lodash-es/sortBy.js";
import { TextToBuffer } from "../../utils/conversion";

const puppeteer = require("puppeteer");
const path = require("path");
const { merge } = require("webpack-merge");
const sharp = require("sharp");
const parallel = require("async/parallel");
const sortBy = require("lodash");

/**
 * Image Service
 */
export default class Image extends Service {
  public async getPoster(url, fileName) {
    const config = JSON.stringify({
      background: {
        name: "bg",
      },
      layers: [
        {
          type: "img",
          "z-index": 1,
          url: "https://cstore-public.seewo.com/threadmill-map/5369168308ae455999f2e27d2ca511cd",
          height: 50,
          width: 50,
          top: 30,
          left: 30,
        },
        {
          type: "text",
          text: "我爱我的祖国",
          "z-index": 1,
          top: 30,
          left: 30,
          options: {
            textColor: "red",
            fontSize: 24,
          },
        },
      ],
    });
    console.log("merge", merge(config, defaultConfig));
    let { width, height, layers, background } = merge(config, defaultConfig);

    layers = sortBy(layers, (item) => item["z-index"]);

    if (background.url) {
      layers.unshift({
        width,
        height,
        type: "img",
        top: 0,
        left: 0,
        url: background.url,
      });
    }

    sharp({
      create: {
        width,
        height,
        channels: 4,
      },
    })
      .png()
      .toBuffer()
      .then((buffer) => {
        parallel(
          layers.map((item) => {
            return function (callback) {
              const { top, left } = merge(defaultItem, item);
              // const { top, left, width, height } = merge(defaultItem, item);
              function composite(buffer) {
                callback({ input: buffer, top, left });
              }
              // if (item.type === "img" && item.url) {
              // }
              if (item.type === "text" && item.url) {
                TextToBuffer(item.text, { ...item.options }, composite);
              }
            };
          })
        ),
          (err, data) => {
            if (err) {
              console.log(err);
            }
            sharp(buffer)
              .composite(data)
              .toBuffer()
              .then((buffer) => {
                console.log("buffer", buffer);
              });
          };
      });
    // const { ctx } = this;
    // console.log(ctx.request.body);
    const browser = await puppeteer.launch({
      headless: true,
      slowMo: 0,
      args: [
        "--no-zygote",

        "--no-sandbox",

        "--disable-gpu",

        "--no-first-run",

        "--single-process",

        "--disable-extensions",

        "--disable-xss-auditor",

        "--disable-dev-shm-usage",

        "--disable-popup-blocking",

        "--disable-setuid-sandbox",

        "--disable-accelerated-2d-canvas",

        "--enable-features=NetworkService",
      ],
    });
    const page = await browser.newPage();
    //设置可视区域大小,默认的页面大小为800x600分辨率
    await page.setViewport({ width, height });
    await page.goto(url);
    //对整个页面截图
    await page.screenshot({
      path: path.resolve(`./screenshot/${fileName}.png`), //图片保存路径
      type: "png",
      fullPage: false, //边滚动边截图
    });

    //执行cos 或 oss 脚本，把图片上传到cdn环境，此处由于调试，暂时省略

    await page.close();
    await browser.close();

    return `${fileName}.png`;
  }
}
