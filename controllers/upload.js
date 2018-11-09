const util = require('util');
// const Tesseract = require('tesseract.js')
const multiparty = require('multiparty');
const exec = util.promisify(require('child_process').exec);
const request = util.promisify(require('request'))
const querystring = require('querystring')
const AMAZON_URL = 'https://www.amazon.fr/s/ref=nb_sb_noss/260-9982470-2264950?';
const cheerio = require('cheerio')
const debug = require('debug')('myapp:server')
const fs = require('fs')
const noop = ()=>'noop'
const EXPECTED_RESULTS = 3
const _ = require('lodash')
const { tap } = require('../utils/tap')

const queryStr = (search) => querystring.stringify({
    'url': 'search-alias%3Daps',
    '__mk_fr_FR': 'ÅMÅŽÕÑ',
    'field-keywords': search
})

const analyze = (path) => exec(`tesseract ${path} stdout --oem 1 --psm 7`)
const crawlAmazon = (url) => {
    console.log(url)
    return request(url)
        .then((response) => {
            const body = response.body
            //fs.writeFile('amazon.html', body, noop)
            const $ = cheerio.load(body)
            const results = _.range(EXPECTED_RESULTS).map(i => $('#result_'+i).html())
            return results ? results : 'no result';
        })
}

exports.imageForm = function (req, res) {
    res.render('upload', {
        title: 'Upload Images',
    });
    // crawlAmazon(`${AMAZON_URL}${queryStr}`)
    //         .then((crawlingResults) => res.render('results', {results: crawlingResults}))
    //         .catch(err => res.end(err.message))
};

exports.uploadImage = function (req, res) {
    const form = new multiparty.Form(/*{
        autoFiles: true,
        uploadDir: __dirname + '../public/images',
    }*/);

    form.parse(req, function (err, fields, files) {
        if (err) {
            res.writeHead(400, { 'content-type': 'text/plain' });
            res.end("invalid request: " + err.message);
            return;
        }

        analyze(files.image[0].path)
            .then(tap)
            .then(({ stdout }) => crawlAmazon(`${AMAZON_URL}${queryStr(stdout)}`))
            .then((crawlingResults) => res.render('results', {results: crawlingResults}))
            .catch(err => res.end(err.message))

    });
};