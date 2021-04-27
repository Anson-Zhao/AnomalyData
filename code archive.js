var http = require('http'),
    fs = require('fs'),
    mysql = require('mysql'),
    express = require('express'),
    app = express();

//connect to mySQL

var con = mysql.createConnection({
    host: "10.11.90.16",
    port: "3306",
    user: "AppUser",
    password: "Special888%",
    schema: "ESP2",
    table: "anomalies"
});
// con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
// });
app.get('/abc', function (req, res) {
    var cool = req.query;
    console.log(cool.date);
    con.query("SELECT MAX(ID) FROM ESP2.anomalies", function (err, result) {
        var ID = JSON.stringify(result)
        console.log(ID);

        if (ID == '[{"MAX(ID)":null}]') {
            ID = '1'
        } else {
            ID = parseInt(ID.replace('[{"MAX(ID)":', '')) + 1
        }

        con.query("INSERT INTO ESP2.anomalies (ID, Date, StartTime, EndTime, GapValue, Station, TruePositive) VALUES ('" + ID + "', '" + cool.date + "', '" + cool.startTime + "', '" + cool.endTime + "', '" + cool.spikeSize + "', '" + cool.station + "', '" + cool.truePositive + "');", function (err, result) {
            if (err) throw err;
            res.send("pwn'd");
        });
    });
})

app.get('/defg', function (req, res) {
    var neat = req.query;
    var modified = false
    console.log(neat.date);
    var variables = [neat.date, neat.startTime, neat.endTime, neat.spikeSize, neat.station, neat.truePositive, neat.eventDate, neat.eventTime, neat.eventLocation, neat.eventLat, neat.eventLong, neat.url],
        columns = ["Date", "StartTime", "EndTime", "GapValue", "Station", "TruePositive", "EventDate", "EventTime", "EventLocation", "EventLat", "EventLong", "EventURL",],
        i = 0,
        querySet = "";

    console.log(variables);

    while (i < variables.length) {
        if (variables[i] !== "") {
            if (modified === false) {
                querySet = "UPDATE ESP2.anomalies SET "
                modified = true
            }
            querySet += columns[i] + " = '" + variables[i] + "', ";
        }

        i++;
    }

    if (modified === true) {
        querySet += "WHERE ID = '" + neat.id + "';";
        querySet = querySet.replace(', WHERE',' WHERE');
    }

    console.log(querySet);

    if (modified === true) {
        con.query(querySet, function (err, result) {
            if (err) throw err;
            console.log("ok");
            res.send("amongst");
        });
    } else {
        res.send("amongst");
    }
})
app.listen(3008);