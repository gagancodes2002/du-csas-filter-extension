function getCollegeAndProgrammeList() {
  let collegeList = [];
  let tableBody = document.querySelector("table tbody");

  for (let tableRow of Array.from(tableBody.children)) {
    let programmeName = tableRow.querySelector("td:nth-child(1) b").innerText;
    let collegeName = tableRow.querySelector("td:nth-child(2) b").innerText;

    collegeList.push({
      college: collegeName,
      programme: programmeName,
      element: tableRow,
    });
  }
  return collegeList;
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: getCollegeAndProgrammeList,
      },
      (results) => {
        const data = results[0].result;
        const colleges = [...new Set(data.map((item) => item.college))];
        const programmes = data.reduce((acc, item) => {
          acc[item.college] = acc[item.college] || [];
          if (!acc[item.college].includes(item.programme)) {
            acc[item.college].push(item.programme);
          }
          return acc;
        }, {});

        autocomplete(document.getElementById("collegeName"), colleges, () => {
          const selectedCollege = document.getElementById("collegeName").value;
          const programmeInput = document.getElementById("programmeName");
          if (programmes[selectedCollege]) {
            programmeInput.disabled = false;
            autocomplete(programmeInput, programmes[selectedCollege]);
          } else {
            programmeInput.disabled = true;
            autocomplete(programmeInput, []);
          }
        });

        autocomplete(document.getElementById("programmeName"), [], null);
      }
    );
  });
});

document.getElementById("submit").addEventListener("click", () => {
  const collegeName = document.getElementById("collegeName").value;
  const programmeName = document.getElementById("programmeName").value;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: filterAndHighlight,
      args: [collegeName, programmeName],
    });
  });
});

function autocomplete(inp, arr, onChange) {
  let currentFocus;
  inp.addEventListener("input", function (e) {
    let a,
      b,
      i,
      val = this.value;
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(a);
    for (i = 0; i < arr.length; i++) {
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        b = document.createElement("DIV");
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        b.innerHTML += '<input type="hidden" value="' + arr[i] + '">';
        b.addEventListener("click", function (e) {
          inp.value = this.getElementsByTagName("input")[0].value;
          closeAllLists();
          if (onChange) onChange();
        });
        a.appendChild(b);
      }
    }
  });
  inp.addEventListener("keydown", function (e) {
    let x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      currentFocus++;
      addActive(x);
    } else if (e.keyCode == 38) {
      currentFocus--;
      addActive(x);
    } else if (e.keyCode == 13) {
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) x[currentFocus].click();
      }
    }
  });

  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    x[currentFocus].classList.add("autocomplete-active");
  }

  function removeActive(x) {
    for (let i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  function closeAllLists(elmnt) {
    const x = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

function filterAndHighlight(collegeSearchQuery, programmeSearchQuery) {
  let collegeList = [];
  let tableBody = document.querySelector("table tbody");

  for (let tableRow of Array.from(tableBody.children)) {
    let programmeName = tableRow.querySelector("td:nth-child(1) b").innerText;
    let collegeName = tableRow.querySelector("td:nth-child(2) b").innerText;

    collegeList.push({
      college: collegeName,
      programme: programmeName,
      element: tableRow,
    });
  }

  let result = collegeList.find((data) => {
    return (
      data.college.includes(collegeSearchQuery) &&
      data.programme.includes(programmeSearchQuery)
    );
  });

  // Remove highlight from all rows
  collegeList.forEach((data) => {
    data.element.style.backgroundColor = "";
  });

  if (result) {
    result.element.scrollIntoView({ block: "center" });
    setTimeout(() => {
      result.element.style.backgroundColor = "yellow";
    }, 500); // Delay the highlight to ensure scroll into view
  }
}
