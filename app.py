from flask import Flask
from flask import render_template
from controllers.views.auth.AuthController import authController
from controllers.views.home.HomeController import home
from controllers.api.Employee import employee
from model.dao.Employee import db

app = Flask(__name__, template_folder='templates')
app.register_blueprint(authController, url_prefix='/auth')
app.register_blueprint(home, url_prefix='/home')
app.register_blueprint(employee, url_prefix='/api/employee')
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:0219@localhost:5432/PuntoFrio'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


@app.route('/')
def Dashboard():
    return render_template('welcome/Dashboard.html')


if __name__ == '__main__':
    app.run(port=8080, host='0.0.0.0')
    app.config["FLASK_ENV"] = "development"

db.init_app(app)


@app.before_request
def function():
    db.create_all()
