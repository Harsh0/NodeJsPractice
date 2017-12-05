var request = require('request');
module.exports = function (context,cb) {
    var countryCode = context.query.country;
    var options = { 
        method: 'GET',
        url: `http://services.groupkt.com/state/get/${countryCode}/all`,
        headers:{}
    };
    request(options, function (error, response, body) {
        if (error){
            return cb({error});
        }
        cb(null,JSON.parse(body)["RestResponse"].result.map(e=>{
            return e.name;
        }));
    });
}