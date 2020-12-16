import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";

import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likeView from "./views/likeView";
import { elements, renderLoader, clearLoader } from "./views/base";

/* *-Global state of the app
 * *-Search object
 * *-Current recipe object
 * *-shopping list object
 * *-Liked object
 */
const state = {};
// window.state = state;
/** Search  controller*/

const controlSearch = async () => {
  //1.Get query from view
  const query = searchView.getInput(); //TODO
  // const query = "pizza"; //TODO
  state.search = new Search(query);

  if (query) {
    //2.new search object and add to state
    state.search = new Search(query);
    //3.prepare UI for Results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);
    try {
      //4.Search for recipes
      await state.search.getResults();
      //5.render results on UI
      // console.log(state.search.result);
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {
      alert("Some thing Went wrong with the search..!");
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});
//Testing
/* window.addEventListener("load", (e) => {
  e.preventDefault();
  controlSearch();
}); */

elements.searchResPages.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-inline");
  // console.log(btn);
  if (btn) {
    //--> base ten 0 means binary  so use base 10 for all
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
    // console.log(goToPage);
  }
});

// const search = new Search("pizza");
// console.log(search);

// search.getResults();

/* Recipe controller */
const controlRecipe = async () => {
  // Get ID
  const id = window.location.hash.replace("#", "");
  // console.log(id);
  if (id) {
    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);
    //Highlight selected search item
    if (state.search) searchView.highlightSelected(id);

    // Create new recipe object
    try {
      state.recipe = new Recipe(id);
      //TESTING
      // window.r = state.recipe;
      // Get recipe data and parse ingredients
      await state.recipe.getRecipe();
      // console.log(state.recipe.parseIngredients);
      state.recipe.parseIngredients();

      // calc time & calc servings
      state.recipe.calcTime();
      state.recipe.calcServings();

      // render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
      // console.log(state.recipe);
    } catch (err) {
      console.log(err);
      alert("Error processing recipe!");
    }
  }
};

// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);

["hashchange", "load"].forEach((event) => {
  window.addEventListener(event, controlRecipe);
});
/* 
List controller
*/
const controlList = () => {
  //Cerate new list if there is no list
  if (!state.list) state.list = new List();
  //add ingredients to list and UI
  state.recipe.ingredients.forEach((el) => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};
//Handle delete update list item event
elements.shopping.addEventListener("click", (e) => {
  const id = e.target.closest(".shopping__item").dataset.itemid;
  //handle delete
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    //delete from state
    state.list.deleteItem(id);
    //delete from UI
    listView.deleteItem(id);

    //Handel  count update
  } else if (e.target.matches(".shopping__count-value")) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});
/*
Like Controller
*/
//---> For testing
// state.likes = new Likes();
// likeView.toggleLikeMenu(state.likes.getNumLikes());

const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;
  // console.log(currentID);
  console.log({ isLiked: state.likes.isLiked(currentID) });
  // User has NOT yet liked current recipe
  if (!state.likes.isLiked(currentID)) {
    console.log({ status: "LIKED" });
    // Add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    // Toggle the like button
    likeView.toggleLikeBtn(true);
    // Add like to UI list
    likeView.renderLike(newLike);

    // console.log(state.likes);
    // User HAS liked current recipe
  } else {
    console.log({ status: "NOT LIKED" });

    // Remove like from the state
    state.likes.deleteLike(currentID);

    // Toggle the like button
    likeView.toggleLikeBtn(false);

    // Remove like from UI list
    likeView.deleteLike(currentID);

    // console.log(state.likes);
  }
  likeView.toggleLikeMenu(state.likes.getNumLikes());
};
//Restore liked recipes on page load

window.addEventListener("load", () => {
  state.likes = new Likes();
  //Restore likes
  state.likes.readStorage();

  //Toggle like menu button
  likeView.toggleLikeMenu(state.likes.getNumLikes());

  //Render the existing likes
  state.likes.likes.forEach((like) => likeView.renderLike(like));
});

//Handling recipe button
elements.recipe.addEventListener("click", (e) => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    //Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    //Increase button is clicked
    state.recipe.updateServings("ing");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn,.recipe__btn--add *")) {
    //call control list function
    //add ingredients to shopping list
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    //like controller
    controlLike();
  }
  // console.log(state.recipe.ingredients);
});

// const l = new List();
// window.l = new List();

//handling recipe btn ctrl

/* const r = new Recipe(47746);
r.getRecipe();
console.log(r);
 */
