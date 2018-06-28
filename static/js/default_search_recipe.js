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
    
    
    // Check if recipe is in database, add to database
    self.get_recipe = function(){
        $.getJSON(get_recipe_url,
            function(data) {
                console.log("Got recipes");
                console.log(data.recipes);
                self.vue.recipe_list = data.recipes;
                for(var i=0; i<self.vue.recipe_list.length; i++){
                    self.vue.recipe_list[i].ingredients = JSON.parse(self.vue.recipe_list[i].ingredients);
                }
                self.vue.recipe_search_list = data.recipes;
                enumerate(self.vue.recipe_list);
                }
            );
        $.getJSON(retrieve_today_url,
            function(data) {
                console.log("Got todays recipes");
                self.vue.todays_recipes = JSON.parse(data.recipes);
                }
            );
        
    };
    
    // Filter recipes
    self.filter_recipe = function(){
        searching_recipe = true;
        temp = [];
        for(var i=0; i < self.vue.recipe_list.length; i++){
            if(self.vue.recipe_list[i].name.indexOf(self.vue.recipe_search) != -1){
                temp.push(self.vue.recipe_list[i]);
            }
        }
        self.vue.recipe_search_list = temp;
        searching_recipe = false;
        if(self.vue.invent_filter == true) self.filter_by_invent();
    };
    
    // Check if recipe in todays
    self.check_recipe = function(id){
        for(var i=0; i < self.vue.todays_recipes.length; i++){
            if(self.vue.todays_recipes[i].id == id){
                return true;
            }
        }
        return false;
    }
    
    // add a reipe to today's recipes
    self.add_recipe = function(id) {
        var item = null;
        for(var i=0; i < self.vue.recipe_list.length; i++){
            if(self.vue.recipe_list[i].id == id){
                item = self.vue.recipe_list[i];
            }
        }
        var temp = {id: id,
                    recipe: item,
                    };
        if(!self.check_recipe(id)){
            self.vue.todays_recipes.push(temp);
            $.post(add_recipe_url,
            {
                todays: JSON.stringify(self.vue.todays_recipes),
            },
            function(data) {
                console.log("successfully added recipe");
                }
            );
        }
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
    };
    
    // toggle filter by invent
    self.toggle_invent = function() {
        if(self.vue.invent_filter == true){
            self.vue.invent_filter = false;
            self.filter_recipe();
            return;
        }else{
            self.vue.invent_filter = true;
            self.filter_recipe();
        }
    };
    
    // Filter by invntory
    self.filter_by_invent = function() {
        var contains = false;
        for(var j=0; j<self.vue.inventory.length; j++){
            for(var i=self.vue.recipe_search_list.length-1; i>=0; i -= 1){
                for(var k=0; k<self.vue.recipe_search_list[i].ingredients.length; k++){
                    if(self.vue.recipe_search_list[i].ingredients[k].ingr.name == self.vue.inventory[j].name){
                        contains = true;
                        break;
                    }
                }
                if(contains == false){
                    self.vue.recipe_search_list.splice(i,1);
                }else{
                    contains = false;
                }
            }
        }
    };
    
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            recipe_list: [],          //ingrdient search vars
            recipe_search_list: [],
            recipe_search: "",
            searching_recipe: false,
            todays_recipes: [],
            inventory: [],
            invent_filter: false,
        },
        methods: {
            get_recipe: self.get_ingr,
            filter_recipe: self.filter_recipe,
            add_recipe: self.add_recipe,
            check_recipe: self.check_recipe,
            toggle_invent: self.toggle_invent,
        },
        watch: {
            recipe_search: function() { self.filter_recipe(); },
            todays_recipes: function() { self.filter_recipe(); },
        },

    });
    
    self.get_user_inv();
    self.get_recipe();
    
    $("#vue-div").show();
    
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});

