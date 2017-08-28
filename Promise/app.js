const Prom = require('./_Promise');


var p = new Prom((resolve,reject)=>{
	resolve("Hi");
});

p
.then((d)=>{
	console.log(d);
	return new Prom((resolve,reject)=>{
		setTimeout(()=>{
			reject("hello");
		},1000);
	})
})
.catch(err=>{
	console.log('fist err',err);
	return new Prom((resolve,reject)=>{
		resolve("hey");
	})
})