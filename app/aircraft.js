function saveAircraft(event) {
  event.preventDefault();

  const aircraft = getFormData($('#aircraftForm'));

  if(aircraft.id != "") {
    updateAircraft(aircraft, event);
  } else {
    addAircraft(aircraft, event);
  }
}

function addAircraft(aircraft, event) {
  event.preventDefault();

  $.ajax({
    url: 'http://localhost:8080/aeronaves/',
    type: 'POST',
    data: JSON.stringify(aircraft),
    contentType: 'application/json',
    success: function() {
      toastr["success"]("Aircraft saved successfully!")
      clearForm();
      reloadMainFunctions();
    }
  });
}

function updateAircraft(aircraft, event) {
  $.ajax({
    url: 'http://localhost:8080/aeronaves/' + aircraft.id,
    type: 'PUT',
    contentType: 'application/json',
    data : JSON.stringify(aircraft),
    success: function() {
      toastr["success"]("Aircraft saved successfully!")
      clearForm();
      reloadMainFunctions();
    }
  })
}

function deleteAircraft(id) {
  $.ajax({
    url: 'http://localhost:8080/aeronaves/' + id,
    type: 'DELETE',
    success: function() {
      toastr["success"]("Aircraft deleted successfully!")
      reloadMainFunctions();
    }
  })
}

function modifyAircraft(id) {
  $.ajax({
    url: 'http://localhost:8080/aeronaves/' + id,
    type: 'GET',
    dataType: 'json',
    success: function(response) {
      fillFormWithAircraft(response);
    }
  })
}

function getAllAircraft() {
  $.ajax({
    url: 'http://localhost:8080/aeronaves/',
    type: 'GET',
    success: function(aircraftList) {
      getAircraftByDecade(aircraftList);
      printNotSoldQty(aircraftList);
      printQtyThisWeek(aircraftList);
      printBrandQty(aircraftList, 'EMBRAER','embraerQty');
      printBrandQty(aircraftList, 'BOEING','boeingQty');
      printBrandQty(aircraftList, 'AIRBUS','airbusQty');
      initializeDataTable(aircraftList);
    }
  });
};

function getNotSoldAircraft(aircraftList) {
  return aircraftList.filter(
    function(aircraft){
      return aircraft.sold == false;
    }
  ).length;
}

function getLastWeekRegisteredAircraft(aircraftList) {
  return aircraftList.filter(
    function(aircraft){
      return moment(aircraft.created).subtract(1,'week');
  }).length;
}

function getAircraftByBrand(aircraftList, brand) {
  return aircraftList.filter(
    function(aircraft){
      return aircraft.brand == brand;
    }
  ).length;
}

function getAircraftByDecade(aircraftList) {
  let formattedDates = [];
  let decades = {};

  const distinct = (value, index, self) => {
    return self.indexOf(value) === index;
  }

  aircraftList.forEach(aircraft => {
    formattedDates.push(getDecade((aircraft.year)));
  });

  formattedDates.sort();

  formattedDates.forEach(function(decade) {
    decades[decade] = (decades[decade] || 0) + 1;
  });

  printAircraftByDecade(decades);

}

function printAircraftByDecade(decades) {
  let html = 'Registered in database:<br>';
  for(decade in decades){
    html += '    <b>' + decade + '</b>: ' + decades[decade] + '<br>';
  }

  $('#aircraftByDecade').html(html);
}

function printQtyThisWeek(aircraftList){
  $('#thisWeek').html(getLastWeekRegisteredAircraft(aircraftList));
}

function printNotSoldQty(aircraftList) {
  $('#notSold').html(getNotSoldAircraft(aircraftList));
}

function printBrandQty(aircraftList, brand, id){
  $('#' + id).html(getAircraftByBrand(aircraftList, brand));
}

function initializeDataTable(aircraftList) {
  let html = '';

  aircraftList.forEach(aircraft => {
    html += '<tr>';
    html += '   <td align="center"><i class="fas fa-times" style="cursor: pointer;" onclick="deleteAircraft(' + aircraft.id + ');">' +
                  '</i>&nbsp;&nbsp;<i class="fas fa-pencil-alt" style="cursor: pointer;" onclick="modifyAircraft(' + aircraft.id + ');"></i></td>';
    html += '   <td>' + aircraft.name + '</td>';
    html += '   <td>' + aircraft.brand + '</td>';
    html += '   <td>' + aircraft.year + '</td>';
    html += '   <td>' + replaceNullForEmptyString(aircraft.description) + '</td>';
    html += '   <td>' + aircraft.sold + '</td>';
    html += '   <td>' + formatDateToDDMMYYYY(aircraft.created) + '</td>';
    html += '   <td>' + formatDateToDDMMYYYY(replaceNullForEmptyString(aircraft.updated)) + '</td>';
    html += '</tr>';
  });

  $('#aircraftTable tbody').html(html);

  $('#aircraftTable').DataTable();
}

function reloadMainFunctions() {
  getAllAircraft();  
}

$('document').ready(function(){
  reloadMainFunctions();
});

function formatDateToDDMMYYYY(inputFormat) {
  if(inputFormat === "") {
    return inputFormat;
  }
  function pad(s) {
    return (s < 10) ? '0' + s : s;
  }
  let d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
}

function replaceNullForEmptyString(object) {
  return (object != null) ? object : "";
}

function getFormData($form){
  var unindexed_array = $form.serializeArray();
  var indexed_array = {};

  $.map(unindexed_array, function(n, i){
      indexed_array[n['name']] = n['value'];
  });

  return indexed_array;
}

function getDecade(year) {
  const date = new Date(year, 01, 01);
  return (Math.floor(date.getFullYear() / 10) * 10) + 's';
}

function fillFormWithAircraft(aircraft){
  $('#aircraftId').val(aircraft.id);
  $('#selectBrand').val(aircraft.brand);
  $('#aircraftName').val(aircraft.name);
  $('#aircraftDescription').val(aircraft.description);
  $('#year').val(aircraft.year);
  $('#selectStatus').val(aircraft.sold.toString());
}

function clearForm(){
  $('#aircraftForm')[0].reset();
}