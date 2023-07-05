$(document).ready(function() {
  // Initialize content types checkboxes
  $(".contentType-group input[type='checkbox']").change(function() {
    var selectedContentTypes = $(".contentType-group input[type='checkbox']:checked").map(function() {
      return $(this).val();
    }).get();
    console.log("Selected content types:", selectedContentTypes);
  });

  // Initialize genres checkboxes
  $(".genre-group input[type='checkbox']").change(function() {
    var selectedGenres = $(".genre-group input[type='checkbox']:checked").map(function() {
      return $(this).val();
    }).get();
    console.log("Selected genres:", selectedGenres);
  });

  // Rating Range Slider
  $("#ratingRangeSliderContainer").slider({
    range: true,
    min: 0,
    max: 10,
    step: 0.1,
    values: [0, 10],
    slide: function(event, ui) {
      $("#ratingRangeValue").text(ui.values[0].toFixed(1) + " - " + ui.values[1].toFixed(1));
      $("#minRatingInput").val(ui.values[0].toFixed(1));
      $("#maxRatingInput").val(ui.values[1].toFixed(1));
    }
  });
  var ratingSliderValues = $("#ratingRangeSliderContainer").slider("values");
  $("#ratingRangeValue").text(ratingSliderValues[0].toFixed(1) + " - " + ratingSliderValues[1].toFixed(1));
  $("#minRatingInput").val(ratingSliderValues[0].toFixed(1));
  $("#maxRatingInput").val(ratingSliderValues[1].toFixed(1));

  // Minimum Amount of Votes Slider
  $("#minVotesSlider").slider({
    range: "min",
    min: 0,
    max: 250000, // Update the max value as needed
    value: 0,
    step: 25, // Update the step value as needed
    slide: function (event, ui) {
      var formattedValue = ui.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      $("#minVotesValue").text(formattedValue);
      $("#minVotesInput").val(ui.value);
    },
  });

  var minVotesValue = $("#minVotesSlider").slider("value");
  $("#minVotesValue").text(minVotesValue);
  $("#minVotesInput").val(minVotesValue);

  // Release Year Range Slider
  $("#yearSlider").slider({
    range: true,
    min: 1900,
    max: 2023,
    values: [1900, 2023],
    slide: function(event, ui) {
      $("#yearRangeValue").text(ui.values[0] + " - " + ui.values[1]);
      $("#minYearInput").val(ui.values[0]);
      $("#maxYearInput").val(ui.values[1]);
    }
  });
  var yearSliderValues = $("#yearSlider").slider("values");
  $("#yearRangeValue").text(yearSliderValues[0] + " - " + yearSliderValues[1]);
  $("#minYearInput").val(yearSliderValues[0]);
  $("#maxYearInput").val(yearSliderValues[1]);
});


