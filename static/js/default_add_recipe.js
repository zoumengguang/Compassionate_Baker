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
    
    // Toggle public
    self.toggle_public = function(){
        self.vue.is_public = !self.vue.is_public;
    };
    
    // Check if item is in recipe ingredients
    self.ingr_in_recipe = function(index){
        for(var i=0;i<self.vue.recipe_ingr.length; i++){
            if(index == self.vue.recipe_ingr[i].ingr._idx){
                console.log("Already in recipe");
                return true;
            }
        }
        console.log("Not in recipe");
        return false;
    };
    
    // Add ingredient to recipe
    self.add_ingr = function(index){
        if(!self.ingr_in_recipe(index)){
            var temp = {quantity: 0,
                        unit: "g",
                        ingr: self.vue.ingr_list[index],};
            self.vue.recipe_ingr.push(temp);
            console.log("Added ingredient to recipe: " +
                        self.vue.ingr_list[index].name);
        }
    };
    
    // Remove ingredients from recipe
    self.remove_ingr = function(index){
        for(var i=0;i<self.vue.recipe_ingr.length; i++){
            if(index == self.vue.recipe_ingr[i].ingr._idx){
                console.log("Removing " + self.vue.recipe_ingr[i].ingr.name +
                            " from recipe");
                self.vue.recipe_ingr.splice(i,1);
                break;
            }
        }
    };
    
    // Add new step
    self.add_step = function(){
        var step = {active: true,
                    time: 0,
                    unit: "min",
                    instruction: "",};
        self.vue.recipe_steps.push(step);
        enumerate(self.vue.recipe_steps);
    };
    
    // Remove a step
    self.remove_step = function(index){
        console.log("Removing step " + (index+1) + " from recipe");
        self.vue.recipe_steps.splice(index,1);
        enumerate(self.vue.recipe_steps);
    };
    
    // Check recipe for empty values
    self.check_recipe = function(){
        if(self.vue.recipe_name.trim() == "") return false;
        if(self.vue.recipe_description.trim() == "") return false;
        if(self.vue.recipe_ingr.length == 0) return false;
        for(var i=0;i<self.vue.recipe_ingr.length; i++){
            if(self.vue.recipe_ingr[i].amount <= 0){
                console.log("Negative value in ingredient amount");
                return false;
            }
        }
        for(var i=0;i<self.vue.recipe_steps.length; i++){
            if(self.vue.recipe_steps[i].instruction.trim() == ""){
                console.log("No instruction for step " + i);
                return false;
            }
        }
        console.log("Passed check");
        return true;
    };
    
    // Add recipe to database
    self.add_recipe = function(){
        // Check to make sure there are no empty values
        console.log("button pressed");
        if(self.check_recipe() == false){
            console.log("There is an empty value");
            alert("There is an empty value, please complete the form.");
            return;
        }
        // Add to database
        $.post(add_recipe_url,
            {
                is_public: self.vue.is_public,
                name: self.vue.recipe_name,
                description: self.vue.recipe_description,
                ingredients: JSON.stringify(self.vue.recipe_ingr),
                steps: JSON.stringify(self.vue.recipe_steps),
            },
            function(data) {
                console.log("Added recipe to database");
                console.log("ingredients" + self.vue.recipe_ingr);
                console.log("ingredients" + self.vue.recipe_steps);
                self.vue.is_public = false;
                self.vue.recipe_name = "";
                self.vue.recipe_description = "";
                self.vue.recipe_ingr = [];
                self.vue.recipe_steps = [];
                }
            );
        console.log("Done");
    };
    
    // Set var for form complete
    self.is_complete = function(){
        self.vue.form_complete = self.check_recipe();
    };
    
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            ingr_list: [],          //ingrdient search vars
            ingr_search_list: [],
            ingr_search: "",
            searching_ingr: false,
            is_public: false,       //public/private
            recipe_name: "",          //recipe form vars
            recipe_description: "",
            recipe_ingr: [],
            recipe_steps: [],
            form_complete: false,
        },
        methods: {
            get_ingr: self.get_ingr,
            filter_ingr: self.filter_ingr,
            toggle_public: self.toggle_public,
            ingr_in_recipe: self.ingr_in_recipe,
            add_ingr: self.add_ingr,
            remove_ingr: self.remove_ingr,
            add_step: self.add_step,
            remove_step: self.remove_step,
            check_recipe: self.check_recipe,
            add_recipe: self.add_recipe,
            is_complete: self.is_complete,
        },
        watch: {
            ingr_search: function() { self.filter_ingr(); },
            recipe_name: function() { self.is_complete();},
            recipe_description: function() { self.is_complete();},
            recipe_ingr: function() { self.is_complete();},
        },

    });
    
    self.get_ingr();
    
    $("#vue-div").show();
    
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});

