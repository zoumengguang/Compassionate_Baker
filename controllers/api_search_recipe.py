import tempfile
import time

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

# get recipes
def get_recipe():
    recipes = []
    list = None
    
    if auth.user is not None:   # added all public memos
        list = db((db.recipes.created_by == auth.user.id) |
                        (db.recipes.is_public == True)).select(db.recipes.ALL)
    else:   # make public memos visible when not logged in
        list = db(db.recipes.is_public == True).select(db.recipes.ALL)
    
    for i, r in enumerate(list):
        temp = dict(id = r.id,
                    created_by = r.created_by,
                    is_public = r.is_public,
                    name = r.name,
                    description = r.description,
                    ingredients = r.ingredients,
                    steps = r.steps)
        recipes.append(temp)
    
    return response.json(dict(recipes = recipes))

# retrieve todays recipes
def retrieve_today():
    recipes = None
    list = None
    
    if auth.user is not None:   # added all public memos
        list = db(db.todays_recipes.user_id == auth.user.id).select(db.todays_recipes.ALL)
        if list is None:
            return response.json(dict())
    else:   # make public memos visible when not logged in
        return response.json(dict())
    
    for i, r in enumerate(list):
        recipes = r.yields
    
    if recipes is None:
        recipes = "[]"
    
    return response.json(dict(recipes = recipes))

# Update an edited memo
@auth.requires_signature()
def add_recipe():
    item = db(db.todays_recipes.user_id == auth.user.id).select().first()
    if item is not None:
        item.update_record(yields = request.vars.todays)
    else:
        table_id = db.todays_recipes.insert(yields = request.vars.todays)
    
    return dict()
