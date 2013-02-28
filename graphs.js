#!/usr/bin/env phantomjs
var system = require('system');
var page = require('webpage').create();
var fs = require('fs');

page.injectJs("./js/jquery-1.9.1.min.js") || ( console.log("Unable to load jQuery") && phantom.exit());
page.injectJs("./js/highcharts.js") || ( console.log("Unable to load Highcharts") && phantom.exit());
page.injectJs("./js/modules/exporting.js") || (console.log("Unable to load Highcharts") && phantom.exit());

page.onConsoleMessage = function (msg) {
    console.log(msg);
};

phantom.injectJs(system.args[1]) || (console.log("Unable to load json file") && phantom.exit());

var width = 800, height = 400;
if (system.args.length == 4) {
    width = parseInt(system.args[2], 10);
    height = parseInt(system.args[3], 10);
}

console.log("Loaded result file");


var graphit = function(config) {
  if ( $("#container").length == 0 ){
    $('body').append('<div id="container"></div>');
  }
  console.log(config.series);
  var chart = new Highcharts.Chart({
         chart: {
               renderTo: 'container',
               animations: false,
               width: config.width,
               height: config.height,
               type: 'column'
         },
         exporting: {
               enabled: false,
         },
         series: config.series,
         title: {
               text: "allegro cloud " + config.title
         },
         credits: {
               enabled: false
         },
         plotOptions: {
               series: {
                   pointStart: 1
                }
         }
   });
  return chart.getSVG();
}

keys = ["read.iops", "write.iops", "read.bw", "write.bw"];

/* Here we generate the config to the graph function */
for(idx in keys){
  key = keys[idx];
  series = [];

  for( name in tests) {
    series.push({
      name: key + " - " + name,
      data: [tests[name][key]]
    });
  }
  /* this is the final form of the config*/
  config = {
    width: width,
    height: height,
    series: series,
    title: key
  }
  svg = page.evaluate(graphit, config);
  file_name = "/tmp/"+key+".svg";
  fs.isFile(file_name) && fs.remove(file_name);
  console.log("Saved SVG to file");
  fs.write(file_name, svg);
  console.log("Wirted " + file_name)
}


phantom.exit();
