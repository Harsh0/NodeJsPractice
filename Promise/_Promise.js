const _Promise = function(cb){
	let a = {}
	if(!(cb&&{}.toString.call(cb)=='[object Function]')){
		throw new Error(`Promise resolve ${cb} is not a function`);
	}
	let temp = {};
	temp.functionChain = [];
	this.then = (successCallback)=>{
		temp.functionChain.push({type:'then',func:successCallback});
		return this;
	};
	this.catch = (errCallback)=>{
		temp.functionChain.push({type:'catch',func:errCallback});
		return this;
	};
	this.transferEventListeners = (functionChain)=>{
		temp.functionChain = functionChain;
	}
	temp.resolve = (data)=>{
		let funcChain = temp.functionChain;
		for(let i=0;i<funcChain.length;i++){
			if(funcChain[i].type=='then'){
				try{
					let newPromOrData =  funcChain[i].func(data);
					if(newPromOrData instanceof _Promise){
						//promise has received
						//put all other function to newpromise object
						newPromOrData.transferEventListeners(funcChain.slice(i+1));
						process.nextTick(()=>{
							delete this;//remove this promise;
						})
						break;
						//when the resolve or reject of new promise called functions will be fetched from this chain and executed
					}else{
						data = newPromOrData;
						//in next iteration this data will be used to call next then
					}
				}catch(err){
					//call reject
					process.nextTick(()=>{
						temp.reject(err);
					})
					break;
				}
			}
		}
	};
	temp.reject = (err)=>{
		//find the first catch and execute and run other functions if available after that
		let funcChain = temp.functionChain;
		for(let i=0;i<funcChain.length;i++){
			if(funcChain[i].type=='catch'){
				try{
					let newPromOrData = funcChain[i].func(err);
					if(newPromOrData instanceof _Promise){
						newPromOrData.transferEventListeners(funcChain.slice(i+1));
						process.nextTick(()=>{
							delete this;
						})
						break;
					}else{
						temp.functionChain = funcChain.slice(i+1);
						process.nextTick(()=>{
							temp.resolve(newPromOrData);
						})
						break;
					}
				}catch(err){
					//find other catch and execute
					temp.functionChain = funcChain.slice(i+1);
					process.nextTick(()=>{
						temp.reject(err);
					});
					break;
				}
			}
		}
	}
	process.nextTick(()=>{
		try{
			cb(temp.resolve,temp.reject);
		}catch(err){
			temp.reject(err);
		}
	});
}
module.exports = _Promise;