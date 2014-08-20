// beer list data array
var beerListData = [];

// make sure DOM is ready
$(document).ready(function() {
	// populate the beer list table when the page loads.
	populateTable();

	// beer info click
	$('#beerList table tbody').on('click', 'td a.showBeerInfo', showBeerInfo);

	// add beer button click
	$('#btnAddBeer').on('click', addBeer);

	// delete beer click
	$('#beerList table tbody').on('click', 'td a.deleteBeer', deleteBeer);

	// update beer info click
	$('#beerList table tbody').on('click', 'td a.updateBeer', changeBeerInfo);

	// cancel update beer button click
	$('#btnCancelUpdateBeer').on('click', togglePanels);

	// add updated class to updated fields
	$('#updateBeer input').on('change', function(){$(this).addClass('updated')});

	// update beer button click
	$('#btnUpdateBeer').on('click', updateBeer);
});

// fill table with data
function populateTable() {
	// clear table contents
	var tableContent = '';

	//jQuery AJAX call for JSON beer list data
	$.getJSON('/beers/beerlist', function (results) {
		// add results to beer list array
		beerListData = results;
		// for each item in the results, add table row and cells to the content string
		$.each(results, function() {
			tableContent += '<tr>';
			tableContent += '<td><a href="#" class="showBeerInfo" rel="' + this.beerName + '" title="Show Details">' + this.beerName +'</a></td>';
			tableContent += '<td>' + this.style + '</td>';
			tableContent += '<td>' + this.rating + '</td>';
			tableContent += '<td><a href="#" class="deleteBeer" rel="' + this._id + '">delete</a>/<a href="#" class="updateBeer" rel="' + this._id + '">update</a></td>';
			tableContent += '</tr>';
		});
		// put the content string into the HTML table
		$('#beerList table tbody').html(tableContent);
	});
}

// toggle addBeer and updateBeer panels
function togglePanels () {
	$('#addBeerPanel').toggle();
	$('#updateBeerPanel').toggle();
}

// show beer info
function showBeerInfo (event) {
	// prevent default action of event from triggering
	event.preventDefault();

	// retrieve beerName from link rel attribute
	var thisBeerName = $(this).attr('rel');

	// get index of object based on the id
	var index = beerListData.map(function(item) {
		return item.beerName;
	}).indexOf(thisBeerName);

	// get the beer object from array
	var thisBeerObject = beerListData[index];

	// populate info box
	$('#beerInfoName').text(thisBeerObject.beerName);
	$('#beerInfoBrewedBy').text(thisBeerObject.brewedBy);
	$('#beerInfoBrewedLocation').text(thisBeerObject.brewedLocation);
	$('#beerInfoStyle').text(thisBeerObject.style);
	$('#beerInfoABV').text(thisBeerObject.abv);
	$('#beerInfoIBU').text(thisBeerObject.ibu);
	$('#beerInfoRating').text(thisBeerObject.rating);
	$('#beerInfoComments').text(thisBeerObject.comments);
}

// add beer
function addBeer(event) {
	// prevent default action of event from triggering
	event.preventDefault();

	// increase errorCount variable if any fields are blank
	var errorCount = 0;

	$('#addBeer input').each(function(index, val) {
		if($(this).val() === '') { errorCount++; }
	});

	// check if errorCount's is at zero
	if(errorCount === 0) {
		// if it is, put all form info into new beer object
		var newBeer = {
			'beerName': $('#addBeer fieldset input#inputBeerName').val(),
			'brewedBy': $('#addBeer fieldset input#inputBeerBrewedBy').val(),
			'brewedLocation': $('#addBeer fieldset input#inputBeerBrewedLocation').val(),
			'style': $('#addBeer fieldset input#inputBeerStyle').val(),
			'abv': $('#addBeer fieldset input#inputBeerABV').val(),
			'ibu': $('#addBeer fieldset input#inputBeerIBU').val(),
			'rating': $('#addBeer fieldset input#inputBeerRating').val()
		}

		// use AJAX to post the new beer object to addbeer service
		$.ajax({
			type: 'POST',
			data: newBeer,
			url: '/beers/addbeer',
			dataType: 'JSON'
		}).done(function(response) {
			// check for successful (blank) response
			if (response.msg === '') {
				// clear form inputs
				$('#addBeer fieldset input').val('');
				// update the table
				populateTable();
			}
			else {
				// if something goes wrong, alert the error message the service returned
				alert('Error adding beer: ' + response.msg);
			}
		});
	}
	else {
		// if errorCount is more than 0, alert user
		alert('Fill in all fields');
		return false;
	}
}

// update beer
function changeBeerInfo (event) {
	// prevent default action of event from triggering
	event.preventDefault();

	// if addBeerPanel is visible, hide it and show updateBeerPanel
	if($('#addBeerPanel').is(":visible")) {
		togglePanels();
	}

	// retrieve beerName from link rel attribute
	var thisBeerName = $(this).attr('rel');

	// get index of object based on the id
	var index = beerListData.map(function(item) {
		return item._id;
	}).indexOf(thisBeerName);

	// get the beer object from array
	var thisBeerObject = beerListData[index];

	// populate info box
	$('#updateBeerName').val(thisBeerObject.beerName);
	$('#updateBeerBrewedBy').val(thisBeerObject.brewedBy);
	$('#updateBeerBrewedLocation').val(thisBeerObject.brewedLocation);
	$('#updateBeerStyle').val(thisBeerObject.style);
	$('#updateBeerABV').val(thisBeerObject.abv);
	$('#updateBeerIBU').val(thisBeerObject.ibu);
	$('#updateBeerRating').val(thisBeerObject.rating);

	// put the beer id into the rel of the update beer block
	$('#updateBeer').attr('rel', thisBeerObject._id);
}

function updateBeer (event) {
	// prevent default action of event from triggering
	event.preventDefault();
	// pop up a confirmation dialog
	var confirmation = confirm('Are you sure you want to update this beer?');
	// Check and make sure the user confirmed the update
	if (confirmation === true) {
		// if user confirmed, do the update
		// get the id of the beer to be updated
		var updateBeerId = $(this).parentsUntil('div').parent().attr('rel');
		// get the collection of updated fields
		var fieldsToBeUpdated = $('#updateBeer input.updated');
		// create an object of the updated fields
		var updatedFields = {};
		var updatedFieldCount = 0;
		// populate the updated fields object
		$(fieldsToBeUpdated).each(function () {
			var key = $(this).attr('name');
			var value = $(this).val();
			updatedFields[key] = value;
			updatedFieldCount++;
		});
		console.log(updatedFields);
		if (updatedFieldCount == 0) {
			alert('You did not change anything');
		}
		else {
			$.ajax({
				type: 'PUT',
				url: 'beers/updatebeer/' + updateBeerId,
				data: updatedFields
			}).done(function (response) {
				// check for a successful response
				if (response.msg === '') {
					togglePanels();
				}
				else {
					alert('Error: ' + response.msg);
				}
				populateTable();
			});
		}
	}
	else {
		// if user did not confirm, do nothing
		return false;
	}
}

// delete beer
function deleteBeer(event) {
	// prevent default action of event from triggering
	event.preventDefault();
	// pop up a confirmation dialog
	var confirmation = confirm('Are you sure you want to delete this beer?');
	// Check and make sure the user confirmed the delete
	if (confirmation === true) {
		// if user confirmed, do the delete
		$.ajax({
			type: 'DELETE',
			url: '/beers/deletebeer/' + $(this).attr('rel')
		}).done(function(response) {
			// check for a successful response
			if (response.msg === '') {
			}
			else {
				alert('Error: ' + response.msg);
			}
			// update the table
			populateTable();
		});
	}
	else {
		// if user did not confirm, do nothing
		return false;
	}
}


