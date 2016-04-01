var jsdom = require("jsdom");
var chalk = require('chalk');
var fs = require('fs');
var request = require('request');
var async = require('async');
var path = require('path');
var moment = require('moment');

var url = 'http://cdn.serieswatch.tv/2/House%20MD/';

jsdom.env({
  url: "http://cdn.serieswatch.tv/2/House%20MD/",
  scripts: ["http://code.jquery.com/jquery.js"],
  done: function (err, window) {

    console.log('URL Reading Completed');

    if(err)
      console.log(err);

    else {
      var $ = window.$;

      console.log('No error while reading DOM');
      console.log('Starting File Download...');

      var total_files = $('a').length;

      console.log(chalk.green('Total Files to be downloaded : ' + total_files));

      for(var i = 1; i < 15; i++)
      {
        (function (i) {
          var element = $('a:eq(' + i + ')');
          var file_name = element.text();
          var server_path = element.attr('href');
          var absolute_file_path = path.join(__dirname, 'Downloads', file_name);
          var season_name = file_name.substr(file_name.indexOf('S'), 6);
          console.log('i : ' + i);
          console.log(file_name);

          if(file_name.indexOf('480') != '-1')
            console.log(chalk.green(season_name + chalk.blue('  480p file found...') + '  Skipped from downloading...'));

          else if(file_name.indexOf('Night') != '-1')
            console.log(chalk.green(season_name + chalk.blue('  File repeated...') + '  Skipped from downloading...'));

          else if(server_path.indexOf('Night') != '-1')
            console.log(chalk.green(season_name + chalk.blue('  File repeated...') + '  Skipped from downloading...'));

          else {
            console.log(chalk.green(season_name + chalk.yellow('  Queued for downloading...')));

            var file_url = encodeURI(element.attr('href'));
            var total_file_size, start_time, end_time;

            var stream = fs.createWriteStream(absolute_file_path);
            request(url + file_url).pipe(stream);

            start_time = moment(new Date());

            fs.watchFile(absolute_file_path, function () {
              fs.stat(absolute_file_path, function (err, stats) {
                if(err) {
                  console.log('Error while watching file.');
                  console.log(err);
                }

                else {
                  var _size = stats.size;
                  var size = _size + ' bytes';

                  if(_size > 1024)
                  {
                    _size = _size / 1024;
                    size = (_size.toFixed(2) + ' KB');
                  }

                  if(_size > 1024)
                  {
                    _size = _size / 1024;
                    size = (_size.toFixed(2) + ' MB');
                  }

                  if(_size > 1024)
                  {
                    _size = _size / 1024;
                    size = (_size.toFixed(2) + ' GB');
                  }

                  console.log(season_name + '  ' + chalk.yellow(size) + '  downloaded.');
                }
              });
            });

            stream.on('finish', function () {
              end_time = moment(new Date());

              console.log(chalk.blue(season_name + ' Downloaded in ' + end_time.diff(start_time, 'seconds') + ' seconds'));
            });

            stream.on('error', function (err) {
              console.log('Error in stream');
              console.log(err);
            });
          }
        }(i));
      }
    }
  }
});
