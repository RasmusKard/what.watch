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
  var ratingRangeSlider = document.getElementById('ratingRangeSliderContainer');
  var ratingRangeValue = document.getElementById('ratingRangeValue');
  var minRatingInput = document.getElementById('minRatingInput');
  var maxRatingInput = document.getElementById('maxRatingInput');

  noUiSlider.create(ratingRangeSlider, {
    start: [0, 10],
    connect: true,
    step: 0.1,
    range: {
      'min': 0,
      'max': 10
    }
  });

  ratingRangeSlider.noUiSlider.on('update', function(values, handle) {
    var minValue = parseFloat(values[0]);
    var maxValue = parseFloat(values[1]);

    ratingRangeValue.textContent = minValue.toFixed(1) + ' - ' + maxValue.toFixed(1);
    minRatingInput.value = minValue.toFixed(1);
    maxRatingInput.value = maxValue.toFixed(1);
  });


  // Minimum Amount of Votes Slider
  var minVotesSlider = document.getElementById('minVotesSlider');
  var minVotesValue = document.getElementById('minVotesValue');
  var minVotesInput = document.getElementById('minVotesInput');

  noUiSlider.create(minVotesSlider, {
    range: {
      'min': 0,
      'max': 250000
    },
    step: 25,
    start: 0,
    format: {
      to: function (value) {
        return value.toString();
      },
      from: function (value) {
        return Number(value.replace(/,/g, ''));
      }
    }
  });


  minVotesSlider.noUiSlider.on('update', function (values, handle) {
    var floatValue = parseFloat(values[handle]);
    var formattedValue = floatValue.toLocaleString(undefined, { maximumFractionDigits: 0 });
    minVotesValue.textContent = formattedValue;
    minVotesInput.value = floatValue;
  });










  // Release Year Range Slider
  var yearSlider = document.getElementById('yearSlider');
  var yearRangeValue = document.getElementById('yearRangeValue');
  var minYearInput = document.getElementById('minYearInput');
  var maxYearInput = document.getElementById('maxYearInput');

  noUiSlider.create(yearSlider, {
    start: [1900, 2023],
    connect: true,
    step: 1,
    range: {
      'min': 1900,
      'max': 2023
    }
  });

  yearSlider.noUiSlider.on('update', function(values, handle) {
    var minYear = Math.round(values[0]);
    var maxYear = Math.round(values[1]);

    yearRangeValue.textContent = minYear + ' - ' + maxYear;
    minYearInput.value = minYear;
    maxYearInput.value = maxYear;
  });
})




