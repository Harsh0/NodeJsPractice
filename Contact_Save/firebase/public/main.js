//controller functions
var interval;
var apiUrl = "";
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
            if(data[i]["_id"]){
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
      if(k=="_id"){
        continue;
      }
      var cell = row.insertCell(j);
      cell.innerHTML = data[i][k];
      j++;
    }
    var cell = row.insertCell(j);
    cell.innerHTML = "<a id='delete' href='javascript:deleteRow("+i+")' >Delete</a>";
  }
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
