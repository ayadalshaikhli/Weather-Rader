let searchBtn = $("#button-search");
let searchInput = $("#search-input");
let listUl = $(".city-list");
let cityList = $(".list-group-item");
let heroWeatherUV;
let storedCities = [];
let searchCity;
//--------------- get from local storage
function getStoredCities() {
    storedCities = JSON.parse(localStorage.getItem("Recent Cities"))
        if (storedCities !== null) {
            renderCities();
        } else {
            storedCities = [];
        }
}

//--------------- render Cities
function renderCities() {
    if ($(".list-group-item").length){
        $(".list-group-item").remove();
    }
    storedCities.forEach(element => {
        $("<li>").addClass("list-group-item").text(element).appendTo(listUl);
    });
}

$(".city-list").on("click", "li" , function(event){
    event.preventDefault();
    searchCity = $(this).text();
    
    fetchApis();
    $('html, body').animate({
        scrollTop: $("#weather-cards").offset().top
    }, 1);
})

//------------- Click Event
searchBtn.on("click", function(event){
    event.preventDefault();
    searchCity = searchInput.val();

    fetchApis();
    $('html, body').animate({
        scrollTop: $("#weather-cards").offset().top
    }, 1);

})

// ------------- fetch APIs
function fetchApis(){
    var apiLink = `https://api.openweathermap.org/data/2.5/weather?q=`
    var apiUnits = `&units=imperial&appid=f7472a802226858d322b00d97deeebb3` 
    var apiLink = apiLink + `${ searchCity }` + apiUnits
    console.log(apiLink);
    fetch( apiLink ).then( function( response ){
       if (response.status == 200) {
           response.json().then( function ( data ) {
//-------------------- Second Fetch  
           var uvApi = `https://api.openweathermap.org/data/2.5/onecall?lat=`
           var uvUnits = `&units=imperial&appid=f7472a802226858d322b00d97deeebb3`
           var lon = `&lon=`
           var uvApi = uvApi + `${ data.coord.lat }` + lon + `${ data.coord.lon }` + uvUnits
           console.log(uvApi);
           fetch(uvApi).then( function( response ){
           if (response.status == 200) {
               response.json().then( function (dataUv) {
                localStorage.setItem( "Recent Cities", JSON.stringify(storedCities ));
                
                displayInfo( data );
                renderCities();
                   heroWeatherUV = dataUv.current.uvi;
                   fiveDayForecastDisplay(dataUv);
                   //checking if our city name already exists in history -- rearrangin city names when clicked
                if  ( !storedCities.includes( searchCity.trim() ) ) {
                        storedCities.unshift( searchCity.trim() );
                } else {
                        if (storedCities.indexOf( searchCity.trim() ) > 0 ) {
                            storedCities.splice( storedCities.indexOf(searchCity.trim()) , 1 );
                            storedCities.unshift( searchCity.trim() );
                            }
                    }
                if ( storedCities.length >= 6 ){
                    storedCities.splice( 6 );
                    }
                    
               })
           }
           })
           .catch( function(){
            console.log( "Bad Request" );
       })
           })
       } else {
           searchInput.val( "" );
           alert( "Please enter valid city name" )
       }
   })
   .catch(function(){
       console.log( "Bad Request" )
   })
}

// ====================Day and night Background 
function checkDayTime() {
        var currentTime = moment().format('HH') ;
        dayCheck()
        function dayCheck() {
          if (15 <= currentTime) {
              $("#daynight").removeClass("is-active-night");
              $(".jumbotron").css("background-color", "rgb(31, 31, 31)")
              moonAnimation()
              console.log(currentTime);
          }else{
              
            $("#daynight").addClass("is-active-night");
          }


          if (15 >= currentTime){
          $("#daylight").removeClass("is-active-day");
          $(".jumbotron").css("background-color", "#00cbfe")

          
          sunAnimation()
          console.log("=+++");
          
          }else{
            $("#daylight").addClass("is-active-day");
          }
      };  
      
}

// ----------------------- Display Info for Today

function displayInfo(rawData) {
    searchInput.val("");
    if($(".weather-cards").length){
        $(".weather-cards").empty();
        $(".weather-cards").remove();
    }
    let weatherCards = $("<section>").addClass("weather-cards").attr("id", "weather-cards").appendTo(document.body);
    let cardDiv = $("<div>").addClass("card text-center main-card").appendTo(weatherCards);
    function checkWeatherDes() {
        if (rawData.weather[0].icon == "01d") {
            $("<img>").addClass("mountain-big").attr("src", "./assets/img/card-imgs/DAYMOUNTIN.png").appendTo(cardDiv)
            $("<img>").addClass("both-big").attr("src", "./assets/img/card-imgs/sun.png").appendTo(cardDiv)
            $("<img>").addClass("sky-big").attr("src", "./assets/img/card-imgs/DAYSKY.png").appendTo(cardDiv)
          }else{
            $("<img>").addClass("mountain-big").attr("src", "./assets/img/card-imgs/NIGHTMOUNTIN.png").appendTo(cardDiv)
            $("<img>").addClass("both-big").attr("src", "./assets/img/card-imgs/moon.png").appendTo(cardDiv)
            $("<img>").addClass("sky-big").attr("src", "./assets/img/card-imgs/NIGHTSKY.png").appendTo(cardDiv)
          }
    }
    checkWeatherDes()
    let animationText = $("<div>").addClass("animation-text-big").appendTo(cardDiv);
    let cardBody = $("<div>").addClass("card-body animation-big").appendTo(animationText);
    $("<div>").addClass("card-text").appendTo(cardBody).text(rawData.name + " " + rawData.sys.country);
    $("<div>").addClass("card-text").appendTo(cardBody).text(new Date().toLocaleDateString());
    $("<h5>").addClass("card-title").appendTo(cardBody).text(rawData.weather[0].description);
    let heroWeatherIcon = "http://openweathermap.org/img/wn/" + rawData.weather[0].icon + '.png';
    $("<img>").addClass("current-weather-image").attr("src", heroWeatherIcon).appendTo(cardBody);
    $("<div>").addClass("card-text").text("Temperature: " +  rawData.main.temp + ' \u00B0' + "F").appendTo(cardBody);
    $("<div>").addClass("card-text").text("Humidity: " + rawData.main.humidity).appendTo(cardBody);
    $("<div>").addClass("card-text").text("Wind Speed: " + rawData.wind.speed + " mph").appendTo(cardBody);
    $("<div>").addClass("card-text").text("UV Index: " + heroWeatherUV).appendTo(cardBody);

    cardAnimationBig()
}

// ----------------------- Display Info for next 5 days=
function fiveDayForecastDisplay( fiveDayData ) {
    let fiveDayForecast = [[],[],[],[],[]];
    console.log( "Five Day Data" , fiveDayData )
    let nextDay = new Date();
    if ($(".row").length){
        $(".row").empty();
        $(".row").remove();
    }
    let secoundSection = $("<section>").addClass("secound-Section").appendTo(document.body)
    let smallCardsContainer = $("<div>").addClass("container").appendTo(secoundSection);
    let smallCardsRow = $("<div>").addClass("row").appendTo(smallCardsContainer);
    $("<h1>").text("5 Day Forecast").appendTo(smallCardsRow);
   
    for (i=0; i<fiveDayForecast.length; i++){
            nextDay.setDate(nextDay.getDate() + 1);
            fiveDayForecast[i].push(nextDay.toLocaleDateString());
            fiveDayForecast[i].push(fiveDayData.daily[i].weather[0].icon);
            fiveDayForecast[i].push(Math.floor(fiveDayData.daily[i].temp.day));
            fiveDayForecast[i].push(fiveDayData.daily[i].humidity); 
            console.log(fiveDayData.hourly[0].weather[0].main);     
    }
    for (i=0; i < fiveDayForecast.length;i++){
            var cardBgPrimary = $("<div>").addClass("card text-center small-card col-sm-12 col-md-4 col-lg-2").appendTo(smallCardsRow);
            function checkWeatherdescription() {
                if(fiveDayForecast[i][1] == "01d"){
                    $("<img>").addClass("mountain").attr("src", "./assets/img/card-imgs/DAYMOUNTIN.png").appendTo(cardBgPrimary);
                    $("<img>").addClass("both").attr("src", "./assets/img/card-imgs/sun.png").appendTo(cardBgPrimary);
                    $("<img>").addClass("sky").attr("src", "./assets/img/card-imgs/DAYSKY.png").appendTo(cardBgPrimary);
                    
                }else{
                    $("<img>").addClass("mountain").attr("src", "./assets/img/card-imgs/NIGHTMOUNTIN.png").appendTo(cardBgPrimary);
                    $("<img>").addClass("both").attr("src", "./assets/img/card-imgs/moon.png").appendTo(cardBgPrimary);
                    $("<img>").addClass("sky").attr("src", "./assets/img/card-imgs/NIGHTSKY.png").appendTo(cardBgPrimary);
                   
                }
                
            }
            
            checkWeatherdescription()
            
            let smallAnimationText = $("<div>").addClass("animation-text").appendTo(cardBgPrimary);
            $("<div>").addClass("card-title").text(fiveDayForecast[i][0]).appendTo(smallAnimationText);
            let smallBodyCard = $("<div>").addClass("card-body").appendTo(smallAnimationText);

            $("<img>").attr("src", "http://openweathermap.org/img/wn/" + fiveDayForecast[i][1] + '.png').appendTo(smallBodyCard);
            
            $("<div>").text("Temperature: " + fiveDayForecast[i][2] + ' \u00B0' + "F").addClass("card-text temp").appendTo(smallBodyCard);
            $("<div>").text("Humidity: " + fiveDayForecast[i][3]).addClass("card-text").appendTo(smallBodyCard);
           
        } 
        addClickListener(fiveDayForecast)
        cardAnimation()
}


//-------------on click F to C conversion
function addClickListener(fiveDayForecast){
    let fahrenheit = true;
    $(".text-center").click(function(event) {
        let celsius = [];
        let y = 0;
        if(fahrenheit) {
            fahrenheit = false;
            for ( i=0; i< fiveDayForecast.length; i++ ) {
                celsius.push(Math.floor((fiveDayForecast[i][2]-32) * 5/9));  
            };
                $(".temp").each( function(){
                $(this).text("Temperature: " + celsius[y] + ' \u00B0' + "C")
                y++;
                 })
         } else {
             $(".temp").each( function(){
                 $(this).text("Temperature: " + fiveDayForecast[y][2] + ' \u00B0' + "F");
                 fahrenheit = true;
             })
            }
        })
}
getStoredCities();
// ---------- displays last searched city 
if (storedCities.length){
    fetchApis(searchCity=$( "li" ).first().text())
}


// =========
// Animation
// =========

const tm = TweenMax;
const tl = gsap.timeline({defaults: {ease: "power1.out"}})




// Moon Animation
function moonAnimation() {
    tl.from(".background-img-night-time-moon",3,{
        y: "-400",
        opacity: 0,
        ease: Expo.easeInOut,
    });
    
    tl.from(".background-img-night-time-trees",3,{
        y: "100",
        opacity: 0,
        ease: Expo.easeInOut,
    }, "-=3")
    
    tl.from(".background-img-night-time-stars",3,{
        opacity: 0,
        ease: Expo.easeInOut,
    }, "-=2.5")
    
    tl.from(".list-group",2,{
        y: "-40",
        opacity: 0,
        stagger: .25,
        delay: .5,
        scale: ".2",
        ease: Expo.easeInOut,
    }, "-=2.5")
    tl.from(".display-4 ",3,{
        x: "-100",
        opacity: 0,
        delay: .5,
        ease: Expo.easeInOut,
    }, "-=2.5")
}


// Sun Animation
function sunAnimation() {
    tl.from(".background-img-day-time-sun",3,{
        y: "-400",
        opacity: 0,
        ease: Expo.easeInOut,
    });

    tl.from(".background-img-day-time-daygreen",3,{
        y: "100",
        opacity: 0,
        ease: Expo.easeInOut,
    }, "-=3")
    
    tl.from(".background-img-day-time-cloud1",3,{
        x:'200',
        opacity: 0,
        ease: Expo.easeInOut,
    }, "-=2.5")
    
    tl.from(".background-img-day-time-cloud2",3,{
        x:'-200',
        opacity: 0,
        ease: Expo.easeInOut,
    }, "-=2.5")
    
    tl.from(".list-group",2,{
        y: "-40",
        opacity: 0,
        stagger: .25,
        delay: .5,
        scale: ".2",
        ease: Expo.easeInOut,
    }, "-=2.5")
    // tl.from(".display-4 ",3,{
    //     x: "-100",
    //     opacity: 0,
    //     delay: .5,
    //     ease: Expo.easeInOut,
    // }, "-=2.5")
}

function cardAnimation() {


    gsap.from(".mountain", {
        scrollTrigger:{
        trigger: ".sky",
        toggleActions: "restart none none none"
        } ,
        y:"250",
        delay: 2,
        duration: 2
    })
    gsap.from(".sky", {
        scrollTrigger:{
        trigger: ".sky",
        toggleActions: "restart none none none"
        } ,
        y:"250",
        delay: 2,
        duration: 2
    })
    gsap.from(".animation-text > div",{
        scrollTrigger:{
            delay: 4,
        trigger: ".sky",
        toggleActions: "restart none none none",
        },
        opacity: 0,
        stagger: .25,
        x:"150",

        duration: 2,
        
    },"-=5")
    gsap.from(".both", {
        scrollTrigger:{
        trigger: ".sky",
        toggleActions: "restart none none none"
        } ,
        y:"350",
        delay: 2,
        duration: 2
    })

    
}
function cardAnimationBig() {

    gsap.from(".mountain-big", {
        scrollTrigger:{
        trigger: ".mountain-big",
        toggleActions: "restart none none none"
        } ,
        y:"100",
        delay: 2,
        duration: 2
    })
    gsap.from(".sky-big", {
        scrollTrigger:{
        trigger: ".mountain-big",
        toggleActions: "restart none none none"
        } ,
        y:"150",
        delay: 2,
        duration: 2
    })
    gsap.from(".animation-text-big > div", {
        scrollTrigger:{
        trigger: ".mountain-big",
        toggleActions: "restart none none none",
        },
        opacity: 0,
        stagger: .25,
        x:"150",
        y:"150",
        delay: 4,
        duration: 2,
        
    },"-=5")
    gsap.from(".animation-big > div", {
        scrollTrigger:{
        trigger: ".mountain-big",
        toggleActions: "restart none none none",
        },
        opacity: 0,
        stagger: .25,
        x:"150",
        y:"150",
        delay: 4,
        duration: 2,
        
    },"-=5")
    gsap.from(".both-big", {
        scrollTrigger:{
        trigger: ".mountain-big",
        toggleActions: "restart none none none"
        } ,
        y:"350",
        delay: 2,
        duration: 2
    })

    
}

checkDayTime()

