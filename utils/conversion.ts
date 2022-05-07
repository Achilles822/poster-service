const textToImage = require('text-to-image')
import { encode, decode } from 'node-base64-image'
// import axios from 'axios'
const axios = require('axios')
// import fetch from 'node-fetch'
const fetch = require('node-fetch-commonjs')
const FormData = require('form-data')
const fs = require('fs')

export const ImageToBuffer = (url: string) => {
  return new Promise(async (resolve, reject) => {
    const options = { string: true }
    try {
      const image = await encode(url, options)
      const buffer = Buffer.from(image as any, 'base64')
      console.log(buffer)
      return resolve(buffer)
    } catch (e) {
      console.log(e)
      return reject(e)
    }
  })
}

export const TextToBuffer = (text: string, options): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const uri = textToImage
        .generateSync(text, options)
        .split(';base64,')
        .pop()
      return resolve(Buffer.from(uri, 'base64'))
    } catch (e) {
      return reject(e)
    }
    // return composite({}, Buffer.from(uri, 'base64'))
  })
}
export const handleFontPath = (config) => {
  const newConfig = config.layers.map((layer) => {
    if (layer.type === 'text') {
      if (layer.options.fontPath) {
        layer.options.fontPath = `${__dirname}/../fonts/${layer.options.fontPath}`
      }
      return layer
    }
    return layer
  })
  console.log('newConfig', newConfig)
  return { ...config, layers: newConfig }
}

export const dataURLtoFile = async (base64: string, filename: string) => {
  // const arr = base64.split(',')
  // const mime = arr[0]?.match(/:(.*?);/)[1]
  // const bstr = Buffer.from(arr[1], 'base64').toString()

  // let n = bstr.length
  // const u8arr = new Uint8Array(n)
  // // eslint-disable-next-line no-plusplus
  // while (n--) {
  //   u8arr[n] = bstr.charCodeAt(n)
  // }
  // console.log(fetch)
  // return fetch.default.File([u8arr], filename, { type: mime })

  // const stream = `data:application/octet-stream;base64,${base64}`
  // return fetch(stream).then((res) => res.blob())
  const BASE64_MARKER = ';base64,'
  let parts
  let contentType
  let raw
  // if (base64.indexOf(BASE64_MARKER) === -1) {
  parts = base64.split(',')
  contentType = parts[0].split(':')[1]
  raw = decodeURIComponent(parts[1])
  return new Blob([raw], { type: contentType })
  // }
  // parts = base64.split(BASE64_MARKER)
  // contentType = parts[0].split(':')[1]
  // raw = window.atob(parts[1])
  // const rawLength = raw.length
  // const uInt8Array = new Uint8Array(rawLength)
  // for (let i = 0; i < rawLength; ++i) {
  //   uInt8Array[i] = raw.charCodeAt(i)
  // }
  // return new Blob([ uInt8Array ], { type: contentType })
}

const CSTORE_INFO = {
  baseUrl: 'https://cstore.seewo.com',
  appid: '10146',
  oversea_baseurl: 'http://yd.test.seewo.com/europe/operation-platform',
  oversea_appid: 'threadmill-map-pub',
}

const data = {
  appId: CSTORE_INFO.appid,
  clientIp: '127.0.0.1',
  requestId: '',
  clientId: '',
}

export async function handleUploadFile(file) {
  const token = await axios.get(
    `${CSTORE_INFO.baseUrl}/cstore/api/v2/uploadPolicy`,
    {
      params: data,
      xsrfCookieName: 'csrfToken',
      xsrfHeaderName: 'x-csrf-token',
    }
  )
  const { uploadUrl } = token.data.data.policyList[0]
  const { formFields } = token.data.data.policyList[0]
  const form = new FormData()
  if (formFields.length) {
    formFields.forEach((item) => {
      form.append(item.key, item.value)
    })
  }
  form.append('file', file)
  const config = {
    headers: form.getHeaders(),
  }
  const result = await axios.post(uploadUrl, form, config)

  return result.data.data
}
