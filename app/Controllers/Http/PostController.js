"use strict";

const auth = require("@adonisjs/auth");

const Post = use("App/Models/Post");

class PostController {
  async index({ request, auth }) {
    const user = await auth.getUser();

    if (await user.can("read_private_posts")) {
      const posts = await Post.all();

      return posts;
    }

    const posts = await Post.query().where({ type: "public" }).fetch();

    return posts;
  }

  async store({ request }) {
    const data = request.only(["title", "content", "type"]);

    const post = await Post.create(data);

    return post;
  }

  async show({ params, auth, response }) {
    const post = await Post.findOrFail(params.id);

    if (post.type === "public") {
      return post;
    }

    const user = await auth.getUser();

    if (await user.can("read_private_posts")) {
      return post;
    }

    return response.status(400).send({
      error: {
        message: "Você não tem permissão de leitura",
      },
    });
  }

  async update({ params, request, response }) {
    const data = request.only(["title", "content", "type"]);

    const post = await Post.findOrFail(params.id);

    post.merge(data);

    await post.save();

    return post;
  }

  async destroy({ params }) {
    const permission = await Post.findOrFail(params.id);

    permission.delete();
  }
}

module.exports = PostController;
