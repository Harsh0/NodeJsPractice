const _Promise = require('./_Promise.min');


var p = new _Promise((resolve,reject)=>{
	resolve("Hi");
});

p
.then((d)=>{
	console.log(d);
	return new _Promise((r,s)=>{
		s(1);
	});
})
.catch(err=>{
	console.log('fist err',err);
	return new _Promise((resolve,reject)=>{
		resolve("hey");
	})
})
.then(data=>{
	console.log(data);
});