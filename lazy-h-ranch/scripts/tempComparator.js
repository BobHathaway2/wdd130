let sensorData = {};
sensorData.greenhouseData = [];
sensorData.outdoorData = [];

async function getSensorData() {
    const outdoorUrl = 'https://run.mocky.io/v3/9bec2f3b-566b-49a3-9ea1-1ad92c0a3365';
    const greenhouseUrl = 'https://run.mocky.io/v3/7ec4c465-9729-4a2e-80e1-282543bac7cc';
    
    async function getSourceData(url) {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            return data;
        }

    }
    
    sensorData.greenhouseData = await getSourceData(greenhouseUrl);
    sensorData.outdoorData = await getSourceData(outdoorUrl);
    drawChart();
}

function getDateOfInterest() {
    let dateOfInterest = new Date(document.getElementById("start").value);
    dstSwitchDate = new Date("11/06/2022");
    if (dateOfInterest.getTime() >= dstSwitchDate.getTime()) {
        dateOfInterest.setHours(dateOfInterest.getHours() + 7);
    } else {
        dateOfInterest.setHours(dateOfInterest.getHours() + 6);
    };
    return dateOfInterest;
}

function filterDataByDate(dateOfInterest, arrayOfTempsAndTimes) {
    let entriesForDate = arrayOfTempsAndTimes.filter(function(entry){
        let timeOfEntry = new Date(entry.Time);
        let diffTime = (timeOfEntry - dateOfInterest);
        let diffTimeInHours = (diffTime / (1000 * 60 * 60)); 
        return (diffTimeInHours >= 0 && diffTimeInHours < 24);
    });
    return entriesForDate;
}


function calculateAverageTemperaturesByHour(arrayOfTempsAndTimes) {
    let y = [];
    let i = 0;
    let sum = 0;
    let count = 0;
    arrayOfTempsAndTimes.forEach((entry) => {
        const hours = new Date(entry.Time).getHours();
        if (hours == i) {
            sum += entry.Temperature;
            count++;
        } else {
            let average = sum / count;
            y.push(average);
            i++;
            count = 0;
            sum = 0;
        }
    })
    let average = sum / count;
    y.push(average);
    return y;
}

function getLineOfData(dateOfInterest, arrayOfData) {
    return calculateAverageTemperaturesByHour(filterDataByDate(dateOfInterest, arrayOfData));
}


function drawChart(){
    let dateOfInterest = getDateOfInterest();
    let outdoorLinePoints = getLineOfData(dateOfInterest, sensorData.outdoorData);
    let greenhouseLinePoints = getLineOfData(dateOfInterest, sensorData.greenhouseData);;
        new Chart("myChart", {
            type: "line",
            data: {
              labels: [...Array(24).keys()],
              datasets: [{
                data: outdoorLinePoints,
                borderColor: "blue",
                label: "Outdoor Temp (°F)",
                fill: false
              },{
                data: greenhouseLinePoints,
                borderColor: "green",
                label: "Greenhouse Temp (°F)",
                fill: false
              }]
            },
            options: {
                scales: {
                    yAxes: [{
                      scaleLabel: {
                        display: true,
                        labelString: '°F'
                      }
                    }],
                    xAxes: [{
                        scaleLabel: {
                          display: true,
                          labelString: 'hour of day'
                        }
                      }]
                } 
            }
        })
}
getSensorData();
document.querySelector("#start").addEventListener("change", drawChart);
