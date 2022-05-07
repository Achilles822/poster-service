import { Service } from 'egg'
import { defaultConfig, defaultItem } from '../../config/poster_default_config'
// import sortBy from "lodash-es/sortBy.js";
import {
  TextToBuffer,
  ImageToBuffer,
  handleFontPath,
  dataURLtoFile,
  handleUploadFile,
} from '../../utils/conversion'

// const puppeteer = require("puppeteer");
// const path = require("path");
const { merge } = require('webpack-merge')
const sharp = require('sharp')
// const parallel = require('async/parallel')
const _ = require('lodash')
const fs = require('fs')

/**
 * Image Service
 */
export default class Image extends Service {
  public async getPoster() {
    console.log('this.ctx.body')
    console.log(this.ctx.request.body)
    // console.log(handleFontPath(this.ctx.request.body))
    // return true
    // const config = {
    //   background: {
    //     name: 'bg',
    //   },
    //   layers: [
    //     {
    //       type: 'img',
    //       'z-index': 1,
    //       url: 'https://cstore-public.seewo.com/threadmill-map/5369168308ae455999f2e27d2ca511cd',
    //       height: 50,
    //       width: 50,
    //       top: 30,
    //       left: 30,
    //     },
    //     {
    //       type: 'text',
    //       text: '我爱我的祖国dfjdhfjkdsfciuorexvngn',
    //       'z-index': 2,
    //       top: 300,
    //       left: 120,
    //       options: {
    //         textColor: 'red',
    //         fontSize: 24,
    //         textAlign: 'center',
    //         fontPath: `${__dirname}/../../fonts/BEBAS.TTF`,
    //         fontFamily: 'BEBAS',
    //       },
    //     },
    //   ],
    // }
    // console.log("merge");
    // console.log(merge(config, defaultConfig));
    let { width, height, layers, background } = merge(
      handleFontPath(this.ctx.request.body),
      defaultConfig
    )

    layers = _.sortBy(layers, (item) => item['z-index'])

    console.log('layers')
    console.log(layers)
    // console.log(merge(handleFontPath(this.ctx.request.body), defaultConfig))

    if (background.url) {
      layers.unshift({
        width,
        height,
        type: 'img',
        top: 0,
        left: 0,
        url: background.url,
      })
    }
    // 绘制基础画布
    sharp({
      create: {
        width,
        height,
        channels: 4,
        background: 'red',
      },
    })
      .png()
      .toBuffer()
      .then(async (buffer) => {
        const result = []
        console.log('layers', layers)
        while (layers.length > 0) {
          const layer = layers.pop()
          // console.log('layer', layer)
          const { top, left } = merge(defaultItem, layer)
          if (layer.type === 'img' && layer.url) {
            const img = await ImageToBuffer(layer.url)
            result.push({ input: img, top, left })
          }
          if (layer.type === 'text' && layer.text) {
            const text = await TextToBuffer(layer.text, { ...layer.options })
            result.push({ input: text, top, left })
          }
        }
        sharp(buffer)
          .composite(result)
          .toBuffer()
          .then((buffer) => {
            console.log('绘制结束')
            // console.log(
            //   'buffer',
            //   `data:image/png;base64,${buffer.toString('base64')}`
            // )
            handleUploadFile(
              dataURLtoFile(
                // `${buffer.toString('base64')}`,
                `data:image/png;base64,${buffer.toString('base64')}`,
                new Date().getTime().toString()
              )
            ).then((res) => {
              console.log(res)
            })

            fs.writeFile(
              `${__dirname}/photo.txt`,
              `data:image/png;base64,${buffer.toString('base64')}`,
              (err) => {
                console.log(err)
              }
            )
          })

        return true
      })
  }
}
