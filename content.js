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

window.getCollegeAndProgrammeList = getCollegeAndProgrammeList;
