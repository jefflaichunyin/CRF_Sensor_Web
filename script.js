

//can be used to reconnect on connection lost
function onConnectionLost(responseObject) {
    console.log("connection lost: " + responseObject.errorMessage);
    //window.setTimeout(location.reload(),20000); //wait 20seconds before trying to connect again.
};

function perc2color(perc,min,max) {
            var base = (max - min);

            if (base == 0) { perc = 100; }
            else {
                perc = (perc - min) / base * 100; 
            }
            var r, g, b = 0;
            if (perc < 50) {
                r = 255;
                g = Math.round(5.1 * perc);
            }
            else {
                g = 255;
                r = Math.round(510 - 5.10 * perc);
            }
            var h = r * 0x10000 + g * 0x100 + b * 0x1;
            return '#' + ('000000' + h.toString(16)).slice(-6);
}


//what is done when a message arrives from the broker
function onMessageArrived(message) {

    var mapping = [2, 8, 14, 20, 4, 10, 16, 0, 6, 12, 18];
    var overlay = document.getElementById('overlay');
   
    try {
      console.log(message.payloadString);
      const msg = JSON.parse(message.payloadString);
      var sensor_id = msg["id"];
      var co2 = msg["co2"];
      var div_id = mapping.indexOf(sensor_id);
      // console.log(sensor_id, co2, div_id);
      overlay.children[mapping.indexOf(sensor_id)].children[0].textContent = co2;
      for(i=0; i<overlay.children.length; i++) {
        var co2 = parseInt(overlay.children[i].children[0].textContent);
        if(!isNaN(co2)) {
          overlay.children[i].style.backgroundColor = perc2color(co2, 1500, 400);
        }
      }
      // overlay.children.forEach(element => {
      //   var co2 = parseInt(element.children[0].textContent);
      //   element.style.backgroundColor = perc2color(co2, 400, 2000);
      // });
    } catch (e) {
      console.error(e);
    }

}

function on_body_loaded() {


    var MQTTbroker = 'jefflai.tpddns.cn';
    var MQTTport = 8080;
    var MQTTsubTopic = 'crf_esp_sensor/#'; //works with wildcard # and + topics dynamically now

    var client = new Paho.MQTT.Client(MQTTbroker, MQTTport,
        "myclientid_" + parseInt(Math.random() * 100, 10));

    client.onMessageArrived = onMessageArrived;
    client.onConnectionLost = onConnectionLost;

    var options = {
        timeout: 3,
        onSuccess: function () {
          console.log("mqtt connected");
          // Connection succeeded; subscribe to our topics
          client.subscribe(MQTTsubTopic, {qos: 1});
        },
        onFailure: function (message) {
          console.log("Connection failed, ERROR: " + message.errorMessage);
          //window.setTimeout(location.reload(),20000); //wait 20seconds before trying to connect again.
        }
      };
    
    client.connect(options);
    console.log("on body loaded");
}

