//controller functions
var interval;
// var apiUrl = "https://wt-3e2065a708fccb555d9d503914e3c909-0.run.webtask.io";
var apiUrl = "";
var currRow;
function ajax(config){
			this.method = config.method || 'GET';
			this.payload = config.payload || null;
			var xhr = new XMLHttpRequest();
			xhr.open(this.method, config.url, true);
      if(this.method=="POST"){
        xhr.setRequestHeader("Content-Type","application/json");
      }
			xhr.addEventListener("load", function(){
				config.success(xhr);
			});
			xhr.addEventListener("error", config.error);
			xhr.send(this.payload);
}
function getData(){
    ajax({
      url:apiUrl+'/getData',
      success:function(xhr){
        if(xhr.status==200){
            localStorage.setItem('business',xhr.response);
            renderPage();
        }else{
            alert("Server error!");
        }
      },
      error:function(err){
        setTimeout(getData,10000);
      }
    })
}
function pushData(data,cb){
  //push data to data base if connection lost send error otherwise updated data
  ajax({
    method:'POST',
    payload:JSON.stringify(data),
    url:apiUrl+'/pushData',
    success:function(xhr){
        if(xhr.status==200){
            cb(null,JSON.parse(xhr.response));
        }else{
            alert("Server error!!");
        }
    },
    error:function(err){
      cb(err);
    }
  })
}
function sync(){
  //get the data and sync if connection is not there poll it to evergy 30 seconds and save in interval variable
  if(interval){
    clearInterval(interval);
  }
  var data = localStorage.getItem('business');
  if(data){
    data = JSON.parse(data);
    var unsentData = [];
    for(var i=0;i<data.length;i++){
      if(!data[i]["_id"]){
        unsentData.push(data[i]);
      }
			if(data[i]["unsync"]){
				unsentData.push(data[i])
			}
    }
    if(unsentData.length){
      var dataPushed = function(err,dbData){
        if(err){
          interval = setTimeout(function(){
            pushData(unsentData,dataPushed)
          },30000);
        }else{
          var syncedData = []
          for(var i=0;i<data.length;i++){
            if(data[i]["_id"]&&(!data[i]["unsync"])){
              syncedData.push(data[i]);
            }
          }
          syncedData = syncedData.concat(dbData);
          localStorage.setItem('business',JSON.stringify(syncedData));
//          alert('data synced to database');
        }
      }
      pushData(unsentData,dataPushed);
    }else{
      getData();
    }
  }else{
    getData();
  }
}
function saveLocalStorage(data){
  var d = localStorage.getItem('business');
  if(d){
    d = JSON.parse(d);
    var temp = d.find(function(e){
      for(k in e){
          if(k=="_id"){
            continue;
          }
          if(e[k]!=data[k]){
            return false;
          }
      }
      return true;
    });
    if(temp){
      alert("Contact already here!");
      return;
    }
    d.push(data);
  }else{
    d = [data];
  }
  localStorage.setItem('business',JSON.stringify(d));
  renderPage();
//  alert('data saved sucessfully');
  sync();
}

//view functions
function fillData(select,d){
  var list = document.getElementById(select);
  var childs = list.children;
  while(childs.length){
    list.removeChild(childs[0]);
  }
  //add new child
  for(var i in d){
    var opt = document.createElement('option');
    opt.innerHTML = d[i];
    opt.value = d[i];
    list.appendChild(opt);
  }
}
function catChange(){
  var value = document.getElementById('catList').value;
  var category = data.category.find(function(e){
    if(e.name==value){
      return true;
    }
  });
  fillData('subCatList',category.sub)
}
function renderPage(){
  var table = document.getElementById('showTable');
  var data = localStorage.getItem('business');
  data = JSON.parse(data);
  //remove previous rows
  while(table.rows.length>1){
    table.deleteRow(1);
  }
  //add rows to table
  for(var i in data){
    var row = table.insertRow(+i+1);
    var j=0;
    for(var k in data[i]){
      if(k=="_id"||k=="unsync"){
        continue;
      }
      var cell = row.insertCell(j);
      cell.innerHTML = data[i][k];
      j++;
    }
    cell = row.insertCell(j);
    cell.innerHTML = "<a href='javascript:deleteRow("+i+")' >Delete</a>";
		j++;
		cell = row.insertCell(j);
		cell.innerHTML = "<a href='javascript:updateRow("+i+")' >Update</a>";
  }
}
function updateRow(i){
	currRow = +i;
	var data = JSON.parse(localStorage.getItem('business'));
	//show update button hide submit button
	document.getElementById('submit').hidden = true;
	document.getElementById('update').hidden = false;
	document.getElementById('cancelUpdate').hidden = false;
	//put all data to text box
	document.getElementById('natureList').value= data[currRow].nature;
	document.getElementById('catList').value= data[currRow].category;
	document.getElementById('subCatList').value = data[currRow].subCategory;
	document.getElementById('vendorName').value= data[currRow].vendorName;
	document.getElementById('firmName').value = data[currRow].firmName;
	document.getElementById('custName').value = data[currRow].custName;
	document.getElementById('address').value= data[currRow].address;
	document.getElementById('mobile').value= data[currRow].mobile;
}
function clearData(){
	document.getElementById('vendorName').value= "";
	document.getElementById('firmName').value = "";
	document.getElementById('custName').value = "";
	document.getElementById('address').value= "";
	document.getElementById('mobile').value= "";
}
function cancelUpdate(){
	currRow= undefined;
	document.getElementById('submit').hidden = false;
	document.getElementById('update').hidden = true;
	document.getElementById('cancelUpdate').hidden = true;
	clearData();
}
function update(){
	var data = JSON.parse(localStorage.getItem('business'));
	if(data[currRow]["_id"]){
		data[currRow]["unsync"] = true;
	}
	data[currRow].nature=document.getElementById('natureList').value;
  data[currRow].category=document.getElementById('catList').value;
  data[currRow].subCategory=document.getElementById('subCatList').value;
  data[currRow].vendorName=document.getElementById('vendorName').value;
  data[currRow].firmName=document.getElementById('firmName').value;
  data[currRow].custName=document.getElementById('custName').value;
  data[currRow].address=document.getElementById('address').value;
  data[currRow].mobile=document.getElementById('mobile').value;
	localStorage.setItem('business',JSON.stringify(data));
	clearData();
	renderPage();
	sync();
}
function deleteRow(i){
    var flag = confirm("Are you sure, you want to delete row "+(i+1));
    var data = localStorage.getItem('business');
    data = JSON.parse(data);
    var row = data.splice(i,1)[0];
    localStorage.setItem('business',JSON.stringify(data));
    if(flag){
        if(row["_id"]){
            ajax({
                method:'POST',
                payload:JSON.stringify({_id:row["_id"]}),
                url:apiUrl+'/deleteData',
                success:function(xhr){
                    if(xhr.status==200){
                        renderPage();
                    }else{
                        alert('Server Error');
                    }
                },
                error:function(){
                    alert('Some error Occured');
                }
            });
        }else{
            renderPage();
        }
    }
}
function submit(){
  var obj = {
    nature:document.getElementById('natureList').value,
    category:document.getElementById('catList').value,
    subCategory:document.getElementById('subCatList').value,
    vendorName:document.getElementById('vendorName').value,
    firmName:document.getElementById('firmName').value,
    custName:document.getElementById('custName').value,
    address:document.getElementById('address').value,
    mobile:document.getElementById('mobile').value
  };
	clearData();
  saveLocalStorage(obj);
}
var catArray = data.category.map(function(e){
  return e.name;
});
fillData('natureList',data.nature);
fillData('catList',catArray);
fillData('subCatList',data.category[0].sub);
sync();
renderPage();
