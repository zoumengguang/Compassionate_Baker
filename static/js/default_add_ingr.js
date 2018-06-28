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
    self.add_ingr = function(){
        self.vue.added_ingr = false;
        if(self.vue.item == null || self.vue.item == ''){
            console.log("No ingredient inputed!");
            self.vue.empty = true;
            self.vue.duplicate = false;
        }else{
            $.getJSON(check_dupe_url,
                {
                    name: self.vue.item,
                },
                function(data) {
                    if(data.dupe == false){
                        console.log("Added Ingredient!");
                        self.vue.last_ingr = self.vue.item;
                        self.vue.item = null;
                        self.vue.duplicate = false;
                        self.vue.added_ingr = true;
                    }else{
                        console.log("Ingredient already in database!")
                        self.vue.duplicate = true;
                    };
                });
            self.vue.empty = false;
        }
        
    };
    

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            item: null,
            duplicate: false,
            empty: false,
            added_ingr: false,
            last_ingr: null,
        },
        methods: {
            add_ingr: self.add_ingr,
        }

    });
    
    
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});

