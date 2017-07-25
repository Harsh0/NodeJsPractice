//controller functions
var interval;
function sync(){
  //get the data and sync if connection is not there poll it to evergy 30 seconds and save in interval variable
  if(interval){
    clearInterval(interval);
  }
  data = localStorage.getItem('business');
  if(data){
    data = JSON.parse(data);
    var unsentData = [];
    for(var i=0;i<data.length;i++){
      if(!data[i]["_id"]){
        unsentData.push(data[i]);
      }
    }
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
        alert('data synced to database');
      }
    }
    pushData(unsentData,dataPushed);
  }
}
function pushData(data,cb){
  //push data to data base if connection lost send error otherwise updated data
  cb(data);
}
// sync();
renderPage();
function saveLocalStorage(data){
  var d = localStorage.getItem('business');
  if(d){
    d = JSON.parse(d);
    var temp = d.find(function(e){
      for(k in e){
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
  alert('data saved sucessfully');
  renderPage();
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
    console.log(i);
    var row = table.insertRow(+i+1);
    var j=0;
    for(var k in data[i]){
      var cell = row.insertCell(j);
      cell.innerHTML = data[i][k];
      j++;
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
