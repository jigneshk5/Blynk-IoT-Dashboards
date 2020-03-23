var ctx = document.getElementById('myChart').getContext('2d');

$(function(){  

    $('#green').change(function(){
        if($(this).prop('checked')){
            console.log("Green checked");
            $.get("http://192.168.1.42:8080/mNjgEPGW5OtJB0SAuUgZLgsG9LI8Cbyk/update/V0?value=1",function(data, status){
                console.log("On Status: " + status);
              });
        }else{
            console.log("Unchecked");
            $.get("http://192.168.1.42:8080/mNjgEPGW5OtJB0SAuUgZLgsG9LI8Cbyk/update/V0?value=0",function(data, status){
                console.log("Off Status: " + status);
              });
        }
    });
    $('#red').change(function(){
        if($(this).prop('checked')){
            console.log("RED checked");
            $.get("http://192.168.1.42:8080/mNjgEPGW5OtJB0SAuUgZLgsG9LI8Cbyk/update/V1?value=1",function(data, status){
                console.log("On Status: " + status);
              });
        }else{
            console.log("Unchecked");
            $.get("http://192.168.1.42:8080/mNjgEPGW5OtJB0SAuUgZLgsG9LI8Cbyk/update/V1?value=0",function(data, status){
                console.log("Off Status: " + status);
              });
        }
    });
    $('#slider').change(function(){
        $("#sliderval").html( $(this).val());

        $.get("http://192.168.1.42:8080/mNjgEPGW5OtJB0SAuUgZLgsG9LI8Cbyk/update/V2?value="+$(this).val(),function(data, status){
                console.log("Slider Status: " + status);
              });
    });
 
    Promise.all([ajax1(), ajax2(),ajax3()]).then((data) =>{ // 
        //console.log(data);
        if(data[0][0]=='1' && $('#green').prop('checked')==false){
            $('#green').click();
        }
        if(data[1][0]=='1' && $('#red').prop('checked')==false){
            $('#red').click();
        }

        //Initilize the Slider
        $("#sliderval").html( data[2][0]);
        $('#slider').val(data[2][0]);


      }).catch((err) => {
        alert('Dashboard not inilized with'+err)
      })    

      //REAL TIME DATA STREAM ON CHART AND GAUGE
      var data={
        labels: [],
        datasets: [{
            label: 'Distance',
            fill: false,
            borderColor: '#0eb33a', // Add custom color border (Line)
            backgroundColor: '#0eb33a', // Add custom color background (Points and Fill)
            borderWidth: 1 // Specify bar border width
        }]
    }
    var chart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
        responsive: true, // Instruct chart js to respond nicely.
        maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height 
    }
    });
    let dp=[];
    let label=[];
    let i=0;
      setInterval(function(){            // CUSTOM LISTENER or SUBSCRIBER
        Promise.all([ajax4(), ajax5()]).then((val) =>{ // 
        // This will be called anytime there is a new ldr or dist valueson V3 or V4
            if(val[0][0]){
                document.getElementById('canvas').setAttribute("data-value", val[0][0]);
            }
            if(val[1][0]){
                label.push(new Date().toLocaleString().split(',')[1]);
                dp.push(val[1][0]);
                i = dp.length;
                if(i>5){
                    dp.shift();
                    label.shift();
                    i--;
                }
                data.labels = label;
                data.datasets[0].data=dp;
                //console.log(dp);
                chart.update();  
            }
        });
    },8000);

    // });

    function ajax1() {
        return $.ajax({
          url: "http://192.168.1.42:8080/mNjgEPGW5OtJB0SAuUgZLgsG9LI8Cbyk/get/V0", 
          dataType: 'json',    
          success: function(res) {
            console.log("Got response for ajax1"+ res);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log( 'Could not get data, server response: ' + textStatus + ': ' + errorThrown );
            }
        });
      }
      function ajax2() {
        return $.ajax({
          url: "http://192.168.1.42:8080/mNjgEPGW5OtJB0SAuUgZLgsG9LI8Cbyk/get/V1", 
          dataType: 'json',    
          success: function(res) {
            console.log("Got response for ajax2"+ res);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log( 'Could not get data, server response: ' + textStatus + ': ' + errorThrown );
            }
        });
      }
      function ajax3() {
        return $.ajax({
          url: "http://192.168.1.42:8080/mNjgEPGW5OtJB0SAuUgZLgsG9LI8Cbyk/get/V2", 
          dataType: 'json',    
          success: function(res) {
            console.log("Got response for ajax3"+ res);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log( 'Could not get data, server response: ' + textStatus + ': ' + errorThrown );
            }
        });
      }
      function ajax4() {
        return $.ajax({
          url: "http://192.168.1.42:8080/mNjgEPGW5OtJB0SAuUgZLgsG9LI8Cbyk/get/V3", 
          dataType: 'json',    
          success: function(res) {
            console.log("Got response for ajax4"+ res);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log( 'Could not get data, server response: ' + textStatus + ': ' + errorThrown );
            }
        });
      }
      function ajax5() {
        return $.ajax({
          url: "http://192.168.1.42:8080/mNjgEPGW5OtJB0SAuUgZLgsG9LI8Cbyk/get/V4", 
          dataType: 'json',    
          success: function(res) {
            console.log("Got response for ajax5"+ res);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log( 'Could not get data, server response: ' + textStatus + ': ' + errorThrown );
            }
        });
      }
});