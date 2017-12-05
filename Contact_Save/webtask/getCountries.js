var request = require('request');
module.exports = function (context,cb) {
    var options = { 
        method: 'GET',
        url: 'http://services.groupkt.com/country/get/all',
        headers:{}
    };
    request(options, function (error, response, body) {
        if (error){
            return cb({error});
        }
        cb(null,JSON.parse(body)["RestResponse"].result
        .sort((a,b) => {
            return b.name < a.name;
        }).map(e=>{
            return {
                code:e.alpha3_code,
                name:e.name
            };
        }));
    });
}