const util = require('util');
const multiparty = require('multiparty');
const exec = util.promisify(require('child_process').exec);
const request = util.promisify(require('request'))
const querystring = require('querystring')

const cheerio = require('cheerio')
const debug = require('debug')('myapp:server')
const fs = require('fs')
const noop = () => 'noop'
const _ = require('lodash')
const { tap } = require('../utils/tap')

const AMAZON_URL = 'https://www.amazon.fr/s/ref=nb_sb_noss/260-9982470-2264950?';
const EXPECTED_RESULTS = 3
const UPLOAD_DIR = __dirname + '/../public/images'
const FILE_FIELD_NAME = 'image'
console.log(UPLOAD_DIR)

exports.imageForm = function (req, res) {
    res.render('upload', {
        title: 'Upload Images',
    });
    // crawlAmazon(`${AMAZON_URL}${queryStr}`)
    //         .then((crawlingResults) => res.render('results', {results: crawlingResults}))
    //         .catch(err => res.end(err.message))
};

const extractPath = files => files[FILE_FIELD_NAME][0].path
exports.uploadImage = function (req, res) {

    const form = new multiparty.Form({
        uploadDir: UPLOAD_DIR,
    });

    form.parse(req, function (err, fields, files) {
        if (err) {
            res.writeHead(400, { 'content-type': 'text/plain' });
            res.end("invalid request: " + err.message);
            return;
        }
        
        const path = extractPath(files)
        console.log(util.inspect(files))
        console.log(util.inspect(fields))

        analyze(path)
            .then(tap)
            .then(res => {
                fs.unlink(path, noop)
                return res
            })
            .then(({ stdout }) => crawlAmazon(`${AMAZON_URL}${queryStr(stdout)}`))
            .then((crawlingResults) => res.render('results', { results: crawlingResults }))
            .catch(err => { console.error(err); throw err; })
            .catch(err => res.render('error', { error: err }))

    });
};

function queryStr(search) {
    return querystring.stringify({
        'url': 'search-alias%3Daps',
        '__mk_fr_FR': 'ÅMÅŽÕÑ',
        'field-keywords': search
    })
}

function analyze(path){ return exec(`tesseract ${path} stdout --oem 1`); }

function crawlAmazon(url) {
    return request(url)
        .then((response) => {
            const body = response.body
            //fs.writeFile('amazon.html', body, noop)
            const $ = cheerio.load(body)
            const results = _.range(EXPECTED_RESULTS).map(i => $('#result_' + i).html())
            return results ? results : 'no result';
        })
}