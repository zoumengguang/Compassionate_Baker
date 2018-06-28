// This is the js for the default/index.html view.


var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};
    

    // Check if ingredient is in database, add to database
    self.get_ingr = function(){
        $.getJSON(get_ingr_url,
            function(data) {
                console.log("Got ingredients");
                self.vue.ingr_list = data.ingredients;
                self.vue.ingr_search_list = data.ingredients;
                enumerate(self.vue.ingr_list);
                }
            );
        
    };

    // Get user inventory
    self.get_user_inv = function() {
        $.post(get_user_inv_URL,
            function(data) {
                console.log("Got inventory");
                self.vue.inventory = JSON.parse(data.inventory);
                enumerate(self.vue.inventory);
                }
            );
    }

    // Get today's recipes
    self.get_recipes = function() {
        $.post(get_recipes_URL,
            function(data) {
                console.log("Got recipes");
                if (data.yields != null) {
                    self.vue.recipes = JSON.parse(data.yields);
                    for (var i = 0; i < self.vue.recipes.length; i++) {
                        console.log(self.vue.recipes[i].ingredients);
                        self.vue.recipes[i].recipe.ingredients = JSON.parse(self.vue.recipes[i].recipe.ingredients);
                        self.vue.recipes[i].recipe.steps = JSON.parse(self.vue.recipes[i].recipe.steps);
                    }
                }

                enumerate(self.vue.recipes);
            });
    }

    // Get previous day's recipes
    self.get_prev_recipes = function() {
        $.post(get_prevrecipes_URL,
            function(data) {
                console.log("Got prevrecipes");
                if (data.yields != null) {
                    self.vue.prevrecipes = JSON.parse(data.yields);
                    for (var i = 0; i < self.vue.prevrecipes.length; i++) {
                        self.vue.prevrecipes[i].recipe.ingredients = JSON.parse(self.vue.prevrecipes[i].recipe.ingredients);
                        self.vue.prevrecipes[i].recipe.steps = JSON.parse(self.vue.prevrecipes[i].recipe.steps);
                    }
                }

                enumerate(self.vue.prevrecipes);
                }
            );
    }
    
    // Filter ingredients
    self.filter_ingr = function(){
        searching_ingr = true;
        temp = [];
        for(var i=0; i < self.vue.ingr_list.length; i++){
            if(self.vue.ingr_list[i].name.indexOf(self.vue.ingr_search) != -1){
                temp.push(self.vue.ingr_list[i]);
            }
        }
        self.vue.ingr_search_list = temp;
        searching_ingr = false;
    };
    
    // Check if item is in recipe ingredients
    self.ingr_in_invent = function(index){
        for(var i=0;i<self.vue.inventory.length; i++){
            if(index == self.vue.inventory[i]._idx){
                console.log("Already in recipe");
                return true;
            }
        }
        console.log("Not in recipe");
        return false;
    };
    
    // Add ingredient to recipe
    self.add_ingr = function(index){
        if(!self.ingr_in_invent(index)){
            self.vue.inventory.push(self.vue.ingr_list[index]);
            console.log("Added ingredient to recipe: " +
                        self.vue.ingr_list[index].name);
            self.commit_user_inv();
        }
    };
    
    // Remove ingredients from recipe
    self.remove_ingr = function(index){
        for(var i=0;i<self.vue.inventory.length; i++){
            if(index == self.vue.inventory[i]._idx){
                console.log("Removing " + self.vue.inventory[i].name +
                            " from recipe");
                self.vue.inventory.splice(i,1);
                self.commit_user_inv();
                break;
            }
        }
    };

    // Helper function for adding/removing user inventory
    self.commit_user_inv = function() {
        $.post(commitUserInvURL,
            {
                ingredients: JSON.stringify(self.vue.inventory)
            },
            function (data) {
                console.log("Updated inv");
            })
    }

    // Cycle today's recipes into previous day
    self.newday_recipes = function() {
        $.post(newday_recipesURL,
            {
                recipes: self.vue.recipes
            },
            function(data) {
                self.vue.prevrecipes = self.vue.recipes;
                self.vue.recipes = [];
            })
    }

    self.open_recipe_full = function(id) {
        console.log("in open");
        self.vue.cur_recipe_id = id;
        
        self.vue.cur_ingr_unit = [];
        
        enumerate(self.vue.cur_recipe_id.ingredients);
        for(var i=0; i<self.vue.cur_recipe_id.ingredients.length; i++){
            var temp = {_idx: self.vue.cur_recipe_id.ingredients[i]._idx,
                        unit: self.vue.cur_recipe_id.ingredients[i].unit,
                        quantity: self.vue.cur_recipe_id.ingredients[i].quantity,};
            self.vue.cur_ingr_unit.push(temp);
        }
        console.log(self.vue.cur_ingr_unit);
        self.vue.recipe_is_open = true;
    }

    self.back_to_main = function() {
        self.vue.cur_recipe_id = null;
        self.vue.recipe_is_open = false;
    }
    
    //recipe conversion
    self.conversion = function(old_idx){
        var old_item = self.vue.cur_ingr_unit[old_idx];
        
        console.log(old_item);
        console.log(self.vue.cur_recipe_id.ingredients[old_idx]);
        
        if(old_item.unit=="g"){
            if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "kg"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*0.001).toFixed(2);
            }else if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "mg"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*1000).toFixed(2);
            }else if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "l"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*0.002).toFixed(2);
            }else if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "oz"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*0.035).toFixed(2);
            }
        }
        if(old_item.unit=="kg"){
            if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "g"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*1000).toFixed(2);
            }else if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "mg"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*1e6).toFixed(2);
            }else if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "l"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*2.205).toFixed(2);
            }else if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "oz"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*35.274).toFixed(2);
            }
        }
        if(old_item.unit=="mg"){
            if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "g"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*0.001).toFixed(2);
            }else if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "kg"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*1e-6).toFixed(2);
            }else if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "l"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*2.205e-6).toFixed(2);
            }else if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "oz"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*3.527e-5).toFixed(2);
            }
        }
        if(old_item.unit=="l"){
            if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "g"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*453.592).toFixed(2);
            }else if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "kg"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*0.454).toFixed(2);
            }else if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "mg"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*4.536e5).toFixed(2);
            }else if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "oz"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*16).toFixed(2);
            }
        }
        if(old_item.unit=="oz"){
            if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "g"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*28.35).toFixed(2);
            }else if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "kg"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*0.028).toFixed(2);
            }else if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "mg"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*2.835e4).toFixed(2);
            }else if(self.vue.cur_recipe_id.ingredients[old_idx].unit == "l"){
                self.vue.cur_recipe_id.ingredients[old_idx].quantity = (old_item.quantity*0.063).toFixed(2);
            }
        }
        self.vue.cur_ingr_unit[old_idx].quantity = self.vue.cur_recipe_id.ingredients[old_idx].quantity;
        self.vue.cur_ingr_unit[old_idx].unit = self.vue.cur_recipe_id.ingredients[old_idx].unit;
        console.log("changed");
    }

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            ingr_list: [],          //ingrdient search vars
            ingr_search_list: [],
            ingr_search: "",
            searching_ingr: false,
            inventory: [],          //ingredients in inventory remaining
            recipes: null,
            prevrecipes: null,
            recipe_is_open: false,
            cur_recipe_id: null,
            cur_ingr_unit: [],
        },
        methods: {
            get_ingr: self.get_ingr,
            filter_ingr: self.filter_ingr,
            remove_ingr: self.remove_ingr,
            add_ingr: self.add_ingr,
            commit_user_inv: self.commit_user_inv,
            newday_recipes: self.newday_recipes,
            open_recipe_full: self.open_recipe_full,
            back_to_main: self.back_to_main,
            conversion: self.conversion,
        },
        watch: {
            ingr_search: function () { self.filter_ingr(); }
        },
    });
    
    self.get_ingr();
    self.get_user_inv();
    self.get_recipes();
    self.get_prev_recipes();
    
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});

