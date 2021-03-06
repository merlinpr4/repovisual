//contains the code for displaying the graphs using the data stored in the csv files
d3.csv("commits.csv").then(makeChart);

var div = document.getElementById("user_info");
div.innerHTML += '';

avg = 0 
topLang = ""
freqTopLang = 0

//Displays the users stats
d3.csv("user_info.csv", function(data) {
  
  div.innerHTML += "Username: ".bold() + data.Username  + "<br />" 
  div.innerHTML += "Name: ".bold() + data.Name  + "<br />" 
  div.innerHTML += "Public Repositories: ".bold() + data.Repos  + "<br />" 

  div.innerHTML += "Followers: ".bold() + data.Followers + "<br />" 
  div.innerHTML += "Followings: ".bold() + data.Following + "<br />" 
  div.innerHTML += "Location: ".bold() + data.Location + "<br />" 

  div.innerHTML += "Most used top language: ".bold() + topLang +  "<br />" + "  (top language of " + freqTopLang + " repos )" + "<br/>" 

  const img = document.getElementById("profile_pic");
  img.src = data.PP
});


//converting the csv values into a format for the charts to use
function makeChart(repos) {
  var reposLabels = repos.map(function (d) {
    return d.Repo;
  });
  var commitsData = repos.map(function (d) {
    return d.Commits;
  });

  var sizeData =  repos.map(function (d) {
    return d.Size;
  });

  var contributors =  repos.map(function (d) {
    return d.Contributors;
  });

  var daysData = repos.map(function(d){
    return d.Days;
  });

  var descriptions = repos.map(function (d){
    return d.Descriptions;
  });

 //get the average commits  
  let sum = 0;
  for(let i = 0 ; i < commitsData.length ; i ++) {
    sum += Number(commitsData[i]);
  }

  avg = sum/commitsData.length;
  avg = parseFloat(avg).toFixed(2)
  const horizontalLine = commitsData.map(x => avg);

  
  var languages = repos.map(function (d) {
    return d.Language;
  });

  //count freq of top language used
  var languagefreq = {};
  languages.forEach(function (x) { languagefreq[x] = (languagefreq[x] || 0) + 1; });
  var lang = [];
  var freq = [];
 
    for(x in languagefreq)
    {
      if (x != "N/A"){
      lang.push(x);
      freq.push(languagefreq[x])
      
      if (freqTopLang < languagefreq[x]){
        freqTopLang = languagefreq[x]
        topLang = x
      }
     }
    }

    Chart.defaults.global.defaultFontColor = 'black';
    

  //functions to load the graphs
  commitsChart(reposLabels,commitsData,avg,horizontalLine,sum,sizeData,contributors,languages,daysData)
  commitsVsSizeChart(reposLabels,commitsData,sizeData)
  languageChart(lang,freq)
  daysChart(reposLabels,daysData,commitsData)
}

//creates barchart of total commits per repo with extra info such as size,languages,contributors ,days and percentage of commits it accounts for
//creates a horizontal line with the average of the commits aswell
function commitsChart(reposLabels,commitsData,avg,horizontalLine,sum,sizeData,contributors,languages,daysData){

  //creates the barchart colour gradient
  var bar_ctx = document.getElementById('totalCommits').getContext('2d')
  var colours = bar_ctx.createLinearGradient(0, 0, 0, 600);
  colours.addColorStop(0, "#E975A8");
  colours.addColorStop(1, "#726CF8");

var chart = new Chart("totalCommits", {
  type: "bar",
  data: {
    labels: reposLabels,
    datasets: [ {
        label: "commits",
        backgroundColor:  colours,
        data: commitsData,
        order:1 , 
        borderWidth: 1
      },
     {
        label: "average commits: " + avg,
        borderColor: "#80b6f4",
        data: horizontalLine , 
        borderDash : [5,5 ],
        pointRadius : 0 ,
        fill: false ,
        borderWidth: 3,
        type: "line",
        order:0
      }
    ]
  },
    options: {
      responsive : true,
      maintainAspectRatio: true,
      legend: {
         position: 'top',
         display:  true 
      },
      plugins: {
        deferred: {
          yOffset: '75%'
        }
    },
      title: {
        display: true,  
        text: "Total commits per repository"
      },
      scales: {
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Total commits",
              fontSize: 16
            }
          }
        ]
      },      
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            let line1 = "Total commits: " + Number(tooltipItem.yLabel)  ;
            return line1 ;
           
          },
          afterLabel: function(tooltipItem, data) {
            var numerator = commitsData[tooltipItem.index]
            var denominator =  sum ;
            var percent = Math.round((numerator/denominator) * 100)
            console.log(numerator)
            let line2 =  "Percentage: " + percent + "%";
            let line3 = "Size in KB: " + sizeData[tooltipItem.index]; 
            let line4 = "Contributors: " + contributors[tooltipItem.index];
            let line5 =  "Language: " + languages[tooltipItem.index] ;
            let line6 = "Days spend: " + daysData[tooltipItem.index];
            return  [line2 ,line3,line4,line5,line6];
           
          }
        }
      }
    }
});
}

//randomize colours for the piechart
function getColors(length){
  let pallet = [ "#7777ff",  "#7FDBFF","#ffff80" ,"#FFBFD3",  "#3D9970", "#ff726f", "#42f5bf", "#0074D9","#39CCCC", "#4ee44e","#01FF70", "#85144b", "#F012BE", "#AAAAAA"];
  let colors = [];

  for(let i = 0; i < length; i++) {
    colors.push(pallet[i % (pallet.length - 1)]);
  }

  return colors;
}

//doughtnut chart of top language in users repos
function languageChart(lang,freq){
var chart3 = new Chart("primaryLanguageFrequency", {
  type: 'doughnut',
  data: {
    labels: lang,
    datasets: [
      {
        label: "repos",
        backgroundColor: getColors(freq.length),
        data: freq
      }
    ]
  },
  options: {
    tooltips: {
      callbacks: {
      label: function(tooltipItem, data) {
        var lang = data.labels[tooltipItem.index];
         return lang  ;
        },
        afterLabel: function(tooltipItem, data) {
        var dataset = data.datasets[tooltipItem.datasetIndex];
        var meta = dataset._meta[Object.keys(dataset._meta)[0]];
        var total = meta.total;
        var currentValue = dataset.data[tooltipItem.index];
        var percentage = parseFloat((currentValue/total*100).toFixed(2));
        let line2 = currentValue + " " +  data.datasets[tooltipItem.datasetIndex].label 
        let line3 =   ' (' + percentage + '%)'
          return [line2,line3];
        }
      }
   },
    title: {
      display: true,
      text: 'Top repository languages'
    }
  }
});
}

//linegraph of commits versus size in KB of all repos
function commitsVsSizeChart(reposLabels,commitsData,sizeData){
  var chart2 = new Chart("twoLineGraph", {
    type: "line",
    data: {
      labels: reposLabels,
      datasets: [{
        label: "commits",
        labelString: "Total Commits",
        yAxisID: "commits",
        data: commitsData,
        borderColor: "#ff69b4",
        fill: false
      },
        {
          label: "size",
          labelString: "Total Size(KB)",
          yAxisID: "size",
          data: sizeData,
          borderColor: "#00FFFF",
          fill: false
      }]
    },
    options: {
      legend: {
        display: true
      },
      scales: {
        yAxes: [{
          gridLines: {
            display:false
          },
          id: 'commits',
          labelString: "commits",
          type: 'linear',
          position: 'left',
           scaleLabel: {
            display: true,
            labelString: "Total Commits",
            fontSize: 16
          }
        },
        {
          id: 'size',
          type: 'linear',
          position: 'right',
          scaleLabel: {
            display: true,
            labelString: "Total Size",
            fontSize: 16
          }
        
        }]
      },
      title: {
        display: true,
        text: 'Total Commits vs Total Size'
    },
    plugins: {
      deferred: {
        yOffset: '60%'
      }
    }
  }
  });
}

//days Chart compares the number of days spend on repo from when repo was created to last push vs total commits
function daysChart(reposLabels,daysData,commitsData ){

  var bar_ctx = document.getElementById('daysSpend').getContext('2d')
  var colours1 = bar_ctx.createLinearGradient(0, 0, 0, 600);
  colours1.addColorStop(0, "#55D284");
  colours1.addColorStop(1, "#F2CF07");

  var colours2 = bar_ctx.createLinearGradient(0, 0, 0, 600);
  colours2.addColorStop(0, "#EB6B9D");
  colours2.addColorStop(1, "#EE8C68");


var chart3 = new Chart("daysSpend", {
  type: 'bar',
  data: {
    labels: reposLabels,
    datasets: [
      {
        label: "commits",
        backgroundColor: colours2,
        data: commitsData 
      },  
    {
      label: "days",
      backgroundColor: colours1,
      data: daysData
    },
  
  ]
  },
  options: {
    title: {
      display: true,
      text: 'Total Commits vs Days Spend '
    },
    plugins: {
      deferred: {
        yOffset: '65%'
      }
  }
 }
});
}