/**
 * Interactive form and chart events / logic.
 */
(function () {
  var sYearEl = document.getElementById('sYear'),
    sMonthEl = document.getElementById('sMonth'),
    sDayEl = document.getElementById('sDay'),
    unitboxEl = document.getElementById('unitbox'),
    unitText = document.querySelector('.unitbox-label').textContent.toLowerCase(),
    items = document.querySelectorAll('.chart li'),
    itemCount,
    COLOR = 'red',
    KEY = {
      UP: 38,
      DOWN: 40
    };

  // Set listeners
  unitboxEl.addEventListener('change', _handleUnitChange);
  sYearEl.addEventListener('input', _handleDateChange);
  sYearEl.addEventListener('keydown', _handleUpdown);
  sYearEl.addEventListener('blur', _unhideValidationStyles);
  sMonthEl.addEventListener('change', _handleDateChange);
  sMonthEl.addEventListener('keydown', _handleUpdown);
  sDayEl.addEventListener('input', _handleDateChange);
  sDayEl.addEventListener('blur', _unhideValidationStyles);
  sDayEl.addEventListener('keydown', _handleUpdown);

  // Ensure the month is unselected by default.
  sMonthEl.selectedIndex = -1;

  // Load default values
  _loadStoredValueOfPSD();

  // Event Handlers
  function _handleUnitChange(e) {
    window.location = '' + e.currentTarget.value + '.html';
  }

  function _handleDateChange(e) {

    // Save date of birth in local storage
    localStorage.setItem("PSD", JSON.stringify({
      month: sMonthEl.value,
      year: sYearEl.value,
      day: sDayEl.value
    }));

    if (_dateIsValid()) {
      itemCount = calculateElapsedTime();
      _repaintItems(itemCount);
    } else {
      _repaintItems(0);
    }
  }

  function _handleUpdown(e) {
    var newNum;
    // A crossbrowser keycode option.
    thisKey = e.keyCode || e.which;
    if (e.target.checkValidity()) {
      if (thisKey === KEY.UP) {
        newNum = parseInt(e.target.value, 10);
        e.target.value = newNum += 1;
        // we call the date change function manually because the input event isn't
        // triggered by arrow keys, or by manually setting the value, as we've done.
        _handleDateChange();
      } else if (thisKey === KEY.DOWN) {
        newNum = parseInt(e.target.value, 10);
        e.target.value = newNum -= 1;
        _handleDateChange();
      }
    }
  }

  function _unhideValidationStyles(e) {
    e.target.classList.add('touched');
  }

  function calculateElapsedTime() {
    var currentDate = new Date(),
      projectStartDate = _getprojectStartDate(),
      diff = currentDate.getTime() - projectStartDate.getTime(),
      elapsedTime;

    switch (unitText) {
      case 'weeks':
        // Measuring weeks is tricky since our chart shows 52 weeks per year (for simplicity)
        // when the actual number of weeks per year is 52.143. Attempting to calculate weeks
        // with a diffing strategy will result in build-up over time. Instead, we'll add up
        // 52 per elapsed full year, and only diff the weeks on the current partial year.
        var elapsedYears = (new Date(diff).getUTCFullYear() - 1970);
        var isThisYearsBirthdayPassed = (currentDate.getTime() > new Date(currentDate.getUTCFullYear(), smonthEl.value, sdayEl.value).getTime());
        var birthdayYearOffset = isThisYearsBirthdayPassed ? 0 : 1;
        var dateOfLastBirthday = new Date(currentDate.getUTCFullYear() - birthdayYearOffset, smonthEl.value, sdayEl.value);
        var elapsedDaysSinceLastBirthday = Math.floor((currentDate.getTime() - dateOfLastBirthday.getTime()) / (1000 * 60 * 60 * 24));
        var elapsedWeeks = (elapsedYears * 52) + Math.floor(elapsedDaysSinceLastBirthday / 7);
        elapsedTime = elapsedWeeks;
        break;
      case 'months':
        // Months are tricky, being variable length, so I opted for the average number
        // of days in a month as a close-enough approximation (30.4375). This can make
        // the chart look off by a day when you're right on the month threshold, but
        // it's otherwise fairly accurate over long periods of time.
        elapsedTime = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.4375));
        break;
      case 'years':
        // We can represent our millisecond diff as a year and subtract 1970 to
        // end up with an accurate elapsed time. To see why, consider the following:
        //
        //   1. JavaScript's Date timestamp represents milliseconds since 1970. Thus,
        //      new Date(0).toUTCString() → 'Thu, 01 Jan 1970 00:00:00 GMT'
        //   2. Picture the diff between today and tomorrow. It's a small number. A
        //      newly created date with that number would result in January 2 1970.
        //   3. Thus, subtracting 1970 from that date gives us elapsed time. We use
        //      UTC because otherwise we'd need to offset "1970" by our timezone.
        //
        // See more details here: https://stackoverflow.com/a/24181701/1154642
        elapsedTime = (new Date(diff).getUTCFullYear() - 1970);
        break;
    }

    return elapsedTime;
  }

  function _dateIsValid() {
    return monthEl.checkValidity() && dayEl.checkValidity() && yearEl.checkValidity();
  }

  function _getProjectStartDate() {
    return new Date(sYearEl.value, sMonthEl.value, sDayEl.value);
  }
  
  function _getProjectFinishDate() {
    return new Date(fYearEl.value, fMonthEl.value, fDayEl.value);
  }
  
  function _repaintItems(number) {
    for (var i = 0; i < items.length; i++) {
      if (i < number) {
        items[i].style.backgroundColor = COLOR;
      } else {
        items[i].style.backgroundColor = '';
      }
    }
  }

  function _loadStoredValueOfPSD() {
    var PSD = JSON.parse(localStorage.getItem('PSD'));

    if (!PSD) {
      return;
    }

    if (PSD.month >= 0 && PSD.month < 12) {
      smonthEl.value = PSD.month
    }

    if (PSD.year) {
      syearEl.value = PSD.year
    }

    if (PSD.day > 0 && PSD.day < 32) {
      sdayEl.value = PSD.day
    }
    _handleDateChange();
  }
  
  function _loadStoredValueOfPFD() {
    var PFD = JSON.parse(localStorage.getItem('PFD'));

    if (!PFD) {
      return;
    }

    if (PFD.month >= 0 && PFD.month < 12) {
      fMonthEl.value = PFD.month
    }

    if (PFD.year) {
      fYearEl.value = PFD.year
    }

    if (PFD.day > 0 && PFD.day < 32) {
      fDayEl.value = PFD.day
    }
    _handleDateChange();
  }

})();
