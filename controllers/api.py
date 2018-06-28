import tempfile
import time

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

@auth.requires_signature()
def commit_user_inv():
    # check if entry exists
    tmp = db(db.todays_ingredients.user_id == auth.user_id).select().first()
    if tmp is None:
        user_inv_id = db.todays_ingredients.insert(
            user_id=auth.user_id,
            ingredients=request.vars.ingredients
        )
    else:
        user_inv_id = tmp.update_record(
            user_id=auth.user_id,
            ingredients=request.vars.ingredients
        )        

    return response.json(dict(todays_ingredients=dict(
        user_inv_id=user_inv_id,
        user_id=auth.user_id,
        ingredients=request.vars.ingredients
    )))

def get_user_inv():
    userinv = db(db.todays_ingredients.user_id == auth.user_id).select()
    jsonstr = "[]"
    
    if userinv is None:
        return response.json(dict(
        inventory=jsonstr
        ))
    
    for i, r in enumerate(userinv):
        jsonstr = r.ingredients
    
    return response.json(dict(
        inventory=jsonstr
    ))

def get_recipes():
    rows = db(db.todays_recipes.user_id == auth.user_id).select()
    yields = "[]"

    for i, r in enumerate(rows):
        yields = r.yields
    
    return response.json(dict(
        yields = yields
    ))

def get_prevrecipes():
    rows = db(db.prev_yields.user_id == auth.user_id).select()
    yields = "[]"

    if rows is None:
        return response.json(dict(
        yields = yields
        ))
    else:
        for i, r in enumerate(rows):
            yields = r.yields
    
    return response.json(dict(
        yields = yields
    ))

# Clear today's recipe database and move to prev day's 
def newday_recipes():
    # select all today's recipes
    rows = db(db.todays_recipes.user_id == auth.user_id).select()
    prev_yields = ""

    # copy into array for data transfer and insert into database for prev day
    today_item = db(db.todays_recipes.user_id == auth.user.id).select().first()
    prev_item = db(db.prev_yields.user_id == auth.user.id).select().first()
    if prev_item is not None:
        if today_item is not None:
            prev_item.update_record(yields = today_item.yields)
            today_item.update_record(yields="[]")
        else:
            db.prev_yields.update_record(yields="[]")
    else:
        if today_item is not None:
            db.prev_yields.insert(yields = today_item.yields)
            today_item.update_record(yields="[]")
        else:
            db.prev_yields.insert(yields="[]")
    
    return response.json(dict(
        yields=prev_yields
    ))
