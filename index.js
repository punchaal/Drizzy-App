'use strict'


function getDrinksName(searchTerm){
    const cocktailDbURL = "https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=" + searchTerm
    console.log(cocktailDbURL)
    fetch(cocktailDbURL)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error("response.statusText");
    })
    .then(responseJson => displayResults(responseJson))
    .catch(error => {
        $("#js-error-message").text(`Seems like you mistyped the name of the alcohol. Try again with a different name?`);
        $("#js-error-message").removeClass("hidden")
    });
}

//Format parameters to encode and join as per youtube API request needs
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

//check for user input to figure out what base alcohol to use for displaying cocktail recipes
function watchForm(){
    $('form').submit(event=>{
        event.preventDefault();
        hideForm();
        changeBackground();
        searchAgain();
        toggleButton();
        const searchTerm = $("#js-search-term").val();
        getDrinksName(searchTerm);
    });
}

function toggleButton(){
    $("#js-search-again").addClass("search-button");
}

function displayResults(responseJson){
    console.log(responseJson)
    for(let i=0; i<responseJson.drinks.length; i++){
        const searchCocktailName = `${(responseJson.drinks[i].idDrink)}`
        const cocktailName=`${responseJson.drinks[i].strDrink}+" cocktail drink"`
        $("#results-list").append(`<li class="cards" id = "${searchCocktailName}"><img src="${responseJson.drinks[i].strDrinkThumb}" class="thumbnail" alt="${responseJson.drinks[i].strDrink}"/>
        <div class="title"><h3 >${responseJson.drinks[i].strDrink}</h3><small> View Recipe </small></div>
        <a href="#" class="recipe"><i class="fas fa-cocktail"></i></a></li>`)

//On clicking the cocktail card, fetch the recipe as well as video associated with it
        $("#results-list").on("click","#"+searchCocktailName,function(){
            const maxResults=5;
            fetchDrinksRecipe(searchCocktailName)
            fetchYoutubeVids(cocktailName,maxResults)
        });
    }
}


function fetchYoutubeVids(query,maxResults=5){
    const apiKey = 'AIzaSyAgx-_PPWqFOzD8uiF9tCOKgzvKyebDjBY'; 
    const searchURL = 'https://www.googleapis.com/youtube/v3/search';
    const params = {
        key: apiKey,
        q: query,
        part: 'snippet',
        maxResults,
        type: 'video',
      };
      const queryString = formatQueryParams(params)
      const url = searchURL + '?' + queryString;

      console.log(url);
    
      fetch(url)
        .then(responseVideos => {
          if (responseVideos.ok) {
            return responseVideos.json();
          }
          throw new Error(responseVideos.statusText);
        })
        .then(responseVideosJson => showYoutubeVids(responseVideosJson))
        .catch(err => {
          $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });

}


function fetchDrinksRecipe(searchCocktailName){
    const cocktailRecipeURL = "https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=" + searchCocktailName;
    fetch(cocktailRecipeURL)
    .then(responseRecipe => {
        if (responseRecipe.ok) {
            return responseRecipe.json();
        }
        throw new Error(responseRecipe.statusText);
    })
    .then(responseRecipeJson => displayRecipeResults(responseRecipeJson))
    .catch(err => {
        $("#js-error-message").text(`Something went wrong: ${err.message}`);
    });
}


function displayRecipeResults(responseRecipeJson,responseVideosJson){
    console.log(responseRecipeJson)
    $("#results-list").empty();
    $("#result-details").removeClass("hidden").addClass("result-details");
    addRecipeList(responseRecipeJson);
}

//Displaying the recipe once a cocktail has been chosen
function addRecipeList(responseRecipeJson){
    $("#ingredients").append(`<h2 class="recipeHeaders">RECIPE</h2>
    <h2 class="drink-name">${responseRecipeJson.drinks[0].strDrink}</h2>
    <h5 class="header">Ingredients List:</h5>`)
    for(let i = 1;i < 16;i++){
        let measure= responseRecipeJson.drinks[0]["strMeasure"+i]
        let ing = responseRecipeJson.drinks[0]["strIngredient"+i]
        if (ing!="" && ing!=" " && ing!=null){
            $("#ingredients").append(`<li class="ingredientsList">${measure} ${ing}</li>`)
        }
    }
    $("#ingredients").append(`<h5 class="header">Instructions:</h5>
    <p>${responseRecipeJson.drinks[0].strInstructions}</p>`)
}

//showing the first 5 videos that would appear for the search term 
function showYoutubeVids(responseVideosJson){

    $('#videos').append(`<h2 class="recipeHeaders">RELATED YOUTUBE VIDEOS</h2>`);

    for (let i = 0; i<10; i++){
        $('#videos').append(
            `<li class="video-list"><a class="video-title" target="_blank" href="https://www.youtube.com/watch?v=${responseVideosJson.items[i].id.videoId}">
            <h3 class="video-title">${responseVideosJson.items[i].snippet.title}</h3></a>
            <div class="flex">
          <p class="col-md-9"> ${responseVideosJson.items[i].snippet.description}</p>
          <a target="_blank" href="https://www.youtube.com/watch?v=${responseVideosJson.items[i].id.videoId}"><img src="${responseVideosJson.items[i].snippet.thumbnails.default.url}" class="thumbnail rounded-border"  alt="${responseVideosJson.items[i].snippet.title}"/></a>
          </div>
          </li>`
        )};
}

function searchAgain(){
    $("#js-search-again").click(function(){
            window.location.reload();
        } 
    )}


//Remove the initial background and replace with a plain grey to display the cocktail cards more clearly
function changeBackground(){
    $('body').css('background', '#f9f9f9');
}

//hide the initial form on submit
function hideForm(){
    $("#js-form").addClass("hidden");
}

watchForm();