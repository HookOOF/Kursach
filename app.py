import mimetypes
import os 
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
from flask import Flask, render_template, request, redirect, url_for, flash,session
from flask_sqlalchemy import SQLAlchemy
from flask_scss import Scss
from flask_cors import CORS

from flask_migrate import Migrate

# Инициализация Flask-Migrate


app = Flask(__name__,static_folder='static')
CORS(app)
app.secret_key = os.urandom(30).hex()
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)
migrate = Migrate(app, db)
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Первичный ключ
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    draggables = db.relationship('Draggable', backref='user', lazy=True)  # Связь с Draggable


# Модель для объектов draggable
class Draggable(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Первичный ключ
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Внешний ключ
    eid = db.Column(db.Integer, nullable=False)
    layer_name = db.Column(db.String(80),nullable=False)
    position_x = db.Column(db.Float, nullable=False)  # Координата X
    position_y = db.Column(db.Float, nullable=False)
    properties = db.Column(db.JSON, nullable=True)  # Дополнительные свойства объекта в формате JSON

@app.before_request
def create_tables():
    db.create_all()

@app.route("/")
def index():
        return render_template('index.html')

@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password")
    user = User.query.filter_by(username=username, password=password).first()

    if user:
        session['isAuthorized'] = True
        session['user'] = username
        session['user_id'] = user.id 
        flash("Login successful!", "success")
        return redirect(url_for("index"))
    else:
        flash("Invalid credentials. Please try again.", "danger")
        return redirect(url_for("index")) 




@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("index"))

@app.route('/update-draggable', methods=['POST'])
def update_draggable():
    data = request.json
    #object_id = data.get('objectId')
    x = data.get('xPosition')
    y = data.get('yPosition')
    eid = data.get('id')
    layername = data.get('layer_name')
    properties = data.get('params')

    user_id = session.get('user_id')
    if not user_id:
        return {"error": "User not authenticated"}, 403
    draggable = Draggable.query.filter_by(user_id=user_id, eid=eid).first()

    if draggable:
        draggable.user_id = user_id
        draggable.position_x = x
        draggable.position_y = y
        draggable.properties = properties
        draggable.eid = eid
        draggable.layer_name = layername
        db.session.commit()
        return {"message": "Position updated successfully"}, 200
    else:
        new_draggable = Draggable(
            user_id=user_id,
            eid=eid,
            position_x=x,
            position_y=y,
            layer_name = layername)
        db.session.add(new_draggable)
        db.session.commit()
        return {"message": "Draggable created successfully"}, 201
@app.route('/get-draggables', methods=['GET'])
def get_draggables():
    user_id = session.get('user_id')  # ID пользователя из сессии
    if not user_id:
        return {"error": "User not authenticated"}, 403

    draggables = Draggable.query.filter_by(user_id=user_id).all()
    draggable_list = [
        {
            "eid": d.eid,
            "position_x": d.position_x,
            "position_y": d.position_y,
            "properties": d.properties,
            "layer_name": d.layer_name

        } for d in draggables
    ]
    return {"draggables": draggable_list}, 200
@app.cli.command("create-user")
def create_user():
    db.create_all()
    new_user = User(username="testuser", password="password123")
    db.session.add(new_user)
    db.session.commit()
    print("User created!")

@app.cli.command("clear-db")
def clear_db():
    """Очистить все данные из таблиц базы данных."""
    try:
        # Удаление данных из таблицы Draggable
        num_draggables_deleted = db.session.query(Draggable).delete()
        print(f"{num_draggables_deleted} записей удалено из таблицы Draggable.")

        # Удаление данных из таблицы User
        num_users_deleted = db.session.query(User).delete()
        print(f"{num_users_deleted} записей удалено из таблицы User.")

        # Фиксация изменений
        db.session.commit()
        print("База данных успешно очищена.")
    except Exception as e:
        db.session.rollback()
        print(f"Произошла ошибка при очистке базы данных: {e}")

@app.cli.command("show-tables")
def show_tables():
    """Показать содержимое таблиц User и Draggable."""
    print("\n=== Таблица User ===")
    users = User.query.all()
    for user in users:
        print(f"ID: {user.id}, Username: {user.username}, Password: {user.password}")

    print("\n=== Таблица Draggable ===")
    draggables = Draggable.query.all()
    for draggable in draggables:
        print(f"ID: {draggable.id}, User ID: {draggable.user_id}, EID: {draggable.eid}, "
              f"Layer Name: {draggable.layer_name}, X: {draggable.position_x}, Y: {draggable.position_y}, "
              f"Properties: {draggable.properties}")




if __name__ == "__main__":
    app.run(debug=True)