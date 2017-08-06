"use strict";
const request = require("request-promise");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const url = require("url");
const HtmlMinify = require('htmlmin');

module.exports = function (ctx, req, res) {
  res.writeHead(200, {
    "Content-Type": "text/html "
  });
  if (!ctx.query.url) {
    res.end("no url provided");
  }
  const articleUrl = ctx.query.url;
  const endpointUrl = ctx.headers.host;
  request({
      url: articleUrl,
      encoding: null,
      timeout: 60000,
      maxAttempts: 6000,
      retryDelay: 1000
    })
    .then(HTML => {
      let html = HTML;
      html = iconv.decode(html, "gb2312");
      const $ = cheerio.load(html);
      $("#guild").remove();
      $("#shop").remove();
      $(".bottomlink").remove();
      $("#feit2").remove();
      $("script").remove();
      $("link").remove();
      $("style").remove();
      if (articleUrl.indexOf(".html") > -1) {
        $('div[align="center"]').remove();
      }
      $('a:contains("返回目录")').attr('target', '_blank');
      $("head").append(`
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
        <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.rawgit.com/ZachSaucier/Just-Read/d7090485/default-styles.css">
        <link rel="stylesheet" href="https://cdn.rawgit.com/ZachSaucier/8295d9dc926d7064ff0d4f3f04b35b55/raw/06a8cc03bbdbb7e36f7ae192f834226320f752cd/dark-theme.css">
        `);
      $("head").append(`
        <style>
        body {
          max-width: 600px;
          margin: 20px auto;
          font-size: 18px;
          padding: 0 10px;
        }
        @media screen and (min-width: 768px) {
          body {
            font-size: 20px;
            color: #fff;
          }
        }
        </style>
        `);
      $("a").each((i, elem) => {
        let href = $(elem).attr("href");
        href = url.resolve(articleUrl, href);
        href = `https://${endpointUrl}/piaotian-parser?url=${href}`;
        $(elem).attr("href", href);
      });
      $("body").append($(".toplink").clone());
      $("body").prepend(`
      <div class="clearfix">
        <a style="display:block; float: right;" href="${articleUrl}" target="_blank">Original Url</a>
      </div>
      `);
      html = "<html>" + $("html").html() + "</html>";
      html = HtmlMinify(html);
      res.end(html);
    })
    .catch(err => {
      res.end(err);
    });
};