$(document).ready(function() {
  // Initialize content types checkboxes
  $(".contentType-group input[type='checkbox']").change(function() {
    var selectedContentTypes = $(".contentType-group input[type='checkbox']:checked").map(function() {
      return $(this).val();
    }).get();
    console.log("Selected content types:", selectedContentTypes);
    updateMultiSelect("#contentTypeMultiSelect", selectedContentTypes);
  });

  // Initialize genres checkboxes
  $(".genre-group input[type='checkbox']").change(function() {
    var selectedGenres = $(".genre-group input[type='checkbox']:checked").map(function() {
      return $(this).val();
    }).get();
    console.log("Selected genres:", selectedGenres);
    updateMultiSelect("#genreMultiSelect", selectedGenres);
  });

  function updateMultiSelect(containerId, selectedItems) {
    var container = $(containerId);
    container.empty();

    selectedItems.forEach(function(item) {
      var chip = $('<div class="chip"><span class="chip-label">' + item + '</span></div>');
      container.append(chip);
    });
  }

  // Handle dropdown-toggle click to show/hide dropdown-menu
  $(".dropdown-checkbox .dropdown-toggle").on("click", function(e) {
    e.stopPropagation();
    $(this).siblings(".dropdown-menu").toggle();
    $(this).parent().toggleClass("show");
    $(this).attr("aria-expanded", $(this).parent().hasClass("show"));
  });

  // Handle checkbox selection behavior and click event for the whole dropdown item
  $(".dropdown-checkbox .dropdown-item").on("click", function(e) {
    e.stopPropagation();
    var checkbox = $(this).find("input[type='checkbox']");
    checkbox.prop("checked", !checkbox.prop("checked")).change();
  });

  // Handle checkbox change event
  $(".dropdown-checkbox input[type='checkbox']").change(function(e) {
    e.stopPropagation();
    var selectedItems = $(this).closest(".dropdown-menu").find("input[type='checkbox']:checked");
    var selectedValues = selectedItems.map(function() {
      return $(this).val();
    }).get();
    var multiSelectContainer = $(this).closest(".form-group").find(".multi-select-input");
    multiSelectContainer.text(selectedValues.join(", "));
  });

  // Close the dropdown when clicking outside
  $(document).on("click", function() {
    $(".dropdown-checkbox .dropdown-menu").hide();
    $(".dropdown-checkbox").removeClass("show");
    $(".dropdown-checkbox .dropdown-toggle").attr("aria-expanded", false);
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
      to: function(value) {
        return value.toString();
      },
      from: function(value) {
        return Number(value.replace(/,/g, ''));
      }
    }
  });

  minVotesSlider.noUiSlider.on('update', function(values, handle) {
    var integerValue = Math.floor(parseFloat(values[handle]) / 25) * 25;
    var formattedValue = integerValue.toLocaleString(undefined, { maximumFractionDigits: 0 });
    minVotesValue.textContent = formattedValue;
    minVotesInput.value = integerValue;
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

  // Open dropdown text box for already watched content
  $("#watchedContentButton").on("click", function(e) {
    e.stopPropagation();
    var dropdownMenu = $("#watchedContentFormContainer");
    dropdownMenu.toggle();

    // Scroll to the dropdown menu if it is not in view
    if (!isElementInViewport(dropdownMenu[0])) {
      $('html, body').animate({
        scrollTop: dropdownMenu.offset().top
      }, 500);
    }
  });

  // Randomize button click
  $("#randomizeBtn").click(function(e) {
    e.preventDefault();
    $("form").attr("action", "/run_script").submit();
  });

  function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
  var savedValue = Cookies.get('watchedContentCookie');
  if (savedValue) {
    // Set the input value from the saved cookie value
    $("#watchedContentInput").val(savedValue);
  }
  $("#watchedContentInput").on("change", function() {
  var inputValue = $(this).val();
  Cookies.set('watchedContentCookie', inputValue, { expires: 7 }); // Cookie expires in 7 days
});
  const closeButton = document.querySelector('.close');
  const errorBox = document.querySelector('.error');

  closeButton.addEventListener('click', () => {
      errorBox.style.display = 'none';
  });
  function runScript() {
    fetch('/run_script', {
      method: 'POST'
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Error: ' + response.statusText);
      }
    })
    .then(function(data) {
      // Handle the successful response and update the page
      const randomizedData = data.sorted_data;
      const posterUrl = data.poster_url;
      const overview = data.overview;
      // Update the page with the randomized content
      // ...
    })
    .catch(function(error) {
      // Handle the error response and update the error message
      const errorMessage = error.message;
      const errorElement = document.querySelector('.error');
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    });
  }
});
