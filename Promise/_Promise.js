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
						break;
						//when the resolve or reject of new promise called functions will be fetched from this chain and executed
					}else{
						data = newPromOrData;
						//in next iteration this data will be used to call next then
					}
				}catch(err){
					//find first catch after i and execute
					while(1){
						if(funcChain[i+1]){
							if(funcChain[i+1].type=='catch'){
								//function found
								//make new Prom and call the reject
								let newProm = new _Promise((resolve,reject)=>{
									reject(err);
								});
								newProm.functionChain = funcChain.slice(i+1);
								funcChain = [];
								break;
							}else{
								funcChain.splice(i+1,1);
							}
						}else{
							break;
						}
					}
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
						funcChain = [];
						newPromOrData.functionChain = funcChain.slice(i+1);
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
	let self = this;
	process.nextTick(()=>{
		try{
			cb(self.resolve,self.reject);
		}catch(err){
			self.reject(err);
		}
	});
}
module.exports = _Promise;