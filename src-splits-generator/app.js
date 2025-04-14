const textarea = document.getElementById("markdown");
const preview = document.getElementById("preview");

populateSrc(
  `## Load a splits file to generate timestamps
  \nYou can copy the source and paste it under your speedrun.com run description.`
);

function handleCopyLocation() {
  navigator.clipboard.writeText(textarea.value);
  document.getElementById("copy-tooltip").style.visibility = "visible";
  setTimeout(() => {
    document.getElementById("copy-tooltip").style.visibility = "hidden";
  }, 1000);
}

function populateSrc(value) {
  textarea.value = value;
  populatePreview(value);
}

function populatePreview(value) {
  preview.innerHTML = marked.parse(value.replaceAll(" ", "&#8193;"));
}

function onloadSplitsFile(e) {
  var file = e.target.files[0];
  if (file) {
    readFile(file);
  }
}

function onChangeSettings() {
  var file = document.getElementById("fileInput").files[0];
  if (file) {
    readFile(file);
  }
}

function readFile(file) {
  let reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = function (evt) {
    parseXML(evt.target.result);
  };
  reader.onerror = function (evt) {
    populateSrc("error reading file");
  };
}

function parseStime(stime) {
  const [hh, mm, ssFraction] = stime.split(":");
  return (
    parseInt(hh) * 3600000 +
    parseInt(mm) * 60000 +
    parseFloat(ssFraction) * 1000
  );
}

function formatMilliseconds(ms, decimals) {
  const factor = 10 ** decimals;
  const rounded = Math.round(ms * factor) / factor;

  let totalSeconds = Math.floor(rounded / 1000);
  let fractional = Math.round((rounded % 1000) * factor / 1000);

  if (fractional === factor) {
    totalSeconds += 1;
    fractional = 0;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n, len = 2) => n.toString().padStart(len, "0");

  let time =
    hours > 0
      ? `${hours}:${pad(minutes)}:${pad(seconds)}`
      : minutes > 0
        ? `${minutes}:${pad(seconds)}`
        : `${seconds}`;

  if (decimals > 0) {
    time += `.${fractional.toString().padStart(decimals, "0")}`;
  }

  return time;
}

function parseXML(xmlString) {
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(xmlString, "text/xml");

  const spaceValue = parseInt(document.getElementById("spacing").value);
  const decimals = parseInt(document.getElementById("decimals").value);
  const timingMethod = document.getElementById("timing-method").value;

  let result = "";
  let count = 1;
  let prevTime = 0;
  result += "## [Time Splits](https://gmpranav.github.io/src-splits-generator/)\n\n";
  const spaceStr = " ".repeat(spaceValue);
  result += `| **#** | | **Name** | ${spaceStr}| **Finished At** | ${spaceStr}| **Split** |\n`;
  result += "|---|---|---|---|:---:|---|:---:|\n";

  xmlDoc.querySelectorAll("Run Segments Segment").forEach((segment) => {
    const splitName = segment
      .querySelector("Name")
      .textContent.split("}")
      .pop()
      .replace(/^(\s|-)+/, "");
    const realTime = segment.querySelector(
      `SplitTimes SplitTime[name="Personal Best"] ${timingMethod}`
    )?.textContent;

    if (realTime) {
      const parsedTime = parseStime(realTime);
      const splitTime = parsedTime - prevTime;

      result += `| ${count} || ${splitName} || ${formatMilliseconds(parsedTime, decimals)} || ${formatMilliseconds(splitTime, decimals)} |\n`;
      prevTime = parsedTime;
    }
    else {
      result += `| ${count} || ${splitName} || - || - |\n`;
      prevTime = "-";
    }
    count++;
  });

  populateSrc(result);
}