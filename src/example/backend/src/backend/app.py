import sqlite3
from flask import Flask, g, request, jsonify

app = Flask(__name__)
  
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect("db.sqlite", autocommit=True)
        db.set_trace_callback(lambda x: print("SQL:", x))
        db.row_factory = sqlite3.Row
    return db

@app.cli.command("init-db")
def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/api/rating/<id>", methods=['GET'])
def rating(id):
    q = query_db('SELECT rating FROM ratings WHERE id = ?', (int(id),), one=True)
    value = int(q["rating"]) if q else None
    return jsonify({"rating": value})

@app.route("/api/rating/<id>", methods=['POST'])
def update_rating(id):
    value = request.json["rating"]
    q = get_db().execute('INSERT OR REPLACE INTO ratings VALUES (?, ?)', (int(id), value))
    return jsonify({"rating": value})
