const Prom = require('./_Promise');


var p = new Prom((resolve,reject)=>{
	resolve("Hi");
});

p
.then((d)=>{
	console.log(d);
	return new Prom((resolve,reject)=>{
		resolve("hello");
	})
})
.catch(err=>{
	console.log('fist err',err);
	return "error from first catch"
})
.then((d)=>{
	console.log("third",d);
})
.catch(err=>{
	console.log("error",err);
})