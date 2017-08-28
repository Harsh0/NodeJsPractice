const _Promise = function(cb){
	this.functionChain = [];
	this.then = (successCallback)=>{
		this.functionChain.push({type:'then',func:successCallback});
		return this;
	};
	this.catch = (errCallback)=>{
		this.functionChain.push({type:'catch',func:errCallback});
		return this;
	};
	this.resolve = (data)=>{
		let funcChain = this.functionChain;
		for(let i=0;i<funcChain.length;i++){
			if(funcChain[i].type=='then'){
				try{
					let newPromOrData =  funcChain[i].func(data);
					if(newPromOrData instanceof _Promise){
						//promise has received
						//put all other function to newpromise object
						newPromOrData.functionChain = funcChain.slice(i+1);
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
						this.reject(err);
					})
					break;
				}
			}
		}
	};
	this.reject = (err)=>{
		//find the first catch and execute and run other functions if available after that
		let funcChain = this.functionChain;
		for(let i=0;i<funcChain.length;i++){
			if(funcChain[i].type=='catch'){
				try{
					let newPromOrData = funcChain[i].func(err);
					if(newPromOrData instanceof _Promise){
						newPromOrData.functionChain = funcChain.slice(i+1);
						process.nextTick(()=>{
							delete this;
						})
						break;
					}else{
						this.functionChain = funcChain.slice(i+1);
						process.nextTick(()=>{
							this.resolve(newPromOrData);
						})
						break;
					}
				}catch(err){
					//find other catch and execute
					this.functionChain = funcChain.slice(i+1);
					process.nextTick(()=>{
						this.reject(err);
					});
					break;
				}
			}
		}
	}
	process.nextTick(()=>{
		try{
			cb(this.resolve,this.reject);
		}catch(err){
			this.reject(err);
		}
	});
}
module.exports = _Promise;