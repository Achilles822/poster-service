import { Controller } from 'egg'

export default class ImageController extends Controller {
  public async index() {
    const { ctx } = this
    ctx.body = await ctx.service.image.getPoster()
  }
}
